import os
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("API_KEY")

# 其实没懂要不要加入示例代码，以及参数设为多少。

import requests 

# 服务地址
host = "https://api.map.baidu.com"

# 接口地址
uri = "/weather/v1/"

params = {
    "district_id":    "222405",
    "data_type":    "all",
    "ak":       API_KEY,

}

response = requests.get(url = host + uri, params = params)
if response:
    print(response.json())