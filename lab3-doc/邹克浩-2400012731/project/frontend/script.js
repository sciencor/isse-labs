const API_BASE = '/tasks';

// UI elements
const taskListEl = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const cancelBtn = document.getElementById('cancelBtn');
const searchEl = document.getElementById('search');
const filterPriority = document.getElementById('filterPriority');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const filterCompleted = document.getElementById('filterCompleted');

let tasks = [];
let editingId = null;
let lastExpandedDesc = null;
let originalFormState = null;
let pendingDeleteId = null;

async function fetchTasks(){
  const res = await fetch(API_BASE);
  const data = await res.json();
  tasks = data.tasks || [];
  // ensure stable order if not provided
  tasks.sort((a,b)=> (a.order||0) - (b.order||0));
  renderTasks();
}

function applyFilters(items){
  const q = searchEl.value.trim().toLowerCase();
  let out = items.filter(t => {
    if(filterPriority.value && t.priority !== filterPriority.value) return false;
    if(filterCategory.value && t.category !== filterCategory.value) return false;
    if(filterCompleted && filterCompleted.value){
      const want = filterCompleted.value === 'true';
      if(!!t.completed !== want) return false;
    }
    if(q){
      return t.title.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q);
    }
    return true;
  });

  if(sortBy.value === 'due_date'){
    out.sort((a,b)=> (a.due_date||'').localeCompare(b.due_date||''));
  } else if(sortBy.value === 'priority'){
    const rank = { '高':1,'中':2,'低':3 };
    out.sort((a,b)=> (rank[a.priority]||9) - (rank[b.priority]||9));
  }

  return out;
}

function renderTasks(){
  taskListEl.innerHTML = '';
  const visible = applyFilters(tasks);
  if(visible.length===0){ taskListEl.innerHTML = '<li>没有任务</li>'; return; }
  visible.forEach(t=>{
    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('draggable','true');
    // expose priority for CSS selectors
    li.setAttribute('data-priority', t.priority || '中');
    if(editingId === t.id) li.classList.add('editing');

  const top = document.createElement('div'); top.className = 'task-top';
  const main = document.createElement('div'); main.className='task-main';
  const title = document.createElement('div'); title.className='task-title'; title.textContent = t.title + (t.completed ? ' ✅' : '');
  const meta = document.createElement('div'); meta.className='task-meta'; meta.textContent = `截止: ${t.due_date||'—'}`;
  const badges = document.createElement('div'); badges.className = 'badges';
  const pri = document.createElement('div'); pri.className = 'badge ' + (t.priority==='高' ? 'priority-high' : (t.priority==='中' ? 'priority-mid' : 'priority-low'));
  pri.textContent = t.priority || '中';
  const cat = document.createElement('div'); cat.className = 'badge category'; cat.textContent = t.category || '';
  badges.appendChild(pri); badges.appendChild(cat);
  main.appendChild(title); main.appendChild(meta);
  top.appendChild(main); top.appendChild(badges);

    // description (toggleable, only one open at a time)
    if(t.description){
      const desc = document.createElement('div'); desc.className = 'task-desc folded'; desc.textContent = t.description;
      desc.onclick = ()=>{
        if(lastExpandedDesc && lastExpandedDesc !== desc){
          lastExpandedDesc.classList.remove('expanded');
          lastExpandedDesc.classList.add('folded');
        }
        desc.classList.toggle('folded');
        desc.classList.toggle('expanded');
        lastExpandedDesc = desc.classList.contains('expanded') ? desc : null;
      };
      main.appendChild(desc);
    }

    const actions = document.createElement('div'); actions.className='task-actions';
    const toggleBtn = document.createElement('button'); toggleBtn.textContent = t.completed? '取消完成' : '标记完成';
    toggleBtn.onclick = ()=> toggleComplete(t.id, !t.completed);
    const delBtn = document.createElement('button'); delBtn.textContent = '删除'; delBtn.onclick = ()=> openDeleteModal(t.id, t.title);
    const editBtn = document.createElement('button'); editBtn.textContent = '编辑'; editBtn.onclick = ()=> openEdit(t);
    actions.appendChild(toggleBtn); actions.appendChild(delBtn);
  actions.appendChild(editBtn);

    li.appendChild(top);
    if(t.description) li.appendChild(main);
    li.appendChild(actions);
    // drag-and-drop handlers
    li.addEventListener('dragstart', (e)=>{
      li.classList.add('dragging');
      e.dataTransfer.setData('text/plain', t.id);
      e.dataTransfer.effectAllowed = 'move';
    });
    li.addEventListener('dragend', ()=>{ li.classList.remove('dragging'); });
    li.addEventListener('dragover', (e)=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; });
    li.addEventListener('drop', async (e)=>{
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if(!draggedId) return;
      const fromIndex = tasks.findIndex(x=> String(x.id) === String(draggedId));
      const toIndex = tasks.findIndex(x=> x.id === t.id);
      if(fromIndex<0 || toIndex<0 || fromIndex===toIndex) return;
      const [moved] = tasks.splice(fromIndex,1);
      tasks.splice(toIndex,0,moved);
      // update order fields and persist each affected task
      for(let i=0;i<tasks.length;i++){ tasks[i].order = i; await fetch(`${API_BASE}/${tasks[i].id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({order: i})}); }
      renderTasks();
    });
    taskListEl.appendChild(li);
  });
}

function openModal(){ taskModal.classList.remove('hidden'); }
function closeModal(){ taskModal.classList.add('hidden'); taskForm.reset(); document.getElementById('formError').style.display = 'none'; }

addTaskBtn.addEventListener('click', ()=>{
  // ensure form cleared for new task
  taskForm.reset(); taskForm.elements['id'].value = '';
  editingId = null; originalFormState = null; openModal();
});

// cancel behavior: restore original if editing
cancelBtn.addEventListener('click', ()=>{
  if(editingId && originalFormState){
    for(const k in originalFormState){ if(taskForm.elements[k]) taskForm.elements[k].value = originalFormState[k]; }
  }
  editingId = null; originalFormState = null; closeModal();
});

taskForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = new FormData(taskForm);
  const payload = {};
  for(const [k,v] of form.entries()) payload[k]=v;
  payload.completed = false;
  const formErrorEl = document.getElementById('formError');
  if(!payload.title || payload.title.trim()===''){
    formErrorEl.textContent = '标题不能为空'; formErrorEl.style.display = 'block'; return;
  } else { formErrorEl.style.display = 'none'; }
  if(payload.id){
    const id = payload.id; delete payload.id;
    const res = await fetch(`${API_BASE}/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    if(res.ok){ closeModal(); editingId = null; originalFormState = null; fetchTasks(); }
  } else {
    const res = await fetch(API_BASE, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    if(res.ok){ closeModal(); fetchTasks(); }
  }
});

function openEdit(task){
  // populate form
  taskForm.elements['id'].value = task.id;
  taskForm.elements['title'].value = task.title || '';
  taskForm.elements['description'].value = task.description || '';
  taskForm.elements['priority'].value = task.priority || '中';
  taskForm.elements['category'].value = task.category || '工作';
  taskForm.elements['due_date'].value = task.due_date || '';
  editingId = task.id;
  // save original state for cancel
  originalFormState = { id: task.id, title: task.title||'', description: task.description||'', priority: task.priority||'中', category: task.category||'工作', due_date: task.due_date||'' };
  openModal();
}

function openDeleteModal(id, title){
  pendingDeleteId = id;
  const msg = document.getElementById('deleteMessage');
  msg.textContent = `确认删除任务："${title}"？此操作无法撤销。`;
  document.getElementById('deleteModal').classList.remove('hidden');
}

document.getElementById('deleteCancel').addEventListener('click', ()=>{ pendingDeleteId = null; document.getElementById('deleteModal').classList.add('hidden'); });
document.getElementById('deleteConfirm').addEventListener('click', async ()=>{ if(pendingDeleteId){ await deleteTask(pendingDeleteId); pendingDeleteId = null; document.getElementById('deleteModal').classList.add('hidden'); } });

async function toggleComplete(id, completed){
  await fetch(`${API_BASE}/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({completed})});
  fetchTasks();
}

async function deleteTask(id){
  await fetch(`${API_BASE}/${id}`, { method:'DELETE' });
  fetchTasks();
}

// Theme toggle (dark mode)
// (theme switch removed — single light theme)

// filters and search
[searchEl, filterPriority, filterCategory, sortBy, filterCompleted].forEach(el=> el.addEventListener('input', renderTasks));

// initial load
fetchTasks();
