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

    /// <summary>
    /// Logout endpoint - invalidates the current session
    /// </summary>
    [HttpPost("logout")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult Logout()
    {
        // JWT tokens are stateless, so we just return success
        // The client should remove the token from storage
        return Ok(new { message = "Logout successful." });
    }

    /// <summary>
    /// Forgot password - sends password reset email
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _authService.ForgotPasswordAsync(forgotPasswordDto);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            return StatusCode(500, new { message = "Şifre sıfırlama işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.", error = ex.Message });
        }
    }

    /// <summary>
    /// Reset password - resets password using token
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.ResetPasswordAsync(resetPasswordDto);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }
}

