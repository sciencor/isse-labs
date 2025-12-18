from prometheus_client import Counter, Gauge, Histogram, Summary, generate_latest
from flask import Response

# 定义一个计数器，用于统计 /hello 的访问次数
hello_counter = Counter(
    "hello_request_total",
    "Total number of /hello requests"
)

# 定义一个 Gauge
random_gauge = Gauge(
    "random_value_gauge",
    "A random value gauge"
)

# 定义一个 Histogram
latency_histogram = Histogram(
    "request_latency_seconds",
    "Request latency in seconds",
    buckets=(0.1, 0.2, 0.5, 1.0, 2.0, 5.0)
)

# 定义一个 Summary
processing_summary = Summary(
    "request_processing_seconds",
    "Request processing time in seconds"
)

# 暴露所有 metrics
def metrics():
    return Response(generate_latest(), mimetype="text/plain")
