# TodoList 任务管理系统

一个基于 Flask 后端和 HTML/CSS/JavaScript 前端的现代化任务管理系统，支持任务的增删改查、分类筛选、优先级管理等功能。

> **注意**: 由于本机5000端口被占用，本项目使用6597端口运行。如需修改端口，请在 `app.py` 文件中调整 `port` 参数。

## 🚀 功能特性

- ✅ **任务管理**: 添加、删除、标记完成/未完成任务
- 🏷️ **分类管理**: 支持学习、工作、生活、其他四个类别
- ⭐ **优先级管理**: 高、中、低三个优先级等级
- 🔍 **智能筛选**: 按类别和优先级筛选任务，带状态指示器
- 📊 **统计信息**: 实时显示总任务数、已完成、待完成数量
- 📱 **响应式设计**: 支持桌面端和移动端访问
- 🎨 **现代化UI**: 美观的渐变色彩、动画效果和微交互
- ✨ **美化筛选**: 自定义下拉菜单、状态指示器和动画效果
- 🌐 **完整服务**: 集成静态文件服务，支持直接访问根路径

## 📁 项目结构

```text
lab3-doc/
└── 张永康-2300017812/
    ├── README.md            # 项目说明文档
    └── project/             # 项目代码目录
        ├── app.py           # Flask 后端服务器
        ├── index.html       # 前端页面
        ├── script.js        # 前端 JavaScript 逻辑
        ├── style.css        # 样式文件
        └── test_api.py      # API 测试
```

## 🛠️ 技术栈

### 后端

- **Flask**: Python Web框架
- **Flask-CORS**: 处理跨域请求
- **RESTful API**: 标准的REST接口设计
- **面向对象设计**: 使用类封装业务逻辑，提高代码可维护性
- **类型提示**: 使用Python类型提示提高代码可读性
- **日志系统**: 集成日志记录功能
- **端口管理**: 支持自定义端口配置，默认使用6597端口

### 前端

- **HTML5**: 语义化标记
- **CSS3**: 现代化样式，支持渐变、动画、响应式布局
- **JavaScript ES6+**: 模块化编程，使用async/await处理异步请求
- **Fetch API**: 现代化的HTTP请求方式

## 🚀 快速开始

### 环境要求

- Python 3.7+
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd project
   ```

2. **安装Python依赖**

   ```bash
   pip install -r requirements.txt
   ```

3. **启动后端服务器**

   ```bash
   python app.py
   ```

   服务器将在 `http://localhost:6597` 启动

   > **端口说明**: 由于5000端口被占用，本项目使用6597端口。如需使用其他端口，请修改 `app.py` 中的 `port` 参数。

4. **访问TodoList应用**
   - 直接在浏览器中访问 `http://localhost:6597`
   - 所有静态资源（CSS、JS）会自动加载
   - 支持完整的TodoList功能，包括美化的筛选界面

## 📖 API 文档

### 基础信息

- **基础URL**: `http://localhost:6597`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **端口说明**: 使用6597端口（原5000端口被占用）

### 接口列表

#### 1. 主页面

```http
GET /
```

**说明**: 返回TodoList主页面HTML内容

**示例**:

```bash
curl "http://localhost:6597/"
```

#### 2. 获取任务列表

```http
GET /tasks
```

**查询参数**:

- `category` (可选): 按类别筛选 (学习/工作/生活/其他)
- `priority` (可选): 按优先级筛选 (高/中/低)

**示例**:

```bash
curl "http://localhost:6597/tasks?category=学习&priority=高"
```

**响应格式**:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "完成作业",
      "category": "学习",
      "priority": "高",
      "completed": false
    }
  ],
  "message": "成功获取1个任务"
}
```

#### 2. 创建新任务

```http
POST /tasks
```

**请求体**:

```json
{
  "title": "任务标题",
  "category": "学习",
  "priority": "高"
}
```

**示例**:

```bash
curl -X POST "http://localhost:6597/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "写报告", "category": "学习", "priority": "高"}'
```

#### 3. 更新任务状态

```http
PUT /tasks/{id}
```

**请求体**:

```json
{
  "completed": true
}
```

**示例**:

```bash
curl -X PUT "http://localhost:6597/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

#### 4. 删除任务

```http
DELETE /tasks/{id}
```

**示例**:

```bash
curl -X DELETE "http://localhost:6597/tasks/1"
```

#### 5. 健康检查

```http
GET /health
```

**示例**:

```bash
curl "http://localhost:6597/health"
```

**响应格式**:

```json
{
  "status": "success",
  "data": {
    "message": "服务运行正常",
    "statistics": {
      "total": 5,
      "completed": 2,
      "pending": 3
    }
  },
  "message": "TodoList API 服务正常"
}
```

#### 6. 获取统计信息

```http
GET /stats
```

**示例**:

```bash
curl "http://localhost:6597/stats"
```

**响应格式**:

```json
{
  "status": "success",
  "data": {
    "total": 5,
    "completed": 2,
    "pending": 3
  },
  "message": "统计信息获取成功"
}
```

## 🎯 使用指南

### 添加任务

1. 在"添加新任务"区域填写任务标题
2. 选择任务类别（学习/工作/生活/其他）
3. 选择优先级（高/中/低）
4. 点击"添加任务"按钮

### 管理任务

- **标记完成**: 点击任务右侧的"标记完成"按钮
- **删除任务**: 点击任务右侧的"删除"按钮
- **筛选任务**: 使用顶部的筛选下拉菜单

### 快捷键

- `Ctrl + Enter`: 快速添加任务（在标题输入框中）
- `Escape`: 清除所有筛选条件

## 🧪 测试用例

### 功能测试

1. **添加任务测试**
   - 添加3个不同类别的任务
   - 验证任务正确显示在列表中

2. **状态切换测试**
   - 标记一个任务为完成
   - 验证任务显示删除线效果

3. **删除任务测试**
   - 删除一个任务
   - 验证任务从列表中消失

4. **筛选功能测试**
   - 按类别筛选任务
   - 按优先级筛选任务
   - 验证筛选结果正确

5. **统计信息测试**
   - 验证总任务数、已完成数、待完成数正确更新

### API测试

使用以下命令测试API接口：

```bash
# 测试获取任务列表
curl "http://localhost:6597/tasks"

# 测试创建任务
curl -X POST "http://localhost:6597/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "测试任务", "category": "工作", "priority": "中"}'

# 测试更新任务
curl -X PUT "http://localhost:6597/tasks/1" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 测试删除任务
curl -X DELETE "http://localhost:6597/tasks/1"

# 测试健康检查
curl "http://localhost:6597/health"

# 测试统计信息
curl "http://localhost:6597/stats"
```

## 🎨 界面预览

### 主要界面元素

- **顶部标题区域**: 渐变背景，显示应用名称
- **添加任务表单**: 包含标题输入框、类别选择、优先级选择
- **筛选控制区域**: 按类别和优先级筛选任务
- **任务列表区域**: 显示所有任务，支持状态切换和删除
- **统计信息区域**: 显示任务统计数据的卡片

### 样式特色

- **现代化设计**: 使用渐变色彩和圆角设计
- **响应式布局**: 支持桌面端和移动端
- **动画效果**: 平滑的过渡动画和悬停效果
- **状态指示**: 不同优先级和类别使用不同颜色标识

## 🔧 开发说明

### 代码结构

- **app.py**: Flask应用主文件，采用面向对象设计
  - `Task`: 任务数据模型类，封装任务属性和方法
  - `TaskManager`: 任务管理器类，处理所有任务相关业务逻辑
  - `TodoListAPI`: 主API类，管理Flask应用和路由
- **index.html**: 静态HTML页面，定义页面结构
- **script.js**: JavaScript类TodoApp，封装所有前端逻辑
- **style.css**: CSS样式文件，定义页面外观

### 数据存储

- 当前使用内存列表存储任务数据
- 服务器重启后数据会丢失
- 可扩展为数据库存储（SQLite/MySQL/PostgreSQL）

### 端口配置

- **默认端口**: 6597（由于5000端口被占用）
- **修改端口**: 在 `app.py` 文件的 `run()` 方法中修改 `port` 参数
- **端口检查**: 使用 `netstat -an | findstr :6597` 检查端口占用情况

### 扩展功能

- 任务编辑功能
- 任务搜索功能
- 任务排序功能
- 用户认证系统
- 数据持久化存储

## 🐛 故障排除

### 常见问题

1. **服务器启动失败**
   - 检查Python版本是否≥3.7
   - 确认已安装所有依赖包
   - 检查6597端口是否被占用（本项目使用6597端口，因为5000端口被占用）
   - 如需使用其他端口，请修改 `app.py` 中的 `port` 参数

2. **前端无法连接后端**
   - 确认后端服务器正在运行
   - 检查浏览器控制台是否有CORS错误
   - 尝试使用本地服务器而不是直接打开HTML文件

3. **任务添加失败**
   - 检查任务标题是否为空
   - 查看浏览器控制台错误信息
   - 确认后端API返回正确响应

## 📄 许可证

本项目采用 MIT 许可证，详情请参阅 LICENSE 文件。

## 👥 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

**开发时间**: 2024年
**开发者**: 张永康-2300017812
**技术栈**: Flask + HTML/CSS/JavaScript
