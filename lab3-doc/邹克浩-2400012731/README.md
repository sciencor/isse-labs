## 快速开始（开发）

1. 创建并激活虚拟环境（如果尚未）：

```bash
python -m venv .venv
source .venv/bin/activate
```

2. 安装依赖：

```bash
pip install -r project/backend/requirements.txt
```

3. 启动后端（Flask 会托管前端静态文件）：

```bash
python project/backend/app.py
```

4. 在浏览器打开：

```
http://127.0.0.1:5000/