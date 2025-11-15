import dotenv,os
import requests

dotenv.load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")
site = "http://api.openweathermap.org/"
geocoding_uri = "geo/1.0/direct"
weather_data_uri = "data/2.5/weather"


def request_improver(url, **kwargs):
    response = requests.get(url, **kwargs)

    if response.status_code != 200:
        response.raise_for_status()

    response.encoding = response.apparent_encoding
    return response.json()


params = {
    "q":"北京",
    "limit":1,
    "appid":API_KEY
}

geo_response = request_improver(site+geocoding_uri, params=params)

location_information = geo_response[0]
name = location_information["name"]
local_name = location_information["local_names"]["zh"]
lat = location_information["lat"]
lon = location_information["lon"]

params = {
    "lat":lat,
    "lon":lon,
    "appid":API_KEY,
    "units":"metric", # temperature in Celsius
    "lang":"zh_cn"
}

weather_data_response = request_improver(site + weather_data_uri, params=params)
weather_brief = weather_data_response["weather"][0]["description"]
weather_detail_json = weather_data_response["main"]


print(f"Weather for City {name}({local_name}): {weather_brief}")

for key,value in weather_detail_json.items():
    print(f"The “{key}”: {value}")

