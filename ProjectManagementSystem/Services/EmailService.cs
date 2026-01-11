using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.Data;

namespace ProjectManagementSystem.Services;

public class EmailService : IEmailService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EmailService> _logger;

    public EmailService(ApplicationDbContext context, ILogger<EmailService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> IsEmailConfiguredAsync()
    {
        var smtpSettings = await _context.SmtpSettings
            .Where(s => s.IsActive)
            .FirstOrDefaultAsync();

        return smtpSettings != null && 
               !string.IsNullOrEmpty(smtpSettings.Host) &&
               !string.IsNullOrEmpty(smtpSettings.Username) &&
               !string.IsNullOrEmpty(smtpSettings.Password) &&
               !string.IsNullOrEmpty(smtpSettings.FromEmail);
    }

    public async Task<bool> SendTaskAssignmentEmailAsync(
        string toEmail, 
        string toName, 
        string taskTitle, 
        string taskDescription, 
        string projectName, 
        string priority, 
        string status)
    {
        try
        {
            // SMTP ayarlarını veritabanından al
            var smtpSettings = await _context.SmtpSettings
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (smtpSettings == null)
            {
                _logger.LogWarning("SMTP ayarları bulunamadı veya aktif değil.");
                return false;
            }

            // Email içeriği oluştur
            var subject = $"Yeni Görev Atandı: {taskTitle}";
            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #007bff; color: white; padding: 15px; text-align: center; }}
                        .content {{ padding: 20px; background-color: #f8f9fa; }}
                        .task-info {{ background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }}
                        .footer {{ text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Yeni Görev Atandı</h2>
                        </div>
                        <div class='content'>
                            <p>Merhaba <strong>{toName}</strong>,</p>
                            <p>Size yeni bir görev atanmıştır:</p>
                            <div class='task-info'>
                                <p><strong>Görev Başlığı:</strong> {taskTitle}</p>
                                <p><strong>Proje:</strong> {projectName}</p>
                                <p><strong>Durum:</strong> {status}</p>
                                <p><strong>Öncelik:</strong> {priority}</p>
                                <p><strong>Açıklama:</strong></p>
                                <p>{taskDescription ?? "Açıklama yok"}</p>
                            </div>
                            <p>Görev detaylarını görüntülemek için sisteme giriş yapabilirsiniz.</p>
                        </div>
                        <div class='footer'>
                            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
                        </div>
                    </div>
                </body>
                </html>";

            // SMTP client oluştur
            using var client = new SmtpClient(smtpSettings.Host, smtpSettings.Port)
            {
                EnableSsl = smtpSettings.EnableSsl,
                Credentials = new NetworkCredential(smtpSettings.Username, smtpSettings.Password)
            };

            // Mail mesajı oluştur
            using var message = new MailMessage
            {
                From = new MailAddress(smtpSettings.FromEmail, smtpSettings.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(toEmail, toName));

            // Email gönder
            await client.SendMailAsync(message);

            _logger.LogInformation($"Görev atama emaili başarıyla gönderildi: {toEmail}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Email gönderme hatası: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendPasswordResetEmailAsync(
        string toEmail, 
        string toName, 
        string resetToken, 
        string resetUrl)
    {
        try
        {
            // SMTP ayarlarını veritabanından al
            var smtpSettings = await _context.SmtpSettings
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (smtpSettings == null)
            {
                _logger.LogWarning("SMTP ayarları bulunamadı veya aktif değil.");
                return false;
            }

            // Email içeriği oluştur
            var subject = "Şifre Sıfırlama İsteği";
            var body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #dc3545; color: white; padding: 15px; text-align: center; }}
                        .content {{ padding: 20px; background-color: #f8f9fa; }}
                        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                        .button:hover {{ background-color: #0056b3; }}
                        .footer {{ text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }}
                        .warning {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Şifre Sıfırlama İsteği</h2>
                        </div>
                        <div class='content'>
                            <p>Merhaba <strong>{toName}</strong>,</p>
                            <p>Hesabınız için şifre sıfırlama talebinde bulunuldu. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                            <div style='text-align: center;'>
                                <a href='{resetUrl}' class='button'>Şifremi Sıfırla</a>
                            </div>
                            <div class='warning'>
                                <p><strong>Önemli:</strong></p>
                                <p>Bu bağlantı 24 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                            </div>
                            <p>Alternatif olarak, aşağıdaki bağlantıyı tarayıcınıza kopyalayıp yapıştırabilirsiniz:</p>
                            <p style='word-break: break-all; color: #007bff;'>{resetUrl}</p>
                        </div>
                        <div class='footer'>
                            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
                        </div>
                    </div>
                </body>
                </html>";

            // SMTP client oluştur
            using var client = new SmtpClient(smtpSettings.Host, smtpSettings.Port)
            {
                EnableSsl = smtpSettings.EnableSsl,
                Credentials = new NetworkCredential(smtpSettings.Username, smtpSettings.Password)
            };

            // Mail mesajı oluştur
            using var message = new MailMessage
            {
                From = new MailAddress(smtpSettings.FromEmail, smtpSettings.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(toEmail, toName));

            // Email gönder
            await client.SendMailAsync(message);

            _logger.LogInformation($"Şifre sıfırlama emaili başarıyla gönderildi: {toEmail}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Şifre sıfırlama emaili gönderme hatası: {ex.Message}");
            return false;
        }
    }
}
