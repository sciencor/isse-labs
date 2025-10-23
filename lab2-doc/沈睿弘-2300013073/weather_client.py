#这里是读取天气的脚本代码

import requests
import json
import argparse
import sys
import dotenv
import os
from datetime import datetime

def get_weather_data(district_id, ak):
    url = "https://api.map.baidu.com/weather/v1/"

    params = {
        "district_id": district_id,
        "data_type": "all",
        "ak": ak,
    }

    response = requests.get(url=url, params=params, timeout=10)
    json_data = response.json()

    if json_data.get("status") != 0:
        error_msg = json_data.get("message", "未知错误")
        print(f"API错误: {error_msg}")
        return None
    return json_data.get("result")



def format_location_info(location):
    """格式化位置信息"""
    return f"""
📍 位置信息:
   - 国家: {location.get('country', '未知')}
   - 省份: {location.get('province', '未知')}
   - 城市: {location.get('city', '未知')}
   - 区县: {location.get('name', '未知')}
   - 区划代码: {location.get('id', '未知')}
"""


def format_current_weather(now):
    """格式化当前天气信息"""
    temp = now.get('temp', '未知')
    feels_like = now.get('feels_like', '未知')
    rh = now.get('rh', '未知')
    wind_class = now.get('wind_class', '未知')
    wind_dir = now.get('wind_dir', '未知')
    text = now.get('text', '未知')
    aqi = now.get('aqi', '未知')
    pm25 = now.get('pm25', '未知')
    uptime = now.get('uptime', '未知')

    try:
        if len(uptime) == 14:
            uptime_str = f"{uptime[:4]}-{uptime[4:6]}-{uptime[6:8]} {uptime[8:10]}:{uptime[10:12]}:{uptime[12:14]}"
        else:
            uptime_str = uptime
    except:
        uptime_str = uptime

    return f"""
🌤️  实时天气:
   - 温度: {temp}°C (体感: {feels_like}°C)
   - 相对湿度: {rh}%
   - 风力: {wind_class} {wind_dir}
   - 天气现象: {text}
   - 空气质量指数: {aqi}
   - PM2.5: {pm25} μg/m³
   - 数据更新时间: {uptime_str}
"""


def format_forecast(forecasts):
    """格式化天气预报信息"""
    if not forecasts:
        return "暂无预报数据"

    forecast_text = "\n📅 未来5天天气预报:"
    for forecast in forecasts[:5]:
        date = forecast.get('date', '未知')
        week = forecast.get('week', '未知')
        high = forecast.get('high', '未知')
        low = forecast.get('low', '未知')
        text_day = forecast.get('text_day', '未知')
        text_night = forecast.get('text_night', '未知')
        wd_day = forecast.get('wd_day', '未知')
        wc_day = forecast.get('wc_day', '未知')

        forecast_text += f"""
   - {date} ({week}):
     🌅 白天: {text_day}, {high}°C, {wd_day} {wc_day}
     🌙 晚上: {text_night}, {low}°C"""

    return forecast_text


def format_indexes(indexes):
    """格式化生活指数信息"""
    if not indexes:
        return "暂无生活指数数据"

    indexes_text = "\n💡 生活指数:"
    for index_item in indexes:
        name = index_item.get('name', '未知')
        brief = index_item.get('brief', '未知')
        detail = index_item.get('detail', '未知')

        indexes_text += f"""
   - {name}: {brief}
     {detail}"""

    return indexes_text


def format_alerts(alerts):
    """格式化天气预警信息"""
    if not alerts:
        return "\n⚠️  暂无天气预警"

    alerts_text = "\n⚠️  天气预警:"
    for alert in alerts:
        alert_type = alert.get('type', '未知')
        level = alert.get('level', '未知')
        title = alert.get('title', '未知')
        desc = alert.get('desc', '未知')

        alerts_text += f"""
   - {level} ({alert_type}):
     {title}
     {desc}"""

    return alerts_text


def format_hourly_forecast(forecast_hours):
    """格式化逐小时预报信息"""
    if not forecast_hours:
        return "暂无逐小时预报数据"

    hourly_text = "\n⏰ 未来8小时逐小时预报:"
    for hour_data in forecast_hours[:8]:
        text = hour_data.get('text', '未知')
        temp_fc = hour_data.get('temp_fc', '未知')
        wind_class = hour_data.get('wind_class', '未知')
        wind_dir = hour_data.get('wind_dir', '未知')
        rh = hour_data.get('rh', '未知')
        data_time = hour_data.get('data_time', '未知')

        hourly_text += f"""
   - {data_time}: {text}, {temp_fc}°C, {wind_dir} {wind_class}, 湿度: {rh}%"""

    return hourly_text


def print_weather_info(result):
    """打印格式化的天气信息"""
    if not result:
        return

    print("=" * 60)
    print("🌈 百度地图天气查询结果")
    print("=" * 60)

    # 位置信息
    location = result.get('location', {})
    print(format_location_info(location))

    # 当前天气
    now = result.get('now', {})
    if now:
        print(format_current_weather(now))

    # 天气预报
    forecasts = result.get('forecasts', [])
    print(format_forecast(forecasts))

    # 生活指数
    indexes = result.get('indexes', [])
    print(format_indexes(indexes))

    # 天气预警
    alerts = result.get('alerts', [])
    print(format_alerts(alerts))

    # 逐小时预报（只显示前8小时）
    forecast_hours = result.get('forecast_hours', [])
    print(format_hourly_forecast(forecast_hours))

    print("=" * 60)


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='百度地图天气查询')
    parser.add_argument(
        '--district_id',
        type=str,
        default='110108',
        help='区县的行政区划编码，默认为110108（北京市海淀区）'
    )

    args = parser.parse_args()

    dotenv.load_dotenv()
    ak = os.getenv("BAIDU_MAP_API_KEY")

    if not ak:
        print("错误: 请设置环境变量 BAIDU_MAP_API_KEY")
        sys.exit(1)

    print(f"🔍 查询天气信息 (行政区划代码: {args.district_id})...")

    result = get_weather_data(args.district_id, ak)

    if result is None:
        sys.exit(1)

    print_weather_info(result)

    print("✅ 查询完成!")


if __name__ == "__main__":
    main()