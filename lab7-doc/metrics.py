from prometheus_client import Counter, generate_latest
from flask import Response

# 定义一个计数器，用于统计 /hello 的访问次数
hello_counter = Counter(
    "hello_request_total",
    "Total number of /hello requests"
)

# 暴露所有 metrics
def metrics():
    return Response(generate_latest(), mimetype="text/plain")
