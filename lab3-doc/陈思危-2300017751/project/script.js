// API 基础URL
const API_BASE = 'http://localhost:5000/api';

// DOM 元素
const todosList = document.getElementById('todos-list');
const todoTitle = document.getElementById('todo-title');
const todoDescription = document.getElementById('todo-description');
const todoPriority = document.getElementById('todo-priority');
const todoCategory = document.getElementById('todo-category');
const addBtn = document.getElementById('add-btn');
const emptyState = document.getElementById('empty-state');

// 筛选元素
const filterCategory = document.getElementById('filter-category');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');

// 统计元素
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');

// 模态框元素
const editModal = document.getElementById('edit-modal');
const closeModal = document.getElementById('close-modal');
const editTodoId = document.getElementById('edit-todo-id');
const editTodoTitle = document.getElementById('edit-todo-title');
const editTodoDescription = document.getElementById('edit-todo-description');
const editTodoPriority = document.getElementById('edit-todo-priority');
const editTodoCategory = document.getElementById('edit-todo-category');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// 全局数据
let allTodos = [];
let currentFilters = {
    category: '',
    priority: '',
    status: ''
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    loadCategories();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
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
        const response = await fetch(`${API_BASE}/todos`);
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
            updateCategoryFilter(categories);
        }
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

// 更新分类筛选下拉框
function updateCategoryFilter(categories) {
    // 保存当前选中的值
    const currentValue = filterCategory.value;
    
    // 清空选项（保留第一个"所有分类"选项）
    filterCategory.innerHTML = '<option value="">所有分类</option>';
    
    // 添加分类选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategory.appendChild(option);
    });
    
    // 恢复之前选中的值
    filterCategory.value = currentValue;
}

// 应用筛选
function applyFilters() {
    let filteredTodos = [...allTodos];
    
    // 按分类筛选
    if (currentFilters.category) {
        filteredTodos = filteredTodos.filter(todo => 
            todo.category === currentFilters.category
        );
    }
    
    // 按优先级筛选
    if (currentFilters.priority) {
        filteredTodos = filteredTodos.filter(todo => 
            todo.priority === currentFilters.priority
        );
    }
    
    // 按状态筛选
    if (currentFilters.status) {
        if (currentFilters.status === 'completed') {
            filteredTodos = filteredTodos.filter(todo => todo.completed);
        } else if (currentFilters.status === 'pending') {
            filteredTodos = filteredTodos.filter(todo => !todo.completed);
        }
    }
    
    renderTodos(filteredTodos);
}

// 渲染todos列表
function renderTodos(todos) {
    todosList.innerHTML = '';
    
    if (todos.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    todos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todosList.appendChild(todoItem);
    });
}

// 创建单个todo元素
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    const priorityClass = `priority-${todo.priority}`;
    const toggleText = todo.completed ? '取消完成' : '标记完成';
    const toggleClass = todo.completed ? 'completed' : '';
    
    li.innerHTML = `
        <div class="todo-header">
            <div class="todo-content">
                <div class="todo-title ${todo.completed ? 'completed' : ''}">
                    ${escapeHtml(todo.title)}
                </div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-meta">
                    <span class="priority-badge ${priorityClass}">
                        ${getPriorityText(todo.priority)}
                    </span>
                    <span class="category-badge">${escapeHtml(todo.category)}</span>
                    <span class="created-time">创建于 ${formatDate(todo.created_at)}</span>
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

// 添加新todo
async function addTodo() {
    const title = todoTitle.value.trim();
    if (!title) {
        showError('请输入任务标题');
        return;
    }
    
    const todoData = {
        title: title,
        description: todoDescription.value.trim(),
        priority: todoPriority.value,
        category: todoCategory.value.trim() || '默认'
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

// 切换todo完成状态
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/todos/${id}/toggle`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            await loadTodos();
            showSuccess('状态更新成功');
        } else {
            showError('更新状态失败');
        }
    } catch (error) {
        console.error('更新状态失败:', error);
        showError('网络连接失败');
    }
}

// 删除todo
async function deleteTodo(id) {
    if (!confirm('确定要删除这个任务吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadTodos();
            await loadCategories();
            showSuccess('任务删除成功');
        } else {
            showError('删除任务失败');
        }
    } catch (error) {
        console.error('删除任务失败:', error);
        showError('网络连接失败');
    }
}

// 编辑todo
function editTodo(id) {
    const todo = allTodos.find(t => t.id === id);
    if (!todo) return;
    
    editTodoId.value = id;
    editTodoTitle.value = todo.title;
    editTodoDescription.value = todo.description || '';
    editTodoPriority.value = todo.priority;
    editTodoCategory.value = todo.category;
    
    editModal.style.display = 'flex';
}

// 关闭编辑模态框
function closeEditModal() {
    editModal.style.display = 'none';
}

// 保存编辑
async function saveEdit() {
    const id = parseInt(editTodoId.value);
    const title = editTodoTitle.value.trim();
    
    if (!title) {
        showError('请输入任务标题');
        return;
    }
    
    const todoData = {
        title: title,
        description: editTodoDescription.value.trim(),
        priority: editTodoPriority.value,
        category: editTodoCategory.value.trim() || '默认'
    };
    
    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todoData)
        });
        
        if (response.ok) {
            closeEditModal();
            await loadTodos();
            await loadCategories();
            showSuccess('任务更新成功');
        } else {
            const error = await response.json();
            showError(error.error || '更新任务失败');
        }
    } catch (error) {
        console.error('更新任务失败:', error);
        showError('网络连接失败');
    }
}

// 更新统计信息
function updateStats() {
    const total = allTodos.length;
    const completed = allTodos.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    totalCount.textContent = `总计: ${total}`;
    completedCount.textContent = `已完成: ${completed}`;
    pendingCount.textContent = `待办: ${pending}`;
}

// 工具函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPriorityText(priority) {
    const texts = {
        'high': '高',
        'medium': '中',
        'low': '低'
    };
    return texts[priority] || '低';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showSuccess(message) {
    // 简单的成功提示
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

function showError(message) {
    // 简单的错误提示
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}