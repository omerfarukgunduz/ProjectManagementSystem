using System.ComponentModel.DataAnnotations;

namespace ProjectManagementSystem.DTOs;

public class UpdateProjectDto
{
    [Required(ErrorMessage = "Proje adı gereklidir.")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Proje adı 3-200 karakter arasında olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;

    public List<int>? UserIds { get; set; }
}
