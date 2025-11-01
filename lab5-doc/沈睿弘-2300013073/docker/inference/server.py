from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# TODO: Load the trained model from the shared volume (use the correct path)
import time
max_retries = 5
for retry in range(max_retries):
    try:
        model = joblib.load('/app/models/iris_model.pkl')
        break
    except Exception as e:
        print(f"Error loading model: {e}")
        time.sleep(1)
# model = joblib.load('/app/models/iris_model.pkl')

# TODO: Add request method to predict
@app.route('/predict', methods=['POST'])
def predict():
    # TODO: Get the input array from the request body and make prediction using the model
    get_json = request.get_json()
    if not get_json or 'input' not in get_json:
        return jsonify({'error': 'Invalid request body'}), 400

    try:
        iris_input = np.array(get_json['input'], dtype=float).reshape(1, -1)
    except (TypeError, ValueError):
        return jsonify({'error': 'Input must be a numeric array'}), 400

    # HINT: use np.array().reshape(1, -1) to convert input to 2D array
    prediction = model.predict(iris_input)

    return jsonify({'prediction': prediction[0]})

@app.route('/')
def hello():
    return 'Welcome to Docker Lab'

if __name__ == '__main__':
    #Run the Flask app (bind it to port 8080 or any other port)
    app.run(debug=True, port=8080, host='0.0.0.0')
