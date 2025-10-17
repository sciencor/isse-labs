document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://127.0.0.1:5000";

    const taskList = document.getElementById("task-list");
    const addTaskBtn = document.getElementById("add-task-btn");
    const taskTitleInput = document.getElementById("task-title");
    const taskCategoryInput = document.getElementById("task-category");
    const taskPriorityInput = document.getElementById("task-priority");
    const filterCategory = document.getElementById("filter-category");
    const filterPriority = document.getElementById("filter-priority");

    // Load tasks on page startup
    loadTasks();

    // Add event listeners
    addTaskBtn.addEventListener("click", addTask);
    filterCategory.addEventListener("change", filterTasks);
    filterPriority.addEventListener("change", filterTasks);

    /**
     * Fetches tasks from the API and renders them.
     */
    async function loadTasks() {
        const category = filterCategory.value;
        const priority = filterPriority.value;
        
        let url = `${API_URL}/tasks`;
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (priority) params.append("priority", priority);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await fetch(url);
            const result = await response.json();

            if (result.status === "success") {
                renderTasks(result.data);
            } else {
                console.error("Failed to load tasks:", result.message);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
        }
    }

    /**
     * Renders tasks in the list.
     * @param {Array} tasks - The array of task objects.
     */
    function renderTasks(tasks) {
        taskList.innerHTML = "";
        if (tasks.length === 0) {
            taskList.innerHTML = "<p>No tasks found. Add one!</p>";
            return;
        }

        tasks.forEach(task => {
            const item = document.createElement("li");
            item.className = `task-item ${task.completed ? "completed" : ""}`;
            item.dataset.id = task.id;

            const priorityClass = task.priority === '高' ? 'priority-high' : '';

            item.innerHTML = `
                <div class="info">
                    <span class="title">${task.title}</span>
                    <div class="meta">
                        <span>Category: ${task.category}</span> | 
                        <span class="priority ${priorityClass}">Priority: ${task.priority}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="toggle-btn">${task.completed ? "Undo" : "Complete"}</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            // Add event listeners for task actions
            item.querySelector(".toggle-btn").addEventListener("click", () => toggleTask(task.id, !task.completed));
            item.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));

            taskList.appendChild(item);
        });
    }

    /**
     * Adds a new task.
     */
    async function addTask() {
        const title = taskTitleInput.value.trim();
        const category = taskCategoryInput.value;
        const priority = taskPriorityInput.value;

        if (!title) {
            alert("Task title is required.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, priority }),
            });

            const result = await response.json();

            if (result.status === "success") {
                taskTitleInput.value = ""; // Clear input
                loadTasks(); // Refresh list
            } else {
                alert(`Failed to add task: ${result.message}`);
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    /**
     * Deletes a task by its ID.
     * @param {number} taskId - The ID of the task to delete.
     */
    async function deleteTask(taskId) {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "DELETE",
            });
            const result = await response.json();

            if (result.status === "success") {
                loadTasks(); // Refresh list
            } else {
                alert(`Failed to delete task: ${result.message}`);
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    /**
     * Toggles the completion status of a task.
     * @param {number} taskId - The ID of the task.
     * @param {boolean} completed - The new completion status.
     */
    async function toggleTask(taskId, completed) {
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed }),
            });

            const result = await response.json();

            if (result.status === "success") {
                loadTasks(); // Refresh list
            } else {
                alert(`Failed to update task: ${result.message}`);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }

    /**
     * Filters tasks based on selected criteria.
     */
    function filterTasks() {
        loadTasks();
    }
});
