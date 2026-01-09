using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.Data;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Entities;

namespace ProjectManagementSystem.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TaskResponseDto>> GetAllTasksAsync(int userId, bool isAdmin, int? projectId = null)
    {
        IQueryable<TaskItem> query = _context.TaskItems
            .Include(t => t.TaskUsers)
                .ThenInclude(tu => tu.User)
            .Include(t => t.Project);

        // Proje filtresi
        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
        }

        // Admin değilse sadece atandığı taskları veya projesindeki taskları getir
        if (!isAdmin)
        {
            query = query.Where(t => 
                t.TaskUsers.Any(tu => tu.UserId == userId) || 
                t.Project.ProjectUsers.Any(pu => pu.UserId == userId));
        }

        var tasks = await query.ToListAsync();

        return tasks.Select(t => new TaskResponseDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            AssignedUserIds = t.TaskUsers.Select(tu => tu.UserId).ToList(),
            AssignedUserNames = t.TaskUsers.Select(tu => tu.User.Username).ToList(),
            ProjectId = t.ProjectId,
            ProjectName = t.Project.Name,
            CreatedDate = t.CreatedDate
        });
    }

    public async Task<TaskResponseDto?> GetTaskByIdAsync(int id, int userId, bool isAdmin)
    {
        var query = _context.TaskItems
            .Include(t => t.TaskUsers)
                .ThenInclude(tu => tu.User)
            .Include(t => t.Project)
            .Where(t => t.Id == id);

        // Admin değilse sadece atandığı taskı veya projesindeki taskı getir
        if (!isAdmin)
        {
            query = query.Where(t => 
                t.TaskUsers.Any(tu => tu.UserId == userId) || 
                t.Project.ProjectUsers.Any(pu => pu.UserId == userId));
        }

        var task = await query.FirstOrDefaultAsync();

        if (task == null)
        {
            return null;
        }

        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            AssignedUserIds = task.TaskUsers.Select(tu => tu.UserId).ToList(),
            AssignedUserNames = task.TaskUsers.Select(tu => tu.User.Username).ToList(),
            ProjectId = task.ProjectId,
            ProjectName = task.Project.Name,
            CreatedDate = task.CreatedDate
        };
    }

    public async Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto createTaskDto)
    {
        // Proje kontrolü
        var project = await _context.Projects.FindAsync(createTaskDto.ProjectId);
        if (project == null)
        {
            throw new InvalidOperationException("Project not found.");
        }

        // Task oluştur
        var task = new TaskItem
        {
            Title = createTaskDto.Title,
            Description = createTaskDto.Description,
            Status = createTaskDto.Status,
            Priority = createTaskDto.Priority,
            ProjectId = createTaskDto.ProjectId,
            CreatedDate = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        // Kullanıcı atamalarını yap
        if (createTaskDto.AssignedUserIds != null && createTaskDto.AssignedUserIds.Any())
        {
            // UserIds'lerin geçerli olduğunu kontrol et
            var validUserIds = await _context.Users
                .Where(u => createTaskDto.AssignedUserIds.Contains(u.Id))
                .Select(u => u.Id)
                .ToListAsync();

            var taskUsers = validUserIds.Select(userId => new TaskUser
            {
                TaskId = task.Id,
                UserId = userId
            }).ToList();

            _context.TaskUsers.AddRange(taskUsers);
            await _context.SaveChangesAsync();
        }

        // Navigation properties'i yükle
        await _context.Entry(task)
            .Collection(t => t.TaskUsers)
            .Query()
            .Include(tu => tu.User)
            .LoadAsync();

        await _context.Entry(task)
            .Reference(t => t.Project)
            .LoadAsync();

        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            AssignedUserIds = task.TaskUsers.Select(tu => tu.UserId).ToList(),
            AssignedUserNames = task.TaskUsers.Select(tu => tu.User.Username).ToList(),
            ProjectId = task.ProjectId,
            ProjectName = task.Project.Name,
            CreatedDate = task.CreatedDate
        };
    }

    public async Task<TaskResponseDto?> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto)
    {
        var task = await _context.TaskItems
            .Include(t => t.TaskUsers)
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
        {
            return null;
        }

        // Proje kontrolü
        var project = await _context.Projects.FindAsync(updateTaskDto.ProjectId);
        if (project == null)
        {
            throw new InvalidOperationException("Project not found.");
        }

        // Task bilgilerini güncelle
        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.Status = updateTaskDto.Status;
        task.Priority = updateTaskDto.Priority;
        task.ProjectId = updateTaskDto.ProjectId;

        // Kullanıcı atamalarını güncelle
        if (updateTaskDto.AssignedUserIds != null)
        {
            // Mevcut atamaları kaldır
            _context.TaskUsers.RemoveRange(task.TaskUsers);

            // Yeni atamaları ekle
            if (updateTaskDto.AssignedUserIds.Any())
            {
                // UserIds'lerin geçerli olduğunu kontrol et
                var validUserIds = await _context.Users
                    .Where(u => updateTaskDto.AssignedUserIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();

                var taskUsers = validUserIds.Select(userId => new TaskUser
                {
                    TaskId = task.Id,
                    UserId = userId
                }).ToList();

                _context.TaskUsers.AddRange(taskUsers);
            }
        }

        await _context.SaveChangesAsync();

        // Navigation properties'i yeniden yükle
        await _context.Entry(task)
            .Collection(t => t.TaskUsers)
            .Query()
            .Include(tu => tu.User)
            .LoadAsync();

        await _context.Entry(task)
            .Reference(t => t.Project)
            .LoadAsync();

        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            AssignedUserIds = task.TaskUsers.Select(tu => tu.UserId).ToList(),
            AssignedUserNames = task.TaskUsers.Select(tu => tu.User.Username).ToList(),
            ProjectId = task.ProjectId,
            ProjectName = task.Project.Name,
            CreatedDate = task.CreatedDate
        };
    }

    public async Task<bool> DeleteTaskAsync(int id)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task == null)
        {
            return false;
        }

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();

        return true;
    }
}
