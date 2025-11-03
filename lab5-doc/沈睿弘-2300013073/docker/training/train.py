import os
from pathlib import Path
import joblib
from sklearn import datasets
from sklearn.svm import SVC

#Load the Iris dataset
iris = datasets.load_iris()

#Create an SVM classifier
clf = SVC()

#Train the model using the iris dataset
model = clf.fit(iris.data, iris.target_names[iris.target])

# TODO: Save the trained model to the shared volume (make sure to use the correct path)
model_dir = Path(os.environ.get("MODEL_DIR", "/app/models"))
model_dir.mkdir(parents=True, exist_ok=True)
model_path = model_dir / "iris_model.pkl"
joblib.dump(model, model_path)

print("Model training complete and saved as iris_model.pkl")