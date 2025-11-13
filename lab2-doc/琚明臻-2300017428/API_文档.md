# Todo List API 使用文档

## 概述
这是一个简单的待办事项(Todo)列表API，提供了基本的增删改查功能。API基于Flask框架开发，使用JSON格式进行数据交换。

## API端口

### 1. 获取所有待办事项

获取当前所有的待办事项列表。

- **URL**: `/todos`
- **方法**: `GET`
- **参数**: 无
- **返回值**:
  ```json
  {
    "1": "任务1",
    "2": "任务2",
    "3": "任务3"
  }
  ```
  返回一个对象，其中键为任务ID（整数），值为任务内容（字符串）。

### 2. 添加待办事项

添加一个新的待办事项到列表中。

- **URL**: `/add`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "task": "需要完成的任务"
  }
  ```
- **参数**:
  - `task` (字符串): 待办事项的内容
- **返回值**:
  ```json
  {
    "id": 4,
    "task": "需要完成的任务"
  }
  ```
  返回一个对象，包含新添加任务的ID和内容。

### 3. 删除待办事项

根据ID删除指定的待办事项。

- **URL**: `/delete/<id>`
- **方法**: `DELETE`
- **URL参数**:
  - `id` (整数): 待删除任务的ID
- **返回值**:
  - 成功删除:
    ```json
    {
      "id": 2,
      "deleted": "任务2"
    }
    ```
  - 任务不存在:
    ```json
    {
      "error": "未找到该任务"
    }
    ```

### 4. 更新待办事项

更新指定ID的待办事项内容。

- **URL**: `/update/<id>`
- **方法**: `PUT`
- **URL参数**:
  - `id` (整数): 待更新任务的ID
- **请求体**:
  ```json
  {
    "task": "更新后的任务内容"
  }
  ```
- **参数**:
  - `task` (字符串): 更新后的任务内容
- **返回值**:
  - 成功更新:
    ```json
    {
      "3": "更新后的任务内容"
    }
    ```
  - 任务不存在:
    ```json
    null
    ```

## 使用示例

### 获取所有待办事项

```bash
curl -X GET http://localhost:5000/todos
```

### 添加待办事项

```bash
curl -X POST http://localhost:5000/add \
  -H "Content-Type: application/json" \
  -d '{"task": "完成作业"}'
```

### 删除待办事项

```bash
curl -X DELETE http://localhost:5000/delete/1
```

### 更新待办事项

```bash
curl -X PUT http://localhost:5000/update/2 \
  -H "Content-Type: application/json" \
  -d '{"task": "修改后的任务"}'
```

## 错误处理

- 当尝试删除不存在的任务时，API会返回错误信息 `{"error": "未找到该任务"}`
- 当尝试更新不存在的任务时，API会返回 `null`