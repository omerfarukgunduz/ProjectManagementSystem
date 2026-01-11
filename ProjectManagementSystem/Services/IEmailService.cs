namespace ProjectManagementSystem.Services;

public interface IEmailService
{
    Task<bool> SendTaskAssignmentEmailAsync(string toEmail, string toName, string taskTitle, string taskDescription, string projectName, string priority, string status);
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string toName, string resetToken, string resetUrl);
    Task<bool> IsEmailConfiguredAsync();
}
