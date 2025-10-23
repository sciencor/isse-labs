#这里是读取天气的脚本代码
from dotenv import load_dotenv
import os
import requests 

load_dotenv()  # 加载 .env 文件中的环境变量
API_KEY = os.getenv("API_KEY")




# 接口地址
url = "https://api.map.baidu.com/weather/v1/"

# 此处填写你在控制台-应用管理-创建应用后获取的AK
ak = API_KEY

params = {
    "district_id":    "110108",  # haidian peking
    "data_type":    "all",
    "ak":       ak,
}

response = requests.get(url=url, params=params)
if response:
    print(response.json())
