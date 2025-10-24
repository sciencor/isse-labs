// API基础URL
const API_BASE = '/tasks';

// 全局变量存储当前筛选条件
let currentCategoryFilter = null;
let currentPriorityFilter = null;

/**
 * 获取所有任务
 */
async function loadTasks() {
    try {
        const response = await fetch('/tasks');
        const result = await response.json();
        if (result.status === 'success') {
            return result.data;
        } else {
            console.error('获取任务失败:', result.message);
            return [];
        }
    } catch (error) {
        console.error('请求失败:', error);
        return [];
    }
}

/**
 * 添加新任务
 */
async function addTask() {
    const title = document.getElementById('taskInput').value.trim();
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    
    if (!title) {
        alert('请输入任务标题');
        return;
    }
    
    const newTask = {
        title: title,
        priority: priority,
        category: category,
        completed: false
    };
    
    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            document.getElementById('taskInput').value = '';
            renderTasks();
        } else {
            alert('添加任务失败: ' + result.message);
        }
    } catch (error) {
        console.error('添加任务失败:', error);
        alert('网络错误，请重试');
    }
}

/**
 * 删除任务
 * @param {number} id - 任务ID
 */
async function deleteTask(id) {
    if (!confirm('确定要删除这个任务吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/tasks/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            renderTasks();
        } else {
            alert('删除任务失败: ' + result.message);
        }
    } catch (error) {
        console.error('删除任务失败:', error);
        alert('网络错误，请重试');
    }
}

/**
 * 切换任务完成状态
 * @param {number} id - 任务ID
 * @param {boolean} completed - 是否完成
 */
async function toggleTask(id, completed) {
    try {
        const response = await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: completed })
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            renderTasks();
        } else {
            alert('更新任务状态失败: ' + result.message);
        }
    } catch (error) {
        console.error('更新任务状态失败:', error);
        alert('网络错误，请重试');
    }
}

/**
 * 筛选任务
 * @param {string} filterType - 筛选类型
 */
function filterTasks(filterType) {
    // 根据筛选类型更新过滤条件
    if (filterType === 'all') {
        currentCategoryFilter = null;
        currentPriorityFilter = null;
    } else if (filterType === '学习' || filterType === '工作' || filterType === '生活') {
        // 切换类别筛选
        if (currentCategoryFilter === filterType) {
            currentCategoryFilter = null;  // 取消选择
        } else {
            currentCategoryFilter = filterType;
        }
    } else if (filterType === 'high' || filterType === 'medium' || filterType === 'low') {
        // 切换优先级筛选
        if (currentPriorityFilter === filterType) {
            currentPriorityFilter = null;  // 取消选择
        } else {
            currentPriorityFilter = filterType;
        }
    }
    
    // 更新按钮状态
    updateFilterButtonStates();
    
    // 重新渲染任务列表
    renderTasks();
}

/**
 * 更新筛选按钮的状态
 */
function updateFilterButtonStates() {
    // 清除所有按钮的active类
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    // 如果没有筛选条件，激活"全部"按钮
    if (!currentCategoryFilter && !currentPriorityFilter) {
        document.querySelector('[data-filter="all"]').classList.add('active');
        return;
    }
    
    // 激活对应的筛选按钮
    if (currentCategoryFilter) {
        document.querySelector(`[data-filter="${currentCategoryFilter}"]`).classList.add('active');
    }
    
    if (currentPriorityFilter) {
        document.querySelector(`[data-filter="${currentPriorityFilter}"]`).classList.add('active');
    }
}

/**
 * 渲染任务列表
 */
async function renderTasks() {
    const tasks = await loadTasks();
    const taskList = document.getElementById('taskList');
    
    // 根据当前筛选条件过滤任务
    let filteredTasks = tasks;
    
    // 应用类别筛选
    if (currentCategoryFilter) {
        filteredTasks = filteredTasks.filter(task => task.category === currentCategoryFilter);
    }
    
    // 应用优先级筛选
    if (currentPriorityFilter) {
        const priorityMap = {
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        filteredTasks = filteredTasks.filter(task => task.priority === priorityMap[currentPriorityFilter]);
    }
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <h3>暂无任务</h3>
                <p>添加新任务开始管理您的日程</p>
            </div>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // 根据优先级设置左侧边框颜色
        let leftBorderColor = 'transparent';
        if (task.priority === '高') {
            leftBorderColor = '#e53935';
        } else if (task.priority === '中') {
            leftBorderColor = '#ffb142';
        } else if (task.priority === '低') {
            leftBorderColor = '#24a0ed';
        }
        
        taskItem.style.borderLeftColor = leftBorderColor;
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id}, this.checked)">
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-priority ${task.priority.toLowerCase()}">${task.priority}优先级</span>
                    <span class="task-category">${task.category}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">删除</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    
    // 添加任务按钮事件
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    
    // 回车键添加任务
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // 筛选按钮事件
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            filterTasks(filterType);
        });
    });
});