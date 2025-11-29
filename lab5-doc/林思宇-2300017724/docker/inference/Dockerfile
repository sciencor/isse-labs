# Base image
FROM python:3.9-slim

# Setup working directory
WORKDIR /app

# Install dependencies
COPY docker/inference/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server implementation
COPY docker/inference/server.py ./server.py

# Location where the model will be mounted
VOLUME ["/app/models"]

EXPOSE 8080

# Start the Flask inference server
CMD ["python", "server.py"]
