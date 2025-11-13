# encoding:utf-8
import requests 
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=r"D:\AI_software_practice\lab2\.gitignore\.env")

# 接口地址
url = "https://api.map.baidu.com/weather/v1/"

# 此处填写你在控制台-应用管理-创建应用后获取的AK
ak = os.getenv("API_KEY")

params = {
    "district_id":    "222405",
    "data_type":    "all",
    "ak":       ak,

}

response = requests.get(url=url, params=params)
if response:
    print(response.json())