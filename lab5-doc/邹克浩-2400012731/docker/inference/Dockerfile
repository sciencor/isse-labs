FROM python:3.9-slim

WORKDIR /app

RUN pip install flask joblib numpy scikit-learn

COPY docker/inference/server.py ./server.py

VOLUME ["/app/models"]

CMD ["python", "server.py"]