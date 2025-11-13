# TodoList 任务管理系统

这是一个基于 Flask 的前端/后端小型任务管理（TodoList）应用，包含添加、删除、编辑任务、按分类/优先级筛选任务、以及在本地内存或浏览器端保存任务的功能。页面使用 `script.js` 实现交互逻辑，`style.css` 提供样式与动画效果。

主要功能

- 添加任务：在顶部输入标题，选择分类（学习/工作/生活）和优先级（高/中/低），点击“添加任务”。
- 删除任务：在任务条目上点击删除按钮以移除任务。
- 编辑任务：支持修改任务标题、分类或优先级。
- 筛选任务：底部提供按分类和优先级筛选的下拉框，可组合筛选；点击“重置筛选”会恢复所有任务显示。
- 记忆任务：任务在页面刷新或重新启动后仍能保留。
- 动画效果：在完成任务时，会触发烟花动画效果。

运行方法

1. 环境要求

- Python 3.x

2. 安装依赖

如果项目使用 Flask（`app.py` 存在），请在项目根目录下运行：

```powershell
python -m venv venv; .\venv\Scripts\Activate.ps1
pip install flask
```

3. 启动应用

在 `project` 目录下运行（windows powershell）：

```powershell
set FLASK_APP=app.py; set FLASK_ENV=development; flask run
```

或者直接运行：

```powershell
python app.py
```

4. 打开浏览器访问

默认情况下访问： http://127.0.0.1:5000/