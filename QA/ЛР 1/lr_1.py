from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Chrome()

try:
    driver.get("https://pastebin.com")
    wait = WebDriverWait(driver, 10)

    # Fill paste text
    paste_textarea = wait.until(EC.presence_of_element_located((By.ID, "postform-text")))
    paste_textarea.send_keys("Hello from Selenium! This is an automated test paste.")

    # Select expiration
    expiration_field = driver.find_element(By.XPATH, "//span[@id='select2-postform-expiration-container']")
    expiration_field.click()
    option_10min = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//li[contains(text(), '10 Minutes')]"))
    )
    option_10min.click()

    # Fill title
    paste_title = driver.find_element(By.ID, "postform-name")
    paste_title.send_keys("Selenium Test Paste")

    # ✅ Scroll to the button to ensure it’s visible
    create_button = driver.find_element(By.XPATH, '//button[text()="Create New Paste"]')
    driver.execute_script("arguments[0].scrollIntoView(true);", create_button)
    time.sleep(1)  # let ads reposition, if any

    # ✅ Try clicking via JS to bypass overlays
    driver.execute_script("arguments[0].click();", create_button)
    
    # ⚠️ Wait for or bypass CAPTCHA manually
    try:
        captcha_frame = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, "//iframe[contains(@src, 'recaptcha')]"))
        )
        print("⚠️ CAPTCHA detected. Please solve it manually in the browser window...")
        WebDriverWait(driver, 600).until(
            EC.element_to_be_clickable((By.ID, "postform-text"))
        )
        print("✅ CAPTCHA solved, continuing automation...")
    except:
        print("✅ No CAPTCHA detected, continuing...")

    # Wait for new paste to load
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "paste_box_line1")))
    print("✅ New paste created successfully!")
    print("🔗 New paste URL:", driver.current_url)

finally:
    time.sleep(8)
    driver.quit()
