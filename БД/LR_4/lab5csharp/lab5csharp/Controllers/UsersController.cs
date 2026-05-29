using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using lab5csharp.Data;
using lab5csharp.Models;

namespace lab5csharp.Controllers
{
    public class UsersController : Controller
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Users
        public async Task<IActionResult> Index()
        {
            var appDbContext = _context.Users.Include(u => u.Apartment);
            return View(await appDbContext.ToListAsync());
        }

        // GET: Users/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var user = await _context.Users
                .Include(u => u.Apartment)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            return View(user);
        }

        // GET: Users/Create
        // GET: Users/Create
        public IActionResult Create()
        {
            // Формируем список квартир с дополнительным пунктом "Не выбирать квартиру"
            var apartments = _context.Apartments
                .Select(a => new
                {
                    a.Id,
                    Display = $"№{a.Number}, этаж {a.Floor}"
                })
                .ToList();

            var apartmentsList = new List<SelectListItem>
    {
        new SelectListItem { Value = "", Text = "Без квартиры" } // пустой вариант
    };

            apartmentsList.AddRange(apartments.Select(a => new SelectListItem
            {
                Value = a.Id.ToString(),
                Text = a.Display
            }));

            ViewData["ApartmentId"] = apartmentsList;

            return View();
        }

        // POST: Users/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Username,PasswordHash,FullName,Phone,Email,Role,ApartmentId")] User user)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                ViewBag.Errors = errors;

                
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

                ViewData["ApartmentId"] = apartmentsList;

                return View(user);
            }

            // Если квартира не выбрана — ставим null
            if (string.IsNullOrEmpty(user.ApartmentId?.ToString()) || user.ApartmentId == 0)
            {
                user.ApartmentId = null;
            }

            _context.Add(user);
            await _context.SaveChangesAsync();

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("UserRole", user.Role);

            return RedirectToAction("Index", "Links");
        }


        // GET: Users/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            ViewData["ApartmentId"] = new SelectList(_context.Apartments, "Id", "Id", user.ApartmentId);
            return View(user);
        }

        // POST: Users/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Username,PasswordHash,FullName,Phone,Email,Role,ApartmentId")] User user)
        {
            if (id != user.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(user);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!UserExists(user.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["ApartmentId"] = new SelectList(_context.Apartments, "Id", "Id", user.ApartmentId);
            return View(user);
        }

        // GET: Users/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var user = await _context.Users
                .Include(u => u.Apartment)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (user == null)
            {
                return NotFound();
            }

            return View(user);
        }

        // POST: Users/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        // POST: Users/Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                ModelState.AddModelError("", "Введите логин и пароль");
                return View();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null || user.PasswordHash != password)
            {
                ModelState.AddModelError("", "Неверный логин или пароль");
                return View();
            }

            // Успешный вход — сохраняем ID, логин и РОЛЬ в сессию
            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("UserRole", user.Role); // ← Вот тут сохраняем роль

            return RedirectToAction("Index", "Links"); // редирект куда тебе надо
        }


        // POST: Users/Logout
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }
}
