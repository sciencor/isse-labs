/**
 * ToDoList 前端应用
 * 使用纯JavaScript实现任务管理功能
 * 与后端API (localhost:5000) 进行数据交互
 */

// API配置
const API_BASE_URL = 'http://localhost:5000';

// 全局状态管理
let tasks = [];
let filteredTasks = [];
let currentFilters = {
    priority: '',
    category: '',
    status: ''
};

// DOM元素引用
const elements = {
    // 表单元素
    addTaskForm: document.getElementById('addTaskForm'),
    taskTitle: document.getElementById('taskTitle'),
    taskDescription: document.getElementById('taskDescription'),
    taskPriority: document.getElementById('taskPriority'),
    taskCategory: document.getElementById('taskCategory'),
    
    // 筛选元素
    priorityFilter: document.getElementById('priorityFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    statusFilter: document.getElementById('statusFilter'),
    clearFilters: document.getElementById('clearFilters'),
    
    // 统计元素
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    completionRate: document.getElementById('completionRate'),
    
    // 任务列表元素
    tasksList: document.getElementById('tasksList'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    emptyState: document.getElementById('emptyState'),
    
    // 控制按钮
    refreshTasks: document.getElementById('refreshTasks'),
    toggleAllTasks: document.getElementById('toggleAllTasks'),
    clearCompleted: document.getElementById('clearCompleted'),
    
    // 模态框
    errorModal: document.getElementById('errorModal'),
    errorMessage: document.getElementById('errorMessage'),
    errorModalClose: document.getElementById('errorModalClose'),
    deleteModal: document.getElementById('deleteModal'),
    deleteConfirm: document.getElementById('deleteConfirm'),
    deleteCancel: document.getElementById('deleteCancel'),
    
    // 提示消息
    successToast: document.getElementById('successToast')
};

// 待删除的任务ID
let taskToDelete = null;

/**
 * 初始化应用
 * 绑定事件监听器并加载初始数据
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('ToDoList应用初始化中...');
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载任务数据
    loadTasks();
    
    console.log('ToDoList应用初始化完成');
});

/**
 * 绑定所有事件监听器
 */
function bindEventListeners() {
    // 添加任务表单提交
    elements.addTaskForm.addEventListener('submit', handleAddTask);
    
    // 筛选控件事件
    elements.priorityFilter.addEventListener('change', applyFilters);
    elements.categoryFilter.addEventListener('input', applyFilters);
    elements.statusFilter.addEventListener('change', applyFilters);
    elements.clearFilters.addEventListener('click', clearAllFilters);
    
    // 控制按钮事件
    elements.refreshTasks.addEventListener('click', loadTasks);
    elements.toggleAllTasks.addEventListener('click', toggleAllTasks);
    elements.clearCompleted.addEventListener('click', clearCompletedTasks);
    
    // 模态框事件
    elements.errorModalClose.addEventListener('click', hideErrorModal);
    elements.deleteConfirm.addEventListener('click', confirmDeleteTask);
    elements.deleteCancel.addEventListener('click', hideDeleteModal);
    
    // 点击模态框背景关闭
    elements.errorModal.addEventListener('click', function(e) {
        if (e.target === elements.errorModal) {
            hideErrorModal();
        }
    });
    
    elements.deleteModal.addEventListener('click', function(e) {
        if (e.target === elements.deleteModal) {
            hideDeleteModal();
        }
    });
    
    // 成功提示自动隐藏
    elements.successToast.addEventListener('click', hideSuccessToast);
}

/**
 * 显示加载状态
 */
function showLoading() {
    elements.loadingIndicator.style.display = 'flex';
    elements.tasksList.style.display = 'none';
    elements.emptyState.style.display = 'none';
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    elements.loadingIndicator.style.display = 'none';
    elements.tasksList.style.display = 'block';
}

/**
 * 显示错误模态框
 * @param {string} message - 错误消息
 */
function showErrorModal(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.classList.add('show');
}

/**
 * 隐藏错误模态框
 */
function hideErrorModal() {
    elements.errorModal.classList.remove('show');
}

/**
 * 显示删除确认模态框
 * @param {number} taskId - 任务ID
 */
function showDeleteModal(taskId) {
    taskToDelete = taskId;
    elements.deleteModal.classList.add('show');
}

/**
 * 隐藏删除确认模态框
 */
function hideDeleteModal() {
    elements.deleteModal.classList.remove('show');
    taskToDelete = null;
}

/**
 * 显示成功提示
 * @param {string} message - 提示消息
 */
function showSuccessToast(message = '操作成功！') {
    elements.successToast.querySelector('.toast-message').textContent = message;
    elements.successToast.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(hideSuccessToast, 3000);
}

/**
 * 隐藏成功提示
 */
function hideSuccessToast() {
    elements.successToast.classList.remove('show');
}

/**
 * 从API获取所有任务
 */
async function loadTasks() {
    try {
        showLoading();
        console.log('正在加载任务...');
        
        const response = await fetch(`${API_BASE_URL}/tasks`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        tasks = data.tasks || [];
        
        console.log(`成功加载 ${tasks.length} 个任务`);
        
        // 应用当前筛选条件
        applyFilters();
        
        // 更新统计信息
        updateStats();
        
    } catch (error) {
        console.error('加载任务失败:', error);
        showErrorModal(`加载任务失败: ${error.message}`);
        tasks = [];
        renderTasks();
    } finally {
        hideLoading();
    }
}

/**
 * 创建新任务
 * @param {Event} event - 表单提交事件
 */
async function handleAddTask(event) {
    event.preventDefault();
    
    try {
        // 获取表单数据
        const formData = {
            title: elements.taskTitle.value.trim(),
            description: elements.taskDescription.value.trim(),
            priority: elements.taskPriority.value,
            category: elements.taskCategory.value.trim()
        };
        
        // 验证必填字段
        if (!formData.title || !formData.priority || !formData.category) {
            showErrorModal('请填写所有必填字段');
            return;
        }
        
        console.log('正在创建任务:', formData);
        
        // 发送创建请求
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('任务创建成功:', data.task);
        
        // 清空表单
        elements.addTaskForm.reset();
        
        // 重新加载任务列表
        await loadTasks();
        
        // 显示成功提示
        showSuccessToast('任务创建成功！');
        
    } catch (error) {
        console.error('创建任务失败:', error);
        showErrorModal(`创建任务失败: ${error.message}`);
    }
}

/**
 * 更新任务
 * @param {number} taskId - 任务ID
 * @param {Object} updateData - 更新数据
 */
async function updateTask(taskId, updateData) {
    try {
        console.log(`正在更新任务 ${taskId}:`, updateData);
        
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('任务更新成功:', data.task);
        
        // 重新加载任务列表
        await loadTasks();
        
        return data.task;
        
    } catch (error) {
        console.error('更新任务失败:', error);
        showErrorModal(`更新任务失败: ${error.message}`);
        throw error;
    }
}

/**
 * 删除任务
 * @param {number} taskId - 任务ID
 */
async function deleteTask(taskId) {
    try {
        console.log(`正在删除任务 ${taskId}`);
        
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('任务删除成功:', data.deleted_task);
        
        // 重新加载任务列表
        await loadTasks();
        
        showSuccessToast('任务删除成功！');
        
    } catch (error) {
        console.error('删除任务失败:', error);
        showErrorModal(`删除任务失败: ${error.message}`);
    }
}

/**
 * 切换任务完成状态
 * @param {number} taskId - 任务ID
 */
async function toggleTaskCompletion(taskId) {
    try {
        console.log(`正在切换任务 ${taskId} 的完成状态`);
        
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('任务状态切换成功:', data.task);
        
        // 重新加载任务列表
        await loadTasks();
        
        return data.task;
        
    } catch (error) {
        console.error('切换任务状态失败:', error);
        showErrorModal(`切换任务状态失败: ${error.message}`);
        throw error;
    }
}

/**
 * 应用筛选条件
 */
function applyFilters() {
    console.log('应用筛选条件...');
    
    // 获取筛选条件
    currentFilters.priority = elements.priorityFilter.value;
    currentFilters.category = elements.categoryFilter.value.toLowerCase();
    currentFilters.status = elements.statusFilter.value;
    
    // 筛选任务
    filteredTasks = tasks.filter(task => {
        // 优先级筛选
        if (currentFilters.priority && task.priority !== currentFilters.priority) {
            return false;
        }
        
        // 分类筛选
        if (currentFilters.category && !task.category.toLowerCase().includes(currentFilters.category)) {
            return false;
        }
        
        // 状态筛选
        if (currentFilters.status === 'completed' && !task.completed) {
            return false;
        }
        if (currentFilters.status === 'pending' && task.completed) {
            return false;
        }
        
        return true;
    });
    
    console.log(`筛选结果: ${filteredTasks.length}/${tasks.length} 个任务`);
    
    // 渲染筛选后的任务
    renderTasks();
}

/**
 * 清除所有筛选条件
 */
function clearAllFilters() {
    console.log('清除所有筛选条件');
    
    elements.priorityFilter.value = '';
    elements.categoryFilter.value = '';
    elements.statusFilter.value = '';
    
    currentFilters = {
        priority: '',
        category: '',
        status: ''
    };
    
    applyFilters();
    showSuccessToast('筛选条件已清除');
}

/**
 * 渲染任务列表
 */
function renderTasks() {
    console.log(`渲染 ${filteredTasks.length} 个任务`);
    
    if (filteredTasks.length === 0) {
        elements.tasksList.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    // 按ID排序
    const sortedTasks = [...filteredTasks].sort((a, b) => a.id - b.id);
    
    // 生成任务HTML
    elements.tasksList.innerHTML = sortedTasks.map(task => createTaskHTML(task)).join('');
    
    // 绑定任务项事件
    bindTaskEvents();
}

/**
 * 创建任务HTML
 * @param {Object} task - 任务对象
 * @returns {string} 任务HTML字符串
 */
function createTaskHTML(task) {
    const priorityClass = `priority-${task.priority}`;
    const completedClass = task.completed ? 'completed' : '';
    const checkedAttr = task.completed ? 'checked' : '';
    
    // 格式化创建时间
    const createdDate = new Date(task.created_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="task-item ${priorityClass} ${completedClass}" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="handleTaskToggle(${task.id})">
                </div>
                
                <div class="task-details">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                    
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">
                            ${getPriorityIcon(task.priority)} ${getPriorityText(task.priority)}
                        </span>
                        <span class="task-category">
                            📁 ${escapeHtml(task.category)}
                        </span>
                        <span class="task-date">
                            📅 ${createdDate}
                        </span>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-outline" onclick="handleTaskEdit(${task.id})" title="编辑任务">
                        <span class="btn-icon">✏️</span>
                    </button>
                    <button class="btn btn-danger" onclick="handleTaskDelete(${task.id})" title="删除任务">
                        <span class="btn-icon">🗑️</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 绑定任务项事件
 */
function bindTaskEvents() {
    // 任务项点击事件（除了按钮区域）
    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // 如果点击的是按钮或复选框，不触发任务切换
            if (e.target.closest('.task-actions') || e.target.closest('.task-checkbox')) {
                return;
            }
            
            const taskId = parseInt(this.dataset.taskId);
            handleTaskToggle(taskId);
        });
    });
}

/**
 * 处理任务完成状态切换
 * @param {number} taskId - 任务ID
 */
async function handleTaskToggle(taskId) {
    try {
        await toggleTaskCompletion(taskId);
    } catch (error) {
        // 错误已在toggleTaskCompletion中处理
    }
}

/**
 * 处理任务编辑
 * @param {number} taskId - 任务ID
 */
function handleTaskEdit(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // 填充表单
    elements.taskTitle.value = task.title;
    elements.taskDescription.value = task.description;
    elements.taskPriority.value = task.priority;
    elements.taskCategory.value = task.category;
    
    // 滚动到表单
    elements.addTaskForm.scrollIntoView({ behavior: 'smooth' });
    
    // 聚焦到标题输入框
    elements.taskTitle.focus();
    
    showSuccessToast('任务信息已填充到表单，请修改后重新提交');
}

/**
 * 处理任务删除
 * @param {number} taskId - 任务ID
 */
function handleTaskDelete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    showDeleteModal(taskId);
}

/**
 * 确认删除任务
 */
async function confirmDeleteTask() {
    if (taskToDelete) {
        await deleteTask(taskToDelete);
        hideDeleteModal();
    }
}

/**
 * 切换所有任务完成状态
 */
async function toggleAllTasks() {
    try {
        const allCompleted = filteredTasks.every(task => task.completed);
        const targetStatus = !allCompleted;
        
        console.log(`切换所有任务状态为: ${targetStatus ? '已完成' : '未完成'}`);
        
        // 批量更新任务状态
        const updatePromises = filteredTasks
            .filter(task => task.completed !== targetStatus)
            .map(task => updateTask(task.id, { completed: targetStatus }));
        
        await Promise.all(updatePromises);
        
        showSuccessToast(`所有任务已标记为${targetStatus ? '已完成' : '未完成'}`);
        
    } catch (error) {
        console.error('批量切换任务状态失败:', error);
        showErrorModal('批量切换任务状态失败');
    }
}

/**
 * 清空已完成任务
 */
async function clearCompletedTasks() {
    try {
        const completedTasks = tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            showSuccessToast('没有已完成的任务需要清空');
            return;
        }
        
        console.log(`正在清空 ${completedTasks.length} 个已完成任务`);
        
        // 批量删除已完成任务
        const deletePromises = completedTasks.map(task => deleteTask(task.id));
        await Promise.all(deletePromises);
        
        showSuccessToast(`已清空 ${completedTasks.length} 个已完成任务`);
        
    } catch (error) {
        console.error('清空已完成任务失败:', error);
        showErrorModal('清空已完成任务失败');
    }
}

/**
 * 更新统计信息
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    elements.totalTasks.textContent = total;
    elements.completedTasks.textContent = completed;
    elements.completionRate.textContent = `${completionRate}%`;
    
    console.log(`统计信息更新: 总计${total}, 已完成${completed}, 完成率${completionRate}%`);
}

/**
 * 获取优先级图标
 * @param {string} priority - 优先级
 * @returns {string} 图标
 */
function getPriorityIcon(priority) {
    const icons = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    };
    return icons[priority] || '⚪';
}

/**
 * 获取优先级文本
 * @param {string} priority - 优先级
 * @returns {string} 文本
 */
function getPriorityText(priority) {
    const texts = {
        high: '高',
        medium: '中',
        low: '低'
    };
    return texts[priority] || priority;
}

/**
 * HTML转义函数
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 获取任务统计信息
 */
async function loadTaskStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('任务统计信息:', data.stats);
        
        return data.stats;
        
    } catch (error) {
        console.error('获取统计信息失败:', error);
        return null;
    }
}

// 导出函数供全局使用
window.handleTaskToggle = handleTaskToggle;
window.handleTaskEdit = handleTaskEdit;
window.handleTaskDelete = handleTaskDelete;

console.log('ToDoList JavaScript模块加载完成');
