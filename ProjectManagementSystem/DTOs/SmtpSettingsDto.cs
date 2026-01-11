using System.ComponentModel.DataAnnotations;

namespace ProjectManagementSystem.DTOs;

public class SmtpSettingsDto
{
    public int? Id { get; set; }

    [Required(ErrorMessage = "SMTP sunucu adresi gereklidir.")]
    [StringLength(200, ErrorMessage = "SMTP sunucu adresi en fazla 200 karakter olabilir.")]
    public string Host { get; set; } = string.Empty;

    [Required(ErrorMessage = "Port numarası gereklidir.")]
    [Range(1, 65535, ErrorMessage = "Port numarası 1-65535 arasında olmalıdır.")]
    public int Port { get; set; } = 587;

    [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
    [StringLength(200, ErrorMessage = "Kullanıcı adı en fazla 200 karakter olabilir.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre gereklidir.")]
    [StringLength(500, ErrorMessage = "Şifre en fazla 500 karakter olabilir.")]
    public string Password { get; set; } = string.Empty;

    public bool EnableSsl { get; set; } = true;

    [Required(ErrorMessage = "Gönderen e-posta adresi gereklidir.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    [StringLength(200, ErrorMessage = "E-posta adresi en fazla 200 karakter olabilir.")]
    public string FromEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Gönderen adı gereklidir.")]
    [StringLength(200, ErrorMessage = "Gönderen adı en fazla 200 karakter olabilir.")]
    public string FromName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
