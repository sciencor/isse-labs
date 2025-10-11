# encoding:utf-8
import requests 
import os
from dotenv import load_dotenv

# 接口地址
url = "https://api.map.baidu.com/weather/v1/"

print(os.getcwd())

# 此处填写你在控制台-应用管理-创建应用后获取的AK
dotenv_path = "API_KEY.env"
load_dotenv(dotenv_path)
API_KEY = os.getenv("API_KEY")
print(API_KEY)


params = {
    "district_id":    "222401",
    "data_type":    "all",
    "ak":      API_KEY,
}

response = requests.get(url=url, params=params)
if response:
    print(response.json())