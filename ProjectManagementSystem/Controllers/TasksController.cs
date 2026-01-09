using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Services;

namespace ProjectManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// Get all tasks - Admin: all tasks, User: only assigned tasks or tasks in assigned projects
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetAllTasks([FromQuery] int? projectId = null)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin");

        var tasks = await _taskService.GetAllTasksAsync(userId, isAdmin, projectId);
        return Ok(tasks);
    }

    /// <summary>
    /// Get task by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskResponseDto>> GetTaskById(int id)
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin");

        var task = await _taskService.GetTaskByIdAsync(id, userId, isAdmin);

        if (task == null)
        {
            return NotFound(new { message = "Task not found." });
        }

        return Ok(task);
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask([FromBody] CreateTaskDto createTaskDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var task = await _taskService.CreateTaskAsync(createTaskDto);
            return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, task);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update task
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TaskResponseDto>> UpdateTask(int id, [FromBody] UpdateTaskDto updateTaskDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var task = await _taskService.UpdateTaskAsync(id, updateTaskDto);

            if (task == null)
            {
                return NotFound(new { message = "Task not found." });
            }

            return Ok(task);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete task
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var result = await _taskService.DeleteTaskAsync(id);

        if (!result)
        {
            return NotFound(new { message = "Task not found." });
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
