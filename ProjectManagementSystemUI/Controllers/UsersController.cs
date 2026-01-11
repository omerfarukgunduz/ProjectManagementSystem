using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace ProjectManagementSystemUI.Controllers
{
    [Route("Users")]
    public class UsersController : Controller
    {
        private readonly IConfiguration _configuration;

        public UsersController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [Route("")]
        [Route("Index")]
        public IActionResult Index()
        {
            ViewBag.ApiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7241/api";
            return View();
        }

        [Route("Add")]
        public IActionResult Add()
        {
            ViewBag.ApiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7241/api";
            return View();
        }

        [Route("Edit/{id}")]
        public IActionResult Edit(int id)
        {
            ViewBag.UserId = id;
            ViewBag.ApiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7241/api";
            return View();
        }
    }
}
