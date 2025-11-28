from pathlib import Path

from sklearn import datasets
from sklearn.svm import SVC
import joblib

# Load the Iris dataset
iris = datasets.load_iris()

# Create and train an SVM classifier on the iris dataset
clf = SVC()
model = clf.fit(iris.data, iris.target)

# Save the trained model to the shared volume
model_dir = Path("/app/models")
model_dir.mkdir(parents=True, exist_ok=True)
model_path = model_dir / "iris_model.pkl"
joblib.dump(model, model_path)

print(f"Model training complete and saved as {model_path}")


