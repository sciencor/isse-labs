#这里是读取天气的脚本代码
import os
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("API_KEY")

# encoding:utf-8
import requests 

# 接口地址
url = "https://api.map.baidu.com/weather/v1/"

# 此处填写你在控制台-应用管理-创建应用后获取的AK
ak = API_KEY

params = {
    "district_id":    "110108",
    "data_type":    "all",
    "ak":       ak,
}

response = requests.get(url=url, params=params)
if response:
    print(response.json())