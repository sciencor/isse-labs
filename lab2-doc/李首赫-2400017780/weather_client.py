import requests 
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "API_KEY.env")
load_dotenv(dotenv_path)
ak = os.getenv("API_KEY")
# print(ak)
# 服务地址
host = "https://api.map.baidu.com"

# # 接口地址
uri = "/weather/v1/"

params = {
    "district_id":    "222405",
    "data_type":    "all",
    "ak" : ak
}

response = requests.get(url = host + uri, params = params)
if response:
    print(response.json())