from prometheus_client import Counter, Gauge, Histogram, Summary, generate_latest
from flask import Response

# 定义一个计数器，用于统计 /hello 的访问次数
hello_counter = Counter(
    "hello_request_total",
    "Total number of /hello requests"
)

# 定义一个仪表盘，用于模拟某种状态值（例如：随机值）
hello_gauge = Gauge(
    "hello_random_value",
    "A random value generated on each /hello request"
)

# 定义一个直方图，用于统计请求处理时间的分布
hello_histogram = Histogram(
    "hello_request_latency_seconds",
    "Latency of /hello requests in seconds",
    buckets=(0.1, 0.2, 0.5, 1.0, 2.0, 5.0)
)

# 定义一个摘要，用于统计请求处理时间
hello_summary = Summary(
    "hello_request_processing_seconds",
    "Summary of /hello request processing time"
)

# 暴露所有 metrics
def metrics():
    return Response(generate_latest(), mimetype="text/plain")
