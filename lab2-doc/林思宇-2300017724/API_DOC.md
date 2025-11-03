# TodoList API Doc

Base URL: `http://localhost:5000`

## 新增Todo
- Endpoint: `POST /todos`
- 请求参数: JSON `{"task": "任务描述"}`
- 成功响应: `Created Successful`
  ```json
  {
    "id": 1,
    "task": "任务描述"
  }
  ```
- 失败响应:
  - `Bad Request` 缺少 `task` 字段

## 查询Todo
- Endpoint: `GET /todos`
- 请求参数: 无
- 成功响应: `Got Successful`
  ```json
  {
    "todos": {
      "1": "任务描述",
      "2": "另一条任务"
    }
  }
  ```

## 更新Todo
- Endpoint: `PUT /todos/<id>`
- 路径参数: `id` 为Todo ID
- 请求体: JSON `{"task": "新的任务描述"}`
- 成功响应: `Updated Successful`
  ```json
  {
    "id": 1,
    "task": "新的任务描述"
  }
  ```
- 失败响应:
  - `Bad Request` 缺少 `task` 字段
  - `Not Found` ID不存在

## 删除Todo
- Endpoint: `DELETE /todos/<id>`
- 路径参数: `id` 为Todo ID
- 成功响应: `Delete Successful`
  ```json
  {
    "id": 1,
    "task": "任务描述"
  }
  ```
- 失败响应:
  - `Not Found` 指定 ID 不存在

## 运行方式
```bash
pip install flask
python app.py
```
