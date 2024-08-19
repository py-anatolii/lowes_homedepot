import csv
from selenium import webdriver
from bs4 import BeautifulSoup

# Set up the Selenium WebDriver (ensure that you have the appropriate ChromeDriver version)
driver = webdriver.Chrome()

# The URL of the store page
store_url = "https://www.lowes.com/store/WA-Spokane-Valley/2793"
driver.get(store_url)

# Extract the store number from the URL
store_number = store_url.split('/')[-1]

# Get the page source
page_source = driver.page_source

# Parse the page source with BeautifulSoup
soup = BeautifulSoup(page_source, 'html.parser')

# Extract the title
title = ''
title_div = soup.find('div', class_='title')
if title_div:
    title = title_div.get_text(strip=True)
else:
    print("Title not found.")

# Extract the address
address = ''
address_div = soup.find('div', class_='address')
if address_div:
    link = address_div.find('a', class_='LinkBase-sc-2ngoxx-0 eMlesc backyard link size--medium color--interactive')
    if link:
        address_span = link.find('span', class_='label link-label')
        if address_span:
            address_parts = address_span.find_all('div')
            address = ' '.join([part.get_text(strip=True) for part in address_parts])
        else:
            print("Address span not found.")
    else:
        print("Link not found.")
else:
    print("Address div not found.")

# Close the WebDriver
driver.quit()

# Save to CSV file
csv_filename = 'lowes_store_info.csv'

# Write data to CSV
with open(csv_filename, 'w', newline='') as csvfile:
    csvwriter = csv.writer(csvfile)
    
    # Write the header
    csvwriter.writerow(['Store Number', 'Title', 'Address'])
    
    # Write the data
    csvwriter.writerow([store_number, title, address])

print(f"Data saved to {csv_filename}")
