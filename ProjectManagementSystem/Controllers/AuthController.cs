using Microsoft.AspNetCore.Mvc;
using ProjectManagementSystem.DTOs;
using ProjectManagementSystem.Services.Auth;

namespace ProjectManagementSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (string.IsNullOrWhiteSpace(registerDto.Email) || 
            string.IsNullOrWhiteSpace(registerDto.Password) || 
            string.IsNullOrWhiteSpace(registerDto.Username))
        {
            return BadRequest(new { message = "Username, email and password are required." });
        }

        var result = await _authService.Register(registerDto);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        var response = new LoginResponse
        {
            Token = result.Token!,
            Role = result.Role!,
            UserId = result.UserId!.Value,
            Username = result.Username!
        };

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var result = await _authService.Login(loginDto);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        var response = new LoginResponse
        {
            Token = result.Token!,
            Role = result.Role!,
            UserId = result.UserId!.Value,
            Username = result.Username!
        };

        return Ok(response);
    }
}

