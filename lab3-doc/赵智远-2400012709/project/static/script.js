/**
 * ToDo List Application - Frontend JavaScript
 * Handles all UI interactions and API communications
 */

// ===========================
// Constants & Configuration
// ===========================
const API_BASE = '/api/todos';

// ===========================
// DOM Elements
// ===========================
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const addTaskBtn = document.getElementById('addTaskBtn');

const tabButtons = document.querySelectorAll('.tab-btn');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');

const emptyPending = document.getElementById('emptyPending');
const emptyCompleted = document.getElementById('emptyCompleted');

const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

// ===========================
// State Management
// ===========================
let todos = [];
let currentTab = 'pending';

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Initializing ToDo App...');

    // Set default datetime to current time (rounded to next hour)
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1); // Next hour
    dueDateInput.value = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

    // Load todos from server
    await loadTodos();

    // Setup event listeners
    setupEventListeners();

    console.log('✓ App initialized successfully');
}

function setupEventListeners() {
    // Add task button
    addTaskBtn.addEventListener('click', handleAddTask);

    // Enter key in task input
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
}

// ===========================
// API Functions
// ===========================

/**
 * Fetch all todos from the server
 */
async function loadTodos() {
    try {
        const response = await fetch(API_BASE);

        if (!response.ok) {
            throw new Error('Failed to load todos');
        }

        todos = await response.json();
        console.log(`✓ Loaded ${todos.length} todos from server`);

        renderTodos();
    } catch (error) {
        console.error('✗ Error loading todos:', error);
        showNotification('Failed to load todos', 'error');
    }
}

/**
 * Add a new todo via API
 */
async function addTodo(description, priority, dueDate) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description,
                priority,
                due_date: dueDate
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add todo');
        }

        const newTodo = await response.json();
        todos.push(newTodo);

        console.log('✓ Todo added:', newTodo);
        renderTodos();
        showNotification('Task added successfully!', 'success');

        return newTodo;
    } catch (error) {
        console.error('✗ Error adding todo:', error);
        showNotification('Failed to add task', 'error');
        throw error;
    }
}

/**
 * Update a todo via API
 */
async function updateTodo(id, updates) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error('Failed to update todo');
        }

        const updatedTodo = await response.json();

        // Update local state
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
        }

        console.log('✓ Todo updated:', updatedTodo);
        renderTodos();

        return updatedTodo;
    } catch (error) {
        console.error('✗ Error updating todo:', error);
        showNotification('Failed to update task', 'error');
        throw error;
    }
}

/**
 * Delete a todo via API
 */
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }

        // Remove from local state
        todos = todos.filter(t => t.id !== id);

        console.log('✓ Todo deleted:', id);
        renderTodos();
        showNotification('Task deleted successfully!', 'success');
    } catch (error) {
        console.error('✗ Error deleting todo:', error);
        showNotification('Failed to delete task', 'error');
        throw error;
    }
}

// ===========================
// Sorting Functions (渲染前默认排序，非破坏性)
// ===========================

/**
 * Parse due_date to minute-precision timestamp
 * @param {string|number|Date} dueDate - ISO string, UNIX timestamp, or Date object
 * @returns {number} - Minutes since epoch, or Infinity if invalid
 */
function parseDeadlineToMinute(dueDate) {
    if (dueDate == null || dueDate === '') return Infinity;

    let date;

    // Handle Date object
    if (dueDate instanceof Date) {
        date = dueDate;
    }
    // Handle number (seconds or milliseconds)
    else if (typeof dueDate === 'number') {
        const ms = dueDate < 1e12 ? dueDate * 1000 : dueDate;
        date = new Date(ms);
    }
    // Handle string: ISO 8601 datetime-local format "YYYY-MM-DDTHH:mm" or full ISO
    else if (typeof dueDate === 'string') {
        const str = String(dueDate).trim();

        // If it's just a date "YYYY-MM-DD", add midnight time
        if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
            date = new Date(str + 'T00:00:00');
        }
        // If it's datetime-local format "YYYY-MM-DDTHH:mm" (no seconds)
        else if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            date = new Date(str + ':00'); // Add seconds for proper parsing
        }
        // Otherwise parse as-is (full ISO string with timezone)
        else {
            date = new Date(str);
        }
    }
    else {
        return Infinity;
    }

    // Validate and return minute-precision timestamp
    const ts = date.getTime();
    if (!Number.isFinite(ts) || isNaN(ts)) {
        console.warn('⚠️ Invalid date parsed:', dueDate, '-> NaN');
        return Infinity;
    }

    return Math.floor(ts / 60000);
}

/**
 * Map priority string to numeric value for sorting
 * @param {string} priority - "High", "Medium", "Low", or undefined
 * @returns {number} - 3 (High), 2 (Medium), 1 (Low), 0 (undefined)
 */
function priorityToNumber(priority) {
    const map = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return map[priority] || 0;
}

/**
 * Sort tasks by deadline (minute precision) then urgency (priority)
 * 仅用于渲染前默认排序，不修改存储
 * @param {Array} tasks - Array of todo objects
 * @returns {Array} - Sorted copy of tasks (non-destructive)
 */
function sortTasks(tasks) {
    // Non-destructive: create copy with original index for stable sort
    return tasks
        .map((task, idx) => ({ task, idx }))
        .sort((A, B) => {
            const a = A.task, b = B.task;

            // Primary: deadline (minute precision, earlier first)
            const ta = parseDeadlineToMinute(a.due_date);
            const tb = parseDeadlineToMinute(b.due_date);
            if (ta !== tb) return ta - tb;

            // Secondary: urgency (priority, higher first)
            const ua = priorityToNumber(a.priority);
            const ub = priorityToNumber(b.priority);
            if (ua !== ub) return ub - ua;

            // Stable sort: preserve original order
            return A.idx - B.idx;
        })
        .map(({ task }) => task);
}

// ===========================
// UI Event Handlers
// ===========================

/**
 * Handle adding a new task
 */
async function handleAddTask() {
    const description = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    // Validate input
    if (!description) {
        showNotification('Please enter a task description', 'warning');
        taskInput.focus();
        return;
    }

    // Add todo
    try {
        await addTodo(description, priority, dueDate);

        // Clear inputs
        taskInput.value = '';
        prioritySelect.value = 'Medium';
        const resetTime = new Date();
        resetTime.setMinutes(0, 0, 0);
        resetTime.setHours(resetTime.getHours() + 1);
        dueDateInput.value = resetTime.toISOString().slice(0, 16);

        taskInput.focus();
    } catch (error) {
        // Error already handled in addTodo
    }
}

/**
 * Handle toggling todo completion
 */
async function handleToggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
        await updateTodo(id, { completed: !todo.completed });

        if (!todo.completed) {
            showNotification('Task completed! 🎉', 'success');
        }
    } catch (error) {
        // Error already handled in updateTodo
    }
}

/**
 * Handle editing a todo
 */
function handleEdit(id) {
    const todoItem = document.querySelector(`[data-todo-id="${id}"]`);
    if (!todoItem) return;

    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    todoItem.classList.add('editing');

    // Create edit UI
    const editHTML = `
        <div class="todo-content-wrapper">
            <input 
                type="text" 
                class="edit-input" 
                value="${escapeHtml(todo.description)}"
                id="edit-desc-${id}"
            >
            <div class="edit-controls">
                <select class="edit-select" id="edit-priority-${id}">
                    <option value="Low" ${todo.priority === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Medium" ${todo.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="High" ${todo.priority === 'High' ? 'selected' : ''}>High</option>
                </select>
                <input 
                    type="datetime-local" 
                    class="edit-date" 
                    value="${todo.due_date ? todo.due_date.slice(0, 16) : ''}"
                    id="edit-date-${id}"
                >
            </div>
        </div>
        <div class="todo-actions">
            <button class="action-btn save-btn" onclick="handleSaveEdit(${id})">
                Save
            </button>
            <button class="action-btn cancel-btn" onclick="handleCancelEdit(${id})">
                Cancel
            </button>
        </div>
    `;

    // Replace content
    todoItem.innerHTML = editHTML;

    // Focus on input
    document.getElementById(`edit-desc-${id}`).focus();
}

/**
 * Handle saving an edit
 */
async function handleSaveEdit(id) {
    const description = document.getElementById(`edit-desc-${id}`).value.trim();
    const priority = document.getElementById(`edit-priority-${id}`).value;
    const dueDate = document.getElementById(`edit-date-${id}`).value;

    if (!description) {
        showNotification('Description cannot be empty', 'warning');
        return;
    }

    try {
        await updateTodo(id, {
            description,
            priority,
            due_date: dueDate
        });

        showNotification('Task updated successfully!', 'success');
    } catch (error) {
        // Error already handled in updateTodo
    }
}

/**
 * Handle canceling an edit
 */
function handleCancelEdit(id) {
    renderTodos();
}

/**
 * Handle deleting a todo with animation
 */
async function handleDelete(id) {
    const todoItem = document.querySelector(`[data-todo-id="${id}"]`);
    if (!todoItem) return;

    // Add deleting animation
    todoItem.classList.add('deleting');

    // Wait for animation, then delete
    setTimeout(async () => {
        await deleteTodo(id);
    }, 300);
}

// ===========================
// UI Rendering
// ===========================

/**
 * Render all todos based on current tab
 */
function renderTodos() {
    // Sort before filtering (preserves sort across both lists)
    const sortedTodos = sortTasks(todos);

    const pendingTodos = sortedTodos.filter(t => !t.completed);
    const completedTodos = sortedTodos.filter(t => t.completed);

    // Update counts
    pendingCount.textContent = pendingTodos.length;
    completedCount.textContent = completedTodos.length;

    // Render pending list
    if (pendingTodos.length === 0) {
        pendingList.innerHTML = emptyPending.outerHTML;
    } else {
        pendingList.innerHTML = pendingTodos.map(todo => createTodoHTML(todo)).join('');
    }

    // Render completed list
    if (completedTodos.length === 0) {
        completedList.innerHTML = emptyCompleted.outerHTML;
    } else {
        completedList.innerHTML = completedTodos.map(todo => createTodoHTML(todo)).join('');
    }
}

/**
 * Create HTML for a single todo item
 */
function createTodoHTML(todo) {
    const priorityClass = `priority-${todo.priority.toLowerCase()}`;
    const completedClass = todo.completed ? 'completed' : '';

    return `
        <div class="todo-item ${completedClass}" data-todo-id="${todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="handleToggleComplete(${todo.id})"
            >
            <div class="todo-content-wrapper">
                <div class="todo-description">${escapeHtml(todo.description)}</div>
                <div class="todo-meta">
                    <span class="priority-badge ${priorityClass}">
                        ${todo.priority}
                    </span>
                    ${todo.due_date ? `
                        <span class="due-date">
                            📅 ${formatDate(todo.due_date)}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class="todo-actions">
                ${!todo.completed ? `
                    <button class="action-btn edit-btn" onclick="handleEdit(${todo.id})">
                        Edit
                    </button>
                ` : ''}
                <button class="action-btn delete-btn" onclick="handleDelete(${todo.id})">
                    Delete
                </button>
            </div>
        </div>
    `;
}

/**
 * Switch between tabs
 */
function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update todo lists
    if (tab === 'pending') {
        pendingList.classList.add('active');
        completedList.classList.remove('active');
    } else {
        pendingList.classList.remove('active');
        completedList.classList.add('active');
    }
}

// ===========================
// Utility Functions
// ===========================

/**
 * Show notification (simple alert for now)
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Simple visual feedback
    const color = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    }[type] || '#2196f3';

    // Could be enhanced with a proper toast notification system
    console.log(`%c${message}`, `color: ${color}; font-weight: bold;`);
}

/**
 * Format date string with hour precision
 */
function formatDate(dateString) {
    if (!dateString) return '';

    // Parse ISO datetime string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Format time part
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // Relative time for near future/past
    if (diffHours === 0) {
        return `Today at ${timeStr}`;
    } else if (diffHours > 0 && diffHours < 24) {
        return `Today at ${timeStr}`;
    } else if (diffHours < 0 && diffHours > -24) {
        return `Today at ${timeStr}`;
    } else if (diffDays === 1) {
        return `Tomorrow at ${timeStr}`;
    } else if (diffDays === -1) {
        return `Yesterday at ${timeStr}`;
    } else if (diffDays > 0 && diffDays <= 7) {
        return `In ${diffDays} days at ${timeStr}`;
    } else if (diffDays < 0 && diffDays >= -7) {
        return `${Math.abs(diffDays)} days ago at ${timeStr}`;
    }

    // Absolute date + time for distant dates
    const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });

    return `${dateStr} at ${timeStr}`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===========================
// Global Functions (for onclick handlers)
// ===========================
window.handleToggleComplete = handleToggleComplete;
window.handleEdit = handleEdit;
window.handleSaveEdit = handleSaveEdit;
window.handleCancelEdit = handleCancelEdit;
window.handleDelete = handleDelete;
