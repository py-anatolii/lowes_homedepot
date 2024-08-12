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
    options.add_argument('authority=www.homedepot.com')
    options.add_argument('accept=text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7')
    options.add_argument('accept-language=en-US,en;q=0.9')
    options.add_argument('cache-control=no-cache')
    options.add_argument('pragma=no-cache')
    options.add_argument('referer=https://www.homedepot.com')
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
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-testid='my-store-button']"))
    )
    open_modal_button.click()

def clear_search_input(driver):
    driver.execute_script("window.scrollTo(0, 500)")
    search_input = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='ZIP Code, City, State, or Store #']"))
    )
    search_input.click()
    search_input.send_keys(Keys.CONTROL + "a")
    search_input.send_keys(Keys.BACKSPACE)
    return search_input

def select_one_store(driver, store):
    try:
        open_search_modal(driver)
        search_input = clear_search_input(driver)
        search_input.send_keys(store)
        search_input.send_keys(Keys.ENTER)
        time.sleep(1)

        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "button[data-testid='store-pod-localize__button']"))
        )

        set_store_button = driver.find_element(By.CSS_SELECTOR, "button[data-testid='store-pod-localize__button']")
        
        set_store_button.click()

    except Exception as e:
        print(f"An error occurred: {e}")

    time.sleep(1)

def scrape_one_store(driver, website, csv_filename, store, store_distance):
    total_results = get_total_results(driver)

    prices, brands, stocks, names, stores, distances = paginate_and_scrape(driver, website, total_results, csv_filename, store, store_distance)
    
    return prices, brands, stocks, names, stores, distances
    
def get_total_results(driver):
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'span.results-applied__primary-filter-label')))
    page_source = driver.page_source
    soup = BeautifulSoup(page_source, 'html.parser')
    results_text = soup.select_one('span.results-applied__primary-filter-label').text
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
        driver.get(f"{url}&Nao={(i - 1) * items_per_page}")
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
    try:
        scroll_down(driver)
        
        results = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'results-wrapped'))
        )

        price_list = []
        brand_list = []
        stock_list = []
        product_name_list = []

        products = results.find_elements(By.CSS_SELECTOR, 'div[data-testid="product-pod"]')

        for product in products:
            try:
                price_element = product.find_element(By.CSS_SELECTOR, 'div.price')
                price = price_element.text.strip().split('\n')[0]
            except Exception as e:
                price = ''
            
            try:
                brand_element = product.find_element(By.CSS_SELECTOR, 'p[data-testid="attribute-brandname-above"]')
                brand = brand_element.text.strip()
            except Exception as e:
                brand = ''

            try:
                stock_element = product.find_element(By.CSS_SELECTOR, 'span.store__success')
                stock_text = stock_element.text.strip()
                stock_number = stock_text.split()[0]
            except Exception as e:
                stock_number = ''

            try:
                product_name_element = product.find_element(By.CSS_SELECTOR, 'span.sui-text-primary.sui-font-regular.sui-mb-1.sui-line-clamp-5.sui-text-ellipsis.sui-inline')
                product_name = product_name_element.text.strip()
            except Exception as e:
                product_name = ''
            
            price_list.append(price)
            brand_list.append(brand)
            stock_list.append(stock_number)
            product_name_list.append(product_name)
        
        return price_list, brand_list, stock_list, product_name_list

    except Exception as e:
        return [], [], [], []

def home_depot_scraper(zip_code, radius, key_word):
    print("homedepot")

    website = f"https://www.homedepot.com/b/Tools/Pick-Up-Today/N-5yc1vZc1xyZ1z175a5/Ntk-elastic/Ntt-{key_word}?NCNI-5&sortby=bestmatch&sortorder=none"
    csv_filename = 'home_depot_prices_and_brands.csv'

    filtered_stores = find_unique_stores(zip_code, int(radius))["Home Depot"]
    
    driver = setup_driver()
    driver.get(website)

    results = []

    for store in filtered_stores:
        select_one_store(driver, store["store"])
        prices, brands, stocks, names, stores, distances = scrape_one_store(driver, website, csv_filename, store["store"], store["distance"])
        print("Home Depot", prices)
        results.extend([
            {"price": price, "brand": brand, "stock": stock, "name": name, "store": store, "distance": distance}
            for price, brand, stock, name, store, distance in zip(prices, brands, stocks, names, stores, distances)
        ])
    
    driver.quit()
    return results
