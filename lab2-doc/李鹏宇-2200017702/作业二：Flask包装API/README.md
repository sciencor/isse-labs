# TodoList Flask API 使用说明

## 1. 项目简介
本项目基于 Flask 实现了一个简单的 TodoList API，支持新增、查询、删除、更新待办事项。

---

## 2. 启动方法
1. 安装依赖：
   ```sh
   pip install flask
   ```
2. 启动服务：
   ```sh
   python app.py
   ```

---

## 3. API 文档

### 1. 新增待办事项
- **Endpoint**: `/todos`
- **方法**: `POST`
- **参数**（JSON）：
  - `task` (string): 待办事项内容
- **返回值**（JSON）：
  - `id`: 新增事项的编号
  - `task`: 新增事项内容

#### curl 示例
```sh
curl -X POST http://127.0.0.1:5000/todos -H "Content-Type: application/json" -d "{\"task\": \"Finish LAB2\"}"
```

---

### 2. 查询所有待办事项
- **Endpoint**: `/todos`
- **方法**: `GET`
- **参数**: 无
- **返回值**（JSON）：
  - 所有事项的字典，key为id，value为task

#### curl 示例
```sh
# 默认方法是GET
curl http://127.0.0.1:5000/todos
```

---

### 3. 删除待办事项
- **Endpoint**: `/todos/<id>`
- **方法**: `DELETE`
- **参数**: 路径参数 `id`（int）
- **返回值**（JSON）：
  - `deleted`: 被删除的事项内容

#### curl 示例
```sh
curl -X DELETE http://127.0.0.1:5000/todos/1
```

---

### 4. 更新待办事项
- **Endpoint**: `/todos/<id>`
- **方法**: `PUT`
- **参数**: 路径参数 `id`（int），JSON参数 `task`（string）
- **返回值**（JSON）：
  - 更新后的事项

#### curl 示例
```sh
curl -X PUT http://127.0.0.1:5000/todos/1 -H "Content-Type: application/json" -d "{\"task\": \"Learn something about flask and HTTP.\"}"
```

---

## 4. 注意事项
- Windows PowerShell 下建议用 `curl.exe` 替代 `curl`，或用 `Invoke-WebRequest`。
- Terminal 可以直接运行 `curl` 命令。
- JSON 数据建议用双引号，避免转义问题。
- curl 命令中 JSON 数据需用反斜杠转义双引号。
- 先运行 `python app.py`，再用 curl 测试。

## 5. 备注

```
常见的 HTTP 状态码及其含义如下：

200 OK：请求成功，服务器返回所请求的数据。
201 Created：请求成功并创建了新的资源（如新增数据）。
204 No Content：请求成功，但没有返回内容（如删除操作）。
400 Bad Request：请求有语法错误或参数不合法。
401 Unauthorized：未授权，需登录或提供凭证。
403 Forbidden：服务器理解请求但拒绝执行（无权限）。
404 Not Found：请求的资源不存在。
405 Method Not Allowed：请求方法不被允许。
500 Internal Server Error：服务器内部错误。
```