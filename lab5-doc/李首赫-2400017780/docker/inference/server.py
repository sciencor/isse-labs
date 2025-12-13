from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# TODO: Load the trained model from the shared volume (use the correct path)
model = joblib.load('/app/models/iris_model.pkl')
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
    prediction = model.predict(iris_input)
    return jsonify({'prediction': prediction[0]})

@app.route('/')
def hello():
    return 'Welcome to Docker Lab'

if __name__ == '__main__':
    app.run(debug=True, port=8080, host='0.0.0.0')