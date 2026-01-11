using System.ComponentModel.DataAnnotations;
using ProjectManagementSystem.Enums;

namespace ProjectManagementSystem.DTOs;

public class CreateTaskDto
{
    [Required(ErrorMessage = "Görev başlığı gereklidir.")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Görev başlığı 3-200 karakter arasında olmalıdır.")]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;

    public TaskItemPriority Priority { get; set; } = TaskItemPriority.Medium;

    public List<int>? AssignedUserIds { get; set; }

    [Required(ErrorMessage = "Proje seçimi gereklidir.")]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir proje seçiniz.")]
    public int ProjectId { get; set; }
}
