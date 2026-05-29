using lab5csharp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SelectPdf;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.IO;
using System.Threading.Tasks;

namespace lab5csharp.Controllers
{
    public class ReportsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly ICompositeViewEngine _viewEngine;

        public ReportsController(AppDbContext context, ICompositeViewEngine viewEngine)
        {
            _context = context;
            _viewEngine = viewEngine;
        }

        // Вспомогательный метод для рендеринга View в строку HTML
        private async Task<string> RenderViewAsync(string viewName, object model, bool partial = false)
        {
            ViewData.Model = model;

            var actionContext = ControllerContext;

            using var sw = new StringWriter();
            IView view = partial
                ? _viewEngine.FindView(actionContext, viewName, false).View
                : _viewEngine.GetView(null, viewName, false).View;

            var viewContext = new ViewContext(
                actionContext,
                view,
                ViewData,
                TempData,
                sw,
                new HtmlHelperOptions()
            );

            await view.RenderAsync(viewContext);
            return sw.GetStringBuilder().ToString();
        }

        public IActionResult Index()
        {
            return View();
        }

        // Пример отчёта с HTML
        public async Task<IActionResult> PaymentsByUser()
        {
            var data = await _context.Payments
                .Include(p => p.User)
                .GroupBy(p => p.User.Username)
                .Select(g => new {
                    Username = g.Key,
                    TotalPaid = g.Sum(p => p.Amount)
                }).ToListAsync();

            return View(data);
        }

        // И PDF версия этого отчёта
        public async Task<IActionResult> PaymentsByUserPdf()
        {
            var data = await _context.Payments
                .Include(p => p.User)
                .GroupBy(p => p.User.Username)
                .Select(g => new {
                    Username = g.Key,
                    TotalPaid = g.Sum(p => p.Amount)
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("PaymentsByUser", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "PaymentsByUserReport.pdf");
        }

        public async Task<IActionResult> RequestsByStatus()
        {
            var data = await _context.ServiceRequests
                .GroupBy(r => r.Status)
                .Select(g => new {
                    Status = g.Key,
                    Count = g.Count()
                }).ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> RequestsByStatusPdf()
        {
            var data = await _context.ServiceRequests
                .GroupBy(r => r.Status)
                .Select(g => new {
                    Status = g.Key,
                    Count = g.Count()
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("RequestsByStatus", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "RequestsByStatusReport.pdf");
        }

        public async Task<IActionResult> UsersWithApartments()
        {
            var data = await _context.Users
                .Include(u => u.Apartment)
                .Select(u => new {
                    u.Username,
                    Apartment = $"№{u.Apartment.Number}, этаж {u.Apartment.Floor}"
                }).ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> UsersWithApartmentsPdf()
        {
            var data = await _context.Users
                .Include(u => u.Apartment)
                .Select(u => new {
                    u.Username,
                    Apartment = $"№{u.Apartment.Number}, этаж {u.Apartment.Floor}"
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("UsersWithApartments", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "UsersWithApartmentsReport.pdf");
        }

        public async Task<IActionResult> PaymentsByMonth(int month)
        {
            var data = await _context.Payments
                .Where(p => p.PaymentDate.Month == month)
                .Include(p => p.User)
                .Select(p => new {
                    p.User.Username,
                    p.Amount,
                    p.PaymentDate,
                    p.Purpose
                }).ToListAsync();

            ViewBag.Month = month;
            return View(data);
        }

        public async Task<IActionResult> PaymentsByMonthPdf(int month)
        {
            var data = await _context.Payments
                .Where(p => p.PaymentDate.Month == month)
                .Include(p => p.User)
                .Select(p => new {
                    p.User.Username,
                    p.Amount,
                    p.PaymentDate,
                    p.Purpose
                }).ToListAsync();

            ViewBag.Month = month;
            string htmlContent = await RenderViewAsync("PaymentsByMonth", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", $"PaymentsByMonth_{month}.pdf");
        }

        public async Task<IActionResult> ApartmentsWithBuildings()
        {
            var data = await _context.Apartments
                .Include(a => a.Building)
                .Select(a => new {
                    a.Number,
                    a.Floor,
                    a.Area,
                    BuildingAddress = a.Building.Address
                }).ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> ApartmentsWithBuildingsPdf()
        {
            var data = await _context.Apartments
                .Include(a => a.Building)
                .Select(a => new {
                    a.Number,
                    a.Floor,
                    a.Area,
                    BuildingAddress = a.Building.Address
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("ApartmentsWithBuildings", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "ApartmentsWithBuildingsReport.pdf");
        }

        public async Task<IActionResult> AveragePaymentByPurpose()
        {
            var data = await _context.Payments
                .GroupBy(p => p.Purpose)
                .Select(g => new {
                    Purpose = g.Key,
                    Average = g.Average(p => p.Amount)
                }).ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> AveragePaymentByPurposePdf()
        {
            var data = await _context.Payments
                .GroupBy(p => p.Purpose)
                .Select(g => new {
                    Purpose = g.Key,
                    Average = g.Average(p => p.Amount)
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("AveragePaymentByPurpose", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "AveragePaymentByPurposeReport.pdf");
        }

        public async Task<IActionResult> BuildingsWithApartmentsCount()
        {
            var data = await _context.Buildings
                .Select(b => new {
                    b.Address,
                    b.NumberOfFloors,
                    ApartmentsCount = _context.Apartments.Count(a => a.BuildingId == b.Id)
                }).ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> BuildingsWithApartmentsCountPdf()
        {
            var data = await _context.Buildings
                .Select(b => new {
                    b.Address,
                    b.NumberOfFloors,
                    ApartmentsCount = _context.Apartments.Count(a => a.BuildingId == b.Id)
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("BuildingsWithApartmentsCount", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "BuildingsWithApartmentsCountReport.pdf");
        }

        public async Task<IActionResult> LatestRequests()
        {
            var data = await _context.ServiceRequests
                .Include(r => r.User)
                .Include(r => r.Apartment)
                .OrderByDescending(r => r.RequestDate)
                .Take(10)
                .Select(r => new {
                    r.Description,
                    r.Status,
                    r.RequestDate,
                    r.User.Username,
                    ApartmentNumber = r.Apartment.Number
                }).ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> LatestRequestsPdf()
        {
            var data = await _context.ServiceRequests
                .Include(r => r.User)
                .Include(r => r.Apartment)
                .OrderByDescending(r => r.RequestDate)
                .Take(10)
                .Select(r => new {
                    r.Description,
                    r.Status,
                    r.RequestDate,
                    r.User.Username,
                    ApartmentNumber = r.Apartment.Number
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("LatestRequests", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "LatestRequestsReport.pdf");
        }

        public async Task<IActionResult> UsersWithoutPayments()
        {
            var paidUserIds = await _context.Payments.Select(p => p.UserId).Distinct().ToListAsync();
            var data = await _context.Users
                .Where(u => !paidUserIds.Contains(u.Id))
                .Select(u => new { u.Username, u.FullName })
                .ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> UsersWithoutPaymentsPdf()
        {
            var paidUserIds = await _context.Payments.Select(p => p.UserId).Distinct().ToListAsync();
            var data = await _context.Users
                .Where(u => !paidUserIds.Contains(u.Id))
                .Select(u => new { u.Username, u.FullName })
                .ToListAsync();

            string htmlContent = await RenderViewAsync("UsersWithoutPayments", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "UsersWithoutPaymentsReport.pdf");
        }

        public async Task<IActionResult> TotalAreaByBuilding()
        {
            var data = await _context.Buildings
                .Select(b => new {
                    b.Address,
                    TotalArea = _context.Apartments
                        .Where(a => a.BuildingId == b.Id)
                        .Sum(a => (double?)a.Area) ?? 0
                }).ToListAsync();

            return View(data);
        }

        public async Task<IActionResult> TotalAreaByBuildingPdf()
        {
            var data = await _context.Buildings
                .Select(b => new {
                    b.Address,
                    TotalArea = _context.Apartments
                        .Where(a => a.BuildingId == b.Id)
                        .Sum(a => (double?)a.Area) ?? 0
                }).ToListAsync();

            string htmlContent = await RenderViewAsync("TotalAreaByBuilding", data, true);

            var converter = new HtmlToPdf();
            PdfDocument doc = converter.ConvertHtmlString(htmlContent);

            byte[] pdf = doc.Save();
            doc.Close();

            return File(pdf, "application/pdf", "TotalAreaByBuildingReport.pdf");
        }
    }
}
