# ToDoList 使用说明

## 软件介绍
一个美观、功能完整的任务管理Web应用，使用Flask后端和原生JavaScript前端构建。

🌟 项目简介
这是一个现代化的任务管理系统，具有优雅的用户界面和流畅的交互体验。系统支持任务的新增、完成、删除和筛选功能，所有操作都有精美的动画效果。

✨ 功能特性
核心功能
✅ 任务管理 - 添加、编辑、删除任务

✅ 状态标记 - 标记任务为完成/未完成

✅ 智能分类 - 学习、工作、生活三大类别

✅ 优先级管理 - 高、中、低三级优先级

✅ 实时筛选 - 按类别和优先级筛选任务

用户体验
🎨 现代化设计 - 渐变背景、毛玻璃效果、卡片式布局

✨ 流畅动画 - 任务完成时的渐变消失效果

📱 响应式设计 - 完美适配桌面和移动设备

🔄 实时反馈 - 操作成功/失败的消息提示

📊 进度追踪 - 任务完成进度可视化

🛠 技术栈
后端
框架: Python Flask

数据存储: JSON文件 (tasks.json)

API风格: RESTful

跨域支持: Flask-CORS

前端
核心: 原生JavaScript (ES6+)

样式: 纯CSS3 (Flexbox + Grid)

动画: CSS3 Transitions & Animations

网络请求: Fetch API

## 环境配置
🚀 快速开始
环境要求
Python 3.7+

Flask 2.0+

现代浏览器 (支持ES6)

bash
pip install flask flask-cors
准备数据文件

bash

确保项目根目录有 tasks.json 文件，如果不存在，应用启动时会自动创建

## 程序启动

bash
python app.py
访问应用

text
打开浏览器访问: http://localhost:5000

## 程序使用

📖 使用指南
添加任务
在输入框中输入任务标题

选择任务类别（学习/工作/生活）

选择优先级（高/中/低）

点击"添加任务"按钮或按回车键

管理任务
标记完成: 点击任务右侧的"完成"按钮

删除任务: 点击任务右侧的"删除"按钮

筛选查看: 使用顶部筛选按钮按类别或优先级查看任务

动画效果
完成任务: 任务会向右滑动并渐变消失

添加任务: 新任务有滑入动画效果

悬停效果: 鼠标悬停时有轻微上浮和阴影变化

## 关于API接口

🔌 API接口文档
获取任务列表
http
GET /tasks
查询参数:

category (可选): 按类别筛选

priority (可选): 按优先级筛选

响应:

json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "任务标题",
      "category": "学习",
      "priority": "高",
      "completed": false
    }
  ],
  "message": "获取任务成功"
}
添加新任务
http
POST /tasks
请求体:

json
{
  "title": "任务标题",
  "category": "学习",
  "priority": "高"
}
标记任务完成
http
PUT /tasks/{id}/complete
更新任务
http
PUT /tasks/{id}
请求体 (可选字段):

json
{
  "title": "新标题",
  "category": "工作",
  "priority": "中",
  "completed": true
}
删除任务
http
DELETE /tasks/{id}

## 关于界面

🎨 界面预览
主要界面元素
顶部输入区: 任务创建表单

筛选功能区: 类别和优先级筛选

任务列表区: 卡片式任务展示

进度指示器: 完成进度可视化

设计特色
色彩系统: 使用蓝绿色系，高优先级用红色强调

动画系统: 流畅的过渡动画和微交互

响应式布局: 移动端友好的自适应设计

无障碍设计: 良好的对比度和可访问性

🔧 自定义配置
修改样式
编辑 static/style.css 文件：

修改颜色主题

调整动画时长

自定义布局样式

扩展功能
在 static/script.js 中添加：

新的筛选条件

额外的任务字段

自定义动画效果

数据持久化
系统自动使用 tasks.json 文件保存数据，支持：

服务器重启后数据不丢失

手动备份和恢复

数据格式清晰易读

## 可能问题

🐛 故障排除
常见问题
问题: 任务无法保存
解决: 检查 tasks.json 文件权限和格式

问题: 动画效果不流畅
解决: 确保使用现代浏览器，禁用硬件加速的CSS动画

问题: API请求失败
解决: 检查Flask服务是否正常运行，端口是否被占用

调试模式
启动时添加调试参数：

bash
python app.py --debug

## 最后

🤝 贡献指南
欢迎提交 Issue 和 Pull Request 来改进这个项目！

Fork 本项目

创建功能分支 (git checkout -b feature/AmazingFeature)

提交更改 (git commit -m 'Add some AmazingFeature')

推送到分支 (git push origin feature/AmazingFeature)

开启 Pull Request

