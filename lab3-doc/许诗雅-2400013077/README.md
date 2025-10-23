# 运行说明

provided by trae:

## 如何运行项目
1. 确保后端服务正常运行
   - 后端Flask服务已经在 http://localhost:5000 上启动
   - 服务同时提供API接口和静态文件访问
2. 访问前端界面
   
   - 直接在浏览器中打开 http://localhost:5000
   - 或者刷新刚才打开的预览窗口

豆包补充：

没问题，我会用更详细的步骤说明，你可以跟着一步步操作：


### **第一步：确认你已经做好这些准备**
在开始之前，你需要先有这些东西（如果还没有，可能需要先解决）：  
1. 电脑上已经安装了 **Python**（Flask是Python的框架，必须先装Python）。  
   - 检查方法：打开“命令提示符”（Windows）或“终端”（Mac/Linux），输入 `python --version` 或 `python3 --version`，如果显示类似“Python 3.9.7”的版本号，说明已安装；如果提示“不是内部命令”，需要先去[Python官网](https://www.python.org/)下载安装（记得安装时勾选“Add Python to PATH”）。  
2. 你已经有了这个项目的代码（比如从文件夹里找到项目文件，通常会有一个类似 `app.py`、`main.py` 的主文件，以及 `requirements.txt` 这样的依赖文件）。  


### **第二步：启动后端Flask服务（关键步骤）**
后端服务是项目的“发动机”，必须先启动它，前端才能正常运行。步骤如下：  

1. **找到项目存放的文件夹**  
   比如你的项目代码存在 `D:\my_project`（Windows）或 `~/Documents/my_project`（Mac/Linux）这样的文件夹里，先记住这个路径。  

2. **打开“命令提示符”或“终端”**  
   - Windows：按下 `Win + R`，输入 `cmd`，回车，打开“命令提示符”。  
   - Mac：按下 `Command + 空格`，输入 `终端`，回车，打开“终端”。  

3. **进入项目文件夹**  
   在打开的“命令提示符”或“终端”里，输入 `cd 项目路径`，然后回车。  
   举例：如果项目在 `D:\my_project`，就输入 `cd D:\my_project`（Windows）；如果在 `~/Documents/my_project`，就输入 `cd ~/Documents/my_project`（Mac/Linux）。  
   （如果输入后提示“找不到路径”，检查一下路径是否输对，比如文件夹名字有没有写错）  

4. **安装项目需要的依赖**  
   项目运行需要一些Python工具（比如Flask本身），通常项目里会有一个叫 `requirements.txt` 的文件，里面列了所有需要的工具。  
   在终端里输入以下命令，然后回车（耐心等一会儿，会自动下载安装）：  
   ```bash
   pip install -r requirements.txt
   ```  
   （如果提示“pip不是内部命令”，试试用 `pip3 install -r requirements.txt`）  

5. **启动Flask服务**  
   安装完依赖后，输入启动命令（不同项目的启动命令可能不同，通常会在项目说明里写，常见的有这两种）：  
   - 方式1：输入 `python app.py`（如果主文件叫 `app.py`）  
   - 方式2：输入 `flask run`（如果项目用了Flask的默认配置）  
   回车后，终端会显示类似这样的信息：  
   ```
   * Serving Flask app 'app' (lazy loading)
   * Environment: development
   * Running on http://localhost:5000/ (Press CTRL+C to quit)
   ```  
   看到 `http://localhost:5000` 就说明后端服务启动成功了！（注意：这个终端窗口不要关掉，关掉服务就停了）  


### **第三步：访问前端界面**
后端启动后，就可以打开前端页面了：  

1. **打开浏览器**  
   打开你常用的浏览器（比如Chrome、Edge、 Firefox等）。  

2. **在地址栏输入网址**  
   在浏览器最上面的地址栏里，输入 `http://localhost:5000`，然后回车。  

3. **查看结果**  
   这时候应该就能看到项目的前端界面了。如果之前已经打开过这个网址，按一下浏览器的“刷新”按钮（通常是一个圆形箭头）就行。  


### **如果遇到问题，可以检查这些**
- 后端启动失败？可能是依赖没装对（重新执行 `pip install -r requirements.txt`），或者端口被占用（试试关掉其他可能用了5000端口的程序，再重新启动）。  
- 浏览器打不开页面？先检查终端里是否显示 `Running on http://localhost:5000`（确认服务在运行），再检查网址是否输错（有没有多写或少写字符）。  

按这些步骤操作，应该就能正常运行项目了～

## 如何使用TodoList系统
1. 添加新任务
   
   - 在顶部输入区填写任务标题
   - 选择任务分类（学习/工作/生活）
   - 设置优先级（低/中/高）
   - 可选：设置截止时间
   - 点击「添加任务」按钮

2. 任务管理功能
   
   - 标记完成 ：点击任务旁的「完成」按钮
   - 删除任务 ：点击任务旁的「删除」按钮
   - 搜索任务 ：在搜索框中输入关键词，点击「搜索」按钮
3. 筛选和排序功能
   
   - 按分类筛选 ：从分类下拉菜单选择特定分类
   - 按优先级筛选 ：从优先级下拉菜单选择特定优先级
   - 按状态筛选 ：从状态下拉菜单选择（未完成/已完成/已截止）
   - 按时间排序 ：从排序方式按钮选择排序方式
   - 显示全部 ：点击「显示全部」按钮清除所有筛选条件

## 数据持久化说明
- 所有任务数据自动保存到 tasks.json 文件中
- 刷新页面或重启服务后数据不会丢失
- 已完成的任务会显示为灰色并带有删除线
- 已截止的任务会有特殊高亮显示

# Lab3笔记

## 过程(简陋log)

### 阶段一：准备工作

+ 基于助教的prompt让豆包帮忙生成一个更复杂的prompt并转为英语版本（方便后续操作）

+ 选择vibe coding的Agent和软件（看看哪个效果好）
    + trae IDE
    + replit
    + base44

+ 耗时: 约0.5h

p.s. 最后只用了trae，因为感觉效果还可以

### 阶段二：

计算时间

trae IDE start at 14:44
+ init start at 14:46
+ debug-back-end start at 14:50
+ debug-back-end finished at 15:50
+ debug-front-end-UI start at 15:55

+ debug-front-back-connect finished at 16:08
+ debug-date-picker-logic finished at 17:03

+ debug-sift-logic start at 18:48
+ debug-sift-logic finished at 18:59
+ debug-addtask-uiupdate-logic finished at 19:06
+ debug-task-ui-displayerror finished at 19:30
+ adding-one-tick-all-feature finished at 20:11

耗时：约3h

### 阶段三：前端美化

19:12 尝试生成更准确的描述UI的prompt
20:19 开始更新UI
20:48 休息
22:27 继续美化

耗时：约3h

## 感想

代码框架和大体内容其实两分钟就生成好了，最耗时的是对某个具体功能的debug和具体UI的优化，尤其是UI/UX设计方面没有专业知识和工具经验(figma这种设计软件)，直接写prompt也很难直接丈量想要的效果，只能通过不断尝试和调整来实现。

如果在前端设计方面使用更专业一点的Agent可能审美效果会更好一些。

我一开始尝试直接把所有想要调整的UI元素都写在prompt里，但是效果不是很理想。后面改为逐个逐个调整，效果会更好。