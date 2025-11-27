import os
from dotenv import load_dotenv
import requests


host = "https://api.map.baidu.com"
uri = "/weather/v1/"
load_dotenv()
API_KEY = os.getenv("API_KEY")
ak = API_KEY

params = {
    "district_id": "510100",
    "data_type": "all",
    "ak": API_KEY,
}

response = requests.get(url=host + uri, params=params)
print(response.json())
