using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.Auth;
using ProjectManagementSystem.Data;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Entities;

namespace ProjectManagementSystem.Services.Auth;

public class AuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtTokenService _tokenService;

    public AuthService(ApplicationDbContext context, JwtTokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
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

        // Rol = User olarak ata (RoleId = 2 veya "User" rolünü bul)
        var userRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "User");

        if (userRole == null)
        {
            return (false, "User role not found. Please create roles first.", null, null, null, null);
        }

        // Şifreyi bcrypt ile hashle
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Kullanıcıyı oluştur
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = passwordHash,
            RoleId = userRole.Id
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
}

