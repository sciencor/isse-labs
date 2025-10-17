# TodoList 待办事项管理系统

一个基于 Flask + 原生前端技术栈的待办事项管理系统，支持任务的增删改查、优先级分类、筛选统计等功能。

## 📋 功能特性

- ✅ **任务管理**: 添加、删除、完成/取消完成任务
- 🎯 **优先级**: 支持高/中/低三个优先级，不同颜色标识
- 📂 **分类管理**: 工作/学习/生活/其他四大分类
- 🔍 **智能筛选**: 支持按优先级、分类、状态的多条件组合筛选
- 📊 **数据统计**: 实时显示任务总数、完成数、未完成数和完成率
- 📱 **响应式设计**: 完美适配桌面端、平板和移动端

## 🛠️ 技术栈

### 后端
- **Flask 2.x**: 轻量级Web框架
- **Flask-CORS**: 跨域请求支持
- **Python 3.x**: 编程语言

### 前端
- **HTML5**: 页面结构
- **CSS3**: 样式设计（Flexbox/Grid布局）
- **JavaScript (ES6+)**: 交互逻辑
- **Fetch API**: HTTP请求

## 📦 安装步骤

### 1. 克隆项目
```bash
cd lab3-doc/李鹏宇-2200017702/project
```

### 2. 安装Python依赖
```bash
pip install flask flask-cors
```

## 🚀 运行方法

### 1. 启动后端服务
```bash
cd project
python app.py
```
后端服务将运行在 `http://localhost:5000`

### 2. 打开前端页面
**方式1（推荐）**: 使用VS Code的Live Server插件
1. 右键点击 `index.html`
2. 选择 "Open with Live Server"

**方式2**: 直接在浏览器中打开
1. 在浏览器地址栏输入文件路径
2. 例如（更通用的写法，注意区分大小写与斜杠方向）:
  - Windows: `file:///D:/智能化软件系统与工程/LAB/isse-labs/lab3-doc/李鹏宇-2200017702/project/index.html`
  - macOS/Linux: `file:///Users/<你的用户名>/isse-labs/lab3-doc/李鹏宇-2200017702/project/index.html`
  - 或者直接将 `index.html` 文件拖到浏览器窗口中打开

## 📡 API 接口文档

### 基础URL
```
http://localhost:5000/api
```

### 接口列表

#### 1. 获取所有任务
```http
GET /api/todos
```

**Query参数**:
- `priority`: 筛选优先级 (high/medium/low)
- `category`: 筛选分类 (work/study/life/other)
- `status`: 筛选状态 (completed/pending)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "完成实验报告",
      "description": "完成软件工程实验报告",
      "priority": "high",
      "category": "study",
      "completed": false,
      "created_at": "2025-10-17T10:30:00"
    }
  ]
}
```

#### 2. 添加新任务
```http
POST /api/todos
Content-Type: application/json
```

**请求体**:
```json
{
  "title": "任务标题",
  "description": "任务描述",
  "priority": "high",
  "category": "work"
}
```

#### 3. 切换任务状态
```http
PUT /api/todos/<id>/toggle
```

#### 4. 删除任务
```http
DELETE /api/todos/<id>
```

#### 5. 获取统计信息
```http
GET /api/todos/stats
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "total": 10,
    "completed": 6,
    "pending": 4,
    "completion_rate": 60.0
  }
}
```

## 🎨 使用说明

### 添加任务
1. 在顶部表单中输入任务标题（必填）
2. 可选填写任务描述
3. 选择优先级和分类
4. 点击"添加任务"按钮

### 管理任务
- **完成任务**: 点击任务卡片上的"✅ 完成"按钮
- **取消完成**: 已完成任务点击"↩️ 取消完成"按钮
- **删除任务**: 点击"🗑️ 删除"按钮（会有确认提示）

### 筛选任务
使用筛选区域的下拉菜单，可以按优先级、分类、状态进行筛选，支持多条件组合。

### 查看统计
页面顶部实时显示任务统计信息，包括总数、已完成、未完成和完成率。

## 📁 项目结构

```
project/
├── app.py          # Flask后端服务（RESTful API）
├── index.html      # 前端页面结构
├── script.js       # 前端交互逻辑
└── style.css       # 前端样式设计
```

## 🎯 核心特性说明

### 优先级颜色标识
- 🔴 **高优先级**: 红色边框 (#ff4757)
- 🟡 **中优先级**: 橙色边框 (#ffa502)
- 🟢 **低优先级**: 绿色边框 (#2ed573)

### 数据存储
使用Python内存列表存储，服务重启后数据会重置。适合学习和演示用途。

### 响应式设计
- 桌面端: 最大宽度1200px，卡片网格布局
- 平板端: 自适应布局，优化触摸交互
- 移动端: 单列布局，适配小屏幕

## 🐛 已知问题

- 数据仅存储在内存中，服务重启后会丢失
- 不支持任务编辑功能（可在未来版本添加）

## 📝 开发日志

详见 [todo.md](todo.md) 文件。

## 👨‍💻 开发者

李鹏宇 - 2200017702

## 📄 许可证

本项目仅用于学习目的。

---

**最后更新**: 2025-10-17
