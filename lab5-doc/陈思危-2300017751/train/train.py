import os
import joblib
from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pandas as pd

def main():
    print("开始训练模型...")
    
    # 加载 iris 数据集
    iris = datasets.load_iris()
    X = iris.data
    y = iris.target
    
    print(f"数据集形状: X={X.shape}, y={y.shape}")
    print(f"特征名称: {iris.feature_names}")
    print(f"目标类别: {iris.target_names}")
    
    # 划分训练集和测试集
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # 创建并训练随机森林分类器
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # 预测和评估
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"模型准确率: {accuracy:.4f}")
    print("\n分类报告:")
    print(classification_report(y_test, y_pred, target_names=iris.target_names))
    
    # 确保模型保存目录存在
    model_dir = "/app/models"
    os.makedirs(model_dir, exist_ok=True)
    
    # 保存模型到共享卷
    model_path = os.path.join(model_dir, "iris_model.pkl")
    joblib.dump(model, model_path)
    print(f"模型已保存到: {model_path}")
    
    # 保存模型信息
    model_info = {
        'accuracy': accuracy,
        'feature_names': list(iris.feature_names),
        'target_names': list(iris.target_names),
        'model_type': 'RandomForestClassifier'
    }
    
    info_path = os.path.join(model_dir, "model_info.pkl")
    joblib.dump(model_info, info_path)
    print(f"模型信息已保存到: {info_path}")
    
    print("训练完成!")

if __name__ == "__main__":
    main()