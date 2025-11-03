# API 使用文档

## 基础信息
- **Base URL**: `http://localhost:5000` (使用5000端口)
- **数据格式**: JSON

## 端点说明

### 1. 获取 API 信息
- **Endpoint**: `GET /`
- **描述**: 获取 API 基本信息和使用说明
- **参数**: 无
- **响应**:
```json
{
  "message": "TodoList API 服务",
  "endpoints": {
    "GET /todos": "获取所有待办事项",
    "POST /todos": "添加新的待办事项", 
    "PUT /todos/<id>": "更新待办事项",
    "DELETE /todos/<id>": "删除待办事项"
  }
}
```

#### 2. 获取所有待办事项
- **Endpoint**: `GET /todos`
- **描述**: 获取所有待办事项列表
- **参数**: 无
- **成功响应** (200):
```json
{
  "status": "success",
  "count": 2,
  "todos": {
    "1": "学习 Flask",
    "2": "完成作业"
  }
}
```

#### 3. 添加待办事项
- **Endpoint**: `POST /todos`
- **描述**: 添加新的待办事项
- **请求体**:
```json
{
  "task": "新的任务内容"
}
```
- **成功响应** (201):
```json
{
  "status": "success", 
  "message": "待办事项添加成功",
  "todo": {
    "id": 3,
    "task": "新的任务内容"
  }
}
```
- **错误响应** (400):
```json
{
  "status": "error",
  "message": "缺少 task 参数"
}
```

#### 4. 更新待办事项
- **Endpoint**: `PUT /todos/<id>`
- **描述**: 更新指定 ID 的待办事项
- **参数**: 
  - `id` (路径参数): 待办事项 ID
- **请求体**:
```json
{
  "task": "更新后的任务内容"
}
```
- **成功响应** (200):
```json
{
  "status": "success",
  "message": "待办事项更新成功", 
  "todo": {
    "1": "更新后的任务内容"
  }
}
```
- **错误响应** (404):
```json
{
  "status": "error",
  "message": "ID 1 的待办事项不存在"
}
```

#### 5. 删除待办事项
- **Endpoint**: `DELETE /todos/<id>`
- **描述**: 删除指定 ID 的待办事项
- **参数**:
  - `id` (路径参数): 待办事项 ID
- **成功响应** (200):
```json
{
  "status": "success",
  "message": "待办事项删除成功",
  "deleted_task": "被删除的任务内容"
}
```
- **错误响应** (404):
```json
{
  "status": "error", 
  "message": "ID 1 的待办事项不存在"
}
```