using System.ComponentModel.DataAnnotations;

namespace ProjectManagementSystem.DTOs;

public class CreateUserDto
{
    [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Kullanıcı adı 3-100 karakter arasında olmalıdır.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta adresi gereklidir.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
    [StringLength(200, ErrorMessage = "E-posta adresi en fazla 200 karakter olabilir.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre gereklidir.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Rol seçimi gereklidir.")]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir rol seçiniz.")]
    public int RoleId { get; set; }
}

