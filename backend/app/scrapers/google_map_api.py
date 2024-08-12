import requests
from dotenv import load_dotenv
import os

load_dotenv()

def get_coordinates(api_key, zip_code):
    geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={zip_code}&key={api_key}"
    response = requests.get(geocode_url)
    if response.status_code == 200:
        result = response.json()
        if result['results']:
            location = result['results'][0]['geometry']['location']
            return location['lat'], location['lng']
    return None, None

def get_nearby_stores(api_key, lat, lng, radius):
    places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius={radius}&keyword=Lowes|Home+Depot&key={api_key}"
    response = requests.get(places_url)
    if response.status_code == 200:
        result = response.json()
        return result['results']
    return []

def get_distances(api_key, origin, destinations):
    destinations_str = '|'.join([f"{store['geometry']['location']['lat']},{store['geometry']['location']['lng']}" for store in destinations])
    distance_matrix_url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destinations_str}&key={api_key}"
    response = requests.get(distance_matrix_url)
    if response.status_code == 200:
        result = response.json()
        return result['rows'][0]['elements']
    return []

def filter_unique_stores(stores, distances, radius):
    home_depot_addresses = set()
    lowes_addresses = set()
    
    unique_stores = {
        "Lowe's": [],
        "Home Depot": []
    }

    for store, distance in zip(stores, distances):
        name = store['name']
        address = store['vicinity']
        address_number = address.split()[0]
        distance_text = distance['distance']['text']
        distance_value = distance['distance']['value']
        
        if distance_value > radius:
            continue

        if "Home Depot" in name:
            if address_number not in home_depot_addresses:
                home_depot_addresses.add(address_number)
                unique_stores["Home Depot"].append({
                    "store": f"Home Depot, {address}",
                    "distance": distance_text
                })
        
        if "Lowe's" in name:
            if address_number not in lowes_addresses:
                lowes_addresses.add(address_number)
                unique_stores["Lowe's"].append({
                    "store": f"Lowe's Home Improvement, {address}",
                    "distance": distance_text
                })
    
    return unique_stores

def find_unique_stores(zip_code, radius):
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    if not api_key:
        raise ValueError("Google Maps API key not found in environment variables")
    
    lat, lng = get_coordinates(api_key, zip_code)
    if lat and lng:
        stores = get_nearby_stores(api_key, lat, lng, radius)
        origin = f"{lat},{lng}"
        distances = get_distances(api_key, origin, stores)
        unique_stores = filter_unique_stores(stores, distances, radius)

        return unique_stores
    else:
        print("Invalid Zip Code or API Error")
        return {
            "Lowe's": [],
            "Home Depot": []
        }
