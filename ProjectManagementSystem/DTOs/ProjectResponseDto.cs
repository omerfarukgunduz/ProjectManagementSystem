namespace ProjectManagementSystem.DTOs;

public class ProjectResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public List<int> UserIds { get; set; } = new List<int>();
    public List<string> UserNames { get; set; } = new List<string>();
}
