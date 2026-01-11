using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.Data;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Enums;

namespace ProjectManagementSystem.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardDto> GetDashboardStatsAsync(int userId, bool isAdmin)
    {
        var dashboard = new DashboardDto();

        // Projects
        IQueryable<Entities.Project> projectsQuery = _context.Projects;
        if (!isAdmin)
        {
            projectsQuery = projectsQuery.Where(p => p.ProjectUsers.Any(pu => pu.UserId == userId));
        }
        dashboard.TotalProjects = await projectsQuery.CountAsync();

        // Tasks
        IQueryable<Entities.TaskItem> tasksQuery = _context.TaskItems;
        if (!isAdmin)
        {
            tasksQuery = tasksQuery.Where(t => 
                t.TaskUsers.Any(tu => tu.UserId == userId) || 
                t.Project.ProjectUsers.Any(pu => pu.UserId == userId));
        }

        dashboard.TotalTasks = await tasksQuery.CountAsync();
        dashboard.CompletedTasks = await tasksQuery
            .Where(t => t.Status == TaskItemStatus.Done)
            .CountAsync();
        dashboard.PendingTasks = await tasksQuery
            .Where(t => t.Status == TaskItemStatus.Todo || t.Status == TaskItemStatus.InProgress)
            .CountAsync();

        // Users (only for Admin)
        if (isAdmin)
        {
            dashboard.TotalUsers = await _context.Users.CountAsync();
        }

        return dashboard;
    }
}
