import os
import requests
import argparse

api_key = os.getenv("BAIDU_API_KEY")


def request_weather(district_id: str, data_type: str = "all"):
    host = "https://api.map.baidu.com"
    uri = "/weather/v1/"

    params = {
        "district_id": district_id,
        "data_type": data_type,
        "ak": api_key,
    }

    response = requests.get(url=f"{host}{uri}", params=params)
    if response:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Query weather by district_id and data_type"
    )
    # refer to https://mapopen-website-wiki.bj.bcebos.com/cityList/weather_district_id.csv
    parser.add_argument("--district_id", required=True, help="Baidu district_id")
    parser.add_argument(
        "--data_type",
        default="all",
        choices=["now", "fc", "index", "alert", "fc_hour", "all"],
        help="Weather data type: now/fc/index/alert/fc_hour/all (default: all)",
    )
    args = parser.parse_args()

    result = request_weather(args.district_id, args.data_type)
    print(result)
