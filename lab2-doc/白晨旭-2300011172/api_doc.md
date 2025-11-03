# To do list API文档

## 概览
- 服务文件：app.py
- 运行：python app.py（默认在 http://127.0.0.1:5000，debug=True）
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
