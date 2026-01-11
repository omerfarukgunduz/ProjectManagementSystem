using ProjectManagementSystem.DTOs;

namespace ProjectManagementSystem.Services;

public interface ISmtpSettingsService
{
    Task<SmtpSettingsDto?> GetSmtpSettingsAsync();
    Task<SmtpSettingsDto> CreateOrUpdateSmtpSettingsAsync(SmtpSettingsDto smtpSettingsDto);
    Task<bool> TestSmtpConnectionAsync();
}
