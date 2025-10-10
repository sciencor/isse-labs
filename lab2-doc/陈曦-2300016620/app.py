# app.py
from flask import Flask, request, jsonify, render_template_string

class TodoList:
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
        return self.todos.copy()

    def update_item(self, id, task):
        if id in self.todos:
            self.todos[id] = task
            return {id: task}
        return None

app = Flask(__name__)
todo_list = TodoList()


@app.route("/")
def home():
    html = """
    <h1>TodoList API </h1>
    <ul>
        <li><a href="/ui">可视化操作</a></li>
    </ul>
    """
    return render_template_string(html)


@app.route("/show_todos", methods=["GET"])
def get_todos():
    todos = todo_list.get_items()
    return jsonify(todos), 200


@app.route("/add_todo", methods=["POST"])
def add_todo():
    data = request.get_json()
    if not data or "task" not in data:
        return jsonify({"success": False, "msg": "缺少参数 'task'"}), 400
    task = data.get("task").strip()
    if not task:
        return jsonify({"success": False, "msg": "任务内容不能为空"}), 400
    result = todo_list.add_item(task)
    return jsonify(result), 201


@app.route("/update_todo/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    data = request.get_json()
    if not data or "task" not in data:
        return jsonify({"success": False, "msg": "缺少参数 'task'"}), 400
    task = data.get("task").strip()
    if not task:
        return jsonify({"success": False, "msg": "任务内容不能为空"}), 400
    result = todo_list.update_item(todo_id, task)
    if result:
        return jsonify(result), 200
    else:
        return jsonify({"success": False, "msg": "未找到该任务 ID"}), 404


@app.route("/delete_todo/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    result = todo_list.remove_item(todo_id)
    if result:
        return jsonify({"deleted": "success", "id": todo_id, "task": result}), 200
    else:
        return jsonify({"success": False, "msg": "未找到该任务 ID"}), 404



@app.route("/ui")
def ui():
    html = '''
    <h1>可视化操作面板</h1>
    

    <div>
        <h3>查看所有任务</h3>
        <button onclick="getTodos()">刷新</button>
        <pre id="output"></pre>
    </div>

    <hr>

    <div>
        <h3>添加新任务</h3>
        <input type="text" id="addTaskInput" placeholder="任务内容" />
        <button onclick="addTodo()">添加</button>
    </div>

    <hr>
   
    <div>
        <h3>更新任务</h3>
        <input type="number" id="updateIdInput" placeholder="输入ID" min="1" />
        <input type="text" id="updateTaskInput" placeholder="更新内容" />
        <button onclick="updateTodo()">更新</button>
    </div>

    <hr>
    
    <div>
        <h3>删除任务</h3>
        <input type="number" id="deleteIdInput" placeholder="输入ID" min="1" />
        <button onclick="deleteTodo()">删除</button>
    </div>
    
    <script>
        function showOutput(data) {
            document.getElementById("output").textContent = JSON.stringify(data, null, 2);
        }


        function getTodos() {
            fetch("/show_todos")
                .then(res => res.json())
                .then(data => showOutput(data))
                .catch(err => showOutput({error: "请求失败", detail: err}));
        }


        function addTodo() {
            const task = document.getElementById("addTaskInput").value.trim();
            if (!task) {
                alert("任务内容不能为空！");
                return;
            }
            fetch("/add_todo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task: task })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.msg || "添加成功！");
                document.getElementById("addTaskInput").value = "";
                getTodos(); // 自动刷新
            });
        }


        function updateTodo() {
            const id = document.getElementById("updateIdInput").value;
            const task = document.getElementById("updateTaskInput").value.trim();
            if (!id || !task) {
                alert("ID 和任务内容都不能为空！");
                return;
            }
            fetch(`/update_todo/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ task: task })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("更新成功！");
                    document.getElementById("updateIdInput").value = "";
                    document.getElementById("updateTaskInput").value = "";
                } else {
                    alert("更新失败：" + data.msg);
                }
                getTodos();
            });
        }


        function deleteTodo() {
            const id = document.getElementById("deleteIdInput").value;
            if (!id) {
                alert("输入要删除的 ID");
                return;
            }
            if (!confirm("确定要删除 ID=" + id + " 任务？")) return;

            fetch(`/delete_todo/${id}`, { method: "DELETE" })
                .then(res => res.json())
                .then(data => {
                    alert(data.msg || "删除成功");
                    document.getElementById("deleteIdInput").value = "";
                    getTodos();
                });
        }

        window.onload = getTodos;
    </script>
    '''
    return render_template_string(html)


if __name__ == "__main__":
    app.run(debug=True)