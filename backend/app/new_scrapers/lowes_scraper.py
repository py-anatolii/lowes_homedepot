from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import math
import re

class LowesScraper:
    def __init__(self):
        self.driver = None
        self.soup = None
        self._setup_driver()

    def _setup_driver(self):
        options = Options()
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
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()

    def fetch_page(self, url):
        try:
            self.driver.get(url)
            time.sleep(5)
            self.scroll_down()
            page_content = self.driver.page_source
            self.soup = BeautifulSoup(page_content, 'lxml')
        except Exception as e:
            print(f"Error fetching page: {e}")
            self.soup = None
        return page_content

    def scroll_down(self, step_height=500, times=15):
        """Scroll down the page by step_height pixels for a specified number of times."""
        for _ in range(times):
            self.driver.execute_script(f"window.scrollBy(0, {step_height});")
            time.sleep(2) 

    def get_total_products(self):
        if self.soup:
            try:
                total_number_text = self.soup.find('p', class_='typography variant--body_1 align--left results').text
                total_number = int(total_number_text.split()[0].replace(',', ''))
                return total_number
            except Exception as e:
                print(f"Error getting total products: {e}")
        return 0

    def get_total_pages(self, total_products, products_per_page=24):
        return math.ceil(total_products / products_per_page)

    def get_product_details(self, expected_store_name):
        if self.soup:
            products = self.soup.find_all('div', class_='sc-o9wle2-4')
            print(f"Found {len(products)} products on the page.")
            details = []
            for product in products:
                try:
                    title = product.find('span', class_='description-spn').get_text(strip=True)
                    cleaned_title = re.sub(r'\s*\([^)]*\)', '', title)
                    brand = product.find('span', class_='BrandNameStyle-sc-4v6c0e-3').get_text(strip=True)
                    price = product.find('div', class_='prdt-actl-pr').get_text(strip=True).replace('\n', ' ')

                    if not price.startswith('$'):
                        continue
                    
                    pickup_message = product.find('div', class_='pickup-message')
                    spans = pickup_message.find_all('span', class_='Fulfilmentstyles__GreenWrapper-sc-5biurv-4')
                    stock_quantity = spans[1].get_text(strip=True) if len(spans) > 1 else 'N/A'
                    store_name = pickup_message.find('a', class_='LinkBase-sc-2ngoxx-0').get_text(strip=True)

                    if not stock_quantity.split()[0].isdigit() or store_name != expected_store_name:
                        continue

                    if not all([title, brand, price, stock_quantity]):
                        continue

                    details.append({
                        'title': cleaned_title,
                        'brand': brand,
                        'price': price,
                        'stock': stock_quantity.split()[0],
                        "store": expected_store_name,
                    })
                except AttributeError as e:
                    continue
            return details
        return []
    
    def toggle_button_click(self):
        toggle_buttons = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_all_elements_located((By.CSS_SELECTOR, 'button[aria-label="toggle button"]'))
        )
        if len(toggle_buttons) >= 2:
            WebDriverWait(self.driver, 10).until(EC.element_to_be_clickable(toggle_buttons[1]))
            toggle_buttons[1].click()
        else:
            print("Less than two buttons found with the given selector.")

    def quit(self):
        if self.driver:
            self.driver.quit()

    def scrape_all_pages(self, key_word, store_num, expected_store_name, products_per_page=24):
        base_url = f"https://www.lowes.com/search?storeId={store_num}&searchTerm={key_word}"
        self.driver.get(f"{base_url}&inStock=1&rollUpVariants=0")
        self.toggle_button_click()
        time.sleep(5)
        page_content = self.driver.page_source
        self.soup = BeautifulSoup(page_content, 'lxml')
        total_products = self.get_total_products()
        total_pages = self.get_total_pages(total_products, products_per_page)
        print(f"Total Products: {total_products}")
        print(f"Total Pages: {total_pages}")

        all_details = []
        for page in range(0, total_pages * products_per_page, products_per_page):
            url = f"{base_url}&offset={page}&inStock=1&rollUpVariants=0"
            print(f"Scraping page with offset: {page}")
            self.fetch_page(url)
            details = self.get_product_details(expected_store_name)
            print(details)
            print("Total prducts for this page: ", len(details))
            all_details.extend(details)
            time.sleep(5)

        self.quit()
        return all_details
    
    def scrape_all_store_infos(self, stores):
        self.driver.get("https://www.lowes.com")
        my_store_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a[data-linkid='selected-store']"))
        )
        my_store_button.click()

        details = []
        for store in stores:
            store_search_input = WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='ZIP Code, City, State or Store #']"))
            )
            store_search_input.click()
            store_search_input.send_keys(Keys.CONTROL + "a")
            store_search_input.send_keys(Keys.BACKSPACE)
            store_search_input.send_keys(store)

            search_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button.rightArrowBtn"))
            )
            search_button.click()
            time.sleep(1)
            
            store_card = self.driver.find_element(By.CLASS_NAME, 'storeCardstyles__StoreCardWrapper-sc-7bbdlt-11')
            store_name = store_card.find_element(By.CSS_SELECTOR, "h5.storeName").text.strip()
            store_address = store_card.find_element(By.CSS_SELECTOR, 'span[data-id="sc-get-directions"]').text.strip().replace('\n', ' ')
            store_num = store_card.find_element(By.CSS_SELECTOR, "button[data-storenumber]").get_attribute('data-storenumber')

            if not store_num.isdigit():
                continue

            if not all([store_name, store_address, store_num]):
                continue
        
            details.append({
                'store': store,
                'name': store_name,
                'address': store_address,
                'number': store_num,
            })

        return details

if __name__ == "__main__":
    key_word = "impact driver"
    store_num = 2790
    expected_store_name = "E. San Jose Lowe's"
    stores = []
    scraper = LowesScraper()

    all_stores = scraper.scrape_all_store_infos(stores)
    print(all_stores)

    all_product_details = scraper.scrape_all_pages(key_word, store_num, expected_store_name)
    
    print("Scraped Product Details:")
    for detail in all_product_details:
        print(detail)
    
    scraper.quit()
