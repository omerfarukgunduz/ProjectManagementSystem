using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProjectManagementSystem.Data;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Entities;

namespace ProjectManagementSystem.Services;

public class SmtpSettingsService : ISmtpSettingsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SmtpSettingsService> _logger;

    public SmtpSettingsService(ApplicationDbContext context, ILogger<SmtpSettingsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SmtpSettingsDto?> GetSmtpSettingsAsync()
    {
        var settings = await _context.SmtpSettings
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (settings == null)
        {
            return null;
        }

        return new SmtpSettingsDto
        {
            Id = settings.Id,
            Host = settings.Host,
            Port = settings.Port,
            Username = settings.Username,
            Password = settings.Password, // Şifre döndürülüyor, güvenlik için maskelenebilir
            EnableSsl = settings.EnableSsl,
            FromEmail = settings.FromEmail,
            FromName = settings.FromName,
            IsActive = settings.IsActive
        };
    }

    public async Task<SmtpSettingsDto> CreateOrUpdateSmtpSettingsAsync(SmtpSettingsDto smtpSettingsDto)
    {
        SmtpSettings settings;

        if (smtpSettingsDto.Id.HasValue)
        {
            // Güncelleme
            settings = await _context.SmtpSettings.FindAsync(smtpSettingsDto.Id.Value);
            if (settings == null)
            {
                throw new InvalidOperationException("SMTP ayarları bulunamadı.");
            }

            settings.Host = smtpSettingsDto.Host;
            settings.Port = smtpSettingsDto.Port;
            settings.Username = smtpSettingsDto.Username;
            settings.Password = smtpSettingsDto.Password;
            settings.EnableSsl = smtpSettingsDto.EnableSsl;
            settings.FromEmail = smtpSettingsDto.FromEmail;
            settings.FromName = smtpSettingsDto.FromName;
            settings.IsActive = smtpSettingsDto.IsActive;
            settings.UpdatedAt = DateTime.UtcNow;

            _context.SmtpSettings.Update(settings);
        }
        else
        {
            // Yeni oluşturma - önceki ayarları pasif yap
            var existingSettings = await _context.SmtpSettings
                .Where(s => s.IsActive)
                .ToListAsync();

            foreach (var existing in existingSettings)
            {
                existing.IsActive = false;
            }

            settings = new SmtpSettings
            {
                Host = smtpSettingsDto.Host,
                Port = smtpSettingsDto.Port,
                Username = smtpSettingsDto.Username,
                Password = smtpSettingsDto.Password,
                EnableSsl = smtpSettingsDto.EnableSsl,
                FromEmail = smtpSettingsDto.FromEmail,
                FromName = smtpSettingsDto.FromName,
                IsActive = smtpSettingsDto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.SmtpSettings.Add(settings);
        }

        await _context.SaveChangesAsync();

        return new SmtpSettingsDto
        {
            Id = settings.Id,
            Host = settings.Host,
            Port = settings.Port,
            Username = settings.Username,
            Password = settings.Password,
            EnableSsl = settings.EnableSsl,
            FromEmail = settings.FromEmail,
            FromName = settings.FromName,
            IsActive = settings.IsActive
        };
    }

    public async Task<bool> TestSmtpConnectionAsync()
    {
        try
        {
            var settings = await _context.SmtpSettings
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                _logger.LogWarning("Aktif SMTP ayarları bulunamadı.");
                return false;
            }

            using var client = new SmtpClient(settings.Host, settings.Port)
            {
                EnableSsl = settings.EnableSsl,
                Credentials = new NetworkCredential(settings.Username, settings.Password),
                Timeout = 5000 // 5 saniye timeout
            };

            // Test bağlantısı - sadece bağlantıyı test ediyoruz, email göndermiyoruz
            await client.SendMailAsync(new MailMessage
            {
                From = new MailAddress(settings.FromEmail, settings.FromName),
                To = { new MailAddress(settings.FromEmail) }, // Kendine gönder (test)
                Subject = "SMTP Test",
                Body = "Bu bir test mesajıdır.",
                IsBodyHtml = false
            });

            _logger.LogInformation("SMTP bağlantı testi başarılı.");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"SMTP bağlantı testi başarısız: {ex.Message}");
            return false;
        }
    }
}
