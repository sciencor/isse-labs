# 使用conda镜像作为基础镜像
FROM continuumio/miniconda3

# 设置工作目录
WORKDIR /app

# 复制requirements.txt到容器中
COPY train/requirements.txt .

# 使用conda安装依赖包
RUN conda install -c conda-forge scikit-learn pandas numpy joblib -y

# 复制训练脚本到容器中
COPY train/train.py .

# 创建模型存储目录
RUN mkdir -p /app/models

# 设置环境变量
ENV PYTHONUNBUFFERED=1

# 设置容器启动时运行的命令
CMD ["python", "train.py"]