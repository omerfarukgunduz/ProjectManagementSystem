using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace ProjectManagementSystemUI.Controllers
{
    [Route("Auth")]
    public class AuthController : Controller
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [Route("")]
        [Route("Login")]
        public IActionResult Login()
        {
            ViewBag.ApiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7241/api";
            return View();
        }

        [Route("ForgotPassword")]
        public IActionResult ForgotPassword()
        {
            ViewBag.ApiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7241/api";
            return View();
        }

        [Route("ResetPassword")]
        public IActionResult ResetPassword(string? token, string? email)
        {
            ViewBag.ApiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7241/api";
            ViewBag.Token = token;
            ViewBag.Email = email;
            return View();
        }
    }
}
