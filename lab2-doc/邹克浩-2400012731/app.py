#这里是将TodoList类函数改为api服务的脚本文件
from flask import Flask, request, jsonify

class TodoList:
    def __init__(self):
        self.todos = {}
        self.counter = 1

    def add_item(self, task):
        self.todos[self.counter] = task
        self.counter += 1
        return {self.counter - 1: "task"}

    def remove_item(self, id):
        if id in self.todos:
            return self.todos.pop(id)
        return None

    def get_items(self):
        return self.todos
    
    def get_item(self, id):
        return self.todos.get(id, None)

    def update_item(self, id, task):
        if id in self.todos:
            self.todos[id] = task
            return {id: task}
        return {id: None}

app = Flask(__name__)
todos = TodoList()

@app.route('/get/<int:id>', methods=['GET'])
def get_item(id):
    item = todos.get_item(id)
    return jsonify({id: item})

@app.route('/get/', methods=['GET'])
def get():
    if request.args.get('id'):
        id = int(request.args.get('id'))
        item = todos.get_item(id)
        return jsonify({id: item})
    return jsonify(todos.get_items())

@app.route('/add', methods=['POST'])
def add():
    data = request.json
    return jsonify(todos.add_item(data["task"]))

@app.route('/remove', methods=["DELETE"])
def remove():
    id = request.json
    return jsonify({id["id"]: todos.remove_item(id["id"])})

@app.route('/update', methods=["PUT"])
def update():
    data = request.json
    return jsonify(todos.update_item(data["id"], data["task"]))

if __name__ == '__main__':
    app.run(debug=True)