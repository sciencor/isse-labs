// ...existing code...
const apiBase = '/todos';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addForm').addEventListener('submit', onAdd);
  document.getElementById('applyFilter').addEventListener('click', loadTodos);
  document.getElementById('clearFilter').addEventListener('click', clearFilter);
  document.getElementById('resetData').addEventListener('click', resetData);
  loadTodos();
  loadProgress();
});

async function onAdd(e) {
  e.preventDefault();
  const task = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('prioritySelect').value;
  const category = document.getElementById('categoryInput').value.trim() || '默认';
  if (!task) return alert('请输入任务内容');
  const res = await fetch(apiBase, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({task, priority, category})
  });
  if (res.ok) {
    document.getElementById('taskInput').value = '';
    loadTodos();
    loadProgress();
  } else {
    alert('添加失败');
  }
}

function getFilters() {
  const priority = document.getElementById('filterPriority').value;
  const category = document.getElementById('filterCategory').value.trim();
  const params = new URLSearchParams();
  if (priority) params.append('priority', priority);
  if (category) params.append('category', category);
  return params.toString() ? `?${params.toString()}` : '';
}

async function loadTodos() {
  const qs = getFilters();
  const res = await fetch(`/todos${qs}`);
  if (!res.ok) return alert('获取列表失败');
  const items = await res.json();
  renderList(items);
  loadProgress();
}

function renderList(items) {
  const ul = document.getElementById('todoList');
  ul.innerHTML = '';
  if (!items.length) {
    ul.innerHTML = '<li class="empty">暂无任务</li>';
    return;
  }
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = item.completed ? 'done' : '';
    li.innerHTML = `
      <div class="left">
        <input type="checkbox" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
        <span class="task">${escapeHtml(item.task)}</span>
        <span class="meta">[${escapeHtml(item.priority)}] <em>${escapeHtml(item.category)}</em></span>
      </div>
      <div class="right">
        <button class="edit" data-id="${item.id}">编辑</button>
        <button class="del" data-id="${item.id}">删除</button>
      </div>
    `;
    ul.appendChild(li);

    li.querySelector('input[type=checkbox]').addEventListener('change', e => {
      toggleTodo(e.target.dataset.id);
    });
    li.querySelector('.del').addEventListener('click', () => deleteTodo(item.id));
    li.querySelector('.edit').addEventListener('click', () => editTodoPrompt(item));
  });
}

async function toggleTodo(id) {
  const res = await fetch(`/todos/${id}/toggle`, {method: 'PATCH'});
  if (res.ok) {
    loadTodos();
    loadProgress();
  } else alert('切换失败');
}

async function deleteTodo(id) {
  if (!confirm('确认删除？')) return;
  const res = await fetch(`/todos/${id}`, {method: 'DELETE'});
  if (res.ok) {
    loadTodos();
    loadProgress();
  } else alert('删除失败');
}

function editTodoPrompt(item) {
  const newTask = prompt('编辑任务内容：', item.task);
  if (newTask === null) return;
  const newPriority = prompt('优先级 (low/normal/high):', item.priority) || item.priority;
  const newCategory = prompt('分类：', item.category) || item.category;
  updateTodo(item.id, {task: newTask, priority: newPriority, category: newCategory});
}

async function updateTodo(id, body) {
  const res = await fetch(`/todos/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  if (res.ok) {
    loadTodos();
    loadProgress();
  } else alert('更新失败');
}

async function loadProgress() {
  const res = await fetch('/todos/progress');
  if (!res.ok) return;
  const p = await res.json();
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  fill.style.width = `${p.percent}%`;
  text.textContent = `完成 ${p.completed} / ${p.total} (${p.percent}%)`;
}

function clearFilter() {
  document.getElementById('filterPriority').value = '';
  document.getElementById('filterCategory').value = '';
  loadTodos();
}

// 开发用：重置数据（如果你已在后端开放 reset 或使用 DEV 模式）
async function resetData() {
  if (!confirm('确认重置所有任务？')) return;
  // 如果后端没有 /todos/reset，可直接重置 database.json 文件（见后端说明）
  const res = await fetch('/todos/reset', {method: 'POST'});
  if (res.ok) {
    loadTodos();
    loadProgress();
  } else {
    alert('重置失败（后端未启用 reset 接口）');
  }
}

// 简单防 XSS
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }