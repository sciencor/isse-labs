import json
from math import e
import re
from urllib import response
from flask import Flask, request, jsonify, g, current_app

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # 解决中文乱码问题

class TodoList:
    def __init__(self):
        # 默认分组（不可删除）
        self.todos = {}  # {id: task_data}

        # 其他分组 {group_name: [task_ids]}
        self.groups = {
            "工作": [],
            "入门": [1, 2, 3]  # 示例任务
        }

        # 任务数据 {id: {task, priority, completed}}
        self.task_data = {
            1: {"task": "点击星形图标设置优先级", "priority": 1, "completed": False},
            2: {"task": "点击复选框标记完成", "priority": 0, "completed": False},
            3: {"task": "使用下拉菜单切换分组", "priority": 0, "completed": False}
        }

        self.next_id = 4

    def add_item(self, task, group="默认", priority=0):
        """添加任务到指定分组"""
        task_id = self.next_id
        self.next_id += 1

        task_info = {
            "task": task,
            "priority": priority,
            "completed": False
        }

        self.task_data[task_id] = task_info

        if group == "默认":
            self.todos[task_id] = task_info
        elif group in self.groups:
            self.groups[group].append(task_id)
        else:
            raise ValueError("Invalid group")

        return {"id": task_id, **task_info}

    def remove_item(self, task_id):
        """删除任务"""
        if task_id in self.task_data:
            # 从所有分组中移除
            for group in self.groups.values():
                if task_id in group:
                    group.remove(task_id)
            # 从默认分组移除
            if task_id in self.todos:
                del self.todos[task_id]
            # 删除任务数据
            del self.task_data[task_id]
            return True
        return False

    def get_items(self, group="默认"):
        """获取指定分组的任务"""
        if group == "默认":
            return [{**data, "id": tid} for tid, data in self.todos.items()]
        elif group in self.groups:
            return [{**self.task_data[tid], "id": tid} for tid in self.groups[group]]
        return []

    def update_item(self, task_id, task=None, priority=None, completed=None, group=None):
        """更新任务信息"""
        if task_id not in self.task_data:
            return None

        # 更新任务数据
        if task is not None:
            self.task_data[task_id]["task"] = task
        if priority is not None:
            self.task_data[task_id]["priority"] = priority
        if completed is not None:
            self.task_data[task_id]["completed"] = completed

        # 更新分组
        if group is not None:
            # 从原分组移除
            for g_name, tasks in self.groups.items():
                if task_id in tasks:
                    tasks.remove(task_id)
            if task_id in self.todos:
                del self.todos[task_id]

            # 添加到新分组
            if group == "默认":
                self.todos[task_id] = self.task_data[task_id]
            elif group in self.groups:
                self.groups[group].append(task_id)
            else:
                raise ValueError("Invalid group")

        return {**self.task_data[task_id], "id": task_id}

    def add_group(self, group_name):
        """添加新分组"""
        if group_name in ["默认", *self.groups.keys()]:
            return False

        self.groups[group_name] = []
        return True

    def remove_group(self, group_name):
        """删除分组（任务将移到默认分组）"""
        if group_name not in self.groups or group_name in {"工作", "入门"}:
            return False

        # 将任务移到默认分组
        for task_id in self.groups[group_name]:
            self.todos[task_id] = self.task_data[task_id]

        del self.groups[group_name]
        return True

    def rename_group(self, old_name, new_name):
        """重命名分组"""
        if old_name not in self.groups or new_name in ["默认", *self.groups.keys()]:
            return False

        self.groups[new_name] = self.groups.pop(old_name)
        return True

    def get_groups(self):
        """获取所有分组信息"""
        return ["默认", *self.groups.keys()]

app.my_list_1 = None

@app.before_request
def before_request():
    if current_app.my_list_1 is None:
        current_app.my_list_1 = TodoList()

from flask import send_from_directory

# 静态文件路由
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route('/')
@app.route('/index')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/show_todos', methods=['GET', 'POST'])
def show_todos():
    group = request.args.get('group', '默认')
    if current_app.my_list_1 is None:
        current_app.my_list_1 = TodoList()

    items = current_app.my_list_1.get_items(group)
    groups = current_app.my_list_1.get_groups()

    return jsonify({
        "success": True,
        "group": group,
        "groups": groups,
        "items": items
    })

@app.route('/add_todo', methods=['POST'])
def add_todo():
    if current_app.my_list_1 is None:
        current_app.my_list_1 = TodoList()

    data = request.get_json()
    if not data or 'task' not in data:
        return jsonify({"success": False, "error": "Invalid input"}), 400

    try:
        task = data['task']
        group = data.get('group', '默认')
        priority = data.get('priority', 0)

        res = current_app.my_list_1.add_item(task, group, priority)
        return jsonify({"success": True, "data": res}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/remove_todo', methods=['POST'])
def remove_todo():
    if current_app.my_list_1 is None:
        return jsonify({"success": False, "error": "List not found"}), 404

    data = request.get_json()
    if not data or 'id' not in data:
        return jsonify({"success": False, "error": "Invalid input"}), 400

    try:
        task_id = int(data['id'])
        if current_app.my_list_1.remove_item(task_id):
            return jsonify({"success": True}), 200
        return jsonify({"success": False, "error": "Task not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/update_todo', methods=['POST'])
def update_todo():
    if current_app.my_list_1 is None:
        return jsonify({"success": False, "error": "List not found"}), 404

    data = request.get_json()
    if not data or 'id' not in data:
        return jsonify({"success": False, "error": "Invalid input"}), 400

    try:
        task_id = int(data['id'])
        res = current_app.my_list_1.update_item(
            task_id,
            task=data.get('task'),
            priority=data.get('priority'),
            completed=data.get('completed'),
            group=data.get('group')
        )
        if res:
            return jsonify({"success": True, "data": res}), 200
        return jsonify({"success": False, "error": "Task not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/add_group', methods=['POST'])
def add_group():
    if current_app.my_list_1 is None:
        current_app.my_list_1 = TodoList()

    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"success": False, "error": "Invalid input"}), 400

    if current_app.my_list_1.add_group(data['name']):
        return jsonify({"success": True}), 201
    return jsonify({"success": False, "error": "Group already exists"}), 400

@app.route('/remove_group', methods=['POST'])
def remove_group():
    if current_app.my_list_1 is None:
        return jsonify({"success": False, "error": "List not found"}), 404

    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"success": False, "error": "Invalid input"}), 400

    if current_app.my_list_1.remove_group(data['name']):
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "error": "Cannot remove default groups"}), 400

@app.route('/rename_group', methods=['POST'])
def rename_group():
    if current_app.my_list_1 is None:
        return jsonify({"success": False, "error": "List not found"}), 404

    data = request.get_json()
    if not data or 'old_name' not in data or 'new_name' not in data:
        return jsonify({"success": False, "error": "Invalid input"}), 400

    if current_app.my_list_1.rename_group(data['old_name'], data['new_name']):
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "error": "Group already exists or cannot rename"}), 400

if __name__ == '__main__':
    app.run(debug=True)
