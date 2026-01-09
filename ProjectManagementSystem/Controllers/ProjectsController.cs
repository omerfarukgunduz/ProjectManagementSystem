using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Services;

namespace ProjectManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// Get all projects - Admin: all projects, User: only assigned projects
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetAllProjects()
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin");

        var projects = await _projectService.GetAllProjectsAsync(userId, isAdmin);
        return Ok(projects);
    }

    /// <summary>
    /// Get project by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectResponseDto>> GetProjectById(int id)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin");

        var project = await _projectService.GetProjectByIdAsync(id, userId, isAdmin);

        if (project == null)
        {
            return NotFound(new { message = "Project not found." });
        }

        return Ok(project);
    }

    /// <summary>
    /// Create a new project (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectResponseDto>> CreateProject([FromBody] CreateProjectDto createProjectDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var project = await _projectService.CreateProjectAsync(createProjectDto);
            return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update project (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectResponseDto>> UpdateProject(int id, [FromBody] UpdateProjectDto updateProjectDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var project = await _projectService.UpdateProjectAsync(id, updateProjectDto);

            if (project == null)
            {
                return NotFound(new { message = "Project not found." });
            }

            return Ok(project);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete project (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var result = await _projectService.DeleteProjectAsync(id);

        if (!result)
        {
            return NotFound(new { message = "Project not found." });
        }

        return NoContent();
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
