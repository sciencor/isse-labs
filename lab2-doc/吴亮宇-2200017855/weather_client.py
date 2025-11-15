import os
import requests
from dotenv import load_dotenv

load_dotenv()
ACCESS_KEY = os.getenv("BAIDU_MAP_AK") 

BASE_URL = "https://api.map.baidu.com/weather/v1/"

params = {
    "district_id": "110108", 
    "data_type": "all",
    "ak": ACCESS_KEY
}

try:
    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    
    data = response.json()
    
    if data.get("status") == 0:
        result = data.get("result", {})
        location = result.get("location", {})
        now = result.get("now", {})
        
        print(f"城市: {location.get('country')}{location.get('province')}{location.get('city')}{location.get('name')}")
        print(f"实时温度: {now.get('temp')}℃")
        print(f"天气: {now.get('text')}")
        print(f"风向/风力: {now.get('wind_dir')}/{now.get('wind_class')}")
        print("--------------------")

        forecasts = result.get("forecasts", [])
        if forecasts:
            print(f"未来三天预报：")
            for i, day in enumerate(forecasts[:3]):
                 print(f"  {day.get('date')} ({day.get('week')}): {day.get('text_day')} / {day.get('text_night')}, 气温 {day.get('low')}℃ ~ {day.get('high')}℃")
        
    else:
        print(f"\nAPI 请求失败。状态码: {data.get('status')}")
        print(f"错误信息: {data.get('message', '无详细信息')}")

except requests.exceptions.RequestException as e:
    print(f"\n网络请求发生错误: {e}")
except Exception as e:
    print(f"\n发生未知错误: {e}")