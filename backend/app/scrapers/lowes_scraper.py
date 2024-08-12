from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import pandas as pd
import time
import math
import os

from .google_map_api import find_unique_stores

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
                    (f"Button with store number {store_no} is disabled. Clicking close button instead.")
                    click_close_button(driver)
                    return

                button.click()
                
                WebDriverWait(driver, 5).until(EC.staleness_of(button))
                return

    except Exception as e:
        print(f"An error occurred: {e}")

    time.sleep(1)

def scrape_one_store(driver, website, csv_filename, store, store_distance):
    total_results = get_total_results(driver)

    prices, brands, stocks, names, stores, distances = paginate_and_scrape(driver, website, total_results, csv_filename, store, store_distance)
    
    return prices, brands, stocks, names, stores, distances
    
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
    
    all_prices = []
    all_brands = []
    all_stocks = []
    all_names = []
    all_stores = []
    all_distances = []
    
    for i in range(1, pages + 1):
        driver.get(f"{url}&offset={(i - 1) * items_per_page}")
        click_second_toggle_button(driver)
        prices, brands, stocks, names = scrape_page_data(driver)
        
        all_prices.extend(prices)
        all_brands.extend(brands)
        all_stocks.extend(stocks)
        all_names.extend(names)
        all_stores.extend([store] * len(prices))
        all_distances.extend([store_distance] * len(prices))
        
        time.sleep(1)
        
    return all_prices, all_brands, all_stocks, all_names, all_stores, all_distances

def scrape_page_data(driver):
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'pl')))
    
    scroll_down(driver)
    
    price_list = []
    brand_list = []
    stock_list = []
    product_name_list = []

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

        try:
            product_name_full = product.find_element(By.CSS_SELECTOR, 'span.description-spn').text.strip()
            product_name = product_name_full.split(' (')[0]
        except:
            product_name = ''

        try:
            stock_spans = product.find_elements(By.CSS_SELECTOR, 'span.Fulfilmentstyles__GreenWrapper-sc-5biurv-4.kGYIzw')
            stock_number = None
            for span in stock_spans:
                text = span.text
                if 'in Stock' in text:
                    stock_number = text.split()[0]
                    break
            if stock_number is None:
                stock_number = ''
        except:
            stock_number = ''
        
        price_list.append(price)
        brand_list.append(brand)
        stock_list.append(stock_number)
        product_name_list.append(product_name)
    
    return price_list, brand_list, stock_list, product_name_list

def lowes_scraper(zip_code, radius, key_word):
    print("lowes")
    
    website = f"https://www.lowes.com/search?searchTerm={key_word}"
    csv_filename = 'lowes_prices_and_brands.csv'

    filtered_stores = find_unique_stores(zip_code, int(radius))["Lowe's"]
    
    driver = setup_driver()
    driver.get(website)

    store_list, store_no_list, store_distance_list = extract_store_data(driver, filtered_stores)

    results = []
    
    for store, store_no, store_distance in zip(store_list, store_no_list, store_distance_list):
        select_one_store(driver, store_no)
        prices, brands, stocks, names, stores, distances = scrape_one_store(driver, website, csv_filename, store, store_distance)
        print("Lowes: ", prices)
        results.extend([
            {"price": price, "brand": brand, "stock": stock, "name": name, "store": store, "distance": distance}
            for price, brand, stock, name, store, distance in zip(prices, brands, stocks, names, stores, distances)
        ])
    
    driver.quit()
    return results
