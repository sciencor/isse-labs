// 全局变量
let todos = [];

// 页面加载时获取待办事项
document.addEventListener('DOMContentLoaded', () => {
    fetchTodos();
});

// 获取待办事项列表
async function fetchTodos() {
    try {
        const response = await fetch('/show_todos');
        const data = await response.json();
        
        if (data.items && typeof data.items === 'object') {
            todos = Object.entries(data.items).map(([id, task]) => ({ id, task }));
            renderTodos();
        } else {
            todos = [];
            renderTodos();
        }
    } catch (error) {
        console.error('获取待办事项失败:', error);
    }
}

// 渲染待办事项列表
function renderTodos() {
    const todoList = document.getElementById('todoItems');
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<li>暂无待办事项</li>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        
        const taskSpan = document.createElement('span');
        taskSpan.textContent = todo.task;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.onclick = () => deleteTodo(todo.id);
        
        const editBtn = document.createElement('button');
        editBtn.textContent = '编辑';
        editBtn.onclick = () => editTodo(todo.id);
        
        li.appendChild(taskSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}

// 添加待办事项
async function addTodo() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();
    
    if (!task) {
        alert('请输入任务内容');
        return;
    }

    try {
        const response = await fetch(`/add_todo?task=${encodeURIComponent(task)}`);
        const data = await response.json();
        
        if (data.id && data.task) {
            taskInput.value = '';
            await fetchTodos();
        } else {
            alert('添加失败: ' + (data.error || '未知错误'));
        }
    } catch (error) {
        console.error('添加待办事项失败:', error);
        alert('添加失败，请稍后再试');
    }
}

// 删除待办事项
async function deleteTodo(id) {
    if (!confirm('确定要删除这个任务吗?')) return;
    
    try {
        const response = await fetch(`/remove_todo?id=${id}`);
        const data = await response.json();
        
        if (data) {
            await fetchTodos();
        } else {
            alert('删除失败: ' + (data.error || '未知错误'));
        }
    } catch (error) {
        console.error('删除待办事项失败:', error);
        alert('删除失败，请稍后再试');
    }
}

// 编辑待办事项
async function editTodo(id) {
    const newTask = prompt('请输入新的任务内容:');
    if (!newTask) return;
    
    try {
        const response = await fetch(`/update_todo?id=${id}&task=${encodeURIComponent(newTask)}`);
        const data = await response.json();
        
        if (data && data[id]) {
            await fetchTodos();
        } else {
            alert('更新失败: ' + (data.error || '未知错误'));
        }
    } catch (error) {
        console.error('更新待办事项失败:', error);
        alert('更新失败，请稍后再试');
    }
}
