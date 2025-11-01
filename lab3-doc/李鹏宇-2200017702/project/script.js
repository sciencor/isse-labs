/**
 * TodoList 前端交互脚本
 * 实现所有前端功能：API调用、DOM渲染、事件处理
 */

// ==================== 配置常量 ====================
const API_BASE = 'http://localhost:5000/api';

// 优先级和分类的中文映射
const PRIORITY_MAP = {
    'high': { text: '高优先级', emoji: '🔴', class: 'high' },
    'medium': { text: '中优先级', emoji: '🟡', class: 'medium' },
    'low': { text: '低优先级', emoji: '🟢', class: 'low' }
};

const CATEGORY_MAP = {
    'work': { text: '工作', emoji: '💼' },
    'study': { text: '学习', emoji: '📚' },
    'life': { text: '生活', emoji: '🏠' },
    'other': { text: '其他', emoji: '📌' }
};


// ==================== API 调用模块 ====================

/**
 * 获取任务列表
 * @param {Object} filters - 筛选条件 {priority, category, status}
 * @returns {Promise<Array>} 任务列表
 */
async function fetchTodos(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.category) params.append('category', filters.category);
        if (filters.status) params.append('status', filters.status);
        
        const url = `${API_BASE}/todos${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('获取任务列表失败:', error);
        showToast('获取任务列表失败', 'error');
        return [];
    }
}

/**
 * 添加新任务
 * @param {Object} todoData - 任务数据
 * @returns {Promise<Object>} 新创建的任务
 */
async function addTodo(todoData) {
    try {
        const response = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todoData)
        });
        
        const result = await response.json();
        
        if (result.code === 201) {
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('添加任务失败:', error);
        showToast(error.message || '添加任务失败', 'error');
        return null;
    }
}

/**
 * 切换任务完成状态
 * @param {number} id - 任务ID
 * @returns {Promise<boolean>} 是否成功
 */
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/todos/${id}/toggle`, {
            method: 'PUT'
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            return true;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('切换任务状态失败:', error);
        showToast('切换任务状态失败', 'error');
        return false;
    }
}

/**
 * 删除任务
 * @param {number} id - 任务ID
 * @returns {Promise<boolean>} 是否成功
 */
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            return true;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('删除任务失败:', error);
        showToast('删除任务失败', 'error');
        return false;
    }
}

/**
 * 获取任务统计信息
 * @returns {Promise<Object>} 统计数据
 */
async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE}/todos/stats`);
        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('获取统计信息失败:', error);
        return { total: 0, completed: 0, pending: 0, completion_rate: 0 };
    }
}


// ==================== DOM 渲染模块 ====================

/**
 * 渲染任务列表
 * @param {Array} todos - 任务列表
 */
function renderTodos(todos) {
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    
    // 如果没有任务，显示空状态
    if (todos.length === 0) {
        todoList.innerHTML = '';
        todoList.appendChild(emptyState);
        return;
    }
    
    // 清空列表
    todoList.innerHTML = '';
    
    // 渲染每个任务
    todos.forEach(todo => {
        const card = createTodoCard(todo);
        todoList.appendChild(card);
    });
}

/**
 * 创建单个任务卡片
 * @param {Object} todo - 任务对象
 * @returns {HTMLElement} 任务卡片DOM元素
 */
function createTodoCard(todo) {
    const card = document.createElement('div');
    card.className = `todo-card priority-${todo.priority}${todo.completed ? ' completed' : ''}`;
    card.dataset.id = todo.id;
    
    const priorityInfo = PRIORITY_MAP[todo.priority];
    const categoryInfo = CATEGORY_MAP[todo.category];
    
    // 格式化创建时间
    const createdDate = new Date(todo.created_at);
    const formattedDate = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')} ${String(createdDate.getHours()).padStart(2, '0')}:${String(createdDate.getMinutes()).padStart(2, '0')}`;
    
    card.innerHTML = `
        <div class="todo-header">
            <div class="todo-title">${escapeHtml(todo.title)}</div>
            <div class="todo-badges">
                <span class="badge badge-priority ${priorityInfo.class}">
                    ${priorityInfo.emoji} ${priorityInfo.text}
                </span>
                <span class="badge badge-category">
                    ${categoryInfo.emoji} ${categoryInfo.text}
                </span>
            </div>
        </div>
        ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-meta">
            <div class="todo-time">📅 ${formattedDate}</div>
            <div class="todo-actions">
                <button class="btn ${todo.completed ? 'btn-secondary' : 'btn-success'}" onclick="handleToggleTodo(${todo.id})">
                    ${todo.completed ? '↩️ 取消完成' : '✅ 完成'}
                </button>
                <button class="btn btn-danger" onclick="handleDeleteTodo(${todo.id})">
                    🗑️ 删除
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * 渲染统计信息
 * @param {Object} stats - 统计数据
 */
function renderStats(stats) {
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('completedCount').textContent = stats.completed;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('completionRate').textContent = `${stats.completion_rate}%`;
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ==================== 事件处理模块 ====================

/**
 * 处理添加任务
 */
async function handleAddTodo() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const priority = document.getElementById('priority').value;
    const category = document.getElementById('category').value;
    
    // 验证标题
    if (!title) {
        showToast('请输入任务标题', 'error');
        document.getElementById('title').focus();
        return;
    }
    
    // 准备任务数据
    const todoData = {
        title,
        description,
        priority,
        category
    };
    
    // 调用API添加任务
    const newTodo = await addTodo(todoData);
    
    if (newTodo) {
        showToast('任务添加成功！', 'success');
        
        // 清空表单
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('priority').value = 'medium';
        document.getElementById('category').value = 'study';
        
        // 重新加载任务列表和统计
        await loadTodos();
        await loadStats();
    }
}

/**
 * 处理切换任务状态
 * @param {number} id - 任务ID
 */
async function handleToggleTodo(id) {
    const success = await toggleTodo(id);
    
    if (success) {
        showToast('任务状态已更新', 'success');
        await loadTodos();
        await loadStats();
    }
}

/**
 * 处理删除任务
 * @param {number} id - 任务ID
 */
async function handleDeleteTodo(id) {
    // 确认删除
    if (!confirm('确定要删除这个任务吗？')) {
        return;
    }
    
    const success = await deleteTodo(id);
    
    if (success) {
        showToast('任务已删除', 'success');
        await loadTodos();
        await loadStats();
    }
}

/**
 * 处理筛选条件变化
 */
async function handleFilter() {
    await loadTodos();
}


// ==================== 辅助函数 ====================

/**
 * 加载任务列表（应用当前筛选条件）
 */
async function loadTodos() {
    const filters = {
        priority: document.getElementById('filterPriority').value,
        category: document.getElementById('filterCategory').value,
        status: document.getElementById('filterStatus').value
    };
    
    const todos = await fetchTodos(filters);
    renderTodos(todos);
}

/**
 * 加载统计信息
 */
async function loadStats() {
    const stats = await fetchStats();
    renderStats(stats);
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success/error/info)
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}


// ==================== 初始化 ====================

/**
 * 页面初始化
 */
async function init() {
    console.log('TodoList 应用初始化...');
    
    // 加载初始数据
    await loadTodos();
    await loadStats();
    
    // 绑定添加任务按钮事件
    document.getElementById('addBtn').addEventListener('click', handleAddTodo);
    
    // 绑定回车键快捷添加
    document.getElementById('title').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTodo();
        }
    });
    
    // 绑定筛选器事件
    document.getElementById('filterPriority').addEventListener('change', handleFilter);
    document.getElementById('filterCategory').addEventListener('change', handleFilter);
    document.getElementById('filterStatus').addEventListener('change', handleFilter);
    
    console.log('TodoList 应用初始化完成！');
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', init);
