## 🚀 本地使用指南

### 快速开始

#### 1. 启动后端服务
```bash
# 进入项目目录
cd project

# 安装Python依赖
pip install -r requirements.txt

# 启动Flask后端服务
python app.py
```

后端服务启动后，您会看到类似输出：
```
启动ToDoList API服务...
服务地址: http://localhost:5000
API文档: http://localhost:5000
按 Ctrl+C 停止服务
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[::1]:5000
```

#### 2. 打开前端页面
有两种方式打开前端页面：

**方式一：直接打开HTML文件**
- 在文件管理器中找到 `project/index.html`
- 双击打开，或右键选择"打开方式" → "浏览器"

**方式二：使用本地服务器（推荐）**
```bash
# 在project目录下启动简单HTTP服务器
python -m http.server 8000

# 然后在浏览器中访问
# http://localhost:8000
```

### 使用说明

#### 📝 添加任务
1. 在页面顶部的"添加新任务"表单中填写信息：
   - **任务标题**（必填）：输入任务的标题
   - **任务描述**（可选）：输入详细描述
   - **优先级**（必填）：选择高/中/低
   - **分类**（必填）：输入分类名称，如"工作"、"学习"、"生活"
2. 点击"➕ 添加任务"按钮

#### 📋 管理任务
- **查看任务**：所有任务显示在任务列表中
- **标记完成**：点击任务左侧的复选框或任务区域
- **编辑任务**：点击任务右侧的"✏️"按钮，任务信息会填充到表单中
- **删除任务**：点击任务右侧的"🗑️"按钮，确认后删除

#### 🔍 筛选任务
- **按优先级筛选**：选择高/中/低优先级
- **按分类筛选**：输入分类名称进行模糊搜索
- **按状态筛选**：选择全部/已完成/未完成
- **清除筛选**：点击"🔄 清除筛选"按钮

#### 📊 批量操作
- **全选/取消全选**：点击"✅ 全选/取消全选"按钮
- **清空已完成**：点击"🗑️ 清空已完成"按钮删除所有已完成任务
- **刷新数据**：点击"🔄 刷新"按钮重新加载任务

#### 📈 查看统计
页面右上角显示实时统计信息：
- 总任务数
- 已完成任务数
- 完成率百分比

### 界面特色

#### 🎨 视觉设计
- **优先级色彩**：红色(高)、黄色(中)、绿色(低)
- **完成状态**：已完成任务有删除线效果
- **响应式布局**：完美适配桌面、平板和手机
- **现代化界面**：渐变背景、圆角设计、阴影效果

#### ⚡ 交互体验
- **悬停效果**：鼠标悬停时的动画反馈
- **点击反馈**：按钮点击的视觉反馈
- **平滑动画**：所有状态变化都有平滑过渡
- **实时更新**：操作后立即更新界面

### 故障排除

#### 常见问题

**1. 后端服务无法启动**
```bash
# 检查Python版本（需要3.6+）
python --version

# 检查依赖是否安装
pip list | grep -i flask

# 重新安装依赖
pip install -r requirements.txt
```

**2. 前端无法连接后端**
- 确保后端服务正在运行（http://localhost:5000）
- 检查浏览器控制台是否有CORS错误
- 尝试刷新页面或重启后端服务

**3. 任务数据丢失**
- 后端使用内存存储，重启服务后数据会丢失
- 这是正常现象，生产环境建议使用数据库

**4. 页面显示异常**
- 确保所有文件（index.html, style.css, script.js）在同一目录
- 检查浏览器控制台是否有JavaScript错误
- 尝试清除浏览器缓存

#### 调试模式

**后端调试**：
```bash
# 启动调试模式（已默认开启）
python app.py
```

**前端调试**：
1. 打开浏览器开发者工具（F12）
2. 查看Console标签页的错误信息
3. 查看Network标签页的API请求状态

### 开发说明

#### 文件结构
```
project/
├── app.py              # Flask后端服务
├── index.html          # 前端页面
├── style.css           # 样式文件
├── script.js           # JavaScript功能
├── requirements.txt    # Python依赖
├── test_api.py         # API测试脚本
└── README.md          # 项目文档
```

#### 技术栈
- **后端**：Flask + Flask-CORS
- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **数据存储**：内存存储（开发环境）
- **API通信**：Fetch API

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
