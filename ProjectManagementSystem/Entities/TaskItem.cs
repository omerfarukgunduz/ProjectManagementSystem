using ProjectManagementSystem.Enums;

namespace ProjectManagementSystem.Entities;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; }
    public TaskItemPriority Priority { get; set; }

    public int AssignedUserId { get; set; }
    public User AssignedUser { get; set; } = null!;

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}

