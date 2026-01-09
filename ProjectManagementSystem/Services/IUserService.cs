using ProjectManagementSystem.DTOs;

namespace ProjectManagementSystem.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto?> GetUserByIdAsync(int id);
    Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto);
    Task<UserResponseDto?> UpdateUserAsync(int id, UpdateUserDto updateUserDto);
    Task<bool> DeleteUserAsync(int id);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
}

