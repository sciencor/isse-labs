from dotenv import load_dotenv
import os
import requests

load_dotenv()
response = requests.get(f"https://api.map.baidu.com/weather/v1/?district_id=110108&data_type=all&ak={os.environ.get("API_KEY")}")
print(response.json())
