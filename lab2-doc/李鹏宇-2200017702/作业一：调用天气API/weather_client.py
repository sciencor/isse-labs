# encoding:utf-8
# 根据您选择的AK已为您生成调用代码
# 检测到您当前的AK设置了IP白名单校验
# 您的IP白名单中的IP非公网IP，请设置为公网IP，否则将请求失败
# 请在IP地址为0.0.0.0/0 外网IP的计算发起请求，否则将请求失败

import requests 
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 服务地址
host = "https://api.map.baidu.com"

# 接口地址
uri = "/weather/v1/"

# 从环境变量中读取AK
ak = os.getenv('BAIDU_MAP_AK')
if not ak:
    raise ValueError("请在.env文件中设置BAIDU_MAP_AK环境变量")

params_now = {
    "district_id":    "110108",
    "data_type":    "now",
    "ak":       ak,
}

params_all = {
    "district_id":    "222405",
    "data_type":    "all",
    "ak":       ak,
}

response_now = requests.get(url = host + uri, params = params_now)
if response_now:
    print(response_now.json())

# response_all = requests.get(url = host + uri, params = params_all)
# if response_all:
#     print(response_all.json())
