from sklearn.svm import SVC
from sklearn import datasets
import joblib
import os

save_path = '/app/models/iris_model.pkl'
os.makedirs(os.path.dirname(save_path), exist_ok=True)

#Load the Iris dataset
iris = datasets.load_iris()

#Create an SVM classifier
clf = SVC()

#Train the model using the iris dataset
model = clf.fit(iris.data, iris.target_names[iris.target])

# TODO: Save the trained model to the shared volume (make sure to use the correct path)
joblib.dump(model, save_path)

print("Model training complete and saved as iris_model.pkl")


