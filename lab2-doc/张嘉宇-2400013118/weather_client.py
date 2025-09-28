import requests
import os
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("API_KEY")

host = "http://api.map.baidu.com"

uri = "/weather/v1"

ak = API_KEY