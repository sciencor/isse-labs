from flask import Flask
from metrics import hello_counter, random_gauge, latency_histogram, processing_summary, metrics
import time
import random

app = Flask(__name__)

@app.route("/hello")
def hello():
    hello_counter.inc()
    
    # Gauge: 设置一个随机值
    random_gauge.set(random.random() * 100)
    
    # Histogram & Summary: 模拟延迟
    delay = random.random() * 2  # 0-2 seconds
    latency_histogram.observe(delay)
    processing_summary.observe(delay)
    
    return f"Hello World! Delay: {delay:.2f}s"

# 暴露 Prometheus 指标
app.add_url_rule("/metrics", "metrics", metrics)

if __name__ == "__main__":
    # 让服务可以被 Docker 访问
    app.run(host="0.0.0.0", port=8000)
