import json
from math import e
import re
from urllib import response
from flask import Flask, request, jsonify, g, current_app

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # 解决中文乱码问题

class TodoList:
    # 二级分组功能（未实现）
    # 默认分组和新建分组
    # group_name_dict = {}
    # group_counter = 0
    def __init__(self):
        self.todos = {}
        self.counter = 1

    def add_item(self, task):
        self.todos[self.counter] = task
        self.counter += 1
        return {"id": self.counter - 1, "task": task}

    def remove_item(self, id):
        if id in self.todos:
            return self.todos.pop(id)
        return None

    def get_items(self):
        return self.todos

    def update_item(self, id, task):
        if id in self.todos:
            self.todos[id] = task
            return {id: task}
        return None

app.my_list_1 = None

@app.before_request
def before_request():
    # if current_app.my_list_1 is None:
    #     g.my_list_1 = TodoList()
    if current_app.my_list_1 is None:
        current_app.my_list_1 = TodoList()

@app.route('/')
@app.route('/index')
def index():
    return "Welcome to the ToDo List API!<p>I'm DJ, a student of <i>ISSE</i>.</p>"

@app.route('/show_todos', methods=['GET', 'POST'])
def show_todos():
    res = {"name": "my_list_1", "items": "这是一个空列表"}
    if isinstance(current_app.my_list_1, TodoList):
        res["items"] = current_app.my_list_1.get_items()

    # # print(current_app.my_list_1.get_items())
    response = jsonify(res)

    return response

@app.route('/add_todo', methods=['GET', 'POST'])
def add_todo():
    if current_app.my_list_1 is None or current_app.my_list_1 is None:
        current_app.my_list_1 = TodoList()
    try:
        task = request.args.get('task')
    except:
        task = request.forms.get('task')
    if task is not None:
        res = current_app.my_list_1.add_item(task)
        response = jsonify(res)
        # print(res)

        return response
    # print("Invalid input")
    return jsonify({"error": "Invalid input"})


@app.route('/remove_todo', methods=['GET', 'POST'])
def remove_todo():
    try:
        id = int(request.args.get('id'))
    except ValueError:
        id = int(request.forms.get('id'))
    except:
        # print("Invalid input")
        return jsonify({"error": "Invalid input"})

    if current_app.my_list_1 is None :
        return jsonify({"error": "List not found, please check list name or initialize a todolist first."})
    try:
        poped = current_app.my_list_1.remove_item(id)
        response = jsonify(poped)

        # print(response)
        return response
    except Exception as e:
        # print(e)
        response = jsonify({"error": str(e)})


        return response

@app.route('/update_todo', methods=['GET', 'POST'])
def update_todo():
    try:
        id = int(request.args.get('id'))
        task = request.args.get('task')
    except ValueError:
        id = int(request.forms.get('id'))
        task = request.forms.get('task')
    except:
        # print("Invalid input")
        return jsonify({"error": "Invalid input"})

    if current_app.my_list_1 is None :
        return jsonify({"error": "List not found, please check list name or initialize a todolist first."})
    try:
        res = current_app.my_list_1.update_item(id, task)
        response = jsonify(res)

        return response
    except Exception as e:
        response = jsonify({"error": str(e)})

        return response

if __name__ == '__main__':

    app.run(debug=True)