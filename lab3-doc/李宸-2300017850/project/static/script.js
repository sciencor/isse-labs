// TodoList应用主模块
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = {
            category: 'all',
            priority: 'all'
        };
        
        // DOM元素
        this.taskInput = document.getElementById('taskInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // 初始化应用
        this.init();
    }
    
    // 初始化应用
    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.updateProgress();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 添加任务按钮点击事件
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        
        // 输入框回车事件
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // 筛选按钮点击事件
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // 任务列表事件委托
        this.taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('complete-btn')) {
                const taskId = parseInt(e.target.dataset.id);
                this.completeTaskWithAnimation(taskId);
            } else if (e.target.classList.contains('delete-btn')) {
                const taskId = parseInt(e.target.dataset.id);
                this.deleteTaskWithAnimation(taskId);
            }
        });
    }
    
    // 加载任务列表
    async loadTasks() {
        try {
            // 构建查询参数
            const params = new URLSearchParams();
            if (this.currentFilter.category !== 'all') {
                params.append('category', this.currentFilter.category);
            }
            if (this.currentFilter.priority !== 'all') {
                params.append('priority', this.currentFilter.priority);
            }
            
            const queryString = params.toString();
            const url = queryString ? `/tasks?${queryString}` : '/tasks';
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.status === 'success') {
                this.tasks = result.data;
                this.renderTasks();
                this.updateProgress();
            } else {
                console.error('获取任务失败:', result.message);
                this.showMessage('获取任务失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('加载任务时出错:', error);
            this.showMessage('加载任务失败，请检查网络连接', 'error');
        }
    }
    
    // 添加新任务
    async addTask() {
        const title = this.taskInput.value.trim();
        const category = this.categorySelect.value;
        const priority = this.prioritySelect.value;
        
        if (!title) {
            this.showMessage('请输入任务标题', 'warning');
            return;
        }
        
        // 添加加载状态
        const originalText = this.addTaskBtn.textContent;
        this.addTaskBtn.innerHTML = '<div class="loading"></div>';
        this.addTaskBtn.disabled = true;
        
        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    category,
                    priority
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // 清空输入框
                this.taskInput.value = '';
                // 重新加载任务列表
                this.loadTasks();
                this.showMessage('任务添加成功', 'success');
            } else {
                this.showMessage('添加任务失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('添加任务时出错:', error);
            this.showMessage('添加任务失败，请检查网络连接', 'error');
        } finally {
            // 恢复按钮状态
            this.addTaskBtn.textContent = originalText;
            this.addTaskBtn.disabled = false;
        }
    }
    
    // 标记任务完成（带动画）
    async completeTaskWithAnimation(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskElement) return;
        
        // 添加完成样式
        taskElement.classList.add('completed');
        
        try {
            const response = await fetch(`/tasks/${taskId}/complete`, {
                method: 'PUT'
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // 添加消失动画
                taskElement.classList.add('fade-out');
                
                // 动画完成后重新加载列表
                setTimeout(() => {
                    this.loadTasks();
                    this.showMessage('任务标记为完成', 'success');
                }, 800);
            } else {
                // 移除完成样式
                taskElement.classList.remove('completed');
                this.showMessage('标记任务完成失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('标记任务完成时出错:', error);
            taskElement.classList.remove('completed');
            this.showMessage('标记任务失败，请检查网络连接', 'error');
        }
    }
    
    // 删除任务（带动画）
    async deleteTaskWithAnimation(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskElement) return;
        
        if (!confirm('确定要删除这个任务吗？')) {
            return;
        }
        
        // 添加消失动画
        taskElement.classList.add('fade-out');
        
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // 动画完成后重新加载列表
                setTimeout(() => {
                    this.loadTasks();
                    this.showMessage('任务删除成功', 'success');
                }, 800);
            } else {
                // 移除动画样式
                taskElement.classList.remove('fade-out');
                this.showMessage('删除任务失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('删除任务时出错:', error);
            taskElement.classList.remove('fade-out');
            this.showMessage('删除任务失败，请检查网络连接', 'error');
        }
    }
    
    // 处理筛选按钮点击
    handleFilterClick(e) {
        const btn = e.target;
        const filterType = btn.dataset.filter ? 'category' : 'priority';
        const value = btn.dataset.filter || btn.dataset.priority;
        
        // 更新当前筛选状态
        this.currentFilter[filterType] = value;
        
        // 更新按钮激活状态
        const parentGroup = btn.parentElement;
        parentGroup.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // 重新加载任务列表
        this.loadTasks();
    }
    
    // 渲染任务列表
    renderTasks() {
        // 清空任务列表
        this.taskList.innerHTML = '';
        
        // 如果没有任务，显示空状态
        if (this.tasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="icon">📝</div>
                <p>没有找到匹配的任务</p>
                <p>添加一个新任务开始吧！</p>
            `;
            this.taskList.appendChild(emptyState);
            return;
        }
        
        // 渲染每个任务
        this.tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.setAttribute('data-task-id', task.id);
            
            taskItem.innerHTML = `
                <div class="task-info">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="task-category">${this.escapeHtml(task.category)}</span>
                        <span class="task-priority ${task.priority}">${this.escapeHtml(task.priority)}优先级</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.completed ? '100%' : '0%'}"></div>
                    </div>
                </div>
                <div class="task-actions">
                    ${!task.completed ? 
                        `<button class="complete-btn" data-id="${task.id}">完成</button>` : 
                        ''
                    }
                    <button class="delete-btn" data-id="${task.id}">删除</button>
                </div>
            `;
            
            this.taskList.appendChild(taskItem);
            
            // 为已完成任务添加进度条动画
            if (task.completed) {
                setTimeout(() => {
                    const progressFill = taskItem.querySelector('.progress-fill');
                    if (progressFill) {
                        progressFill.style.width = '100%';
                    }
                }, 100);
            }
        });
    }
    
    // 更新进度指示器
    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        // 更新进度条（如果存在）
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progressFill = progressBar.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
        }
        
        // 更新标题显示进度
        const title = document.querySelector('h1');
        if (title && totalTasks > 0) {
            const originalText = 'TodoList 任务管理系统';
            title.textContent = `${originalText} (${completedTasks}/${totalTasks})`;
        }
    }
    
    // 显示消息
    showMessage(message, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 5秒后自动移除
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
    
    // HTML转义，防止XSS攻击
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});