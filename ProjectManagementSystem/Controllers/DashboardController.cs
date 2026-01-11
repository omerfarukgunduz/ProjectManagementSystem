using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Services;

namespace ProjectManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Get dashboard statistics - Admin: all stats, User: own stats
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboardStats()
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin");

        var stats = await _dashboardService.GetDashboardStatsAsync(userId, isAdmin);
        return Ok(stats);
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            throw new UnauthorizedAccessException("Invalid token.");
        }
        return userId;
    }
}
