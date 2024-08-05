import requests
import time
import csv

def get_places(api_key, location, radius, keyword, next_page_token=None):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'key': api_key,
        'location': location,
        'radius': radius,
        'keyword': keyword
    }
    if next_page_token:
        params['pagetoken'] = next_page_token
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None

def get_all_lowes_stores(api_key, locations, radius=50000):
    stores = []
    for location in locations:
        result = get_places(api_key, location, radius, "Lowe's")
        while result:
            stores.extend(result['results'])
            if 'next_page_token' in result:
                time.sleep(2)  # Wait for 2 seconds before making the next request
                result = get_places(api_key, location, radius, "Lowe's", result['next_page_token'])
            else:
                break
    return stores

def create_grid(north, south, east, west, step):
    locations = []
    lat_step = (north - south) / step
    lng_step = (east - west) / step
    for i in range(step + 1):
        for j in range(step + 1):
            lat = south + i * lat_step
            lng = west + j * lng_step
            locations.append(f"{lat},{lng}")
    return locations

def save_to_csv(stores, filename="lowes_stores.csv"):
    keys = ['name', 'vicinity', 'place_id', 'lat', 'lng']
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=keys)
        writer.writeheader()
        for store in stores:
            writer.writerow({
                'name': store.get('name'),
                'vicinity': store.get('vicinity'),
                'place_id': store.get('place_id'),
                'lat': store['geometry']['location']['lat'],
                'lng': store['geometry']['location']['lng']
            })

def main():
    api_key = 'AIzaSyBHowR4jBoxko0KCCd_3bz0gO5y2UArRW0'
    # Define the bounding box for the USA
    north, south, east, west = 49.3457868, 24.396308, -66.93457, -125.00165
    # Create a grid of locations
    locations = create_grid(north, south, east, west, step=10)
    # Get all Lowe's stores
    lowes_stores = get_all_lowes_stores(api_key, locations)
    
    # Remove duplicates based on place_id
    unique_stores = {store['place_id']: store for store in lowes_stores}.values()
    
    # Save to CSV
    save_to_csv(unique_stores)

if __name__ == "__main__":
    main()
