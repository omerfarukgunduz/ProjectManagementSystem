using ProjectManagementSystem.DTOs;

namespace ProjectManagementSystem.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectResponseDto>> GetAllProjectsAsync(int userId, bool isAdmin);
    Task<ProjectResponseDto?> GetProjectByIdAsync(int id, int userId, bool isAdmin);
    Task<ProjectResponseDto> CreateProjectAsync(CreateProjectDto createProjectDto);
    Task<ProjectResponseDto?> UpdateProjectAsync(int id, UpdateProjectDto updateProjectDto);
    Task<bool> DeleteProjectAsync(int id);
}
