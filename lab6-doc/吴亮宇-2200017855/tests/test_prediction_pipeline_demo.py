import pytest
import pandas as pd
import numpy as np
from prediction_pipeline_demo import data_preparation, data_split, train_model, eval_model

@pytest.fixture
def housing_data_sample():
    rows = []
    base = {
        "price": 13_300_000,
        "area": 7420,
        "bedrooms": 4,
        "bathrooms": 2,
        "stories": 3,
        "mainroad": "yes",
        "guestroom": "no",
        "basement": "no",
        "hotwaterheating": "no",
        "airconditioning": "yes",
        "parking": 2,
        "prefarea": "yes",
        "furnishingstatus": "furnished",
    }
    # Create 10 slightly varied rows
    for i in range(10):
        rows.append({
            **base,
            "price": base["price"] - i * 100_000,          # 13.3M, 13.2M, ...
            "area": base["area"] + i * 150,                # 7420, 7570, ...
            "bedrooms": 3 + (i % 3),                       # 3,4,5 repeating
            "bathrooms": 2 + (i % 3),                      # 2,3,4 repeating
            "stories": 2 + (i % 3),                        # 2,3,4 repeating
            "mainroad": "yes" if i % 2 == 0 else "no",
            "guestroom": "no" if i % 3 else "yes",
            "basement": "no" if (i+1) % 3 else "yes",
            "hotwaterheating": "no" if i % 4 else "yes",
            "airconditioning": "yes" if i % 5 else "no",
            "parking": 1 + (i % 3),                        # 1,2,3 repeating
            "prefarea": "yes" if i % 2 == 0 else "no",
            "furnishingstatus": "furnished" if i % 2 == 0 else "unfurnished",
        })
    return pd.DataFrame(rows)

def test_data_preparation(housing_data_sample):
    feature_df, target_series = data_preparation(housing_data_sample)
    # Target and datapoints have same length
    assert feature_df.shape[0] == len(target_series)
    # Features are numeric/bool after one-hot
    numeric_bool_cols = feature_df.select_dtypes(include=(np.number, bool)).shape[1]
    assert feature_df.shape[1] == numeric_bool_cols

@pytest.fixture
def feature_target_sample(housing_data_sample):
    feature_df, target_series = data_preparation(housing_data_sample)
    return (feature_df, target_series)

def test_data_split_returns_four_parts(feature_target_sample):
    # TODO(1): 取消下一行的注释以获取拆分结果
    parts = data_split(*feature_target_sample)
    # TODO(2): 增加断言，检测：
    #   - parts 是元组(tuple)
    #   - 元组有四个元素
    assert isinstance(parts, tuple)
    assert len(parts) == 4


def test_end_to_end_train_and_eval(feature_target_sample):
    # TODO(3): 取消下面的注释以进行训练和评估
    X_train, X_test, y_train, y_test = data_split(*feature_target_sample)
    model = train_model(X_train, y_train)
    score = eval_model(X_test, y_test, model)
    # TODO(4): 增加断言，检测：
    #   - score 是浮点数
    #   - score 是有限的（不是 NaN 或 inf）
    assert isinstance(score, float)
    assert np.isfinite(score)
    
