# Prometheus 监控演示项目

这是一个使用 Flask + Prometheus + Grafana 的监控演示项目。

## 项目架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Flask App     │────▶│   Prometheus    │────▶│    Grafana      │
│   (端口 8000)   │     │   (端口 9090)   │     │   (端口 3000)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              ▲
                              │
                        ┌─────────────────┐
                        │  Node Exporter  │
                        │   (端口 9100)   │
                        └─────────────────┘
```

## 快速开始

### 1. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 2. 启动 Flask 应用

```bash
python app.py
```

Flask 应用启动后，可以访问以下端点：

| 端点 | 地址 | 说明 |
|------|------|------|
| Hello | http://127.0.0.1:8000/hello | 返回 "Hello World!" 并记录访问次数 |
| Metrics | http://127.0.0.1:8000/metrics | 查看 Prometheus 格式的指标数据 |

> ⚠️ 注意：根路径 `/` 没有定义，访问会返回 404

### 3. 启动监控栈（新开一个终端）

```bash
docker-compose up -d
```

启动后可以访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| Prometheus | http://127.0.0.1:9090 | 时序数据库 Web UI |
| Grafana | http://127.0.0.1:3000 | 可视化仪表板 |

Grafana 登录信息：
- 用户名：`admin`
- 密码：`admin`

## 测试流程

1. 多次访问 http://127.0.0.1:8000/hello
2. 访问 http://127.0.0.1:8000/metrics 查看 `hello_request_total` 计数器的变化
3. 在 Prometheus UI (http://127.0.0.1:9090) 中查询 `hello_request_total`

## 配置说明

### prometheus.yml

```yaml
global:
  scrape_interval: 5s  # 每 5 秒抓取一次指标

scrape_configs:
  - job_name: 'flask-app'
    static_configs:
      - targets: ['localhost:8000']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

## 停止服务

```bash
# 停止 Flask 应用
# 在运行 python app.py 的终端按 Ctrl+C

# 停止 Docker 容器
docker-compose down
```

## 文件结构

```
prometheus/
├── app.py              # Flask 应用主程序
├── metrics.py          # Prometheus 指标定义
├── prometheus.yml      # Prometheus 配置文件
├── docker-compose.yaml # Docker Compose 配置
├── requirements.txt    # Python 依赖
└── README.md           # 本文档
```

