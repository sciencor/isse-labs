# Base image
FROM docker.m.daocloud.io/python:3.9-slim

# Setup working directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY docker/inference/requirements.txt .
RUN pip install -r requirements.txt

# docker build -t isse-inference ./docker/inference
COPY docker/inference/server.py ./server.py

# Expose port
EXPOSE 8080

# Run flask
CMD ["python", "server.py"]

