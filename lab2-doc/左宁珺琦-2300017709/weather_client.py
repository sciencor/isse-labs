import os
import requests
from dotenv import load_dotenv

# 使用绝对路径确保找到.env文件
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '.env')
load_dotenv(env_path)

class WeatherClient:
    BASE_URL = "https://api.map.baidu.com/weather/v1/"
    
    # 常用城市编码
    COMMON_CITY_CODES = {
        "北京": "110100",
        "上海": "310100",
        "广州": "440100",
        "深圳": "440300",
        "杭州": "330100",
        "南京": "320100",
        "武汉": "420100",
        "成都": "510100",
        "重庆": "500100",
        "天津": "120100",
        "西安": "610100",
    }
    
    def __init__(self):
        self.api_key = os.getenv("key")
        if not self.api_key:
            raise ValueError("百度地图API Key未配置！请检查.env文件或环境变量")
    
    def get_geocode(self, location):
        """获取地区的地理编码（adcode）"""
        # 首先检查常用城市
        if location in self.COMMON_CITY_CODES:
            print(f"使用预定义编码: {self.COMMON_CITY_CODES[location]}")
            return self.COMMON_CITY_CODES[location]
        
        # 如果没有预定义编码，使用API获取
        geocode_url = "https://api.map.baidu.com/geocoding/v3/"
        params = {
            "address": location,
            "output": "json",
            "ak": self.api_key
        }
        
        try:
            response = requests.get(geocode_url, params=params)
            result = response.json()
            
            # 检查API响应状态
            if result.get("status") != 0:
                error_msg = result.get("message", "未知错误")
                raise Exception(f"地理编码API错误: {error_msg}")
            
            # 检查是否有结果
            if not result.get("result") or not result["result"].get("location"):
                raise Exception(f"未找到地区 '{location}' 的地理编码")
            
            # 获取adcode（地区编码）
            adcode = result["result"].get("adcode")
            if not adcode:
                raise Exception(f"地区 '{location}' 没有有效的adcode")
            
            print(f"地区 '{location}' 的编码: {adcode}")
            return adcode
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络请求错误: {str(e)}")
    
    def get_weather(self, location, data_type="now"):
        """获取天气信息"""
        # 获取地区编码
        district_id = self.get_geocode(location)
        
        # 验证地区编码格式（应该是6位数字）
        if not district_id or not isinstance(district_id, str) or not district_id.isdigit() or len(district_id) != 6:
            raise Exception(f"无效的地区编码: {district_id}")
        
        # 构建天气API请求URL
        weather_url = self.BASE_URL + f"?district_id={district_id}&data_type={data_type}&ak={self.api_key}"
        
        try:
            response = requests.get(weather_url)
            result = response.json()
            
            # 检查API响应状态
            if result.get("status") != 0:
                error_msg = result.get("message", "未知错误")
                raise Exception(f"天气API错误: {error_msg}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络请求错误: {str(e)}")
    
    def display_weather(self, location):
        """显示天气信息"""
        try:
            weather_data = self.get_weather(location)
            
            if weather_data and weather_data.get("result"):
                result = weather_data["result"]
                print(f"\n{location}的天气信息:")
                print(f"更新时间: {result.get('forecasts', [{}])[0].get('updateTime', '未知')}")
                
                # 显示当前天气
                if "now" in result:
                    now = result["now"]
                    print(f"当前温度: {now.get('temp', '未知')}°C")
                    print(f"天气状况: {now.get('text', '未知')}")
                    print(f"风向风力: {now.get('wind_dir', '未知')} {now.get('wind_class', '未知')}")
                
                # 显示预报
                if "forecasts" in result and result["forecasts"]:
                    forecast = result["forecasts"][0]
                    print(f"\n今日预报:")
                    print(f"最高温度: {forecast.get('high', '未知')}°C")
                    print(f"最低温度: {forecast.get('low', '未知')}°C")
                    print(f"白天: {forecast.get('text_day', '未知')}")
                    print(f"晚上: {forecast.get('text_night', '未知')}")
            
        except Exception as e:
            print(f"获取天气信息失败: {str(e)}")

# 使用示例
if __name__ == "__main__":
    try:
        client = WeatherClient()
        location = input("请输入要查询的城市名称: ")
        client.display_weather(location)
    except Exception as e:
        print(f"程序错误: {str(e)}")