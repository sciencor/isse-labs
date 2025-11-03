# API 使用说明

- 请求头：`Content-Type: application/json`（POST/PUT）

## 1) GET `/hello`

- **参数**：无
- **返回**：

```json
{
  "msg": "Hello from API-Based todo"
}
```

## 2) POST `/add`

- **参数（Body）**：

```json
{ "task": "待办事项内容" }
```

- **成功返回**：

```json
{ "id": 1, "task": "待办事项内容", "msg": "Task added" }
```

- **失败返回（缺少 task）**：

```json
{ "msg": "Task is required" }
```

## 3) POST `/delete`

- **参数（Body）**：

```json
{ "id": 1 }
```

- **成功返回**：

```json
{ "msg": "Task deleted", "task": "被删除的待办事项内容" }
```

- **未找到**：

```json
{ "msg": "Task not found", "task": "" }
```

- **失败返回（缺少 id）**：

```json
{ "msg": "Id is required" }
```

## 4) PUT `/update`

- **参数（Body）**：

```json
{ "id": 1, "task": "新的内容" }
```

- **成功返回（注意：响应中使用“字符串化的 id”作为键）**：

```json
{ "1": "新的内容", "msg": "Task updated" }
```

- **未找到**：

```json
{ "msg": "Task not found" }
```

- **失败返回（缺少 id 或 task）**：

```json
{ "msg": "Id and task are required" }
```

## 5) GET `/todo`

- **参数**：无
- **成功返回（注意：所有待办以“字符串化的 id”为键）**：

```json
{
  "1": "任务内容A",
  "2": "任务内容B",
  "msg": "Tasks fetched",
  "count": 2
}
```

### 说明

- `/update` 与 `/todo` 的结果中，待办项使用“字符串化的 id”作为键；客户端可按需转换为数组或 `{id, task}` 结构。
