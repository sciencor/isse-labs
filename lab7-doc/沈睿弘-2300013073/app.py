from flask import Flask
import random
import time

from metrics import (
    hello_counter,
    hello_latency_histogram,
    hello_latency_summary,
    hello_work_gauge,
    metrics,
)

app = Flask(__name__)

@app.route("/hello")
def hello():
    hello_counter.inc()

    hello_work_gauge.set(random.randint(0, 100)) # 随机值

    start_time = time.perf_counter()
    time.sleep(random.uniform(0.05, 0.25))
    elapsed_seconds = time.perf_counter() - start_time

    hello_latency_histogram.observe(elapsed_seconds) # 记录耗时分布
    hello_latency_summary.observe(elapsed_seconds) # 记录耗时统计

    return "Hello World!"

# 暴露 Prometheus 指标
app.add_url_rule("/metrics", "metrics", metrics)

if __name__ == "__main__":
    # 让服务可以被 Docker 访问
    app.run(host="0.0.0.0", port=8000)
