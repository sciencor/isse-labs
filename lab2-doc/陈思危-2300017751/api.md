# Todo API 使用文档

## 添加任务

- **Endpoint**：`POST /todos`
- **参数**（JSON）：
	- `task`（string）：任务内容，必填
- **请求示例**：
	```json
	{
		"task": "do homework"
	}
	```
- **返回值**：
	- 成功
		```json
		{
			"id": 1,
			"task": "do homework"
		}
		```
	- 失败
		```json
		{
			"error": "Task content cannot be empty"
		}
		```

---

## 获取所有任务

- **Endpoint**：`GET /todos`
- **参数**：无
- **返回值**：
	```json
	{
		"todos": [
			{"id": 1, "task": "do homework"},
			{"id": 2, "task": "exercise"}
		]
	}
	```

---

## 获取单个任务

- **Endpoint**：`GET /todos/<id>`
- **参数**：
	- `id`（int）：任务编号
- **返回值**：
	- 成功
		```json
		{
			"id": 1,
			"task": "do homework"
		}
		```
	- 失败
		```json
		{
			"error": "Job not found"
		}
		```

---

## 更新任务

- **Endpoint**：`PUT /todos/<id>`
- **参数**：
	- 路径参数：`id`（int）：任务编号
	- 请求体（JSON）：
		- `task`（string）：新任务内容
- **返回值**：
	- 成功
		```json
		{
			"id": 1,
			"task": "correct homework"
		}
		```
	- 失败
		```json
		{
			"error": "Job not found"
		}
		```

---

## 删除任务

- **Endpoint**：`DELETE /todos/<id>`
- **参数**：
	- `id`（int）：任务编号
- **返回值**：
	- 成功
		```json
		{
			"message": "Job deleted",
			"task": "do homework"
		}
		```
	- 失败
		```json
		{
			"error": "Job not found"
		}
		```
