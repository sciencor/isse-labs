from pathlib import Path
import time

from flask import Flask, request, jsonify
from sklearn import datasets
import numpy as np
import joblib

app = Flask(__name__)

MODEL_PATH = Path("/app/models/iris_model.pkl")
WAIT_TIMEOUT = 60  # seconds
POLL_INTERVAL = 2  # seconds


def load_model() -> object:
    """Wait for the trained model to appear on the shared volume and load it."""
    deadline = time.time() + WAIT_TIMEOUT
    while time.time() < deadline:
        if MODEL_PATH.exists():
            return joblib.load(MODEL_PATH)
        time.sleep(POLL_INTERVAL)

    raise FileNotFoundError(
        f"Model file not found at {MODEL_PATH} after waiting {WAIT_TIMEOUT} seconds."
    )


model = load_model()
target_names = datasets.load_iris().target_names


@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True)
    if not payload or "input" not in payload:
        return jsonify({"error": "Request body must include an 'input' list."}), 400

    try:
        iris_input = np.array(payload["input"], dtype=float).reshape(1, -1)
    except (ValueError, TypeError):
        return jsonify({"error": "Input array must contain numeric values."}), 400

    if iris_input.shape[1] != 4:
        return jsonify({"error": "Expected 4 numeric values for the iris features."}), 400

    prediction_idx = int(model.predict(iris_input)[0])
    prediction_label = target_names[prediction_idx]

    return jsonify({"prediction": prediction_label, "class_index": prediction_idx})

@app.route('/')
def hello():
    return 'Welcome to Docker Lab'

if __name__ == '__main__':
    #Run the Flask app (bind it to port 8080 or any other port)
    app.run(debug=True, port=8080, host='0.0.0.0')
