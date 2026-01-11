using System.ComponentModel.DataAnnotations;

namespace ProjectManagementSystem.DTOs;

public class ResetPasswordDto
{
    [Required(ErrorMessage = "Token gereklidir.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta adresi gereklidir.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre gereklidir.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    public string NewPassword { get; set; } = string.Empty;
}
