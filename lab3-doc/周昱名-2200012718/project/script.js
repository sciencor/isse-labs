// 全局变量
let currentCategoryFilter = '';
let currentPriorityFilter = '';
let allTasks = [];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 绑定事件监听器
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskTitle').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // 绑定筛选按钮事件
    bindFilterEvents();
    
    // 加载任务列表
    loadTasks();
});

// 绑定筛选按钮事件
function bindFilterEvents() {
    // 类别筛选
    const categoryFilters = document.getElementById('categoryFilters');
    categoryFilters.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            const category = e.target.getAttribute('data-category');
            setCategoryFilter(category);
            
            // 更新按钮状态
            const buttons = categoryFilters.getElementsByClassName('filter-btn');
            for (let button of buttons) {
                button.classList.remove('active');
            }
            e.target.classList.add('active');
        }
    });
    
    // 优先级筛选
    const priorityFilters = document.getElementById('priorityFilters');
    priorityFilters.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            const priority = e.target.getAttribute('data-priority');
            setPriorityFilter(priority);
            
            // 更新按钮状态
            const buttons = priorityFilters.getElementsByClassName('filter-btn');
            for (let button of buttons) {
                button.classList.remove('active');
            }
            e.target.classList.add('active');
        }
    });
}

// 加载任务列表
async function loadTasks() {
    try {
        let url = 'http://localhost:5000/tasks';
        const params = [];
        
        if (currentCategoryFilter) {
            params.push(`category=${currentCategoryFilter}`);
        }
        if (currentPriorityFilter) {
            params.push(`priority=${currentPriorityFilter}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.status === 'success') {
            allTasks = result.data;
            renderTasks(allTasks);
        } else {
            showError('加载任务失败: ' + result.message);
        }
    } catch (error) {
        showError('网络错误: ' + error.message);
    }
}

// 渲染任务列表
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="icon">📝</div>
                <p>暂无任务，添加一个新任务开始吧！</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id}, this.checked)">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-category ${task.category}">${task.category}</span>
                    <span class="task-priority ${task.priority}">${task.priority}优先级</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 添加任务
async function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const categorySelect = document.getElementById('taskCategory');
    const prioritySelect = document.getElementById('taskPriority');
    
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const priority = prioritySelect.value;

    if (!title) {
        showError('请输入任务标题');
        titleInput.focus();
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                category: category,
                priority: priority
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            // 清空输入框
            titleInput.value = '';
            // 重新加载任务列表
            loadTasks();
        } else {
            showError('添加任务失败: ' + result.message);
        }
    } catch (error) {
        showError('网络错误: ' + error.message);
    }
}

// 切换任务完成状态
async function toggleTask(taskId, completed) {
    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: completed
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadTasks();
        } else {
            showError('更新任务失败: ' + result.message);
            // 重新加载任务列表以恢复状态
            loadTasks();
        }
    } catch (error) {
        showError('网络错误: ' + error.message);
        // 重新加载任务列表以恢复状态
        loadTasks();
    }
}

// 删除任务
async function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.status === 'success') {
            loadTasks();
        } else {
            showError('删除任务失败: ' + result.message);
        }
    } catch (error) {
        showError('网络错误: ' + error.message);
    }
}

// 设置类别筛选
function setCategoryFilter(category) {
    currentCategoryFilter = category;
    loadTasks();
}

// 设置优先级筛选
function setPriorityFilter(priority) {
    currentPriorityFilter = priority;
    loadTasks();
}

// 显示错误信息
function showError(message) {
    // 创建错误提示元素
    let errorDiv = document.querySelector('.error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        document.querySelector('.content').insertBefore(errorDiv, document.querySelector('.add-task-form').nextSibling);
    }
    
    errorDiv.textContent = message;
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.remove();
        }
    }, 3000);
}

// HTML转义，防止XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}