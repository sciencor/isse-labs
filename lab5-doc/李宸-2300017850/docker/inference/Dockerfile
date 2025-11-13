# Base image
FROM docker.m.daocloud.io/python:3.9-slim

# Setup working directory
WORKDIR /app
# Copy requirements.txt and install dependencies
COPY docker/inference/requirements.txt .
RUN pip install -r requirements.txt

COPY docker/inference/server.py ./server.py
# Store model in a shared volume
EXPOSE 8080
# TODO: Set the command to run the training script
CMD ["python", "server.py"]