using System;
using System.Threading;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace Lab_1
{
    class Program
    {
        static void Main(string[] args)
        {
            var options = new ChromeOptions();

            options.AddArgument("--disable-blink-features=AutomationControlled");
            options.AddExcludedArgument("enable-automation");
            options.AddAdditionalOption("useAutomationExtension", false);
            options.AddArgument("--start-maximized");

            IWebDriver driver = new ChromeDriver(options);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(60));

            try
            {

                driver.Navigate().GoToUrl("https://pastebin.com");

                driver.FindElement(By.Id("postform-text")).SendKeys("Test for lab 1");

                IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
                js.ExecuteScript("window.scrollBy(0, 350);");
                Thread.Sleep(1000);

                driver.FindElement(By.Id("select2-postform-expiration-container")).Click();
                Thread.Sleep(500);
                driver.FindElement(By.XPath("//li[text()='10 Minutes']")).Click();

                string myTitle = "Lab 1 Final";
                driver.FindElement(By.Id("postform-name")).SendKeys(myTitle);

                var createBtn = driver.FindElement(By.XPath("//button[text()='Create New Paste']"));
                js.ExecuteScript("arguments[0].click();", createBtn);

                Thread.Sleep(3000);

                try
                {
                    var frames = driver.FindElements(By.XPath("//iframe[starts-with(@src, 'https://challenges.cloudflare.com')]"));
                    if (frames.Count > 0)
                    {
                        driver.SwitchTo().Frame(frames[0]);
                        var body = driver.FindElement(By.TagName("body"));
                        body.Click();

                        driver.SwitchTo().DefaultContent();
                    }
                }
                catch
                {
                    driver.SwitchTo().DefaultContent();
                }

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.ResetColor();

                try
                {
                    wait.Until(d => d.Title.Contains(myTitle));

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("\nСторінка завантажилась!");
                }
                catch (WebDriverTimeoutException)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("\nЧас вийшов. Перевірка не пройдена.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Помилка: " + ex.Message);
            }
            finally
            {
                Console.ResetColor();
                Console.WriteLine("\nНатисніть ENTER, щоб закрити...");
                Console.ReadLine();
                driver.Quit();
            }
        }
    }
}
