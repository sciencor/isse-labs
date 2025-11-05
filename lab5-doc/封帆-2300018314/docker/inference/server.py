from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# TODO: Load the trained model from the shared volume (use the correct path)
model = joblib.load('/app/models/iris_model.pkl')

# TODO: Add request method to predict
@app.route('/predict', methods=['POST'])
def predict():
    # TODO: Get the input array from the request body and make prediction using the model
    get_json = request.get_json()
    iris_input = np.array(get_json['input']).reshape(1, -1)

    # HINT: use np.array().reshape(1, -1) to convert input to 2D array
    prediction = model.predict(iris_input)

    return jsonify({'prediction': prediction.tolist()})

@app.route('/')
def hello():
    return 'Welcome to Docker Lab'

if __name__ == '__main__':
    #Run the Flask app (bind it to port 8080 or any other port)
    app.run(debug=True, port=8080, host='0.0.0.0')
