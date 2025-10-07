# To do list API文档

## 概览
- 服务文件：app.py
- 运行：python app.py（默认在 http://127.0.0.1:5000，debug=True）
- 数据存储：内存（重启丢失）
- 内容类型：application/json

## 接口

### 列出所有待办

- 路径：GET /todos
- 描述：返回当前所有待办项（整个字典，key 为 id，value 为 task 字符串）
- 请求头：Accept: application/json
- 示例请求：
````bash
curl -X GET http://localhost:5000/todos
```` 
- 示例响应（200 OK）：
````json
{
  "1": "买牛奶",
  "2": "做作业"
}
````

### 新增待办
- 路径：POST /todos
- 描述：添加一条待办，返回新创建项的 id 与 task
- 请求头：Content-Type: application/json
- 请求体：
````json
{
  "task": "新的任务描述"
}
````
- 示例请求：
````bash
curl -X POST http://localhost:5000/todos -H "Content-Type: application/json" -d "{\"task\":\"新的任务描述\"}"
````
- 成功响应（201 Created）：
````json
{
  "id": 3,
  "task": "新的任务描述"
}
````
- 错误响应（400 Bad Request）：
````json
{
  "error": "Task is required"
}
````

### 删除待办
- 路径：DELETE /todos/<int:id>
- 描述：删除指定 id 的待办，返回被删除的 task
- 参数：URL 路径参数 id（整数）
- 示例请求：
````bash
curl -X DELETE http://localhost:5000/todos/2
````
- 成功响应（200 OK）：
````json
{
  "message": "Deleted",
  "task": "做作业"
}
````
- 未找到（404 Not Found）：
````json
{
  "error": "Item not found"
}
````

### 更新待办
- 路径：PUT /todos/<int:id>
- 描述：更新指定 id 的 task
- 请求头：Content-Type: application/json
- 请求体：
````json
{
  "task": "更新后的任务描述"
}
````
- 示例请求：
````bash
curl -X PUT http://localhost:5000/todos/3 -H "Content-Type: application/json" -d "{\"task\":\"更新后的任务描述\"}"
````
- 成功响应（200 OK）：
````json
{
  "3": "更新后的任务描述"
}
````
- 未找到（404 Not Found）：
````json
{
  "error": "Item not found"
}
````
- 参数缺失（400 Bad Request）：
````json
{
  "error": "Task is required"
}
````

示例 curl/PowerShell 调用
- POST（curl）：
````bash
curl -X POST http://127.0.0.1:5000/todos -H "Content-Type: application/json" -d "{\"task\":\"买牛奶\"}"
````
- GET（PowerShell）：
````powershell
Invoke-RestMethod -Method Get -Uri http://127.0.0.1:5000/todos
````
- DELETE（curl）：
````bash
curl -X DELETE http://127.0.0.1:5000/todos/1
````

数据模型（简要）
- 内存结构：TodoList.todos 是 dict 类型，key=int id，value=str task
- id 自增：从 1 开始，TodoList.counter 保存下一个 id

已知限制与改进建议
- 数据易失：当前为内存存储，建议改为数据库（SQLite / PostgreSQL）或持久化文件。
- API 不一致：GET 返回整个 dict（键为字符串），POST/PUT 返回不同形式，建议统一返回对象列表或单一对象格式。
- 缺少单项 GET：可实现 GET /todos/<id> 返回单条任务。
- 输入校验：当前无长度/类型校验，建议使用 marshmallow/pydantic 或手动校验。
- 并发安全：当前实现非线程安全（读写同一 dict），在生产考虑锁或使用数据库。
- 鉴权与速率限制：无身份验证，生产环境需加鉴权/HTTPS。
- 错误处理：增加统一错误处理中间件，返回标准错误格式（code/message）。

如何运行与测试
1. 在项目目录运行：
````bash
python app.py
````
2. 打开另一个终端用 curl 或浏览器/Postman 测试上述端点。

需要把文档生成 OpenAPI/Swagger 格式或我帮你实现 GET /todos/<id>、持久化或输入校验吗？