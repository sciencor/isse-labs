使用说明:
1. todolist增加：
示例：
使用说明（TodoList API）

本 README 说明本项目暴露的 TodoList HTTP 接口、请求参数与返回值示例。默认 Flask 开发服务器监听在 `http://localhost:5000`。

启动服务：
```bash
python3 app.py
```

通用说明：
- 所有返回均为 JSON 格式。
- 发送 JSON请求体时，请加请求头：`Content-Type: application/json`。
- 在 curl 示例中使用 `-i` 可同时查看响应头和状态码。

## Endpoints

### 1) 列出所有任务
- 方法：GET
- 路径：/todos
- 请求参数：无
- 成功返回示例（200 OK）：

```json
{
	"1": "buy milk",
	"2": "do homework"
}
```

示例：
```bash
curl -i http://localhost:5000/todos
```

---

### 2) 添加任务
- 方法：POST
- 路径：/add_item
- 请求体（JSON）：
	- task (string) — 必需，任务内容
- 成功返回：201 Created，返回新创建条目的 JSON：`{\"id\": <int>, \"task\": \"...\"}`
- 请求示例：

单行：
```bash
curl -i -X POST http://localhost:5000/add_item -H "Content-Type: application/json" -d '{"task":"buy milk"}'
```

换行（更易读）：
```bash
curl -i -X POST http://localhost:5000/add_item \\
	-H "Content-Type: application/json" \\
	-d '{"task":"buy milk"}'
```

如果缺少 `task`，返回 400 Bad Request：
```json
{ "error": "missing 'task'" }
```

---

### 3) 更新任务
- 方法：PUT
- 路径：/todos/<id>
- 路径参数：
	- id (int) — 要更新的任务 ID
- 请求体（JSON）：
	- task (string) — 必需，新任务内容
- 成功返回：200 OK，返回更新后的条目，例如：`{\"1\": \"buy bread\"}`
- 错误返回：若 id 不存在，返回 404 Not Found：`{\"error\":\"task not found\"}`
- 请求示例：

```bash
curl -i -X PUT http://localhost:5000/todos/1 \\
	-H "Content-Type: application/json" \\
	-d '{"task":"buy bread"}'
```

---

### 4) 删除任务
- 方法：DELETE
- 路径：/todos/<id>
- 路径参数：
	- id (int) — 要删除的任务 ID
- 成功返回：200 OK，返回删除确认，例如：`{\"message\":\"task 1 deleted\"}`
- 错误返回：若 id 不存在，返回 404 Not Found：`{\"error\":\"task not found\"}`
- 请求示例：

```bash
curl -i -X DELETE http://localhost:5000/todos/1
```

---
