import os
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
    print(response.json())