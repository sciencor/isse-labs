# Base image
FROM python:3.9-slim

WORKDIR /app

COPY docker/training/requirements.txt .
RUN pip install -r requirements.txt

COPY docker/inference/server.py ./server.py

VOLUME ["/app/models"]

EXPOSE 8080

CMD ["python", "server.py"]

