using ProjectManagementSystem.Enums;

namespace ProjectManagementSystem.DTOs;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskItemStatus Status { get; set; }
    public TaskItemPriority Priority { get; set; }
    public List<int>? AssignedUserIds { get; set; }
    public int ProjectId { get; set; }
}
