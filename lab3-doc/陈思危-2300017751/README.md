
# TodoList 智能任务管理系统

## 项目概述

本项目是一个智能化的 TodoList 任务管理系统，采用 Flask 后端与原生 HTML/JavaScript 前端，支持任务的详细记录、智能筛选、排序、批量操作和统计分析。系统实现了任务的增删改查、优先级、重要程度、分类、截止日期（DDL）、标签、备注、预计/实际耗时等多维度管理，适用于高效个人任务规划与团队协作。

## 主要功能

- 📝 **任务管理**：添加、编辑、删除、批量更新/删除任务
- ✅ **状态管理**：标记完成/未完成，自动识别过期、今日到期、即将到期
- 🔥 **优先级与重要程度**：支持高/中/低优先级，critical/high/medium/low重要程度，均可筛选与排序
- 📅 **截止日期（DDL）管理**：任务可设置截止日期，支持日期筛选与排序
- 🏷️ **分类与标签**：自定义分类、标签，支持多维筛选
- 📊 **统计分析**：总数、完成数、待办数、过期数、优先级/重要程度/分类分布、预计/实际耗时统计
- 🔍 **智能筛选与排序**：按分类、优先级、重要程度、状态、截止日期等多条件筛选，支持多字段排序
- 🚀 **批量操作**：批量更新、批量删除任务
- 💡 **美观前端**：响应式设计，时间选择器美化，操作流畅，无多余确认弹窗
- 🗂️ **数据持久化**：所有任务数据自动保存至本地 JSON 文件，重启服务数据不丢失

## 技术架构

- **后端**：Flask 2.3.2、Flask-CORS 4.0.0、python-dateutil 2.8.2
- **前端**：HTML5、CSS3、JavaScript (ES6+)
- **数据存储**：JSON 文件本地持久化
- **API**：RESTful 风格，支持丰富参数与多种操作

## 快速开始

1. **安装依赖**
  ```bash
  pip install flask flask-cors python-dateutil
  ```
2. **启动后端服务**
  ```bash
  cd project
  python app.py
  ```
  服务默认运行在 `http://localhost:5000`
3. **打开前端页面**
  直接用浏览器打开 `index.html`，或使用 Live Server 工具。
4. **体验功能**
  - 输入任务标题、描述、截止日期、优先级、重要程度、分类、标签等
  - 一键添加任务，自动刷新，无需额外确认
  - 支持筛选、排序、批量操作、统计分析
  - 可编辑、删除、切换完成状态，体验流畅

## API接口说明（部分）

### 任务相关
- `GET /api/todos`：获取所有任务，支持 category、priority、importance、status、sort_by、sort_order 等参数筛选与排序
- `POST /api/todos`：创建新任务，支持 title、description、priority、importance、category、deadline、tags、estimated_time、actual_time、notes 等字段
- `PUT /api/todos/{id}`：更新任务，字段同上
- `DELETE /api/todos/{id}`：删除指定任务
- `PUT /api/todos/{id}/toggle`：切换任务完成状态
- `PUT /api/todos/batch`：批量更新任务
- `DELETE /api/todos/batch`：批量删除任务

### 统计与筛选
- `GET /api/stats`：获取任务统计信息（总数、完成数、优先级/重要程度/分类分布等）
- `GET /api/categories`：获取所有分类
- `GET /api/tags`：获取所有标签
- `GET /api/todos/overdue`：获取过期任务
- `GET /api/todos/due-today`：获取今日到期任务
- `GET /api/todos/due-soon`：获取即将到期任务

## 目录结构

```
project/
├── app.py         # Flask后端主程序
├── index.html     # 前端页面
├── script.js      # 前端交互逻辑
├── style.css      # 前端样式
├── requirements.txt # 后端依赖
├── todos.json     # 任务数据（自动生成）
└── README.md      # 项目说明文档
```

## 注意事项

1. 首次运行自动生成 `todos.json` 数据文件
2. 请先启动后端服务，再访问前端页面
3. 如遇跨域问题，请确保已安装 `flask-cors`
4. 所有数据本地持久化，重启服务数据不丢失

## 开发与设计说明

本项目采用前后端分离架构，后端提供丰富 RESTful API，前端通过 fetch 实现异步交互。功能设计参考智能化软件系统工程实践，支持多维度任务管理与统计分析。开发过程结合AI辅助，注重用户体验与代码可维护性。

---
如需更多帮助或定制功能，请联系开发者。