using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace ProjectManagementSystemUI.Controllers
{
    [Route("Settings")]
    public class SettingsController : Controller
    {
        private readonly IConfiguration _configuration;

        public SettingsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [Route("")]
        [Route("Index")]
        [Route("Smtp")]
        public IActionResult Smtp()
        {
            // Admin kontrolü JavaScript tarafında yapılıyor
            // API endpoint'leri zaten [Authorize(Roles = "Admin")] ile korumalı
            ViewBag.ApiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7241/api";
            return View();
        }
    }
}
