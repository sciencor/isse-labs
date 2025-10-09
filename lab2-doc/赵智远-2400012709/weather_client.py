import os
from dotenv import load_dotenv
import requests

# 服务地址
host = "https://api.map.baidu.com"
uri = "/weather/v1/"

# Load environment variables from .env (ensure we actually call the function)
load_dotenv()

API_KEY = os.getenv("API_KEY")

params = {
    "district_id": "110105",  # 区县级行政区划代码
    "data_type": "all",  # 返回数据类型
    "ak": API_KEY,  # 访问密钥
}

response = requests.get(url=host + uri, params=params).json()
if response:
    print(response)