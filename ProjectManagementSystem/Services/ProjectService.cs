using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.Data;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Entities;

namespace ProjectManagementSystem.Services;

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;

    public ProjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProjectResponseDto>> GetAllProjectsAsync(int userId, bool isAdmin)
    {
        IQueryable<Project> query = _context.Projects
            .Include(p => p.ProjectUsers)
                .ThenInclude(pu => pu.User);

        // Admin değilse sadece atandığı projeleri getir
        if (!isAdmin)
        {
            query = query.Where(p => p.ProjectUsers.Any(pu => pu.UserId == userId));
        }

        var projects = await query.ToListAsync();

        return projects.Select(p => new ProjectResponseDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            CreatedDate = p.CreatedDate,
            UserIds = p.ProjectUsers.Select(pu => pu.UserId).ToList(),
            UserNames = p.ProjectUsers.Select(pu => pu.User.Username).ToList()
        });
    }

    public async Task<ProjectResponseDto?> GetProjectByIdAsync(int id, int userId, bool isAdmin)
    {
        var query = _context.Projects
            .Include(p => p.ProjectUsers)
                .ThenInclude(pu => pu.User)
            .Where(p => p.Id == id);

        // Admin değilse sadece atandığı projeyi getir
        if (!isAdmin)
        {
            query = query.Where(p => p.ProjectUsers.Any(pu => pu.UserId == userId));
        }

        var project = await query.FirstOrDefaultAsync();

        if (project == null)
        {
            return null;
        }

        return new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedDate = project.CreatedDate,
            UserIds = project.ProjectUsers.Select(pu => pu.UserId).ToList(),
            UserNames = project.ProjectUsers.Select(pu => pu.User.Username).ToList()
        };
    }

    public async Task<ProjectResponseDto> CreateProjectAsync(CreateProjectDto createProjectDto)
    {
        // Proje oluştur
        var project = new Project
        {
            Name = createProjectDto.Name,
            Description = createProjectDto.Description,
            CreatedDate = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // Kullanıcı atamalarını yap
        if (createProjectDto.UserIds != null && createProjectDto.UserIds.Any())
        {
            // UserIds'lerin geçerli olduğunu kontrol et
            var validUserIds = await _context.Users
                .Where(u => createProjectDto.UserIds.Contains(u.Id))
                .Select(u => u.Id)
                .ToListAsync();

            var projectUsers = validUserIds.Select(userId => new ProjectUser
            {
                ProjectId = project.Id,
                UserId = userId
            }).ToList();

            _context.ProjectUsers.AddRange(projectUsers);
            await _context.SaveChangesAsync();
        }

        // ProjectUsers'ı yükle
        await _context.Entry(project)
            .Collection(p => p.ProjectUsers)
            .Query()
            .Include(pu => pu.User)
            .LoadAsync();

        return new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedDate = project.CreatedDate,
            UserIds = project.ProjectUsers.Select(pu => pu.UserId).ToList(),
            UserNames = project.ProjectUsers.Select(pu => pu.User.Username).ToList()
        };
    }

    public async Task<ProjectResponseDto?> UpdateProjectAsync(int id, UpdateProjectDto updateProjectDto)
    {
        var project = await _context.Projects
            .Include(p => p.ProjectUsers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return null;
        }

        // Proje bilgilerini güncelle
        project.Name = updateProjectDto.Name;
        project.Description = updateProjectDto.Description;

        // Kullanıcı atamalarını güncelle
        if (updateProjectDto.UserIds != null)
        {
            // Mevcut atamaları kaldır
            _context.ProjectUsers.RemoveRange(project.ProjectUsers);

            // Yeni atamaları ekle
            if (updateProjectDto.UserIds.Any())
            {
                // UserIds'lerin geçerli olduğunu kontrol et
                var validUserIds = await _context.Users
                    .Where(u => updateProjectDto.UserIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();

                var projectUsers = validUserIds.Select(userId => new ProjectUser
                {
                    ProjectId = project.Id,
                    UserId = userId
                }).ToList();

                _context.ProjectUsers.AddRange(projectUsers);
            }
        }

        await _context.SaveChangesAsync();

        // ProjectUsers'ı yeniden yükle
        await _context.Entry(project)
            .Collection(p => p.ProjectUsers)
            .Query()
            .Include(pu => pu.User)
            .LoadAsync();

        return new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedDate = project.CreatedDate,
            UserIds = project.ProjectUsers.Select(pu => pu.UserId).ToList(),
            UserNames = project.ProjectUsers.Select(pu => pu.User.Username).ToList()
        };
    }

    public async Task<bool> DeleteProjectAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return false;
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return true;
    }
}
