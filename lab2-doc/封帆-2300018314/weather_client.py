import os
import json
from dotenv import load_dotenv
import requests
load_dotenv()

host = "https://api.map.baidu.com"
uri = "/weather/v1/"

API_KEY = os.getenv("API_KEY")

params = {
    "district_id":    "110108", # Changping District, Haidian, Beijing
    "data_type":    "all",
    "ak":       API_KEY,
}

response = requests.get(url=host+uri, params=params)

if response:
    with open("./lab2-doc/weather.json", "w", encoding="utf-8") as f:
        json.dump(response.json(), f, ensure_ascii=False, indent=2)