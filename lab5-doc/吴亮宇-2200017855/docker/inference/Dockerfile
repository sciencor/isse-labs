FROM python:3.9-slim

ENV FLASK_APP=server.py
ENV FLASK_ENV=production

WORKDIR /app

COPY docker/training/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY docker/inference/server.py .

EXPOSE 8080

VOLUME ["/app/models"]

CMD ["python", "server.py"]