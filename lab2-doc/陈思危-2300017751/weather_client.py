import os
import requests
from dotenv import load_dotenv
import pandas as pd


load_dotenv()
BAIDU_API_KEY = os.getenv('BAIDU_API_KEY')

BASE_URL = 'http://api.map.baidu.com/weather/v1/'

def load_city_district_id_mapping():
    df = pd.read_excel('./weather_district_id.xlsx')
    df= df[['district','district_id']]
    return df.set_index('district')['district_id'].to_dict()

CITY_DISTRICT_ID_MAP = load_city_district_id_mapping()

def validate_api_key():
    if not BAIDU_API_KEY:
        raise ValueError('API Key 未设置，请在.env 文件中设置 BAIDU_API_KEY。')

def get_weather(city, data_type='all'):
    validate_api_key()
    district_id = CITY_DISTRICT_ID_MAP.get(city)
    print(f"查询城市: {city}, district_id: {district_id}")
    params = {
        'ak': BAIDU_API_KEY,
        'data_type': data_type,
        'output': 'json',
        "district_id": district_id
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        weather_data = response.json()
        if weather_data['status'] == 0:
            print(f"成功获取 {city} 的天气数据。")
            return weather_data
        else:
            print(f"获取天气数据失败，城市可能不存在。")
            return None
    except requests.exceptions.RequestException as e:
        print(f"请求过程中出现错误: {e}")
        return None


def print_weather_info(weather_data):
    if not weather_data:
        return
    result = weather_data['result']
    location = result['location']
    print(f"城市: {location['name']}")
    now = result['now']
    print(f"当前温度: {now['temp']}°C")
    print(f"天气状况: {now['text']}")
    print(f"风向: {now['wind_dir']}")
    forecasts = result['forecasts']
    print('\n未来天气预报:')
    for forecast in forecasts:
        print(f"{forecast['date']}: {forecast['text_day']}, "
              f"气温: {forecast['low']}°C ~ {forecast['high']}°C。")


if __name__ == '__main__':
    city = input('请输入要查询天气的城市: ')
    weather_data = get_weather(city)
    if weather_data:
        print_weather_info(weather_data)