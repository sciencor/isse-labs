from flask import Flask, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# 任务数据文件路径
TASKS_FILE = 'tasks.json'

def load_tasks():
    """从文件加载任务数据"""
    if not os.path.exists(TASKS_FILE):
        return []
    try:
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_tasks(tasks):
    """保存任务数据到文件"""
    try:
        with open(TASKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"保存任务失败: {e}")

def get_next_id(tasks):
    """获取下一个任务ID"""
    if not tasks:
        return 1
    return max(task['id'] for task in tasks) + 1

def is_overdue(deadline):
    """检查任务是否已截止"""
    try:
        deadline_time = datetime.fromisoformat(deadline)
        return deadline_time < datetime.now()
    except:
        return False

# 获取任务列表（支持筛选和排序）
@app.route('/tasks', methods=['GET'])
def get_tasks():
    """获取任务列表，支持筛选与排序"""
    tasks = load_tasks()
    
    # 获取查询参数
    category = request.args.get('category')
    priority = request.args.get('priority')
    status = request.args.get('status')
    search = request.args.get('search')
    sort = request.args.get('sort')
    
    # 筛选任务
    filtered_tasks = []
    for task in tasks:
        # 按类别筛选
        if category and task.get('category') != category:
            continue
        # 按优先级筛选
        if priority and task.get('priority') != priority:
            continue
        # 按状态筛选
        if status:
            if status == 'completed' and not task.get('completed', False):
                continue
            elif status == 'pending':
                if task.get('completed', False) or (task.get('deadline') and is_overdue(task['deadline'])):
                    continue
            elif status == 'overdue':
                if task.get('completed', False) or (not task.get('deadline') or not is_overdue(task['deadline'])):
                    continue
        # 按关键词搜索
        if search and search.lower() not in task.get('title', '').lower():
            continue
        
        filtered_tasks.append(task)
    
    # 排序
    if sort == 'deadline_asc':
        filtered_tasks.sort(key=lambda x: (x.get('deadline') is None, x.get('deadline', '')))
    elif sort == 'deadline_desc':
        filtered_tasks.sort(key=lambda x: (x.get('deadline') is None, x.get('deadline', '')), reverse=True)
    
    return jsonify({
        "status": "success",
        "data": filtered_tasks,
        "message": "操作成功"
    })

# 新增任务
@app.route('/tasks', methods=['POST'])
def add_task():
    """新增任务"""
    tasks = load_tasks()
    
    try:
        data = request.json
        
        # 验证必填字段
        if not data.get('title'):
            return jsonify({
                "status": "error",
                "data": None,
                "message": "任务标题不能为空"
            }), 400
        
        # 创建新任务
        new_task = {
            "id": get_next_id(tasks),
            "title": data.get('title'),
            "category": data.get('category') or "学习",
            "priority": data.get('priority') or "中",
            "completed": False,
            "deadline": data.get('deadline')
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

# 修改任务状态
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """修改任务状态"""
    tasks = load_tasks()
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "任务不存在"
        }), 404
    
    try:
        data = request.json
        if 'completed' in data:
            task['completed'] = data['completed']
        
        save_tasks(tasks)
        
        return jsonify({
            "status": "success",
            "data": task,
            "message": "任务更新成功"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "data": None,
            "message": f"更新任务失败: {str(e)}"
        }), 500

# 删除任务
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """删除任务"""
    tasks = load_tasks()
    
    task_index = next((i for i, t in enumerate(tasks) if t['id'] == task_id), None)
    if task_index is None:
        return jsonify({
            "status": "error",
            "data": None,
            "message": "任务不存在"
        }), 404
    
    try:
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

# 启用 CORS\@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)