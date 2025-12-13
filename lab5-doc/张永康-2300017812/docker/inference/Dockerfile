FROM python:3.9-slim

WORKDIR /app
COPY docker/inference/requirements.txt .
RUN pip install -r requirements.txt
COPY docker/inference/server.py ./server.py
VOLUME ["/app/models"]
CMD ["python", "server.py"]