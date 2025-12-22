using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace SeleniumLabTask
{
    class Program
    {
        static void Main(string[] args)
        {
            var options = new ChromeOptions();
            options.AddArgument("--start-maximized");
            options.AddArgument("--disable-blink-features=AutomationControlled");

            IWebDriver driver = new ChromeDriver(options);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));

            try
            {
                driver.Navigate().GoToUrl("http://demowebshop.tricentis.com/");

                var apparelLink = wait.Until(d => d.FindElement(By.PartialLinkText("Apparel & Shoes")));
                apparelLink.Click();

                var sortDropdown = wait.Until(d => d.FindElement(By.Id("products-orderby")));
                var sortSelect = new SelectElement(sortDropdown);
                sortSelect.SelectByText("Name: A to Z");

                var viewDropdown = wait.Until(d => d.FindElement(By.Id("products-viewmode")));
                var viewSelect = new SelectElement(viewDropdown);
                viewSelect.SelectByText("List");

                Thread.Sleep(1000);

                var productLinks = wait.Until(d => d.FindElements(By.CssSelector(".product-title > a")))
                                       .Take(2)
                                       .Select(e => e.GetAttribute("href"))
                                       .ToList();

                foreach (var link in productLinks)
                {
                    driver.Navigate().GoToUrl(link);
                    var addToCartBtn = wait.Until(d => d.FindElement(By.CssSelector("input[id^='add-to-cart-button-']")));

                    addToCartBtn.Click();

                    wait.Until(d => d.FindElement(By.Id("bar-notification")));
                }

                Thread.Sleep(1000);

                var cartQtyElement = wait.Until(d => d.FindElement(By.ClassName("cart-qty")));
                var cartQtyText = cartQtyElement.Text; 

                Console.WriteLine($"\nКількість товарів у кошику: {cartQtyText}");

                if (cartQtyText.Contains("(2)"))
                {
                    Console.WriteLine("Тест пройдено успішно! 2 товари додано.");
                }
                else
                {
                    Console.WriteLine("Тест не пройдено. Кількість не співпадає.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Виникла помилка: " + ex.Message);
            }
            finally
            {
                Console.WriteLine("\nНатисніть Enter для завершення...");
                Console.ReadLine();
                driver.Quit();
            }
        }
    }
}