# Base image
FROM python:3.9-slim

# Setup working directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY docker/inference/requirements.txt .
RUN pip install -r requirements.txt

# Copy the server script to the working directory
COPY docker/inference/server.py ./server.py

# Mount shared volume for model access
VOLUME ["/app/models"]

# Expose the port that Flask runs on
EXPOSE 8080

# Set the command to run the Flask server
CMD ["python", "server.py"]
