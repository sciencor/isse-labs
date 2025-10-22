from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# 数据文件路径
TASKS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'tasks.json')

def load_tasks():
    """从JSON文件加载任务"""
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    """保存任务到JSON文件"""
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=4)

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """获取任务列表，支持过滤和排序"""
    tasks = load_tasks()
    
    # 处理过滤条件
    category = request.args.get('category')
    flag = request.args.get('flag')
    star = request.args.get('star')
    
    if category:
        tasks = [task for task in tasks if task['category'] == category]
    if flag:
        tasks = [task for task in tasks if task.get('flag')]
    if star:
        tasks = [task for task in tasks if task.get('star')]
    
    # 排序：未完成在前，已完成在后
    tasks = sorted(tasks, key=lambda x: (x['completed'], x['created_at']))
    
    return jsonify({
        'status': 'success',
        'data': tasks,
        'message': '获取任务列表成功'
    })

@app.route('/tasks', methods=['POST'])
def create_task():
    """创建新任务"""
    tasks = load_tasks()
    new_task = request.json
    
    # 生成新ID
    new_id = max([task['id'] for task in tasks], default=0) + 1
    
    new_task['id'] = new_id
    new_task['created_at'] = datetime.now().isoformat()
    new_task['completed'] = False
    
    tasks.append(new_task)
    save_tasks(tasks)
    
    return jsonify({
        'status': 'success',
        'data': new_task,
        'message': '新增任务成功'
    })

@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task_status(id):
    """更新任务状态"""
    tasks = load_tasks()
    task = next((task for task in tasks if task['id'] == id), None)
    
    if not task:
        return jsonify({
            'status': 'error',
            'message': '任务不存在'
        }), 404
    
    task['completed'] = not task['completed']
    save_tasks(tasks)
    
    return jsonify({
        'status': 'success',
        'data': task,
        'message': '更新任务状态成功'
    })

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    """删除任务"""
    tasks = load_tasks()
    tasks = [task for task in tasks if task['id'] != id]
    save_tasks(tasks)
    
    return jsonify({
        'status': 'success',
        'message': '删除任务成功'
    })

@app.route('/tasks/<int:id>', methods=['PATCH'])
def edit_task(id):
    """编辑任务"""
    tasks = load_tasks()
    task = next((task for task in tasks if task['id'] == id), None)
    
    if not task:
        return jsonify({
            'status': 'error',
            'message': '任务不存在'
        }), 404
    
    update_data = request.json
    task.update(update_data)
    save_tasks(tasks)
    
    return jsonify({
        'status': 'success',
        'data': task,
        'message': '编辑任务成功'
    })

if __name__ == '__main__':
    # 确保数据文件目录存在
    os.makedirs(os.path.dirname(TASKS_FILE), exist_ok=True)
    app.run(debug=True)