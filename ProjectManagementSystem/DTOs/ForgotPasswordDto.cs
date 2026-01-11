using System.ComponentModel.DataAnnotations;

namespace ProjectManagementSystem.DTOs;

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "E-posta adresi gereklidir.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    public string Email { get; set; } = string.Empty;
}
