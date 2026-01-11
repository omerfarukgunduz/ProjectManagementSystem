namespace ProjectManagementSystem.DTOs;

public class DashboardDto
{
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public int TotalUsers { get; set; } // Only for Admin
}
