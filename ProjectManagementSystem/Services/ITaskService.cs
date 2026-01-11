using ProjectManagementSystem.DTOs;

namespace ProjectManagementSystem.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync(int userId, bool isAdmin, int? projectId = null);
    Task<TaskResponseDto?> GetTaskByIdAsync(int id, int userId, bool isAdmin);
    Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto createTaskDto, int userId, bool isAdmin);
    Task<TaskResponseDto?> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto, int userId, bool isAdmin);
    Task<bool> DeleteTaskAsync(int id, int userId, bool isAdmin);
}
