using Microsoft.EntityFrameworkCore;
using ProjectManagementSystem.Data;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Entities;

namespace ProjectManagementSystem.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                RoleName = u.Role.Name,
                RoleId = u.RoleId,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return users;
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return null;
        }

        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            RoleName = user.Role.Name,
            RoleId = user.RoleId,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        // Email kontrolü
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == createUserDto.Email);

        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        // Rol kontrolü
        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == createUserDto.RoleId);

        if (role == null)
        {
            throw new InvalidOperationException("Role not found.");
        }

        // Şifreyi hashle
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password);

        // Kullanıcı oluştur
        var user = new User
        {
            Username = createUserDto.Username,
            Email = createUserDto.Email,
            PasswordHash = passwordHash,
            RoleId = createUserDto.RoleId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Role bilgisini yükle
        await _context.Entry(user)
            .Reference(u => u.Role)
            .LoadAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            RoleName = user.Role.Name,
            RoleId = user.RoleId,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserResponseDto?> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return null;
        }

        // Email değişiyorsa kontrol et
        if (user.Email != updateUserDto.Email)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == updateUserDto.Email && u.Id != id);

            if (existingUser != null)
            {
                throw new InvalidOperationException("Email already exists.");
            }
        }

        // Rol kontrolü
        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == updateUserDto.RoleId);

        if (role == null)
        {
            throw new InvalidOperationException("Role not found.");
        }

        // Güncelle
        user.Username = updateUserDto.Username;
        user.Email = updateUserDto.Email;
        user.RoleId = updateUserDto.RoleId;

        await _context.SaveChangesAsync();

        // Role bilgisini yeniden yükle
        await _context.Entry(user)
            .Reference(u => u.Role)
            .LoadAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            RoleName = user.Role.Name,
            RoleId = user.RoleId,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return false;
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        // Mevcut şifreyi doğrula
        if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("Current password is incorrect.");
        }

        // Yeni şifreyi hashle ve güncelle
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
        await _context.SaveChangesAsync();

        return true;
    }
}

