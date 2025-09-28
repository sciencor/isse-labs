import requests
import os
from dotenv import load_dotenv

def get_weather(district_id="110100"):
    """
    获取指定地区的天气信息
    
    Args:
        district_id (str): 行政区划代码，默认为北京(110100)
        
    Returns:
        dict: 天气信息字典，如果失败则返回None
    """
    # 加载环境变量
    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    
    if not API_KEY:
        print("错误: 未找到API_KEY环境变量，请在.env文件中设置API_KEY")
        return None
    
    # 百度地图天气API的正确端点
    host = "https://api.map.baidu.com"
    uri = "/weather/v1/"
    
    params = {
        "district_id": district_id,
        "data_type": "all",      # 获取所有天气数据
        "ak": API_KEY
    }
    
    try:
        response = requests.get(host + uri, params=params, timeout=10)
        response.raise_for_status()  # 如果HTTP状态码不是200会抛出异常
        
        json_data = response.json()
        
        if json_data['status'] == 0:  # 成功状态
            return json_data['result']
        else:
            print(f"API返回错误: {json_data.get('message', '未知错误')}")
            return None
            
    except requests.exceptions.Timeout:
        print("请求超时，请检查网络连接")
        return None
    except requests.exceptions.RequestException as e:
        print(f"网络请求错误: {e}")
        return None
    except requests.exceptions.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        return None
    except KeyError as e:
        print(f"响应数据格式错误，缺少字段: {e}")
        return None

def display_weather(weather_data):
    """显示天气信息"""
    if not weather_data:
        return
        
    location = weather_data['location']
    now = weather_data['now']
    forecasts = weather_data['forecasts'][:3]  # 显示未来3天天气
    
    print(f"=== {location['province']}{location['city']} 天气信息 ===")
    print(f"当前天气: {now['text']}")
    print(f"当前温度: {now['temp']}°C (体感温度: {now['feels_like']}°C)")
    print(f"风向风速: {now['wind_dir']} {now['wind_class']}")
    print(f"湿度: {now['rh']}%")
    print(f"空气质量指数: {now['aqi']} (PM2.5: {now['pm25']})")
    
    print("\n=== 未来3天天气预报 ===")
    for forecast in forecasts:
        print(f"{forecast['date']} ({forecast['week']}): "
              f"{forecast['text_day']}, {forecast['low']}°C - {forecast['high']}°C, "
              f"{forecast['wd_day']} {forecast['wc_day']}")

if __name__ == "__main__":
    # 获取北京天气信息
    weather_data = get_weather("110100")
    display_weather(weather_data)
