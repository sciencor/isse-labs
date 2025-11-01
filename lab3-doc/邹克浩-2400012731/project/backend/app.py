from flask import Flask, jsonify, request, send_from_directory, abort
import json
import os

# 确定前端目录（相对于 backend 目录的 ../frontend）
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))

app = Flask(__name__)


@app.route('/')
def index():
    # 返回前端 index.html
    index_path = os.path.join(FRONTEND_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_DIR, 'index.html')
    abort(404)


@app.route('/<path:filename>')
def frontend_static(filename):
    # 提供 frontend 目录下的静态文件
    file_path = os.path.join(FRONTEND_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, filename)
    abort(404)

# Data file (use absolute path inside backend directory)
DATA_FILE = os.path.join(BASE_DIR, 'tasks.json')


# Load tasks from DATA_FILE
def load_tasks():
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        return {"tasks": []}


# Save tasks to DATA_FILE
def save_tasks(tasks):
    with open(DATA_FILE, 'w', encoding='utf-8') as file:
        json.dump(tasks, file, ensure_ascii=False, indent=2)

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = load_tasks()
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    tasks = load_tasks()
    new_task = request.json
    new_task['id'] = len(tasks['tasks']) + 1
    tasks['tasks'].append(new_task)
    save_tasks(tasks)
    return jsonify({"message": "Task added successfully!"}), 201

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_tasks()
    tasks['tasks'] = [task for task in tasks['tasks'] if task['id'] != task_id]
    save_tasks(tasks)
    return jsonify({"message": "Task deleted successfully!"})

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    tasks = load_tasks()
    updated_task = request.json
    for task in tasks['tasks']:
        if task['id'] == task_id:
            task.update(updated_task)
            break
    save_tasks(tasks)
    return jsonify({"message": "Task updated successfully!"})

if __name__ == '__main__':
    app.run(debug=True)