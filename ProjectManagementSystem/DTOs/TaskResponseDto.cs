using ProjectManagementSystem.Enums;

namespace ProjectManagementSystem.DTOs;

public class TaskResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskItemStatus Status { get; set; }
    public TaskItemPriority Priority { get; set; }
    public List<int> AssignedUserIds { get; set; } = new List<int>();
    public List<string> AssignedUserNames { get; set; } = new List<string>();
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}
