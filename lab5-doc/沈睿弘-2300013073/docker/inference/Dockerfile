FROM python:3.9-slim

WORKDIR /app

COPY docker/inference/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY docker/inference/server.py ./server.py

ENV MODEL_DIR=/app/models
VOLUME ["/app/models"]

EXPOSE 8080

CMD ["python", "server.py"]

