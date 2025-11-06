FROM python:3.9-slim

# Setup working directory
WORKDIR /app
# Copy requirements.txt and install dependencies
COPY docker/inference/requirements.txt .
RUN pip install -r requirements.txt
# Copy the training script to the working directory
COPY docker/inference/server.py ./server.py
# Store model in a shared volume
VOLUME ["/app/models"]
# TODO: Set the command to run the training script
CMD ["python", "server.py"]