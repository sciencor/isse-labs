import requests
import os
from dotenv import load_dotenv

host = "https://api.map.baidu.com"

uri = "/weather/v1/"

load_dotenv()

ak = os.getenv("API_KEY")

params = {
    "district_id": "222405",
    "data_type":"all",
    "ak":ak,
}

response = requests.get(url = host+uri, params = params)
if response :
    print(response.json())
