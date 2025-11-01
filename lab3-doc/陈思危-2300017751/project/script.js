// API 基础URL
const API_BASE = 'http://localhost:5000/api';

// DOM 元素
const todosList = document.getElementById('todos-list');
const completedTodosList = document.getElementById('completed-todos');
const todoTitle = document.getElementById('todo-title');
const todoDescription = document.getElementById('todo-description');
const todoPriority = document.getElementById('todo-priority');
const todoCategory = document.getElementById('todo-category');
const todoDeadline = document.getElementById('todo-deadline');
const addBtn = document.getElementById('add-btn');
const emptyState = document.getElementById('empty-state');
const completedIndicator = document.getElementById('completed-indicator');
const completedTasksList = document.getElementById('completed-tasks-list');
const completedCountBadge = document.getElementById('completed-count-badge');

// 筛选元素
const filterCategory = document.getElementById('filter-category');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');
const sortBy = document.getElementById('sort-by');

// 统计元素
const totalCount = document.getElementById('total-count');
const pendingCount = document.getElementById('pending-count');
const overdueCount = document.getElementById('overdue-count');

// 模态框元素
const editModal = document.getElementById('edit-modal');
const closeModal = document.getElementById('close-modal');
const editTodoId = document.getElementById('edit-todo-id');
const editTodoTitle = document.getElementById('edit-todo-title');
const editTodoDescription = document.getElementById('edit-todo-description');
const editTodoPriority = document.getElementById('edit-todo-priority');
const editTodoCategory = document.getElementById('edit-todo-category');
const editTodoDeadline = document.getElementById('edit-todo-deadline');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// 全局数据
let allTodos = [];
let currentFilters = {
    category: '',
    priority: '',
    status: '',
    sortBy: 'deadline'
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    loadCategories();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 添加任务
    addBtn.addEventListener('click', addTodo);
    todoTitle.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
    
    // 筛选事件
    filterCategory.addEventListener('change', function() {
        currentFilters.category = this.value;
        applyFilters();
    });
    
    filterPriority.addEventListener('change', function() {
        currentFilters.priority = this.value;
        applyFilters();
    });
    
    filterStatus.addEventListener('change', function() {
        currentFilters.status = this.value;
        applyFilters();
    });
    
    sortBy.addEventListener('change', function() {
        currentFilters.sortBy = this.value;
        applyFilters();
    });
    
    // 已完成任务区域折叠/展开
    completedIndicator.addEventListener('click', toggleCompletedTasks);
    
    // 模态框事件
    closeModal.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEdit);
    
    // 点击模态框外部关闭
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// 加载所有todos
async function loadTodos() {
    try {
        const params = new URLSearchParams();
        params.append('sort_by', currentFilters.sortBy);
        
        const response = await fetch(`${API_BASE}/todos?${params.toString()}`);
        if (response.ok) {
            allTodos = await response.json();
            applyFilters();
            updateStats();
        } else {
            showError('加载任务失败');
        }
    } catch (error) {
        console.error('加载任务失败:', error);
        showError('网络连接失败，请检查后端服务是否启动');
    }
}

// 加载分类列表
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
            const categories = await response.json();
            // 确保默认分类在列表中
            if (!categories.includes('默认分类')) {
                categories.unshift('默认分类');
            }
            updateCategoryFilter(categories);
        }
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

// 更新分类筛选下拉框
function updateCategoryFilter(categories) {
    const currentValue = filterCategory.value;
    filterCategory.innerHTML = '<option value="">所有分类</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategory.appendChild(option);
    });
    
    filterCategory.value = currentValue;
}

// 应用筛选（主列表只显示未完成任务）
function applyFilters() {
    // 分离已完成和未完成任务
    const completedTodos = allTodos.filter(todo => todo.completed);
    let pendingTodos = allTodos.filter(todo => !todo.completed);
    
    // 筛选未完成任务
    if (currentFilters.category) {
        pendingTodos = pendingTodos.filter(todo => 
            todo.category === currentFilters.category
        );
    }
    
    if (currentFilters.priority) {
        pendingTodos = pendingTodos.filter(todo => 
            todo.priority === currentFilters.priority
        );
    }
    
    if (currentFilters.status) {
        pendingTodos = pendingTodos.filter(todo => 
            todo.status === currentFilters.status
        );
    }
    
    // 排序
    pendingTodos.sort(getSortFunction());
    completedTodos.sort(getSortFunction());
    
    // 渲染列表
    renderTodos(pendingTodos);
    renderCompletedTodos(completedTodos);
    
    // 更新已完成任务计数
    completedCountBadge.textContent = completedTodos.length;
    // 控制已完成区域显示
    document.querySelector('.completed-tasks-section').style.display = 
        completedTodos.length > 0 ? 'block' : 'none';
}

// 获取排序函数
function getSortFunction() {
    return (a, b) => {
        if (currentFilters.sortBy === 'deadline') {
            return new Date(a.deadline || '') - new Date(b.deadline || '');
        }
        if (currentFilters.sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (currentFilters.sortBy === 'title') {
            return a.title.localeCompare(b.title);
        }
        return 0;
    };
}

// 渲染待办任务列表
function renderTodos(todos) {
    todosList.innerHTML = '';
    
    if (todos.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo, false);
        todosList.appendChild(todoItem);
    });
}

// 渲染已完成任务列表
function renderCompletedTodos(todos) {
    completedTodosList.innerHTML = '';
    
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo, true);
        completedTodosList.appendChild(todoItem);
    });
}

// 创建单个任务元素
function createTodoElement(todo, isCompleted) {
    const li = document.createElement('li');
    li.className = `todo-item ${isCompleted ? 'completed' : ''}`;
    if (todo.status && !isCompleted) li.classList.add(`status-${todo.status}`);
    
    const priorityClass = `priority-${todo.priority}`;
    const toggleText = isCompleted ? '取消完成' : '标记完成';
    const toggleClass = isCompleted ? 'completed' : '';
    
    // 构建截止日期显示
    let deadlineHtml = '';
    if (todo.deadline) {
        const deadlineDate = new Date(todo.deadline);
        const formattedDate = deadlineDate.toLocaleDateString('zh-CN');
        
        // 未完成任务才检查过期
        const isOverdue = !isCompleted && deadlineDate < new Date() && 
                         new Date(deadlineDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
        
        deadlineHtml = `<span class="deadline-badge ${isOverdue ? 'overdue' : ''}">
                        截止: ${formattedDate}
                      </span>`;
    }
    
    li.innerHTML = `
        <div class="todo-header">
            <div class="todo-content">
                <div class="todo-title ${isCompleted ? 'completed' : ''}">
                    ${escapeHtml(todo.title)}
                </div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-meta">
                    <span class="priority-badge ${priorityClass}">
                        ${getPriorityText(todo.priority)}
                    </span>
                    <span class="category-badge">${escapeHtml(todo.category || '默认分类')}</span>
                    ${deadlineHtml}
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn-sm btn-toggle ${toggleClass}" onclick="toggleTodo(${todo.id})">
                    ${toggleText}
                </button>
                <button class="btn-sm btn-edit" onclick="editTodo(${todo.id})">
                    编辑
                </button>
                <button class="btn-sm btn-delete" onclick="deleteTodo(${todo.id})">
                    删除
                </button>
            </div>
        </div>
    `;
    
    return li;
}

// 切换已完成任务区域显示/隐藏
function toggleCompletedTasks() {
    const isVisible = completedTasksList.style.display !== 'none';
    completedTasksList.style.display = isVisible ? 'none' : 'block';
    document.querySelector('.toggle-icon').textContent = isVisible ? '▼' : '▲';
}

// 添加新任务（分类默认值处理）
async function addTodo() {
    const title = todoTitle.value.trim();
    if (!title) {
        showError('请输入任务标题');
        return;
    }
    
    // 分类为空时设置为默认分类
    const category = todoCategory.value.trim() || '默认分类';
    
    const todoData = {
        title: title,
        description: todoDescription.value.trim(),
        priority: todoPriority.value,
        category: category,
        deadline: todoDeadline.value ? new Date(todoDeadline.value).toISOString().split('T')[0] : null
    };
    
    try {
        const response = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todoData)
        });
        
        if (response.ok) {
            // 清空表单
            todoTitle.value = '';
            todoDescription.value = '';
            todoPriority.value = 'low';
            todoCategory.value = '';
            todoDeadline.value = '';
            
            // 重新加载数据
            await loadTodos();
            await loadCategories();
            showSuccess('任务添加成功');
        } else {
            const error = await response.json();
            showError(error.error || '添加任务失败');
        }
    } catch (error) {
        console.error('添加任务失败:', error);
        showError('网络连接失败');
    }
}

// 切换任务完成状态
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/todos/${id}/toggle`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            await loadTodos();
        } else {
            showError('更新状态失败');
        }
    } catch (error) {
        console.error('更新状态失败:', error);
        showError('网络连接失败');
    }
}

// 删除任务
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadTodos();
            await loadCategories();
            showSuccess('任务已删除');
        } else {
            showError('删除任务失败');
        }
    } catch (error) {
        console.error('删除任务失败:', error);
        showError('网络连接失败');
    }
}

// 编辑任务（分类默认值处理）
function editTodo(id) {
    const todo = allTodos.find(t => t.id === id);
    if (!todo) return;
    
    editTodoId.value = id;
    editTodoTitle.value = todo.title;
    editTodoDescription.value = todo.description || '';
    editTodoPriority.value = todo.priority;
    editTodoCategory.value = todo.category || ''; // 回显当前分类，为空时显示空
    
    // 设置截止日期
    if (todo.deadline) {
        editTodoDeadline.value = todo.deadline.split('T')[0];
    } else {
        editTodoDeadline.value = '';
    }
    
    editModal.style.display = 'flex';
}

// 保存编辑（分类默认值处理）
async function saveEdit() {
    const id = parseInt(editTodoId.value);
    const title = editTodoTitle.value.trim();
    
    if (!title) {
        showError('请输入任务标题');
        return;
    }
    
    // 分类为空时设置为默认分类
    const category = editTodoCategory.value.trim() || '默认分类';
    
    const updatedData = {
        title: title,
        description: editTodoDescription.value.trim(),
        priority: editTodoPriority.value,
        category: category,
        deadline: editTodoDeadline.value ? new Date(editTodoDeadline.value).toISOString().split('T')[0] : null
    };
    
    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            closeEditModal();
            await loadTodos();
            await loadCategories();
            showSuccess('任务已更新');
        } else {
            const error = await response.json();
            showError(error.error || '更新任务失败');
        }
    } catch (error) {
        console.error('更新任务失败:', error);
        showError('网络连接失败');
    }
}

// 关闭编辑模态框
function closeEditModal() {
    editModal.style.display = 'none';
}

// 更新统计信息
function updateStats() {
    const total = allTodos.length;
    const completed = allTodos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const overdue = allTodos.filter(todo => !todo.completed && todo.status === 'overdue').length;
    
    totalCount.textContent = `总计: ${total}`;
    pendingCount.textContent = `待办: ${pending}`;
    overdueCount.textContent = `过期: ${overdue}`;
}

// 工具函数 - 转义HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 工具函数 - 获取优先级文本
function getPriorityText(priority) {
    const map = {
        'high': '高优先级',
        'medium': '中优先级',
        'low': '低优先级'
    };
    return map[priority] || priority;
}

// 显示错误消息
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'notification error';
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    
    setTimeout(() => {
        errorEl.classList.add('fade-out');
        setTimeout(() => errorEl.remove(), 300);
    }, 2000);
}

// 显示成功消息
function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'notification success';
    successEl.textContent = message;
    document.body.appendChild(successEl);
    
    setTimeout(() => {
        successEl.classList.add('fade-out');
        setTimeout(() => successEl.remove(), 300);
    }, 1500);
}

