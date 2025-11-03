**Base URL:** http://127.0.0.1:5000

所有请求和响应体均为 JSON 格式。

### 接口列表 (CRUD Operations)

| 方法 (Method) | 路由 (Endpoint) | 功能说明 | 请求参数 (Request Body) | 成功响应 (Response Body) | 状态码 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/todos` | **[C]reate:** 添加新的待办事项 | JSON: `{"task": "任务描述"}` | JSON: `{"id": <int>, "task": "..."}` | `201` |
| **GET** | `/todos` | **[R]ead:** 查询所有待办事项 | 无 | JSON: `{"<id>": "任务描述", ...}` | `200` |
| **PUT** | `/todos/<int:todo_id>` | **[U]pdate:** 更新指定 ID 的待办事项 | JSON: `{"task": "新任务描述"}` | JSON: `{"id": <int>, "task": "..."}` | `200` |
| **DELETE** | `/todos/<int:todo_id>` | **[D]elete:** 删除指定 ID 的待办事项 | 无 | JSON: `{"message": "...", "task": "..."}` | `200` |