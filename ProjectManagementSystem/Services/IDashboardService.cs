using ProjectManagementSystem.DTOs;

namespace ProjectManagementSystem.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardStatsAsync(int userId, bool isAdmin);
}
