using Microsoft.AspNetCore.Mvc;

namespace lab5csharp.Controllers
{
    public class LinksController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
