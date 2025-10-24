from flask import Flask, request, jsonify, render_template
import json
import os
from datetime import datetime

app = Flask(__name__)

# 使用 JSON 文件模拟数据库存储
TASKS_FILE = 'tasks.json'

def load_tasks():
    """从文件加载任务数据"""
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    """保存任务数据到文件"""
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

def generate_id(tasks):
    """生成新任务ID"""
    if not tasks:
        return 1
    return max(task['id'] for task in tasks) + 1

@app.route('/')
def index():
    """主页 - 提供前端页面"""
    return render_template('index.html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    """获取全部任务"""
    try:
        tasks = load_tasks()
        
        # 根据查询参数筛选任务
        category = request.args.get('category')
        priority = request.args.get('priority')
        
        if category:
            tasks = [task for task in tasks if task.get('category') == category]
        
        if priority:
            tasks = [task for task in tasks if task.get('priority') == priority.title()]
        
        return jsonify({
            "status": "success",
            "data": tasks,
            "message": "获取任务列表成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": [],
            "message": f"获取任务列表失败: {str(e)}"
        }), 500

@app.route('/tasks', methods=['POST'])
def add_task():
    """新增任务"""
    try:
        data = request.get_json()
        
        if not data or 'title' not in data:
            return jsonify({
                "status": "error",
                "data": [],
                "message": "缺少任务标题"
            }), 400
        
        tasks = load_tasks()
        new_task = {
            "id": generate_id(tasks),
            "title": data['title'],
            "category": data.get('category', '生活'),  # 默认为生活
            "priority": data.get('priority', '中'),   # 默认为中优先级
            "completed": data.get('completed', False),
            "created_at": datetime.now().isoformat()
        }
        
        tasks.append(new_task)
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": [new_task],
            "message": "新增任务成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": [],
            "message": f"新增任务失败: {str(e)}"
        }), 500

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """修改任务状态"""
    try:
        data = request.get_json()
        
        if 'completed' not in data:
            return jsonify({
                "status": "error",
                "data": [],
                "message": "缺少completed字段"
            }), 400
        
        tasks = load_tasks()
        task = next((t for t in tasks if t['id'] == task_id), None)
        
        if not task:
            return jsonify({
                "status": "error",
                "data": [],
                "message": "任务不存在"
            }), 404
        
        task['completed'] = data['completed']
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": [task],
            "message": "更新任务状态成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": [],
            "message": f"更新任务状态失败: {str(e)}"
        }), 500

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """删除任务"""
    try:
        tasks = load_tasks()
        task = next((t for t in tasks if t['id'] == task_id), None)
        
        if not task:
            return jsonify({
                "status": "error",
                "data": [],
                "message": "任务不存在"
            }), 404
        
        tasks = [t for t in tasks if t['id'] != task_id]
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": [],
            "message": "删除任务成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": [],
            "message": f"删除任务失败: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)