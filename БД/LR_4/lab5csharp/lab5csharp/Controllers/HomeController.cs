using lab5csharp.Data;
using lab5csharp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Diagnostics;

namespace lab5csharp.Controllers
{
    public class HomeController : Controller
    {
        private readonly AppDbContext _context;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger, AppDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult Index()
        {
            var apartments = _context.Apartments
                .Select(a => new
                {
                    a.Id,
                    Display = $"№{a.Number}, этаж {a.Floor}"
                })
                .ToList();

            var apartmentsList = new List<SelectListItem>
        {
            new SelectListItem { Value = "", Text = "Без квартиры" }
        };

            apartmentsList.AddRange(apartments.Select(a => new SelectListItem
            {
                Value = a.Id.ToString(),
                Text = a.Display
            }));

            ViewBag.ApartmentId = apartmentsList;

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
