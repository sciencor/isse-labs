## TodoList API 文档

### ISSE HW2 2300013073 沈睿弘

## 概述
- 本程序实现了一个基于Flask的TodoList API服务
![](md_images/2025-09-28-01-33-45.png)
## 启动服务
```bash
python app.py --host [host] --port [port] --debug [debug]
```
命令行参数说明：
- `host`：主机地址，默认为`0.0.0.0`
- `port`：端口号，默认为`5000`
- `debug`：是否开启调试模式，默认为`True`

## 测试
```bash
bash test_api.sh
```


## 接口列表

### 1. 新增任务
- 请求：`POST /todos`
- 请求体参数：
  - `task` (string, 必填)：任务内容
- 成功响应：`201 Created`
```json
{
  "id": 1,
  "task": "示例任务"
}
```
- 失败响应：`400 Bad Request`
```json
{
  "error": "Missing 'task' field"
}
```
- 示例：
```bash
curl -X POST http://127.0.0.1:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"task": "Write ISSE lab"}'
```

### 2. 查询任务列表
- 请求：`GET /todos`
- 请求参数：无
- 成功响应：`200 OK`
```json
[
  {"id": 1, "task": "Write ISSE lab"},
  {"id": 2, "task": "Finish project report"}
]
```
- 示例：
```bash
curl http://127.0.0.1:5000/todos
```



### 3. 更新指定任务
- 请求：`PUT /todos/<todo_id>`
- 路径参数：
  - `todo_id` (int, 必填)：任务编号
- 请求体参数：
  - `task` (string, 必填)：新的任务内容
- 成功响应：`200 OK`
```json
{
  "id": 1,
  "task": "Finished writing ISSE lab"
}
```
- 失败响应：

- `400 Bad Request`
```json
{
  "error": "Missing 'task' field"
}
```
- `404 Not Found`
```json
{
  "error": "Task with ID 99 not found"
}
```
- 示例：
```bash
curl -X PUT http://127.0.0.1:5000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"task": "Finished writing ISSE lab"}'
```

### 4. 删除指定任务
- 请求：`DELETE /todos/<todo_id>`
- 路径参数：
  - `todo_id` (int, 必填)：任务编号
- 成功响应：`200 OK`
```json
{
  "id": 1,
  "task": "Write ISSE lab"
}
```
- 失败响应：`404 Not Found`
```json
{
  "error": "Task with ID 99 not found"
}
```
- 示例：
```bash
curl -X DELETE http://127.0.0.1:5000/todos/1
```

## 返回字段说明
- `id`：自增的任务编号
- `task`：任务内容
- `error`：错误信息描述

![](md_images/2025-09-28-01-34-27.png)
![](md_images/2025-09-28-01-34-44.png)
![](md_images/2025-09-28-01-34-57.png)