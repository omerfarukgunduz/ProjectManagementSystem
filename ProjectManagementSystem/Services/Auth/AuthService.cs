using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ProjectManagementSystem.Auth;
using ProjectManagementSystem.Data;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Entities;
using System.Security.Cryptography;
using System.Text;

namespace ProjectManagementSystem.Services.Auth;

public class AuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtTokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        ApplicationDbContext context, 
        JwtTokenService tokenService, 
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, string? Token, string? Role, int? UserId, string? Username)> Register(RegisterDto registerDto)
    {
        // Email zaten varsa hata döndür
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == registerDto.Email);

        if (existingUser != null)
        {
            return (false, "Email already exists.", null, null, null, null);
        }

        // Rol belirlenmişse onu kullan, yoksa varsayılan olarak "User" rolünü ata
        Role? role;
        if (registerDto.RoleId.HasValue && registerDto.RoleId.Value > 0)
        {
            role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == registerDto.RoleId.Value);
            
            if (role == null)
            {
                return (false, "Role not found.", null, null, null, null);
            }
        }
        else
        {
            // Varsayılan olarak "User" rolünü ata
            role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == "User");
            
            if (role == null)
            {
                return (false, "User role not found. Please create roles first.", null, null, null, null);
            }
        }

        // Şifreyi bcrypt ile hashle
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Kullanıcıyı oluştur
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = passwordHash,
            RoleId = role.Id
        };

        // Kullanıcıyı kaydet
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Role bilgisini yükle
        await _context.Entry(user)
            .Reference(u => u.Role)
            .LoadAsync();

        // JWT token üret
        var token = _tokenService.GenerateToken(user, user.Role.Name);

        return (true, "User registered successfully.", token, user.Role.Name, user.Id, user.Username);
    }

    public async Task<(bool Success, string Message, string? Token, string? Role, int? UserId, string? Username)> Login(LoginDto loginDto)
    {
        // Email'e göre kullanıcıyı bul
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null)
        {
            return (false, "Invalid email or password.", null, null, null, null);
        }

        // Şifre doğru mu kontrol et
        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return (false, "Invalid email or password.", null, null, null, null);
        }

        // JWT token üret ve döndür
        var token = _tokenService.GenerateToken(user, user.Role.Name);

        return (true, "Login successful.", token, user.Role.Name, user.Id, user.Username);
    }

    public async Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        // Kullanıcıyı email'e göre bul
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email);

        // Güvenlik için: Kullanıcı yoksa bile başarılı mesaj döndür (email enumeration saldırısını önlemek için)
        if (user == null)
        {
            _logger.LogWarning($"Şifre sıfırlama talebi - Kullanıcı bulunamadı: {forgotPasswordDto.Email}");
            return (true, "Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.");
        }

        // Token oluştur (güvenli rastgele token)
        var tokenBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        var resetToken = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        // Token'ı veritabanına kaydet (24 saat geçerli)
        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(24);
        await _context.SaveChangesAsync();

        // Email gönder
        var mvcBaseUrl = _configuration["MvcSettings:BaseUrl"] ?? "https://localhost:7236";
        var resetUrl = $"{mvcBaseUrl}/Auth/ResetPassword?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(user.Email)}";

        try
        {
            var emailSent = await _emailService.SendPasswordResetEmailAsync(
                user.Email,
                user.Username,
                resetToken,
                resetUrl
            );

            if (!emailSent)
            {
                _logger.LogError($"Şifre sıfırlama emaili gönderilemedi: {user.Email}");
                return (false, "Email gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Şifre sıfırlama emaili gönderilirken hata: {ex.Message}");
            return (false, "Email gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        }

        return (true, "Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.");
    }

    public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        // Kullanıcıyı email ve token'a göre bul
        var user = await _context.Users
            .FirstOrDefaultAsync(u => 
                u.Email == resetPasswordDto.Email && 
                u.PasswordResetToken == resetPasswordDto.Token);

        if (user == null)
        {
            return (false, "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.");
        }

        // Token süresi dolmuş mu kontrol et
        if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            // Token'ı temizle
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return (false, "Şifre sıfırlama bağlantısının süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebinde bulunun.");
        }

        // Yeni şifreyi hashle ve kaydet
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
        
        // Token'ı temizle (tek kullanımlık)
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;

        await _context.SaveChangesAsync();

        _logger.LogInformation($"Şifre başarıyla sıfırlandı: {user.Email}");

        return (true, "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.");
    }
}

