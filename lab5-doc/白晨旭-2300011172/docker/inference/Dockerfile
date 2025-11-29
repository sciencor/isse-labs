# 使用和训练相同的基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制并安装依赖
COPY docker/inference/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 复制推理服务代码
COPY docker/inference/server.py ./server.py

# 声明模型共享卷
VOLUME ["/app/models"]

# 暴露端口（文档用途，真正映射靠 docker run -p）
EXPOSE 8080

# 启动 Flask 服务
CMD ["python", "server.py"]
