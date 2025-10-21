# ToDoList API 后端服务

这是一个基于Flask框架的ToDoList应用后端服务，提供完整的任务管理功能。

## 功能特性

- ✅ 任务创建 (POST /tasks)
- ✅ 任务列表查询 (GET /tasks) - 支持按优先级和分类过滤
- ✅ 任务更新 (PUT /tasks/<id>)
- ✅ 任务删除 (DELETE /tasks/<id>)
- ✅ 任务完成状态切换 (PATCH /tasks/<id>/complete)
- ✅ 任务统计信息 (GET /tasks/stats)
- ✅ 跨域支持 (CORS)
- ✅ 完整的错误处理

## 安装和运行

### 1. 安装依赖

```bash
cd project
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python app.py
```

服务将在 `http://localhost:5000` 启动

## API 接口文档

### 基础信息
- 基础URL: `http://localhost:5000`
- 数据格式: JSON
- 字符编码: UTF-8

### 接口列表

#### 1. 创建任务
- **URL**: `POST /tasks`
- **描述**: 创建新任务
- **请求体**:
```json
{
    "title": "任务标题",
    "description": "任务描述",
    "priority": "high|medium|low",
    "category": "工作|学习|生活"
}
```
- **响应**: 返回创建的任务信息

#### 2. 获取任务列表
- **URL**: `GET /tasks`
- **描述**: 获取所有任务，支持过滤
- **查询参数**:
  - `priority`: 按优先级过滤 (low, medium, high)
  - `category`: 按分类过滤
- **示例**: `GET /tasks?priority=high&category=工作`

#### 3. 更新任务
- **URL**: `PUT /tasks/<task_id>`
- **描述**: 更新指定任务
- **请求体**: 包含要更新的字段
- **示例**:
```json
{
    "title": "更新后的标题",
    "priority": "medium",
    "completed": true
}
```

#### 4. 删除任务
- **URL**: `DELETE /tasks/<task_id>`
- **描述**: 删除指定任务

#### 5. 切换任务完成状态
- **URL**: `PATCH /tasks/<task_id>/complete`
- **描述**: 切换任务的完成状态

#### 6. 获取统计信息
- **URL**: `GET /tasks/stats`
- **描述**: 获取任务统计信息

## 测试方法

### 方法1: 使用curl命令

#### 1. 创建任务
```bash
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习Flask",
    "description": "完成Flask教程学习",
    "priority": "high",
    "category": "学习"
  }'
```

#### 2. 获取所有任务
```bash
curl -X GET http://localhost:5000/tasks
```

#### 3. 按优先级过滤任务
```bash
curl -X GET "http://localhost:5000/tasks?priority=high"
```

#### 4. 更新任务
```bash
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习Flask框架",
    "completed": true
  }'
```

#### 5. 切换任务完成状态
```bash
curl -X PATCH http://localhost:5000/tasks/1/complete
```

#### 6. 删除任务
```bash
curl -X DELETE http://localhost:5000/tasks/1
```

#### 7. 获取统计信息
```bash
curl -X GET http://localhost:5000/tasks/stats
```

### 方法2: 使用Postman

1. 导入以下API集合到Postman
2. 设置基础URL为 `http://localhost:5000`
3. 运行各个请求进行测试

### 方法3: 使用Python requests库

创建一个测试脚本 `test_api.py`:

```python
import requests
import json

BASE_URL = "http://localhost:5000"

def test_create_task():
    """测试创建任务"""
    data = {
        "title": "测试任务",
        "description": "这是一个测试任务",
        "priority": "high",
        "category": "测试"
    }
    response = requests.post(f"{BASE_URL}/tasks", json=data)
    print("创建任务:", response.json())
    return response.json()['task']['id']

def test_get_tasks():
    """测试获取任务列表"""
    response = requests.get(f"{BASE_URL}/tasks")
    print("获取任务列表:", response.json())

def test_update_task(task_id):
    """测试更新任务"""
    data = {
        "title": "更新后的测试任务",
        "completed": True
    }
    response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=data)
    print("更新任务:", response.json())

def test_toggle_completion(task_id):
    """测试切换完成状态"""
    response = requests.patch(f"{BASE_URL}/tasks/{task_id}/complete")
    print("切换完成状态:", response.json())

def test_get_stats():
    """测试获取统计信息"""
    response = requests.get(f"{BASE_URL}/tasks/stats")
    print("统计信息:", response.json())

def test_delete_task(task_id):
    """测试删除任务"""
    response = requests.delete(f"{BASE_URL}/tasks/{task_id}")
    print("删除任务:", response.json())

if __name__ == "__main__":
    print("开始测试ToDoList API...")
    
    # 创建任务
    task_id = test_create_task()
    
    # 获取任务列表
    test_get_tasks()
    
    # 更新任务
    test_update_task(task_id)
    
    # 切换完成状态
    test_toggle_completion(task_id)
    
    # 获取统计信息
    test_get_stats()
    
    # 删除任务
    test_delete_task(task_id)
    
    print("测试完成!")
```

运行测试脚本:
```bash
python test_api.py
```

## 数据模型

### 任务对象结构
```json
{
    "id": 1,
    "title": "任务标题",
    "description": "任务描述",
    "priority": "high|medium|low",
    "category": "分类名称",
    "completed": false,
    "created_at": "2024-01-01T12:00:00.000000",
    "updated_at": "2024-01-01T12:00:00.000000"
}
```

## 错误处理

API返回标准的HTTP状态码和错误信息：

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误（参数验证失败等）
- `404`: 资源不存在
- `405`: 方法不允许
- `500`: 服务器内部错误

错误响应格式：
```json
{
    "error": "错误描述信息"
}
```

## 注意事项

1. 服务使用内存存储，重启后数据会丢失
2. 任务ID是自增的整数，从1开始
3. 优先级只能是 "low", "medium", "high"
4. 所有时间戳使用ISO格式
5. 支持跨域请求，前端可以直接调用API
