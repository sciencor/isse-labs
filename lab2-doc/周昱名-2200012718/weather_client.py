# encoding:utf-8
import requests 
import os
from dotenv import load_dotenv

# 接口地址
url = "https://api.map.baidu.com/weather/v1/"

load_dotenv()
ak = os.getenv("API_KEY")

params = {
    "district_id":    "222405",
    "data_type":    "all",
    "ak":       ak,

}

response = requests.get(url=url, params=params)
if response:
    print(response.json())
