import os
import joblib
from flask import Flask, request, jsonify
import numpy as np
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# 全局变量存储模型
model = None
model_info = None

def load_model():
    """加载训练好的模型"""
    global model, model_info
    
    try:
        # 模型文件路径
        model_path = "/app/models/iris_model.pkl"
        info_path = "/app/models/model_info.pkl"
        
        # 检查模型文件是否存在
        if not os.path.exists(model_path):
            logger.error(f"模型文件不存在: {model_path}")
            return False
            
        # 加载模型
        model = joblib.load(model_path)
        logger.info("模型加载成功")
        
        # 加载模型信息（如果存在）
        if os.path.exists(info_path):
            model_info = joblib.load(info_path)
            logger.info(f"模型信息加载成功: {model_info}")
        
        return True
        
    except Exception as e:
        logger.error(f"加载模型失败: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/info', methods=['GET'])
def model_info_endpoint():
    """返回模型信息"""
    if model_info is None:
        return jsonify({'error': '模型信息不可用'}), 500
    
    return jsonify(model_info)

@app.route('/predict', methods=['POST'])
def predict():
    """预测端点"""
    try:
        # 检查模型是否已加载
        if model is None:
            return jsonify({'error': '模型未加载'}), 500
        
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '请求数据为空'}), 400
        
        if 'input' not in data:
            return jsonify({'error': '缺少input字段'}), 400
        
        # 验证输入数据
        input_data = data['input']
        
        if not isinstance(input_data, list):
            return jsonify({'error': 'input必须是列表格式'}), 400
        
        if len(input_data) != 4:
            return jsonify({'error': 'input必须包含4个特征值'}), 400
        
        # 转换为numpy数组并进行预测
        features = np.array(input_data).reshape(1, -1)
        
        # 进行预测
        prediction = model.predict(features)[0]
        prediction_proba = model.predict_proba(features)[0]
        
        # 准备响应数据
        result = {
            'prediction': int(prediction),
            'prediction_name': model_info['target_names'][prediction] if model_info else f'class_{prediction}',
            'probabilities': {
                model_info['target_names'][i] if model_info else f'class_{i}': float(prob) 
                for i, prob in enumerate(prediction_proba)
            },
            'input_features': input_data
        }
        
        logger.info(f"预测成功: 输入={input_data}, 预测={prediction}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"预测失败: {str(e)}")
        return jsonify({'error': f'预测失败: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '端点不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': '服务器内部错误'}), 500

if __name__ == '__main__':
    # 启动时加载模型
    if load_model():
        logger.info("服务器启动成功")
        app.run(host='0.0.0.0', port=8080, debug=False)
    else:
        logger.error("模型加载失败，服务器无法启动")
        exit(1)