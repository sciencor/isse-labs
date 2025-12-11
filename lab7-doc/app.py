from flask import Flask
from metrics import hello_counter, metrics

app = Flask(__name__)

@app.route("/hello")
def hello():
    hello_counter.inc()
    return "Hello World!"

# 暴露 Prometheus 指标
app.add_url_rule("/metrics", "metrics", metrics)

if __name__ == "__main__":
    # 让服务可以被 Docker 访问
    app.run(host="0.0.0.0", port=8000)
