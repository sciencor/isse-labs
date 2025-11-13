// ==================== 全局变量 ====================
const API_BASE_URL = 'http://localhost:5000';
let currentFilters = {
    category: '',
    priority: '',
    search: ''
};
let allTasks = [];

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadTasks();
});

// ==================== 事件监听器初始化 ====================
function initializeEventListeners() {
    // 添加任务表单提交
    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
    
    // 类别筛选按钮
    document.querySelectorAll('#categoryFilter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => handleCategoryFilter(btn));
    });
    
    // 优先级筛选按钮
    document.querySelectorAll('#priorityFilter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => handlePriorityFilter(btn));
    });
    
    // 搜索按钮
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('clearSearchBtn').addEventListener('click', handleClearSearch);
    
    // 搜索框回车键
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 已完成任务区折叠/展开
    document.getElementById('completedToggle').addEventListener('click', toggleCompletedSection);
}

// ==================== 加载任务列表 ====================
async function loadTasks() {
    try {
        // 构建查询参数
        const params = new URLSearchParams();
        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.priority) params.append('priority', currentFilters.priority);
        if (currentFilters.search) params.append('search', currentFilters.search);
        
        const url = `${API_BASE_URL}/tasks${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('加载任务失败');
        }
        
        const result = await response.json();
        
        if (result.status === 'success') {
            allTasks = result.data;
            renderTasks();
            updateStatistics();
        } else {
            showToast(result.message || '加载任务失败', 'error');
        }
    } catch (error) {
        console.error('加载任务出错:', error);
        showToast('网络错误，请确保后端服务已启动', 'error');
    }
}

// ==================== 渲染任务列表 ====================
function renderTasks() {
    // 分离未完成和已完成的任务
    const inProgressTasks = allTasks.filter(task => !task.completed);
    const completedTasksList = allTasks.filter(task => task.completed);
    
    // 排序：第一关键字是优先级，第二关键字是 dueTime
    const sortedInProgressTasks = sortTasks(inProgressTasks);
    const sortedCompletedTasks = sortTasks(completedTasksList);
    
    // 渲染进行中的任务
    const tasksList = document.getElementById('tasksList');
    const noTasksMessage = document.getElementById('noTasksMessage');
    
    if (sortedInProgressTasks.length === 0) {
        tasksList.innerHTML = '';
        noTasksMessage.style.display = 'block';
    } else {
        tasksList.innerHTML = sortedInProgressTasks.map(task => createTaskCard(task)).join('');
        noTasksMessage.style.display = 'none';
    }
    
    // 渲染已完成的任务
    const completedTasksListEl = document.getElementById('completedTasksList');
    const noCompletedMessage = document.getElementById('noCompletedMessage');
    
    if (sortedCompletedTasks.length === 0) {
        completedTasksListEl.innerHTML = '';
        noCompletedMessage.style.display = 'block';
    } else {
        completedTasksListEl.innerHTML = sortedCompletedTasks.map(task => createTaskCard(task)).join('');
        noCompletedMessage.style.display = 'none';
    }
}

// ==================== 任务排序 ====================
function sortTasks(tasks) {
    const priorityOrder = { '高': 1, '中': 2, '低': 3 };
    
    return tasks.sort((a, b) => {
        // 第一关键字：优先级
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // 第二关键字：dueTime
        if (a.dueTime && b.dueTime) {
            return new Date(a.dueTime) - new Date(b.dueTime);
        } else if (a.dueTime) {
            return -1;
        } else if (b.dueTime) {
            return 1;
        }
        
        // 如果都没有 dueTime，按创建时间排序
        return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

// ==================== 创建任务卡片 ====================
function createTaskCard(task) {
    const priorityClass = task.priority === '高' ? 'priority-high' : 
                          task.priority === '中' ? 'priority-medium' : 'priority-low';
    const completedClass = task.completed ? 'completed' : '';
    
    const priorityBadgeClass = task.priority === '高' ? 'high' : 
                               task.priority === '中' ? 'medium' : 'low';
    
    const priorityIcon = task.priority === '高' ? '🔴' : 
                         task.priority === '中' ? '🟡' : '🟢';
    
    const categoryIcon = task.category === '学习' ? '📚' : 
                         task.category === '工作' ? '💼' : '🏠';
    
    // 格式化时间显示
    const createdTime = formatDateTime(task.createdAt);
    const dueTimeDisplay = task.dueTime ? formatDateTime(task.dueTime) : '无';
    
    // 根据任务状态决定显示的按钮
    const actionButtons = task.completed ? `
        <button class="task-btn task-btn-delete" onclick="deleteTask(${task.id})">
            🗑️ 删除
        </button>
    ` : `
        <button class="task-btn task-btn-complete" onclick="toggleTaskStatus(${task.id}, true)">
            ✓ 完成
        </button>
        <button class="task-btn task-btn-priority-up" onclick="adjustPriority(${task.id}, 'up')" 
                ${task.priority === '高' ? 'disabled' : ''}>
            ⬆️ 提高优先级
        </button>
        <button class="task-btn task-btn-priority-down" onclick="adjustPriority(${task.id}, 'down')"
                ${task.priority === '低' ? 'disabled' : ''}>
            ⬇️ 降低优先级
        </button>
        <button class="task-btn task-btn-delete" onclick="deleteTask(${task.id})">
            🗑️ 删除
        </button>
    `;
    
    return `
        <div class="task-card ${priorityClass} ${completedClass}" id="task-${task.id}">
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <span class="task-priority-badge ${priorityBadgeClass}">
                    ${priorityIcon} ${task.priority}优先级
                </span>
            </div>
            <div class="task-meta">
                <span class="task-meta-item">
                    ${categoryIcon} ${task.category}
                </span>
                <span class="task-meta-item">
                    🕐 创建：${createdTime}
                </span>
                <span class="task-meta-item">
                    ⏰ 截止：${dueTimeDisplay}
                </span>
            </div>
            <div class="task-actions">
                ${actionButtons}
            </div>
        </div>
    `;
}

// ==================== 添加任务 ====================
async function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const dueTime = document.getElementById('taskDueTime').value;
    
    if (!title) {
        showToast('请输入任务标题', 'warning');
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
                dueTime: dueTime || null
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast(result.message || '任务添加成功！', 'success');
            document.getElementById('addTaskForm').reset();
            await loadTasks();
        } else {
            showToast(result.message || '添加任务失败', 'error');
        }
    } catch (error) {
        console.error('添加任务出错:', error);
        showToast('网络错误，请重试', 'error');
    }
}

// ==================== 删除任务 ====================
async function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？')) {
        return;
    }
    
    try {
        // 添加删除动画
        const taskCard = document.getElementById(`task-${taskId}`);
        if (taskCard) {
            taskCard.classList.add('removing');
        }
        
        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast(result.message || '任务删除成功！', 'success');
            await loadTasks();
        } else {
            showToast(result.message || '删除任务失败', 'error');
            // 如果删除失败，移除动画类
            if (taskCard) {
                taskCard.classList.remove('removing');
            }
        }
    } catch (error) {
        console.error('删除任务出错:', error);
        showToast('网络错误，请重试', 'error');
    }
}

// ==================== 切换任务状态 ====================
async function toggleTaskStatus(taskId, completed) {
    try {
        // 如果是标记为完成，先播放庆祝动画
        if (completed) {
            const taskCard = document.getElementById(`task-${taskId}`);
            if (taskCard) {
                // 触发庆祝特效
                await playCelebrationAnimation(taskCard);
            }
        }
        
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast(completed ? '🎉 太棒了！任务已完成！' : '任务已恢复', 'success');
            await loadTasks();
        } else {
            showToast(result.message || '更新任务失败', 'error');
        }
    } catch (error) {
        console.error('更新任务状态出错:', error);
        showToast('网络错误，请重试', 'error');
    }
}

// ==================== 调整优先级 ====================
async function adjustPriority(taskId, direction) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const priorityMap = {
        'up': { '中': '高', '低': '中' },
        'down': { '高': '中', '中': '低' }
    };
    
    const newPriority = priorityMap[direction][task.priority];
    if (!newPriority) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ priority: newPriority })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast(`优先级已调整为 ${newPriority}`, 'success');
            await loadTasks();
        } else {
            showToast(result.message || '调整优先级失败', 'error');
        }
    } catch (error) {
        console.error('调整优先级出错:', error);
        showToast('网络错误，请重试', 'error');
    }
}

// ==================== 类别筛选 ====================
function handleCategoryFilter(btn) {
    // 更新按钮状态
    document.querySelectorAll('#categoryFilter .filter-btn').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    
    // 更新筛选条件
    currentFilters.category = btn.dataset.category;
    loadTasks();
}

// ==================== 优先级筛选 ====================
function handlePriorityFilter(btn) {
    // 更新按钮状态
    document.querySelectorAll('#priorityFilter .filter-btn').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    
    // 更新筛选条件
    currentFilters.priority = btn.dataset.priority;
    loadTasks();
}

// ==================== 搜索功能 ====================
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    currentFilters.search = searchInput.value.trim();
    loadTasks();
}

function handleClearSearch() {
    document.getElementById('searchInput').value = '';
    currentFilters.search = '';
    loadTasks();
}

// ==================== 更新统计信息 ====================
function updateStatistics() {
    const total = allTasks.length;
    const completed = allTasks.filter(task => task.completed).length;
    const inProgress = total - completed;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('inProgressTasks').textContent = inProgress;
    document.getElementById('completedTasks').textContent = completed;
}

// ==================== 折叠/展开已完成任务区 ====================
function toggleCompletedSection() {
    const completedList = document.getElementById('completedTasksList');
    const toggleIcon = document.querySelector('#completedToggle .toggle-icon');
    
    completedList.classList.toggle('collapsed');
    toggleIcon.classList.toggle('rotated');
}

// ==================== Toast 提示 ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // 显示 Toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== 庆祝动画 ====================
async function playCelebrationAnimation(taskCard) {
    return new Promise((resolve) => {
        // 获取任务卡片的位置
        const rect = taskCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 添加脉冲动画类
        taskCard.classList.add('completing');
        
        // 创建星星爆炸效果
        createStarBurst(taskCard, centerX, centerY);
        
        // 创建彩色粒子
        createParticles(centerX, centerY);
        
        // 创建彩带效果
        createRibbons(centerX, centerY);
        
        // 动画持续时间
        setTimeout(() => {
            taskCard.classList.remove('completing');
            resolve();
        }, 1000);
    });
}

// 创建星星爆炸效果
function createStarBurst(taskCard, centerX, centerY) {
    const starBurst = document.createElement('div');
    starBurst.className = 'star-burst';
    taskCard.appendChild(starBurst);
    
    // 创建 8 个星星向四周发射
    const starCount = 8;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const angle = (Math.PI * 2 * i) / starCount;
        const distance = 80;
        const xDist = Math.cos(angle) * distance;
        const yDist = Math.sin(angle) * distance;
        
        star.style.setProperty('--x-dist', `${xDist}px`);
        star.style.setProperty('--y-dist', `${yDist}px`);
        star.style.animationDelay = `${i * 0.05}s`;
        
        starBurst.appendChild(star);
    }
    
    // 动画结束后移除
    setTimeout(() => {
        starBurst.remove();
    }, 1000);
}

// 创建彩色粒子效果
function createParticles(centerX, centerY) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#52D858', '#FF85A1', '#FFC952', '#47B8E0'
    ];
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'fixed';
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.zIndex = '10000';
        
        // 随机方向和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120;
        const xPos = Math.cos(angle) * distance;
        const yPos = Math.sin(angle) * distance;
        
        particle.style.setProperty('--x-pos', `${xPos}px`);
        particle.style.setProperty('--y-pos', `${yPos}px`);
        particle.style.animationDelay = `${Math.random() * 0.1}s`;
        
        document.body.appendChild(particle);
        
        // 动画结束后移除
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// 创建彩带效果
function createRibbons(centerX, centerY) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    
    const ribbonCount = 20;
    
    for (let i = 0; i < ribbonCount; i++) {
        const ribbon = document.createElement('div');
        ribbon.className = 'ribbon';
        ribbon.style.position = 'fixed';
        ribbon.style.left = `${centerX}px`;
        ribbon.style.top = `${centerY}px`;
        ribbon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        ribbon.style.zIndex = '10000';
        
        // 随机方向和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 150;
        const xPos = Math.cos(angle) * distance;
        const yPos = Math.sin(angle) * distance - 50; // 稍微向上偏移
        const rotation = Math.random() * 720 - 360;
        
        ribbon.style.setProperty('--ribbon-x', `${xPos}px`);
        ribbon.style.setProperty('--ribbon-y', `${yPos}px`);
        ribbon.style.setProperty('--ribbon-rotate', `${rotation}deg`);
        ribbon.style.animationDelay = `${Math.random() * 0.15}s`;
        
        document.body.appendChild(ribbon);
        
        // 动画结束后移除
        setTimeout(() => {
            ribbon.remove();
        }, 1400);
    }
}

// ==================== 工具函数 ====================
// 格式化日期时间
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

