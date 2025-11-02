# 使用Python官方镜像作为基础镜像
FROM continuumio/miniconda3

# 设置工作目录
WORKDIR /app

# 复制requirements.txt到容器中
COPY inference/requirements.txt .

# 使用conda安装依赖包
RUN conda install -y flask scikit-learn pandas numpy && \
    pip install joblib gunicorn

# 复制推理服务脚本到容器中
COPY inference/server.py .

# 创建模型存储目录
RUN mkdir -p /app/models

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV PYTHONUNBUFFERED=1

# 设置容器启动时运行的命令
CMD ["python", "server.py"]