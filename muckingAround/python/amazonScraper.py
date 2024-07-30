from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys
import threading
import os.path

stopWriting = False
animation_thread = None

# Cool fetching animation
def animate_fetching():
    global stopWriting
    message = "Fetching details"
    dots = ""
    increasing = True
    
    while not stopWriting:
        sys.stdout.write(f"\r{message}{dots}{' ' * (3 - len(dots))}")
        sys.stdout.flush()
        
        if increasing:
            dots += "."
            if len(dots) == 3:
                increasing = False
        else:
            dots = dots[:-1]
            if len(dots) == 0:
                increasing = True
        
        time.sleep(1)
    
    sys.stdout.write("\r" + " " * len(message) + "\r")
    sys.stdout.flush()

# Function to write to a file
def write_to_file(title, price):
    if os.path.isfile("items.txt"):
        with open("items.txt", "a") as itemsFile:
            itemsFile.write(f"Title: {title}\nPrice: £{price}\n")
    else:
        with open("items.txt", 'w') as itemsFile:
            itemsFile.write(f"Title: {title}\nPrice: £{price}\n")
    print("File written to.")

# Function to scrape Amazon product details
def scrape_amazon_product(url):
    global stopWriting
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    
    try:
        driver.get(url)
        
        # Wait for the page to load completely and the product details to be visible
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "productTitle"))
        )
        
        # Fetch product title
        title_element = driver.find_element(By.ID, "productTitle")
        title = title_element.text
        
        # Fetch product price
        price_whole = driver.find_element(By.XPATH, "//span[@class='a-price-whole']")
        price_fraction = driver.find_element(By.XPATH, "//span[@class='a-price-fraction']")
        
        price = f"{price_whole.text}.{price_fraction.text}"
        print("\nFound item!")
        print("\nTitle:", title)
        print(f"Price: £{price}")

        # Stop the animation and ensure the console is clean
        global animation_thread
        stopWriting = True
        animation_thread.join()  # Ensure animation thread has finished
        sys.stdout.write("\r" + " " * 50 + "\r")  # Clear the line
        
        # Prompt the user to write to a file
        writeFileChoice = input("Do you want to write this to items.txt? (Y/N) ").upper()
        if writeFileChoice == "Y":
            write_to_file(title, price)
        else:
            print("File not written to.")    
    except Exception as e:
        print("An error occurred:", e)
    finally:
        driver.quit()

def main():
    global animation_thread
    url = input("Enter an Amazon product URL: ")
    animation_thread = threading.Thread(target=animate_fetching)
    animation_thread.start()
    scrape_amazon_product(url)

if __name__ == "__main__":
    main()
