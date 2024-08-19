import csv
from selenium import webdriver
from bs4 import BeautifulSoup

# Set up the Selenium WebDriver (ensure that you have the appropriate ChromeDriver version)
driver = webdriver.Chrome()

# The URL of the store page
store_url = "https://www.homedepot.com/l/Prattville/AL/Prattville/36066/806"
driver.get(store_url)

# Extract the store number from the URL
store_number = store_url.split('/')[-1]

# Get the page source
page_source = driver.page_source

# Parse the page source with BeautifulSoup
soup = BeautifulSoup(page_source, 'html.parser')

# Extract the title (only the city name)
title = ''
title_h1 = soup.find('h1', class_='sui-h1-bold sui-line-clamp-unset sui-font-normal sui-text-primary')
if title_h1:
    title_span = title_h1.find('span')
    if title_span:
        title = title_span.get_text(strip=True)
else:
    print("Title not found.")

# Extract the address
address = ''
address_div = soup.find('div', {'data-component': 'store-pod:StorePodAddress:v7.0.1'})
if address_div:
    address_parts = address_div.find_all('p', class_='sui-font-regular sui-text-base sui-leading-tight sui-tracking-normal sui-normal-case sui-line-clamp-unset sui-font-normal sui-text-primary')
    address = ', '.join([part.get_text(strip=True) for part in address_parts])
else:
    print("Address not found.")

# Close the WebDriver
driver.quit()

# Save to CSV file
csv_filename = 'homedepot_store_info.csv'

# Write data to CSV
with open(csv_filename, 'w', newline='') as csvfile:
    csvwriter = csv.writer(csvfile)
    
    # Write the header
    csvwriter.writerow(['Store Number', 'Title', 'Address'])
    
    # Write the data
    csvwriter.writerow([store_number, title, address])

print(f"Data saved to {csv_filename}")
