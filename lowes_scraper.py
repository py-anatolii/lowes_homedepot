from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from bs4 import BeautifulSoup
import pandas as pd
import time
import math
import os

from google_map_api import find_unique_stores

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('authority=www.lowes.com')
    options.add_argument('accept=text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7')
    options.add_argument('accept-language=en-US,en;q=0.9')
    options.add_argument('cache-control=no-cache')
    options.add_argument('pragma=no-cache')
    options.add_argument('referer=https://www.lowes.com')
    options.add_argument('sec-ch-ua="Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"')
    options.add_argument('sec-ch-ua-mobile=?0')
    options.add_argument('sec-ch-ua-platform="Windows"')
    options.add_argument('sec-fetch-dest=document')
    options.add_argument('sec-fetch-mode=navigate')
    options.add_argument('sec-fetch-site=same-origin')
    options.add_argument('sec-fetch-user=?1')
    options.add_argument('upgrade-insecure-requests=1')
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()

    return driver

def click_second_toggle_button(driver):
    buttons = WebDriverWait(driver, 10).until(
        EC.visibility_of_all_elements_located((By.CSS_SELECTOR, 'button[aria-label="toggle button"]'))
    )
    if len(buttons) >= 2:
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable(buttons[1]))
        buttons[1].click()
        print("Second toggle button clicked successfully!")
    else:
        print("Less than two buttons found with the given selector.")
    time.sleep(1)

def click_close_button(driver):
    close_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.modal-close"))
    )
    close_button.click()

def scroll_down(driver):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        
def open_search_modal(driver):
    open_modal_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a[data-linkid='selected-store']"))
    )
    open_modal_button.click()

def clear_search_input(driver):
    search_input = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='ZIP Code, City, State or Store #']"))
    )
    search_input.click()
    search_input.send_keys(Keys.CONTROL + "a")
    search_input.send_keys(Keys.BACKSPACE)
    return search_input

def click_search_button(driver):
    search_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.rightArrowBtn"))
    )
    search_button.click()
    
def extract_store_data(driver, filtered_stores):
    open_search_modal(driver)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "storeName")))

    filtered_store_addresses = [store["store"].split(',')[1].strip().split()[0] for store in filtered_stores]
    filtered_store_distances = [store["distance"] for store in filtered_stores]

    store_list = []
    store_no_list = []
    store_distance_list = []

    for i, store in enumerate(filtered_stores):
        search_input = clear_search_input(driver)
        search_input.send_keys(store["store"])
        click_search_button(driver)
        time.sleep(1)
        
        store_cards = driver.find_elements(By.CLASS_NAME, 'storeCardstyles__StoreCardWrapper-sc-7bbdlt-11')
        for store_card in store_cards:
            store_name = store_card.find_element(By.CSS_SELECTOR, "h5.storeName").text.strip()
            store_address = store_card.find_element(By.CSS_SELECTOR, 'span[data-id="sc-get-directions"]').text.strip().split()[0]
            store_no = store_card.find_element(By.CSS_SELECTOR, "button[data-storenumber]").get_attribute('data-storenumber')
        
            if store_address == filtered_store_addresses[i]:
                store_list.append(store_name)
                store_no_list.append(store_no)
                store_distance_list.append(filtered_store_distances[i])

    click_close_button(driver)
    return store_list, store_no_list, store_distance_list

def select_one_store(driver, store_no):
    try:
        open_search_modal(driver)
        search_input = clear_search_input(driver)
        search_input.send_keys(store_no)
        click_search_button(driver)
        time.sleep(1)

        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "button[data-storenumber]"))
        )

        set_store_buttons = driver.find_elements(By.CSS_SELECTOR, "button[data-storenumber]")
        
        for button in set_store_buttons:
            if button.get_attribute("data-storenumber") == store_no:
                if "disabled" in button.get_attribute("class") or button.get_attribute("disabled"):
                    print(f"Button with store number {store_no} is disabled. Clicking close button instead.")
                    click_close_button(driver)
                    return

                button.click()
                
                WebDriverWait(driver, 5).until(EC.staleness_of(button))
                print(f"Successfully set store number {store_no}.")
                return

        print(f"Store number {store_no} not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

    time.sleep(1)

def scrape_one_store(driver, website, csv_filename, store, store_distance):
    total_results = get_total_results(driver)
    print(f"Total results: {total_results}")

    paginate_and_scrape(driver, website, total_results, csv_filename, store, store_distance)
    
def get_total_results(driver):
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'p.results')))
    page_source = driver.page_source
    soup = BeautifulSoup(page_source, 'html.parser')
    results_text = soup.select_one('p.results').text
    total_results = int(results_text.split()[0])
    return total_results
    
def paginate_and_scrape(driver, url, total_results, csv_filename, store, store_distance):
    items_per_page = 24
    pages = math.ceil(total_results / items_per_page)
    
    if not os.path.exists(csv_filename):
        save_to_csv(csv_filename, [], [], [], [], headers=True)
    
    for i in range(1, pages + 1):
        driver.get(f"{url}&offset={(i - 1) * items_per_page}")
        click_second_toggle_button(driver)
        prices, brands = scrape_page_data(driver)
        stores = [store] * len(prices)
        distances = [store_distance] * len(prices)

        print(f"Page {i} prices: {prices}")
        print(f"Page {i} brands: {brands}")
        print(f"Total prices collected: {len(prices)}")
        print(f"Total brands collected: {len(brands)}")
        
        save_to_csv(csv_filename, prices, brands, stores, distances, headers=False)

        time.sleep(1)
        
def save_to_csv(filename, prod_price, prod_brand, prod_store, prod_distance, headers=False):
    df = pd.DataFrame({'price': prod_price, 'brand': prod_brand, 'store': prod_store, 'distance': prod_distance})
    df.to_csv(filename, mode='a', header=headers, index=False)
        
def scrape_page_data(driver):
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'pl')))
    
    scroll_down(driver)
    
    price_list = []
    brand_list = []

    products = driver.find_elements(By.CSS_SELECTOR, 'div.sc-o9wle2-4')
    for product in products:
        try:
            price = product.find_element(By.CSS_SELECTOR, 'div[aria-label^="Actual Price"]').get_attribute('aria-label').replace('Actual Price ', '')
        except:
            price = ''
        
        try:
            brand = product.find_element(By.CSS_SELECTOR, 'span[data-selector="splp-prd-brd-nm"]').text.strip()
        except:
            brand = ''
        
        price_list.append(price)
        brand_list.append(brand)
    
    return price_list, brand_list

def main():
    google_map_api_key = "AIzaSyBHowR4jBoxko0KCCd_3bz0gO5y2UArRW0"
    
    zip_code = "85041"
    key_word = "impact driver"
    radius = 50000  # radius in meters

    website = f"https://www.lowes.com/search?searchTerm={key_word}"
    csv_filename = 'lowes_prices_and_brands.csv'

    filtered_stores = find_unique_stores(google_map_api_key, zip_code, radius)["Lowe's"]
    print(f"Total stores within {radius/1000} km: {len(filtered_stores)}")
    
    driver = setup_driver()
    driver.get(website)

    store_list, store_no_list, store_distance_list = extract_store_data(driver, filtered_stores)
    print(store_no_list)

    for store, store_no, store_distance in zip(store_list, store_no_list, store_distance_list):
        print(store)
        select_one_store(driver, store_no)
        scrape_one_store(driver, website, csv_filename, store, store_distance)
    
    driver.quit()

if __name__ == "__main__":
    main()
