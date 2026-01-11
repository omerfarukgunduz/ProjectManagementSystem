using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Services;

namespace ProjectManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class SmtpSettingsController : ControllerBase
{
    private readonly ISmtpSettingsService _smtpSettingsService;
    private readonly ILogger<SmtpSettingsController> _logger;

    public SmtpSettingsController(ISmtpSettingsService smtpSettingsService, ILogger<SmtpSettingsController> logger)
    {
        _smtpSettingsService = smtpSettingsService;
        _logger = logger;
    }

    /// <summary>
    /// Get current SMTP settings (Admin only)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SmtpSettingsDto>> GetSmtpSettings()
    {
        var settings = await _smtpSettingsService.GetSmtpSettingsAsync();
        
        if (settings == null)
        {
            return NotFound(new { message = "SMTP ayarları bulunamadı." });
        }

        return Ok(settings);
    }

    /// <summary>
    /// Create or update SMTP settings (Admin only)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SmtpSettingsDto>> CreateOrUpdateSmtpSettings([FromBody] SmtpSettingsDto smtpSettingsDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var settings = await _smtpSettingsService.CreateOrUpdateSmtpSettingsAsync(smtpSettingsDto);
            return Ok(settings);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP ayarları kaydedilirken hata oluştu.");
            return StatusCode(500, new { message = "SMTP ayarları kaydedilirken bir hata oluştu." });
        }
    }

    /// <summary>
    /// Test SMTP connection (Admin only)
    /// </summary>
    [HttpPost("test")]
    public async Task<ActionResult> TestSmtpConnection()
    {
        try
        {
            var isSuccess = await _smtpSettingsService.TestSmtpConnectionAsync();
            
            if (isSuccess)
            {
                return Ok(new { message = "SMTP bağlantı testi başarılı." });
            }
            else
            {
                return BadRequest(new { message = "SMTP bağlantı testi başarısız. Lütfen ayarları kontrol edin." });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP bağlantı testi sırasında hata oluştu.");
            return StatusCode(500, new { message = "SMTP bağlantı testi sırasında bir hata oluştu." });
        }
    }
}
