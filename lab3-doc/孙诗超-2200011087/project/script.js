// API基础URL
const API_BASE = 'http://localhost:5000/api';

// 当前过滤状态
let currentFilter = 'all';
let currentPriority = 'all';
let currentCategory = 'all';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 表单提交事件
    const form = document.getElementById('todo-form');
    form.addEventListener('submit', handleFormSubmit);
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const todoData = {
        content: formData.get('content'),
        category: formData.get('category'),
        priority: formData.get('priority')
    };
    
    try {
        const response = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoData)
        });
        
        if (response.ok) {
            // 清空表单
            event.target.reset();
            // 重新加载待办事项
            loadTodos();
            // 显示成功消息
            showMessage('任务添加成功！', 'success');
        } else {
            const error = await response.json();
            showMessage(`添加失败: ${error.error}`, 'error');
        }
    } catch (error) {
        showMessage('网络错误，请检查服务器是否运行', 'error');
    }
}

// 加载所有待办事项
async function loadTodos() {
    try {
        const response = await fetch(`${API_BASE}/todos`);
        const todos = await response.json();
        
        displayTodos(todos);
        updateStats(todos);
    } catch (error) {
        console.error('加载待办事项失败:', error);
        showMessage('无法连接到服务器', 'error');
    }
}

// 显示待办事项列表
function displayTodos(todos) {
    const container = document.getElementById('todo-items');
    
    if (todos.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无待办事项，开始添加第一个任务吧！</div>';
        updateCategoryFilter(todos);
        return;
    }
    
    // 根据当前过滤状态筛选待办事项
    const filteredTodos = todos.filter(todo => {
        // 状态筛选
        let statusMatch = true;
        switch (currentFilter) {
            case 'active':
                statusMatch = !todo.completed;
                break;
            case 'completed':
                statusMatch = todo.completed;
                break;
            default:
                statusMatch = true;
        }
        
        // 优先级筛选
        let priorityMatch = true;
        if (currentPriority !== 'all') {
            priorityMatch = todo.priority === currentPriority;
        }
        
        // 分类筛选
        let categoryMatch = true;
        if (currentCategory !== 'all') {
            categoryMatch = todo.category === currentCategory;
        }
        
        return statusMatch && priorityMatch && categoryMatch;
    });
    
    // 更新分类筛选器选项
    updateCategoryFilter(todos);
    
    if (filteredTodos.length === 0) {
        container.innerHTML = '<div class="empty-state">没有找到符合条件的任务</div>';
        return;
    }
    
    container.innerHTML = filteredTodos.map((todo, index) => createTodoHTML(todo, index)).join('');
}

// 更新分类筛选器选项
function updateCategoryFilter(todos) {
    const categorySelect = document.getElementById('category-filter');
    
    // 获取所有唯一的分类
    const categories = [...new Set(todos.map(todo => todo.category))].sort();
    
    // 保存当前选中的值
    const currentValue = categorySelect.value;
    
    // 清空现有选项（保留"全部分类"选项）
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    
    // 添加新的分类选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // 恢复之前选中的值（如果仍然存在）
    if (categorySelect.querySelector(`option[value="${currentValue}"]`)) {
        categorySelect.value = currentValue;
    } else {
        categorySelect.value = 'all';
    }
}

// 创建单个待办事项的HTML
function createTodoHTML(todo, index) {
    const completedClass = todo.completed ? 'completed' : '';
    const priorityClass = `priority-${getPriorityClass(todo.priority)}`;
    
    return `
        <div class="todo-item ${completedClass} ${getPriorityClass(todo.priority)}-priority" data-id="${index}">
            <div class="todo-content ${completedClass}">
                <h3>${escapeHtml(todo.content)}</h3>
                <div class="todo-meta">
                    <span>分类: ${escapeHtml(todo.category)}</span>
                    <span class="${priorityClass}">优先级: ${escapeHtml(todo.priority)}</span>
                    <span>创建: ${formatDate(todo.created_at)}</span>
                </div>
            </div>
            <div class="todo-actions">
                ${todo.completed ? 
                    `<button class="btn btn-secondary" onclick="markIncomplete(${index})">标记未完成</button>` :
                    `<button class="btn btn-success" onclick="markComplete(${index})">标记完成</button>`
                }
                <button class="btn btn-danger" onclick="deleteTodo(${index})">删除</button>
            </div>
        </div>
    `;
}

// 标记任务为完成
async function markComplete(todoId) {
    try {
        const response = await fetch(`${API_BASE}/todos/${todoId}/complete`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            loadTodos();
            showMessage('任务标记为完成！', 'success');
        } else {
            const error = await response.json();
            showMessage(`操作失败: ${error.error}`, 'error');
        }
    } catch (error) {
        showMessage('网络错误', 'error');
    }
}

// 标记任务为未完成
async function markIncomplete(todoId) {
    try {
        const response = await fetch(`${API_BASE}/todos/${todoId}/incomplete`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            loadTodos();
            showMessage('任务标记为未完成！', 'success');
        } else {
            const error = await response.json();
            showMessage(`操作失败: ${error.error}`, 'error');
        }
    } catch (error) {
        showMessage('网络错误', 'error');
    }
}

// 删除任务
async function deleteTodo(todoId) {
    if (!confirm('确定要删除这个任务吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/todos/${todoId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTodos();
            showMessage('任务删除成功！', 'success');
        } else {
            const error = await response.json();
            showMessage(`删除失败: ${error.error}`, 'error');
        }
    } catch (error) {
        showMessage('网络错误', 'error');
    }
}

// 过滤待办事项
function filterTodos(filter) {
    currentFilter = filter;
    
    // 更新状态筛选按钮状态
    document.querySelectorAll('.filter-group:first-child .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新加载并显示过滤后的待办事项
    loadTodos();
}

// 按优先级筛选
function filterByPriority(priority) {
    currentPriority = priority;
    
    // 更新优先级筛选按钮状态
    document.querySelectorAll('.filter-group:nth-child(2) .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新加载并显示过滤后的待办事项
    loadTodos();
}

// 按分类筛选
function filterByCategory(category) {
    currentCategory = category;
    loadTodos();
}

// 清除所有筛选
function clearFilters() {
    currentFilter = 'all';
    currentPriority = 'all';
    currentCategory = 'all';
    
    // 重置所有按钮状态
    document.querySelectorAll('.filter-controls .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 重置分类选择框
    document.getElementById('category-filter').value = 'all';
    
    // 重新加载并显示所有待办事项
    loadTodos();
}

// 更新统计信息
function updateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    document.getElementById('total-todos').textContent = total;
    document.getElementById('completed-todos').textContent = completed;
    document.getElementById('pending-todos').textContent = pending;
}

// 显示消息
function showMessage(message, type) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        ${type === 'success' ? 'background: #38a169;' : 'background: #e53e3e;'}
    `;
    
    document.body.appendChild(messageEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// 工具函数：获取优先级CSS类
function getPriorityClass(priority) {
    switch (priority) {
        case '高': return 'high';
        case '中': return 'medium';
        case '低': return 'low';
        default: return 'medium';
    }
}

// 工具函数：转义HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 工具函数：格式化日期
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);