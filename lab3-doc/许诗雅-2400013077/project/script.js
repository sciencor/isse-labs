// API 基础 URL
const API_BASE_URL = 'http://localhost:5000';

// DOM 元素
const taskTitleInput = document.getElementById('task-title');
const taskCategorySelect = document.getElementById('task-category');
const taskPrioritySelect = document.getElementById('task-priority');
const taskDeadlineInput = document.getElementById('task-deadline');
const noDeadlineCheckbox = document.getElementById('no-deadline');
const allDayCheckbox = document.getElementById('all-day');
const addTaskBtn = document.getElementById('add-task-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterCategorySelect = document.getElementById('filter-category');
const filterPrioritySelect = document.getElementById('filter-priority');
const filterStatusSelect = document.getElementById('filter-status');
const sortOptionSelect = document.getElementById('sort-option');
const showAllBtn = document.getElementById('show-all-btn');
const tasksContainer = document.getElementById('tasks-container');

// 自定义tooltip元素
let customTooltip = null;

// 创建自定义tooltip
function createCustomTooltip() {
    if (customTooltip) return;
    
    customTooltip = document.createElement('div');
    customTooltip.className = 'custom-tooltip';
    customTooltip.style.position = 'fixed';
    customTooltip.style.pointerEvents = 'none';
    customTooltip.style.opacity = '0';
    customTooltip.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
    customTooltip.style.transform = 'translateY(5px)';
    customTooltip.style.zIndex = '1000';
    customTooltip.style.padding = '4px 8px';
    customTooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    customTooltip.style.color = 'white';
    customTooltip.style.borderRadius = '4px';
    customTooltip.style.fontSize = '12px';
    customTooltip.style.whiteSpace = 'nowrap';
    
    document.body.appendChild(customTooltip);
}

// 为了解决截止时间格式问题，我们将在addTask函数中直接处理日期转换

// 初始化页面
window.addEventListener('DOMContentLoaded', () => {
    // 设置默认截止时间为明天，时间部分设为16:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(16, 0, 0, 0); // 设置时间为16:00:00
    const formattedDate = tomorrow.toISOString().slice(0, 16); // 保留到分钟
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
    
    // 无截止日期复选框事件
    noDeadlineCheckbox.addEventListener('change', () => {
        if (noDeadlineCheckbox.checked) {
            taskDeadlineInput.disabled = true;
            allDayCheckbox.disabled = true;
            allDayCheckbox.checked = false;
        } else {
            taskDeadlineInput.disabled = false;
            allDayCheckbox.disabled = false;
        }
    });
    
    // 全天复选框事件
    allDayCheckbox.addEventListener('change', () => {
        if (allDayCheckbox.checked) {
            // 如果选择全天，设置时间为当天00:00
            if (taskDeadlineInput.value) {
                // 保持日期不变，只修改时间部分
                const dateStr = taskDeadlineInput.value.split('T')[0];
                taskDeadlineInput.value = dateStr + 'T00:00';
            }
        }
    });
    
    // 创建并添加清除所有任务按钮
    createClearAllButton();
});

// 创建清除所有任务按钮
function createClearAllButton() {
    // 检查按钮是否已存在
    let clearAllButton = document.getElementById('clear-all-button');
    if (clearAllButton) return;
    
    // 创建按钮
    clearAllButton = document.createElement('button');
    clearAllButton.id = 'clear-all-button';
    clearAllButton.className = 'clear-all-button';
    clearAllButton.textContent = '清除所有任务';
    clearAllButton.addEventListener('click', clearAllTasks);
    
    // 将按钮移动到任务列表标题栏右侧
    const tasksSection = document.querySelector('.tasks-section');
    if (tasksSection) {
        // 查找或创建标题容器
        let titleContainer = tasksSection.querySelector('.section-header');
        if (!titleContainer) {
            // 创建标题容器，包含标题和按钮
            titleContainer = document.createElement('div');
            titleContainer.className = 'section-header';
            
            // 查找任务列表标题
            const taskListTitle = tasksSection.querySelector('h2');
            if (taskListTitle) {
                // 将标题移动到容器中
                tasksSection.insertBefore(titleContainer, taskListTitle);
                titleContainer.appendChild(taskListTitle);
                
                // 添加按钮到容器中
                titleContainer.appendChild(clearAllButton);
            }
        } else {
            // 如果已存在标题容器，直接添加按钮
            titleContainer.appendChild(clearAllButton);
        }
    }
    
    // 初始更新按钮状态
    if (typeof updateClearAllButtonState === 'function') {
        updateClearAllButtonState(false);
    }
}

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
            // 前端额外状态过滤（与后端逻辑保持一致）
            let filteredTasks = data.data;
            if (filters.status) {
                filteredTasks = filteredTasks.filter(task => {
                    if (filters.status === 'completed') {
                        return task.completed === true;
                    } else if (filters.status === 'pending') {
                        // 未完成且未截止的任务
                        return task.completed !== true && !isTaskOverdue(task.deadline);
                    } else if (filters.status === 'overdue') {
                        // 未完成且已截止的任务
                        return task.completed !== true && isTaskOverdue(task.deadline);
                    }
                    return true;
                });
            }
            renderTasks(filteredTasks);
        } else {
            console.error('加载任务失败:', data.message);
            showMessage('加载任务失败', 'error');
        }
    } catch (error) {
        console.error('网络错误:', error);
        showMessage('网络错误，请检查后端服务是否运行', 'error');
    }
}

// 清除当前显示的任务
async function clearAllTasks() {
    // 获取当前显示在界面上的任务元素
    const taskElements = document.querySelectorAll('.task-item');
    if (taskElements.length === 0) {
        if (typeof showMessage === 'function') {
            showMessage('当前没有显示的任务可清除', 'info');
        } else {
            alert('当前没有显示的任务可清除');
        }
        return;
    }
    
    // 获取当前显示任务的ID列表
    const taskIds = Array.from(taskElements).map(element => {
        return parseInt(element.getAttribute('data-task-id'));
    }).filter(id => !isNaN(id));
    
    if (!confirm(`确定要清除当前显示的 ${taskIds.length} 个任务吗？此操作不可恢复。`)) {
        return;
    }
    
    try {
        // 逐个删除当前显示的任务
        // 注意：这里也可以优化为批量删除的API调用
        const deletePromises = taskIds.map(id => {
            return fetch(`/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });
        
        const results = await Promise.all(deletePromises);
        
        // 检查是否有失败的删除操作
        const failedResults = results.filter(response => !response.ok);
        if (failedResults.length > 0) {
            throw new Error(`部分任务删除失败，成功删除 ${results.length - failedResults.length} 个任务`);
        }
        
        // 重新加载任务列表
        await loadTasks();
        
        // 显示成功消息
        if (typeof showMessage === 'function') {
            showMessage(`已成功清除 ${taskIds.length} 个任务`, 'success');
        } else {
            alert(`已成功清除 ${taskIds.length} 个任务`);
        }
    } catch (error) {
        console.error('清除任务时出错:', error);
        if (typeof showMessage === 'function') {
            showMessage('清除任务失败: ' + error.message, 'error');
        } else {
            alert('清除任务失败: ' + error.message);
        }
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
        taskItem.setAttribute('data-task-id', task.id);
        
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
        deadline.className = `task-deadline ${isDeadlineSoon && !task.completed ? 'deadline-soon' : ''} ${isOverdue ? 'overdue' : ''}`;
        const deadlineInfo = formatDeadline(task.deadline);
        deadline.textContent = deadlineInfo.displayText;
        
        // 添加自定义悬停提示
        if (deadlineInfo.fullDate !== '无截止时间') {
            deadline.dataset.tooltip = deadlineInfo.fullDate;
            
            deadline.addEventListener('mouseenter', (e) => {
                createCustomTooltip();
                customTooltip.textContent = deadline.dataset.tooltip;
                
                const rect = deadline.getBoundingClientRect();
                const tooltipRect = customTooltip.getBoundingClientRect();
                
                // 计算tooltip位置，显示在元素上方
                customTooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
                customTooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
                
                // 显示tooltip并添加动画
                setTimeout(() => {
                    customTooltip.style.opacity = '1';
                    customTooltip.style.transform = 'translateY(0)';
                }, 10);
            });
            
            deadline.addEventListener('mouseleave', () => {
                if (customTooltip) {
                    customTooltip.style.opacity = '0';
                    customTooltip.style.transform = 'translateY(5px)';
                }
            });
            
            deadline.addEventListener('mousemove', (e) => {
                // 轻微调整tooltip位置，跟随鼠标但保持相对元素居中
                if (customTooltip) {
                    const rect = deadline.getBoundingClientRect();
                    const tooltipRect = customTooltip.getBoundingClientRect();
                    
                    customTooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
                    customTooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
                }
            });
        }
        
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
    
    // 更新清除所有任务按钮状态
    if (typeof updateClearAllButtonState === 'function') {
        updateClearAllButtonState(tasks.length > 0);
    }
}

// 更新清除所有任务按钮状态
function updateClearAllButtonState(hasTasks) {
    // 检查按钮是否已存在
    let clearAllButton = document.getElementById('clear-all-button');
    
    // 如果按钮不存在且有任务，则创建按钮
    if (!clearAllButton && hasTasks) {
        clearAllButton = document.createElement('button');
        clearAllButton.id = 'clear-all-button';
        clearAllButton.className = 'clear-all-button';
        clearAllButton.textContent = '清除所有任务';
        clearAllButton.addEventListener('click', clearAllTasks);
        
        // 将按钮添加到过滤区域旁边
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.appendChild(clearAllButton);
        }
    }
    
    // 如果按钮存在，设置其可用性状态
    if (clearAllButton) {
        clearAllButton.disabled = !hasTasks;
        clearAllButton.classList.toggle('disabled', !hasTasks);
    }
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
                deadline: (() => {
                    // 如果选择了"无截止日期"，直接返回null
                    if (noDeadlineCheckbox.checked) {
                        return null;
                    }
                    
                    // 如果有截止日期
                    if (deadline) {
                        try {
                            // 对于全天任务，直接构造正确的日期字符串，避免时区转换问题
                            if (allDayCheckbox.checked) {
                                // 获取日期部分，设置时间为00:00:00
                                const dateStr = deadline.split('T')[0];
                                return dateStr + 'T00:00:00.000Z';
                            } else {
                                // 非全天任务，使用原始的日期处理
                                const date = new Date(deadline);
                                if (!isNaN(date.getTime())) {
                                    return date.toISOString();
                                }
                            }
                        } catch (e) {
                            console.error('日期解析错误:', e);
                        }
                    }
                    return null;
                })()
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // 清空输入框
            taskTitleInput.value = '';
            // 重新加载任务列表，但保持当前的筛选和排序状态
            loadTasks({
                category: filterCategorySelect.value,
                priority: filterPrioritySelect.value,
                status: filterStatusSelect.value,
                sort: sortOptionSelect.value,
                search: searchInput.value.trim()
            });
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
    // 检查是否为全天任务
    const isAllDayTask = deadline.endsWith('T00:00:00.000Z');
    if (isAllDayTask) {
        // 对于全天任务，只比较日期部分，不考虑时间和时区
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        return deadlineDate < today;
    }
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
 * @returns {Object} 包含显示文本和完整日期信息的对象
 */
function formatDeadline(deadline) {
    if (!deadline) {
        return {
            displayText: '无截止时间',
            fullDate: '无截止时间'
        };
    }
    
    try {
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // 检查是否为全天任务（通过字符串格式检测）
        const isAllDayTask = deadline.endsWith('T00:00:00.000Z');
        
        // 完整日期信息（用于悬停显示）
        const fullDate = date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (isAllDayTask) {
            // 全天任务只显示日期，直接从字符串中提取日期部分避免时区问题
            const dateStr = deadline.split('T')[0];
            const [year, month, day] = dateStr.split('-');
            let displayText = `${month}/${day} (全天)`;
        
            if (diffDays === 0) {
                displayText += ' (今天)';
            } else if (diffDays === 1) {
                displayText += ' (明天)';
            } else if (diffDays > 1 && diffDays <= 7) {
                displayText += ` (${diffDays}天后)`;
            } else if (diffDays < 0) {
                displayText += ' (已过期)';
            }
            
            return {
                displayText: displayText,
                fullDate: `${year}/${month}/${day} (全天)`
            };
        } else {
            // 非全天任务显示日期和时间
            let displayText = date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            if (diffDays === 0) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                if (diffHours === 0) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60));
                    displayText += ` (${diffMinutes}分钟后)`;
                } else {
                    displayText += ` (${diffHours}小时后)`;
                }
            } else if (diffDays === 1) {
                displayText += ' (明天)';
            } else if (diffDays > 1 && diffDays <= 7) {
                displayText += ` (${diffDays}天后)`;
            } else if (diffDays < 0) {
                displayText += ' (已过期)';
            }
            
            return {
                displayText: displayText,
                fullDate: fullDate
            };
        }
    } catch {
        return {
            displayText: deadline,
            fullDate: deadline
        };
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