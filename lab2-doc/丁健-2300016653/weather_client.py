# encoding:utf-8
import requests
import os
from dotenv import load_dotenv

# 接口地址
url = "https://api.map.baidu.com/weather/v1/"

print(os.getcwd())

dotenv_path = ".env"
if not os.path.exists(dotenv_path): # 判断是否存在.env文件
    dotenv_path = None
load_dotenv(dotenv_path)
API_KEY = os.getenv("DJ_API_KEY")
print(API_KEY)


params = {
    "district_id":    "222405",
    "data_type":    "all",
    "ak":      API_KEY,
}

response = requests.get(url=url, params=params)
if response:
    print(response.json())