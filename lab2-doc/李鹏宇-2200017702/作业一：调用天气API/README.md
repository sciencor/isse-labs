# 作业一：调用百度天气 API

## 任务目标
学会调用第三方 API，获取天气信息。

---

## 步骤说明

### 1. 注册百度地图 API
- 访问 [百度地图API官网](https://lbs.baidu.com/faq/api?title=webapi/weather/base)
- 注册账号并创建应用，获取 API Key（AK）

### 2. 安全存储 API Key
- 在项目根目录下新建 `.env` 文件：
  ```ini
  BAIDU_MAP_AK=你的APIKey
  ```
- **注意：不要将 `.env` 文件提交到 GitHub！**
- `.env` 文件已被加入 `.gitignore`，确保安全。

### 3. 编写 Python 脚本
- 参考 `weather_client.py`，使用 requests 和 python-dotenv 读取环境变量并发起 API 请求。
- 示例代码片段：
  ```python
  import requests
  import os
  from dotenv import load_dotenv

  load_dotenv()
  ak = os.getenv('BAIDU_MAP_AK')
  # ...
  ```

### 4. 运行脚本
- 安装依赖：
  ```sh
  pip install requests python-dotenv
  ```
- 运行脚本：
  ```sh
  python weather_client.py
  ```

---

## 运行结果
```
{'status': 0, 'result': {'location': {'country': '中国', 'province': '北京市', 'city': '北京市', 'name': '海淀', 'id': '110108'}, 'now': {'text': '晴', 'temp': 18, 'feels_like': 18, 'rh': 88, 'wind_class': '1级', 'wind_dir': '东北风', 'prec_1h': 0.0, 'clouds': 27, 'vis': 13700, 'aqi': 58, 'pm25': 31, 'pm10': 66, 'no2': 84, 'so2': 3, 'o3': 13, 'co': 0.6, 'wind_angle': 43, 'uvi': 0, 'pressure': 1014, 'dpt': 16, 'uptime': '20250927002000'}}, 'message': 'success'}
{'status': 0, 'result': {'location': {'country': '中国', 'province': '吉林省', 'city': '延边朝鲜族自治州', 'name': '龙井', 'id': '222405'}, 'now': {'text': '雾', 'temp': 10, 'feels_like': 10, 'rh': 95, 'wind_class': '1级', 'wind_dir': '西南风', 'prec_1h': 0.0, 'clouds': 3, 'vis': 1700, 'aqi': 22, 'pm25': 9, 'pm10': 22, 'no2': 18, 'so2': 7, 'o3': 17, 'co': 0.6, 'wind_angle': 239, 'uvi': 0, 'pressure': 960, 'dpt': 9, 'uptime': '20250927002000'}, 'indexes': [{'name': '晨练指数', 'brief': '较适宜', 'detail': '天气阴沉，请避免在林中晨练。'}, {'name': '洗车指数', 'brief': '适宜', 'detail': '天气较好，适合擦洗汽车。'}, {'name': '感冒指数', 'brief': '较易发', 'detail': '天凉，较易感冒'}, {'name': '紫外线指数', 'brief': '强', 'detail': '涂擦 SPF20左右，PA++，避免强光。'}, {'name': '穿衣指数', 'brief': '舒适', 'detail': '建议穿长袖衬衫单裤等服装。'}, {'name': '运动指数', 'brief': '较适宜', 'detail': '请适当降低运动强度。'}], 'alerts': [{'type': '大雾', 'level': '黄色预警', 'title': '龙井市气象台发布大雾黄色预警[III级/较大]', 'desc': '龙井市气象台9月25日07时00分发布大雾黄色预警信号：今天早晨我市大部分地方有雾或轻雾，部分地方已出现能 见度小于500米雾，并将持续3～6小时。市应急管理局、市交通警察大队、市气象局联合提醒注意做好防范工作。'}], 'forecasts': [{'text_day': '多云', 'text_night': '阴', 'high': 25, 'low': 10, 'wc_day': '<3级', 'wd_day': '西风', 'wc_night': '<3级', 'wd_night': '西风', 'date': '2025-09-27', 'week': '星期六'}, {'text_day': '多云', 'text_night': '晴', 'high': 22, 'low': 8, 'wc_day': '<3级', 'wd_day': '西风', 'wc_night': '<3级', 'wd_night': '西风', 'date': '2025-09-28', 'week': '星期日'}, {'text_day': '晴', 'text_night': '晴', 'high': 24, 'low': 7, 'wc_day': '<3级', 'wd_day': ' 西风', 'wc_night': '<3级', 'wd_night': '西南风', 'date': '2025-09-29', 'week': '星期一'}, {'text_day': '晴', 'text_night': '晴', 'high': 23, 'low': 8, 'wc_day': '<3级', 'wd_day': '西北风', 'wc_night': '<3级', 'wd_night': '西南风', 'date': '2025-09-30', 'week': '星期二'}, {'text_day': '多云', 'text_night': '多云', 'high': 24, 'low': 8, 'wc_day': '<3级', 'wd_day': '西南风', 'wc_night': '<3级', 'wd_night': '西风', 'date': '2025-10-01', 'week': '星期三'}, {'text_day': '多云', 'text_night': '多云', 'high': 25, 'low': 10, 'wc_day': '<3级', 'wd_day': '东风', 'wc_night': '<3级', 'wd_night': '北风', 'date': '2025-10-02', 'week': '星期四'}, {'text_day': '多云', 'text_night': '阴', 'high': 24, 'low': 8, 'wc_day': '<3级', 'wd_day': '东北风', 'wc_night': '<3级', 'wd_night': '西南风', 'date': '2025-10-03', 'week': '星期五'}], 'forecast_hours': [{'text': '晴', 'temp_fc': 11, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 93, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 195, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 9, 'data_time': '2025-09-27 00:00:00'}, {'text': '晴', 'temp_fc': 11, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 93, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 188, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 10, 'data_time': '2025-09-27 01:00:00'}, {'text': '晴', 'temp_fc': 11, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 94, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 175, 'pop': 0, 'uvi': 0, 'pressure': 990, 'dpt': 10, 'data_time': '2025-09-27 02:00:00'}, {'text': '晴', 'temp_fc': 10, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 94, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 170, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 9, 'data_time': '2025-09-27 03:00:00'}, {'text': '晴', 'temp_fc': 9, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 94, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 165, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 8, 'data_time': '2025-09-27 04:00:00'}, {'text': '晴', 'temp_fc': 9, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 94, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 160, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 8, 'data_time': '2025-09-27 05:00:00'}, {'text': '晴', 'temp_fc': 11, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 88, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 183, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 9, 'data_time': '2025-09-27 06:00:00'}, {'text': '晴', 'temp_fc': 13, 'wind_class': '<3级', 'wind_dir': '西南风', 'rh': 83, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 221, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 10, 'data_time': '2025-09-27 07:00:00'}, {'text': '晴', 'temp_fc': 15, 'wind_class': '<3级', 'wind_dir': '西风', 'rh': 78, 'prec_1h': 0.0, 'clouds': 0, 'wind_angle': 253, 'pop': 0, 'uvi': 0, 'pressure': 989, 'dpt': 11, 'data_time': '2025-09-27 08:00:00'}, {'text': '晴', 'temp_fc': 17, 'wind_class': '<3级', 'wind_dir': '西风', 'rh': 70, 'prec_1h': 0.0, 'clouds': 3, 'wind_angle': 271, 'pop': 0, 'uvi': 0, 'pressure': 988, 'dpt': 11, 'data_time': '2025-09-27 09:00:00'}, {'text': '多云', 'temp_fc': 19, 'wind_class': '<3级', 'wind_dir': '西风', 'rh': 64, 'prec_1h': 0.0, 'clouds': 6, 'wind_angle': 291, 'pop': 0, 'uvi': 0, 'pressure': 987, 'dpt': 12, 'data_time': '2025-09-27 10:00:00'}, {'text': '多云', 'temp_fc': 22, 'wind_class': '<3级', 'wind_dir': '西北风', 'rh': 57, 'prec_1h': 0.0, 'clouds': 10, 'wind_angle': 303, 'pop': 0, 'uvi': 0, 'pressure': 987, 'dpt': 13, 'data_time': '2025-09-27 11:00:00'}, {'text': '多云', 'temp_fc': 22, 'wind_class': '<3级', 'wind_dir': '西北风', 'rh': 55, 'prec_1h': 0.0, 'clouds': 10, 'wind_angle': 322, 'pop': 0, 'uvi': 0, 'pressure': 986, 'dpt': 13, 'data_time': '2025-09-27 12:00:00'}, {'text': '多云', 'temp_fc': 23, 'wind_class': '<3级', 'wind_dir': '北风', 'rh': 54, 'prec_1h': 0.0, 'clouds': 10, 'wind_angle': 342, 'pop': 0, 'uvi': 0, 'pressure': 985, 'dpt': 13, 'data_time': '2025-09-27 13:00:00'}, {'text': '多云', 'temp_fc': 24, 'wind_class': '3~4级', 'wind_dir': '北风', 'rh': 53, 'prec_1h': 0.0, 'clouds': 10, 'wind_angle': 357, 'pop': 0, 'uvi': 0, 'pressure': 985, 'dpt': 13, 'data_time': '2025-09-27 14:00:00'}, {'text': '多云', 'temp_fc': 23, 'wind_class': '<3级', 'wind_dir': '北风', 'rh': 54, 'prec_1h': 0.0, 'clouds': 31, 'wind_angle': 13, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 13, 'data_time': '2025-09-27 15:00:00'}, {'text': '多云', 'temp_fc': 22, 'wind_class': '<3级', 'wind_dir': '东北风', 'rh': 56, 'prec_1h': 0.0, 'clouds': 52, 'wind_angle': 65, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 12, 'data_time': '2025-09-27 16:00:00'}, {'text': '多云', 'temp_fc': 21, 'wind_class': '<3级', 'wind_dir': '东南风', 'rh': 58, 'prec_1h': 0.0, 'clouds': 72, 'wind_angle': 126, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 12, 'data_time': '2025-09-27 17:00:00'}, {'text': '多云', 'temp_fc': 19, 'wind_class': '<3级', 'wind_dir': '东南风', 'rh': 53, 'prec_1h': 0.0, 'clouds': 74, 'wind_angle': 151, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 10, 'data_time': '2025-09-27 18:00:00'}, {'text': '多云', 'temp_fc': 18, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 49, 'prec_1h': 0.0, 'clouds': 76, 'wind_angle': 173, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 7, 'data_time': '2025-09-27 19:00:00'}, {'text': '多云', 'temp_fc': 17, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 46, 'prec_1h': 0.0, 'clouds': 79, 'wind_angle': 187, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 5, 'data_time': '2025-09-27 20:00:00'}, {'text': '多云', 'temp_fc': 15, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 57, 'prec_1h': 0.0, 'clouds': 79, 'wind_angle': 177, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 7, 'data_time': '2025-09-27 21:00:00'}, {'text': '阴', 'temp_fc': 14, 'wind_class': '<3级', 'wind_dir': '南风', 'rh': 70, 'prec_1h': 0.0, 'clouds': 79, 'wind_angle': 169, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 9, 'data_time': '2025-09-27 22:00:00'}, {'text': '阴', 'temp_fc': 13, 'wind_class': '<3级', 'wind_dir': ' 南风', 'rh': 82, 'prec_1h': 0.0, 'clouds': 80, 'wind_angle': 161, 'pop': 0, 'uvi': 0, 'pressure': 984, 'dpt': 9, 'data_time': '2025-09-27 23:00:00'}]}, 'message': 'success'}
```
---

## 参考资料
- [百度天气API官方文档](https://lbsyun.baidu.com/index.php?title=webapi/weather)
- [python-dotenv 文档](https://saurabh-kumar.com/python-dotenv/)
- [requests 官方文档](https://docs.python-requests.org/zh_CN/latest/)
