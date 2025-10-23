#海淀区实时天气情况查询app
import requests
import os
from dotenv import load_dotenv

load_dotenv()
BAIDU_API_KEY = os.getenv("BAIDU_API_KEY")

url = "https://api.map.baidu.com/weather/v1/"
params = {
    "district_id": "110108", #海淀区的district_id
    "data_type": "all",
    "ak": BAIDU_API_KEY,
}

response = requests.get(url=url, params=params)
if response:
    result = response.json()
    print(f"""海淀区现在的天气情况：\n天气概况:{result['result']["now"]["text"]}\
    \n温度:{result['result']['now']['temp']}摄氏度 体感温度:{result['result']['now']['feels_like']}摄氏度\
    \n相对湿度:{result['result']['now']['rh']}%\n风力等级:{result['result']['now']['wind_class']}\
    \n风向:{result['result']['now']['wind_dir']}\npm2.5浓度:{result['result']['now']['pm25']}μg/m3\
    """)
else:
    print(f"请求失败，状态码：{response.status_code}")
    print(f"响应内容：{response.text}")