import requests

API_KEY = open('APIKEY.txt').read().strip()

def get_info(city_id, info_type, API_KEY):
    url = "https://api.map.baidu.com/weather/v1/"
    params = {
        "district_id": city_id,
        "data_type": info_type,
        "ak": API_KEY,
    }
    response = requests.get(url, params=params)
    return response.json()

def summarize_weather(data):
    data = data.get('result', {}) or {}
    loc = data.get('location', {})
    now = data.get('now', {}) or {}
    forecasts = data.get('forecasts', []) or []
    indexes = {item.get('name'): item for item in data.get('indexes', [])}

    def v(d, k, default='N/A'):
        return d.get(k) if d and d.get(k) is not None else default

    place = f"{v(loc,'province')} {v(loc,'name')} ({v(loc,'id')})"
    current_text = v(now, 'text')
    temp = v(now, 'temp')
    feels = v(now, 'feels_like')
    rh = v(now, 'rh')
    wind = f"{v(now,'wind_dir')}/{v(now,'wind_class')}"
    aqi = v(now, 'aqi')
    pm25 = v(now, 'pm25')
    pm10 = v(now, 'pm10')
    uvi = v(now, 'uvi')
    pressure = v(now, 'pressure')

    today = forecasts[0] if len(forecasts) > 0 else {}
    date = v(today, 'date')
    high = v(today, 'high')
    low = v(today, 'low')
    day_text = v(today, 'text_day')

    dressing = indexes.get('穿衣指数', {}).get('brief', 'N/A')
    uv_index = indexes.get('紫外线指数', {}).get('brief', 'N/A')

    print(f"{place} — {date} 预报")
    print(f"当前天气: {current_text}，温度: {temp}°C（体感 {feels}°C），相对湿度: {rh}%")
    print(f"风况: {wind}，气压: {pressure} hPa，紫外线指数: {uvi}")
    print(f"空气质量: AQI={aqi}，PM2.5={pm25} μg/m³，PM10={pm10} μg/m³")
    print(f"今日: {day_text}，最高 {high}°C，最低 {low}°C")
    print(f"建议 — 穿衣: {dressing}，紫外线: {uv_index}")

if __name__ == "__main__":
    city_id = "110108"  # Example city ID for Beijing
    info_type = "all"      # Requesting all available weather information
    weather_info = get_info(city_id, info_type, API_KEY)
    summarize_weather(weather_info)
    
    
    