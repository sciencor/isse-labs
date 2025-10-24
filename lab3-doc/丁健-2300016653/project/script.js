document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const taskInput = document.getElementById('task-input');
    const prioritySelector = document.getElementById('priority-selector');
    const groupSelector = document.getElementById('group-selector');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');
    const newGroupName = document.getElementById('new-group-name');
    const addGroupBtn = document.getElementById('add-group-btn');
    const renameGroupBtn = document.getElementById('rename-group-btn');
    const removeGroupBtn = document.getElementById('remove-group-btn');
    const currentGroupSelector = document.getElementById('group-selector');
    
    let currentGroup = '默认';
    
    // 初始化
    loadGroups();
    loadTasks(currentGroup);
    
    // 事件监听器
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    addGroupBtn.addEventListener('click', addGroup);
    renameGroupBtn.addEventListener('click', renameGroup);
    removeGroupBtn.addEventListener('click', removeGroup);
    currentGroupSelector.addEventListener('change', (e) => {
        currentGroup = e.target.value;
        loadTasks(currentGroup);
    });
    
    // 加载任务
    function loadTasks(group) {
        fetch(`/show_todos?group=${group}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderTasks(data.items);
                } else {
                    alert('加载任务失败: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('加载任务失败');
            });
    }
    
    // 渲染任务列表
    function renderTasks(tasks) {
        todoList.innerHTML = '';
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item priority-${task.priority}`;
            if (task.completed) {
                li.classList.add('completed');
            }
            
            // 完成状态复选框
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
            
            // 优先级星形图标
            const priorityStars = document.createElement('div');
            priorityStars.className = 'priority-stars';
            for (let i = 1; i <= 3; i++) {
                const star = document.createElement('span');
                star.className = `star ${i <= task.priority ? 'filled' : ''}`;
                star.textContent = '★';
                star.addEventListener('click', () => updateTaskPriority(task.id, i));
                priorityStars.appendChild(star);
            }
            
            // 任务文本
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.task;
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            li.appendChild(checkbox);
            li.appendChild(priorityStars);
            li.appendChild(taskText);
            li.appendChild(deleteBtn);
            
            todoList.appendChild(li);
        });
    }
    
    // 添加任务
    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;
        
        const priority = parseInt(prioritySelector.value);
        const group = groupSelector.value;
        
        fetch('/add_todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: taskText,
                priority: priority,
                group: group
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                taskInput.value = '';
                loadTasks(currentGroup);
            } else {
                alert('添加任务失败: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('添加任务失败');
        });
    }
    
    // 切换任务完成状态
    function toggleTaskCompletion(taskId) {
        fetch('/update_todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: taskId,
                completed: !document.querySelector(`.task-item input[type="checkbox"]:checked`)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('更新任务状态失败: ' + data.error);
                loadTasks(currentGroup);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('更新任务状态失败');
            loadTasks(currentGroup);
        });
    }
    
    // 更新任务优先级
    function updateTaskPriority(taskId, priority) {
        fetch('/update_todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: taskId,
                priority: priority
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadTasks(currentGroup);
            } else {
                alert('更新优先级失败: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('更新优先级失败');
        });
    }
    
    // 删除任务
    function deleteTask(taskId) {
        fetch('/remove_todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: taskId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadTasks(currentGroup);
            } else {
                alert('删除任务失败: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除任务失败');
        });
    }
    
    // 加载分组列表
    function loadGroups() {
        fetch('/show_todos')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateGroupSelectors(data.groups);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    // 更新分组选择器
    function updateGroupSelectors(groups) {
        groupSelector.innerHTML = '';
        currentGroupSelector.innerHTML = '';
        
        groups.forEach(group => {
            const option1 = document.createElement('option');
            option1.value = group;
            option1.textContent = group;
            groupSelector.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = group;
            option2.textContent = group;
            currentGroupSelector.appendChild(option2);
        });
    }
    
    // 添加分组
    function addGroup() {
        const groupName = newGroupName.value.trim();
        if (!groupName) return;
        
        fetch('/add_group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: groupName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                newGroupName.value = '';
                loadGroups();
            } else {
                alert('添加分组失败: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('添加分组失败');
        });
    }
    
    // 重命名分组
    function renameGroup() {
        const oldName = currentGroupSelector.value;
        const newName = prompt('输入新的分组名称:', oldName);
        
        if (!newName || newName === oldName) return;
        
        fetch('/rename_group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                old_name: oldName,
                new_name: newName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadGroups();
                loadTasks(currentGroup);
            } else {
                alert('重命名分组失败: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('重命名分组失败');
        });
    }
    
    // 删除分组
    function removeGroup() {
        const groupName = currentGroupSelector.value;
        if (!confirm(`确定要删除分组"${groupName}"吗？所有任务将移到默认分组`)) return;
        
        fetch('/remove_group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: groupName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadGroups();
                loadTasks('默认');
            } else {
                alert('删除分组失败: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除分组失败');
        });
    }
});
