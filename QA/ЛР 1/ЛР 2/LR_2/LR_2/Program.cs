using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System;
using System.Threading;

namespace PetStoreConsoleSlow
{
    // ЧАСТИНА 1: PAGE OBJECTS

    public class BasePage
    {
        protected IWebDriver Driver;
        protected WebDriverWait Wait;

        public BasePage(IWebDriver driver)
        {
            Driver = driver;
            Wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        protected void Sleep()
        {
            Thread.Sleep(2000);
        }
    }

    public class MainPage : BasePage
    {
        public MainPage(IWebDriver driver) : base(driver) { }

        public void GoTo()
        {
            Driver.Navigate().GoToUrl("https://petstore.octoperf.com/actions/Catalog.action");
            Sleep();
        }

        public void ClickSignIn()
        {
            Sleep();
            Driver.FindElement(By.LinkText("Sign In")).Click();
        }

        public void ClickSignOut()
        {
            Sleep();
            Driver.FindElement(By.LinkText("Sign Out")).Click();
        }

        public bool IsSignInPresent()
        {
            try { return Driver.FindElement(By.LinkText("Sign In")).Displayed; }
            catch { return false; }
        }
    }

    public class LoginPage : BasePage
    {
        public LoginPage(IWebDriver driver) : base(driver) { }

        public void ClickRegisterNow()
        {
            Sleep();
            Driver.FindElement(By.LinkText("Register Now!")).Click();
        }

        public void Login(string username, string password)
        {
            Sleep();
            var userField = Driver.FindElement(By.Name("username"));
            userField.Clear();
            userField.SendKeys(username);

            Sleep();
            var passField = Driver.FindElement(By.Name("password"));
            passField.Clear();
            passField.SendKeys(password);

            Sleep();
            Driver.FindElement(By.Name("signon")).Click();
        }

        public string GetErrorMessage()
        {
            Sleep();
            return Driver.FindElement(By.XPath("//li[contains(text(), 'Invalid')]")).Text;
        }
    }

    public class RegisterPage : BasePage
    {
        public RegisterPage(IWebDriver driver) : base(driver) { }

        public void FillRegistrationForm(string userId, string password)
        {
            Sleep();
            Driver.FindElement(By.Name("username")).SendKeys(userId);
            Driver.FindElement(By.Name("password")).SendKeys(password);
            Driver.FindElement(By.Name("repeatedPassword")).SendKeys(password);

            Driver.FindElement(By.Name("account.firstName")).SendKeys("Test");
            Driver.FindElement(By.Name("account.lastName")).SendKeys("User");
            Driver.FindElement(By.Name("account.email")).SendKeys("test@test.com");
            Driver.FindElement(By.Name("account.phone")).SendKeys("123456");
            Driver.FindElement(By.Name("account.address1")).SendKeys("Street 1");
            Driver.FindElement(By.Name("account.city")).SendKeys("Kyiv");
            Driver.FindElement(By.Name("account.state")).SendKeys("UA");
            Driver.FindElement(By.Name("account.zip")).SendKeys("12345");
            Driver.FindElement(By.Name("account.country")).SendKeys("Ukraine");
        }

        public void SubmitRegistration()
        {
            Sleep();
            Driver.FindElement(By.Name("newAccount")).Click();
        }
    }

    public class CatalogPage : BasePage
    {
        public CatalogPage(IWebDriver driver) : base(driver) { }

        public void SelectCategory(string category)
        {
            Console.WriteLine($"пошук категорії {category}");
            Sleep();
            Driver.FindElement(By.XPath($"//a[contains(@href, '{category.ToUpper()}')]")).Click();
        }

        public void SelectProduct(string productId)
        {
            Sleep();
            Driver.FindElement(By.LinkText(productId)).Click();
        }

        public void AddItemToCart(string itemId)
        {
            Sleep();
            Driver.FindElement(By.LinkText(itemId)).Click();

            Sleep();
            Console.WriteLine("пошук Add to Cart");
            Driver.FindElement(By.LinkText("Add to Cart")).Click();
        }
    }

    public class CartPage : BasePage
    {
        public CartPage(IWebDriver driver) : base(driver) { }

        public void RemoveItem()
        {
            Sleep();
            Driver.FindElement(By.LinkText("Remove")).Click();
        }

        public bool IsCartEmpty()
        {
            Sleep();
            return Driver.PageSource.Contains("Your cart is empty");
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine(" СТАРТ ");

            var options = new ChromeOptions();
            options.AddArgument("--start-maximized");
            options.AddArgument("--disable-blink-features=AutomationControlled");

            IWebDriver driver = new ChromeDriver(options);

            var mainPage = new MainPage(driver);
            var loginPage = new LoginPage(driver);
            var registerPage = new RegisterPage(driver);
            var catalogPage = new CatalogPage(driver);
            var cartPage = new CartPage(driver);

            string username = "User" + new Random().Next(10000, 99999);
            string password = "password123";

            try
            {
                Console.WriteLine("\n[1] Реєстрація");
                mainPage.GoTo();
                mainPage.ClickSignIn();
                loginPage.ClickRegisterNow();

                registerPage.FillRegistrationForm(username, password);
                registerPage.SubmitRegistration();
                Console.WriteLine("Реєстрація пройшла.");

                if (mainPage.IsSignInPresent())
                {
                    Console.WriteLine("Вхід в систему");
                    mainPage.ClickSignIn();
                    loginPage.Login(username, password);
                }

                Console.WriteLine("\n[2] Купівля товару");
                mainPage.GoTo();

                catalogPage.SelectCategory("Dogs");
                catalogPage.SelectProduct("K9-BD-01");
                catalogPage.AddItemToCart("EST-6");

                if (driver.PageSource.Contains("K9-BD-01"))
                    Console.WriteLine("Товар у кошику!");

                Console.WriteLine("\n[3] Видалення");
                cartPage.RemoveItem();

                if (cartPage.IsCartEmpty())
                    Console.WriteLine("Кошик порожній.");

                mainPage.ClickSignOut();
                Console.WriteLine("Вихід виконано.");

                Console.WriteLine("\n[4] Негативний тест (помилка входу)");
                mainPage.ClickSignIn();
                loginPage.Login(username, "WRONG_PASS");

                string error = loginPage.GetErrorMessage();
                if (error.Contains("Invalid"))
                {
                    Console.WriteLine($"Помилку знайдено: {error}");
                }
                else
                {
                    Console.WriteLine("Повідомлення не знайдено.");
                }
                Console.ResetColor();

            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\nПОМИЛКА: " + ex.Message);
                Console.ResetColor();
            }
            finally
            {
                Console.WriteLine("\nРобота завершена. Натисніть ENTER...");
                Console.ReadLine();
                driver.Quit();
            }
        }
    }
}
