from prometheus_client import Counter, Gauge, Histogram, Summary, generate_latest
from flask import Response

# 定义一个计数器，用于统计 /hello 的访问次数
hello_counter = Counter(
    "hello_request_total",
    "Total number of /hello requests"
)

# Gauge：记录最近一次 /hello 的“工作量”（示例：随机值）
hello_work_gauge = Gauge(
    "hello_work_factor",
    "A changing gauge set by /hello (demo work factor)"
)

# Histogram：记录 /hello 的处理耗时的分布
hello_latency_histogram = Histogram(
    "hello_request_latency_seconds",
    "Latency of /hello requests in seconds"
)

# Summary：同样记录 /hello 的处理耗时（便于查看 count/sum）
hello_latency_summary = Summary(
    "hello_request_latency_summary_seconds",
    "Latency summary of /hello requests in seconds"
)

# 暴露所有 metrics
def metrics():
    return Response(generate_latest(), mimetype="text/plain")
