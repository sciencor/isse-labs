// API 基础 URL
const API_BASE_URL = 'http://localhost:5000';

// DOM 元素
const taskTitleInput = document.getElementById('task-title');
const taskCategorySelect = document.getElementById('task-category');
const taskPrioritySelect = document.getElementById('task-priority');
const taskDeadlineInput = document.getElementById('task-deadline');
const addTaskBtn = document.getElementById('add-task-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterCategorySelect = document.getElementById('filter-category');
const filterPrioritySelect = document.getElementById('filter-priority');
const filterStatusSelect = document.getElementById('filter-status');
const sortOptionSelect = document.getElementById('sort-option');
const showAllBtn = document.getElementById('show-all-btn');
const tasksContainer = document.getElementById('tasks-container');

// 初始化页面
window.addEventListener('DOMContentLoaded', () => {
    // 设置默认截止时间为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().slice(0, 16);
    taskDeadlineInput.value = formattedDate;
    
    // 加载任务
    loadTasks();
    
    // 添加事件监听器
    addTaskBtn.addEventListener('click', addTask);
    searchBtn.addEventListener('click', () => searchTasks(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchTasks(searchInput.value);
    });
    
    filterCategorySelect.addEventListener('change', applyFilters);
    filterPrioritySelect.addEventListener('change', applyFilters);
    filterStatusSelect.addEventListener('change', applyFilters);
    sortOptionSelect.addEventListener('change', applyFilters);
    showAllBtn.addEventListener('click', showAllTasks);
});

/**
 * 加载任务列表
 * @param {Object} filters - 筛选参数
 */
async function loadTasks(filters = {}) {
    try {
        // 构建查询参数
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        
        const queryString = params.toString();
        const url = `${API_BASE_URL}/tasks${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'success') {
            renderTasks(data.data);
        } else {
            console.error('加载任务失败:', data.message);
            showMessage('加载任务失败', 'error');
        }
    } catch (error) {
        console.error('网络错误:', error);
        showMessage('网络错误，请检查后端服务是否运行', 'error');
    }
}

/**
 * 渲染任务列表
 * @param {Array} tasks - 任务数组
 */
function renderTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        const noTasks = document.createElement('div');
        noTasks.className = 'no-tasks';
        noTasks.textContent = '暂无任务，请添加新任务';
        tasksContainer.appendChild(noTasks);
        return;
    }
    
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        
        // 检查任务状态
        const isOverdue = isTaskOverdue(task.deadline);
        const isDeadlineSoon = isTaskDeadlineSoon(task.deadline);
        
        if (task.completed) {
            taskItem.classList.add('task-completed');
        } else if (isOverdue) {
            taskItem.classList.add('task-overdue');
        }
        
        // 任务标题
        const taskTitle = document.createElement('div');
        taskTitle.className = 'task-title';
        taskTitle.textContent = task.title;
        
        // 任务元信息
        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';
        
        // 类别
        const category = document.createElement('span');
        category.className = 'task-category';
        category.textContent = task.category;
        
        // 优先级
        const priority = document.createElement('span');
        priority.className = `task-priority priority-${task.priority === '高' ? 'high' : task.priority === '中' ? 'medium' : 'low'}`;
        priority.textContent = task.priority;
        
        // 截止时间
        const deadline = document.createElement('span');
        deadline.className = `task-deadline ${isDeadlineSoon && !task.completed ? 'deadline-soon' : ''}`;
        deadline.textContent = formatDeadline(task.deadline);
        
        taskMeta.appendChild(category);
        taskMeta.appendChild(priority);
        taskMeta.appendChild(deadline);
        
        // 任务状态
        const status = document.createElement('div');
        status.className = 'task-status';
        
        if (task.completed) {
            status.className += ' status-completed';
            status.textContent = '已完成';
        } else if (isOverdue) {
            status.className += ' status-overdue';
            status.textContent = '已截止';
        } else {
            status.className += ' status-pending';
            status.textContent = '未完成';
        }
        
        // 操作按钮
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = task.completed ? '撤销' : '完成';
        completeBtn.addEventListener('click', () => toggleTask(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);
        
        // 组装任务项
        taskItem.appendChild(taskTitle);
        taskItem.appendChild(taskMeta);
        taskItem.appendChild(status);
        taskItem.appendChild(actions);
        
        tasksContainer.appendChild(taskItem);
    });
}

/**
 * 添加任务
 */
async function addTask() {
    const title = taskTitleInput.value.trim();
    const category = taskCategorySelect.value;
    const priority = taskPrioritySelect.value;
    const deadline = taskDeadlineInput.value;
    
    if (!title) {
        showMessage('请输入任务标题', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                category,
                priority,
                deadline: deadline ? new Date(deadline).toISOString() : null
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // 清空输入框
            taskTitleInput.value = '';
            // 重新加载任务列表
            loadTasks();
            showMessage('任务添加成功', 'success');
        } else {
            showMessage(data.message || '添加任务失败', 'error');
        }
    } catch (error) {
        console.error('添加任务失败:', error);
        showMessage('网络错误，请检查后端服务是否运行', 'error');
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
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // 重新加载任务列表
            loadTasks();
            showMessage('任务删除成功', 'success');
        } else {
            showMessage(data.message || '删除任务失败', 'error');
        }
    } catch (error) {
        console.error('删除任务失败:', error);
        showMessage('网络错误，请检查后端服务是否运行', 'error');
    }
}

/**
 * 切换任务完成状态
 * @param {number} id - 任务ID
 */
async function toggleTask(id) {
    try {
        // 先获取当前任务状态
        const response = await fetch(`${API_BASE_URL}/tasks`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const task = data.data.find(t => t.id === id);
            if (task) {
                // 切换完成状态
                const updateResponse = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completed: !task.completed
                    })
                });
                
                const updateData = await updateResponse.json();
                
                if (updateData.status === 'success') {
                    // 重新加载任务列表
                    loadTasks();
                    showMessage('任务状态更新成功', 'success');
                } else {
                    showMessage(updateData.message || '更新任务状态失败', 'error');
                }
            }
        }
    } catch (error) {
        console.error('更新任务状态失败:', error);
        showMessage('网络错误，请检查后端服务是否运行', 'error');
    }
}

/**
 * 搜索任务
 * @param {string} keyword - 搜索关键词
 */
function searchTasks(keyword) {
    loadTasks({
        search: keyword.trim(),
        category: filterCategorySelect.value,
        priority: filterPrioritySelect.value,
        status: filterStatusSelect.value,
        sort: sortOptionSelect.value
    });
}

/**
 * 应用筛选条件
 */
function applyFilters() {
    loadTasks({
        category: filterCategorySelect.value,
        priority: filterPrioritySelect.value,
        status: filterStatusSelect.value,
        sort: sortOptionSelect.value,
        search: searchInput.value.trim()
    });
}

/**
 * 显示所有任务
 */
function showAllTasks() {
    // 重置所有筛选条件
    filterCategorySelect.value = '';
    filterPrioritySelect.value = '';
    filterStatusSelect.value = '';
    sortOptionSelect.value = '';
    searchInput.value = '';
    
    // 加载所有任务
    loadTasks();
}

/**
 * 检查任务是否已截止
 * @param {string} deadline - 截止时间
 * @returns {boolean} 是否已截止
 */
function isTaskOverdue(deadline) {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
}

/**
 * 检查任务是否即将截止（24小时内）
 * @param {string} deadline - 截止时间
 * @returns {boolean} 是否即将截止
 */
function isTaskDeadlineSoon(deadline) {
    if (!deadline) return false;
    const now = new Date();
    const deadlineTime = new Date(deadline);
    const diffInHours = (deadlineTime - now) / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= 24;
}

/**
 * 格式化截止时间显示
 * @param {string} deadline - 截止时间
 * @returns {string} 格式化后的时间
 */
function formatDeadline(deadline) {
    if (!deadline) return '无截止时间';
    
    try {
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let formattedDate = date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                formattedDate += ` (${diffMinutes}分钟后)`;
            } else {
                formattedDate += ` (${diffHours}小时后)`;
            }
        } else if (diffDays === 1) {
            formattedDate += ' (明天)';
        } else if (diffDays > 1 && diffDays <= 7) {
            formattedDate += ` (${diffDays}天后)`;
        } else if (diffDays < 0) {
            formattedDate += ' (已过期)';
        }
        
        return formattedDate;
    } catch {
        return deadline;
    }
}

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success/error)
 */
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // 设置样式
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '12px 20px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.color = 'white';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    messageDiv.style.opacity = '0';
    messageDiv.style.transition = 'opacity 0.3s';
    
    // 设置背景色
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#dc3545';
    } else {
        messageDiv.style.backgroundColor = '#007bff';
    }
    
    // 添加到页面
    document.body.appendChild(messageDiv);
    
    // 显示消息
    setTimeout(() => {
        messageDiv.style.opacity = '1';
    }, 10);
    
    // 3秒后隐藏并移除
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}