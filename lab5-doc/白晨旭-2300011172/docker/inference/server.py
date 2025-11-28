from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# TODO: Load the trained model from the shared volume (use the correct path)
model_path = "/app/models/iris_model.pkl"
model = joblib.load(model_path)

# TODO: Add request method to predict
@app.route('/predict', methods=['POST'])
def predict():
    # TODO: Get the input array from the request body and make prediction using the model
    data = request.get_json()
    if not data or 'input' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    iris_input = data["input"]

    try:
        x = np.array(iris_input, dtype=float).reshape(1, -1)
    except Exception:
        return jsonify({"error": '"input" must be a 1D array of numbers.'}), 400

    try:
        pred = model.predict(x)
    except Exception as e:
        return jsonify({"error": "Model prediction failed.", "details": str(e)}), 500

    prediction = pred[0].item() if hasattr(pred[0], "item") else pred[0]

    return jsonify({"prediction": prediction})


@app.route('/')
def hello():
    return 'Welcome to Docker Lab'

if __name__ == '__main__':
    #Run the Flask app (bind it to port 8080 or any other port)
    app.run(debug=True, port=8080, host='0.0.0.0')
