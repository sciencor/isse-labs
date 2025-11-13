from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

from flask import send_file
from flask import send_from_directory

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 数据文件路径
DATA_FILE = 'tasks.json'

@app.route('/')
def index():
    return send_file('./templates/index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

def load_tasks():
    """从文件加载任务数据"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_tasks(tasks):
    """保存任务数据到文件"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

def get_next_id(tasks):
    """获取下一个可用的任务ID"""
    if not tasks:
        return 1
    return max(task['id'] for task in tasks) + 1

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """获取任务列表，支持筛选"""
    try:
        tasks = load_tasks()
        category = request.args.get('category')
        priority = request.args.get('priority')
        
        # 筛选逻辑
        if category:
            tasks = [task for task in tasks if task['category'] == category]
        if priority:
            tasks = [task for task in tasks if task['priority'] == priority]
        
        return jsonify({
            "status": "success",
            "data": tasks,
            "message": "获取任务成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": [],
            "message": f"获取任务失败: {str(e)}"
        }), 500

@app.route('/tasks', methods=['POST'])
def add_task():
    """添加新任务"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['title', 'category', 'priority']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    "status": "error",
                    "data": None,
                    "message": f"缺少必需字段: {field}"
                }), 400
        
        # 验证优先级和类别的有效性
        valid_priorities = ['高', '中', '低']
        valid_categories = ['学习', '工作', '生活']
        
        if data['priority'] not in valid_priorities:
            return jsonify({
                "status": "error",
                "data": None,
                "message": f"无效的优先级，必须是: {', '.join(valid_priorities)}"
            }), 400
            
        if data['category'] not in valid_categories:
            return jsonify({
                "status": "error",
                "data": None,
                "message": f"无效的类别，必须是: {', '.join(valid_categories)}"
            }), 400
        
        tasks = load_tasks()
        new_task = {
            "id": get_next_id(tasks),
            "title": data['title'],
            "category": data['category'],
            "priority": data['priority'],
            "completed": False
        }
        
        tasks.append(new_task)
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": new_task,
            "message": "任务添加成功"
        }), 201
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"添加任务失败: {str(e)}"
        }), 500

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """更新任务状态"""
    try:
        data = request.get_json()
        tasks = load_tasks()
        
        # 查找任务
        task_index = None
        for i, task in enumerate(tasks):
            if task['id'] == task_id:
                task_index = i
                break
        
        if task_index is None:
            return jsonify({
                "status": "error",
                "data": None,
                "message": "任务不存在"
            }), 404
        
        # 更新任务字段
        if 'completed' in data:
            tasks[task_index]['completed'] = bool(data['completed'])
        if 'title' in data:
            tasks[task_index]['title'] = data['title']
        if 'category' in data:
            tasks[task_index]['category'] = data['category']
        if 'priority' in data:
            tasks[task_index]['priority'] = data['priority']
        
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": tasks[task_index],
            "message": "任务更新成功"
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"更新任务失败: {str(e)}"
        }), 500

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """删除任务"""
    try:
        tasks = load_tasks()
        
        # 查找任务
        task_index = None
        for i, task in enumerate(tasks):
            if task['id'] == task_id:
                task_index = i
                break
        
        if task_index is None:
            return jsonify({
                "status": "error",
                "data": None,
                "message": "任务不存在"
            }), 404
        
        # 删除任务
        deleted_task = tasks.pop(task_index)
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": deleted_task,
            "message": "任务删除成功"
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"删除任务失败: {str(e)}"
        }), 500

@app.route('/tasks/<int:task_id>/complete', methods=['PUT'])
def complete_task(task_id):
    """标记任务为完成状态"""
    try:
        tasks = load_tasks()
        
        # 查找任务
        task_index = None
        for i, task in enumerate(tasks):
            if task['id'] == task_id:
                task_index = i
                break
        
        if task_index is None:
            return jsonify({
                "status": "error",
                "data": None,
                "message": "任务不存在"
            }), 404
        
        # 标记为完成
        tasks[task_index]['completed'] = True
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": tasks[task_index],
            "message": "任务标记为完成"
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"标记任务失败: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)