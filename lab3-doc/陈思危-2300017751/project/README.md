# TodoList 任务管理系统

## 项目介绍

这是一个基于Flask后端和HTML/JS前端的TodoList任务管理系统，实现了任务的增删改查、优先级管理、分类管理等功能。

## 功能特性

- ✅ **任务管理**：添加、编辑、删除任务
- ✅ **状态管理**：标记任务完成/未完成
- ✅ **优先级管理**：高/中/低三个优先级，按优先级排序显示
- ✅ **分类管理**：支持自定义分类，按分类筛选
- ✅ **筛选功能**：按分类、优先级、完成状态筛选
- ✅ **统计信息**：显示总任务数、已完成数、待办数
- ✅ **响应式设计**：支持桌面和移动端
- ✅ **数据持久化**：任务数据保存到JSON文件

## 技术栈

- **后端**：Flask + Python
- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **数据存储**：JSON文件
- **API**：RESTful API设计

## 运行方式

### 1. 安装依赖

```bash
pip install flask flask-cors
```

### 2. 启动后端服务

```bash
cd project
python app.py
```

后端服务将在 `http://localhost:5000` 启动

### 3. 打开前端页面

直接用浏览器打开 `index.html` 文件，或者使用Live Server等工具。

### 4. 开始使用

- 在输入框中输入任务标题和描述
- 选择优先级和分类
- 点击"添加任务"按钮
- 在任务列表中可以标记完成、编辑或删除任务
- 使用顶部的筛选器按不同条件筛选任务

## API接口文档

### 获取所有任务
- **URL**: `GET /api/todos`
- **参数**: 
  - `category` (可选): 按分类筛选
  - `priority` (可选): 按优先级筛选
- **返回**: 任务列表数组

### 创建新任务
- **URL**: `POST /api/todos`
- **Body**: 
  ```json
  {
    "title": "任务标题",
    "description": "任务描述",
    "priority": "high|medium|low",
    "category": "分类名称"
  }
  ```

### 更新任务
- **URL**: `PUT /api/todos/{id}`
- **Body**: 同创建任务

### 删除任务
- **URL**: `DELETE /api/todos/{id}`

### 切换任务状态
- **URL**: `PUT /api/todos/{id}/toggle`

### 获取分类列表
- **URL**: `GET /api/categories`

### 获取统计信息
- **URL**: `GET /api/stats`

## 项目结构

```
project/
├── app.py              # Flask后端服务
├── index.html          # 前端主页面
├── script.js           # 前端JavaScript逻辑
├── style.css           # 前端样式文件
├── todos.json          # 任务数据文件（自动生成）
└── README.md           # 项目说明文档
```

## 注意事项

1. 首次运行时会自动创建 `todos.json` 数据文件
2. 确保后端服务先启动，再访问前端页面
3. 如果遇到跨域问题，请确保安装了 `flask-cors` 包
4. 数据会自动保存到本地JSON文件，重启服务后数据仍然存在

## 开发说明

本项目使用AI辅助开发，采用前后端分离的架构设计。后端提供RESTful API接口，前端使用原生JavaScript与后端交互，实现了完整的TodoList功能。