import requests

def get_coordinates(api_key, zip_code):
    geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={zip_code}&key={api_key}"
    response = requests.get(geocode_url)
    print("Geocode API Response:", response.json())  # Debug print
    if response.status_code == 200:
        result = response.json()
        if result['results']:
            location = result['results'][0]['geometry']['location']
            return location['lat'], location['lng']
    return None, None

def get_nearby_stores(api_key, lat, lng, radius):
    places_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius={radius}&keyword=Lowes|Home+Depot&key={api_key}"
    response = requests.get(places_url)
    print("Places API Response:", response.json())  # Debug print
    if response.status_code == 200:
        result = response.json()
        return result['results']
    return []

def find_unique_stores(zip_code, radius):
    api_key = "AIzaSyBEeyFWcrRc2RPvaaMHFdgFanCVq_AXHQ8"
    if not api_key:
        raise ValueError("Google Maps API key not found in environment variables")
    
    lat, lng = get_coordinates(api_key, zip_code)
    if lat and lng:
        stores = get_nearby_stores(api_key, lat, lng, radius)
        print("Nearby Stores:", stores)  # Debug print
        return stores
    else:
        print("Invalid Zip Code or API Error")
        return None

if __name__ == "__main__":
    zip_code = "85041"
    radius = "100000"
    stores = find_unique_stores(zip_code, radius)
    print("Stores:", stores)
