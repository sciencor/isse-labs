# TodoList System Development Standards

---
## Project Goals

Please help me design a **TodoList task management system** using Flask (backend) + HTML/CSS/JavaScript (frontend) with the following functionalities:

1. Users can input new todo items;
2. Todo items are displayed in a list;
3. Tasks can be deleted;
4. Tasks can be marked as completed;
5. Tasks can be classified by priority (high/medium/low);
6. Tasks can be categorized and filtered by type (study/work/life);
7. Support for setting and displaying task deadlines;
8. Support for sorting by deadline (ascending/descending order);
9. Support for task search (by title keywords);
10. Support for filtering by completion status (completed/overdue/incomplete);
11. Data persistence to local `tasks.json` file.

---
## Development Specification Explanation

> Purpose: To generate a clearly layered and easily extensible system, facilitating teaching demonstrations and debugging.
All code should be written in modules, with clear separation of backend and frontend logic.

---
## I. Technology Stack and Language Definition

- Backend framework: Python Flask
- Frontend: HTML + CSS + JavaScript (vanilla, no frameworks used)
- Data format: JSON
- Storage method: Local `tasks.json` file (persistent storage)
- Operation method: Flask provides RESTful API, frontend calls interfaces using `fetch()`

---
## II. Development Sequence (Mandatory Step-by-Step)
Please generate and test code in the following order, with self-inspection instructions for each step.

### Step 1: Backend Interface Design

1. Design the Flask backend with the following routes:
   - `GET /tasks`: Retrieve tasks (support filtering and sorting);
     - Query parameters:
       - `category`: Filter by category (e.g., "study");
       - `priority`: Filter by priority (e.g., "high");
       - `status`: Filter by completion status (`completed`/`overdue`/`pending`);
       - `search`: Search by title keywords (fuzzy matching);
       - `sort`: Sorting method (`deadline_asc` for ascending order by deadline, `deadline_desc` for descending order by deadline);
   - `POST /tasks`: Add a new task;
   - `PUT /tasks/<id>`: Modify task status (completed/incomplete);
   - `DELETE /tasks/<id>`: Delete a task;

2. Each task object has the following fields:
```json
{
  "id": 1,
  "title": "Write lab report",
  "category": "study",
  "priority": "high",
  "completed": false,
  "deadline": "2023-12-31T23:59:59"  // ISO format datetime
}
```
3. Data storage: Use `tasks.json` file for persistent storage, implementing the following logic:
   - Load data from the file into memory on startup;
   - Synchronously write to the file after each addition/modification/deletion of tasks;
   - Handle file read/write exceptions (e.g., automatically create the file if it does not exist).

4. Backend returns a unified format:
```json
{
  "status": "success",
  "data": [...],
  "message": "Operation successful"
}
```
   In case of errors, return:
```json
{
  "status": "error",
  "data": null,
  "message": "Error description"
}
```

5. Write `app.py` and test that the interfaces return correctly in Postman or a browser.

---
### Step 2: Frontend Page Structure Design

1. Design a main page `index.html` containing the following parts:
   - Input area:
     - Task title input box;
     - Category dropdown menu (study/work/life);
     - Priority dropdown menu (high/medium/low);
     - Deadline picker (datetime-local type);
     - "Add Task" button;
   - Search area:
     - Search input box (placeholder: "Search tasks...");
     - "Search" button;
   - Filter area:
     - Category filter dropdown menu;
     - Priority filter dropdown menu;
     - Completion status filter dropdown menu (all/completed/overdue/incomplete);
     - Sorting options (default/ascending by deadline/descending by deadline);
     - "Show All" button;
   - Task display area (in list form):
     - Each item includes: title, category, priority, deadline, status (completed/incomplete/overdue), operation buttons (complete/delete).

2. Page layout:
   - Top: Input area + Search area;
   - Middle: Filter area;
   - Bottom: Task list.

3. Style description:
   - Incomplete tasks: Black text;
   - Completed tasks: Gray text + strikethrough;
   - Overdue tasks: Red text + blinking border (or other eye-catching styles);
   - High-priority tasks: Red indicator;
   - Tasks with deadline less than 24 hours and incomplete: Orange indicator.

---
### Step 3: Frontend Logic and Interaction (JavaScript)

1. Use `fetch()` to call backend APIs, implementing the following functionalities:
   - Add task: POST (including deadline field);
   - Load task list: GET (support carrying filter, search, and sort parameters);
   - Delete task: DELETE;
   - Toggle task status: PUT;
   - Search tasks: Call GET with `search` parameter after entering keywords;
   - Filter tasks: Call GET with corresponding parameters after selecting conditions;
   - Sort tasks: Call GET with `sort` parameter after selecting sorting method.

2. Automatically refresh the list after each operation.

3. Write `script.js` with clear and modular logic:
   - `loadTasks(filters)`: Load tasks (receive filter parameters);
   - `addTask()`: Add a new task;
   - `deleteTask(id)`: Delete a task;
   - `toggleTask(id)`: Toggle task completion status;
   - `searchTasks(keyword)`: Search tasks;
   - `filterTasksByStatus(status)`: Filter by completion status;
   - `sortTasks(order)`: Sort by time.

---
### Step 4: Modular Structure Requirements
The project structure is as follows (AI-generated code must comply):
```
project/           # Project code directory
    ├── app.py              # Flask backend
    ├── index.html          # Frontend main page
    ├── script.js           # Frontend logic
    ├── style.css           # Style file
    └── tasks.json          # Task data file (auto-generated)
```
---
## III. Supplementary Development Standards

| Category       | Specification Content                                  |
|----------------|--------------------------------------------------------|
| Route naming   | Use RESTful style                                       |
| Variable naming | CamelCase naming convention (addTask, getTasks)         |
| Data interaction | Use JSON exclusively                                   |
| Error handling  | Return "status": "error" and "message" fields           |
| Comment standards | Write a one-sentence description for each function      |
| Style standards | Use light gray background + card-style task boxes, with slight shadow on hover |
| Code testing    | Test each interface with Postman first before connecting to the frontend |
| Time handling   | Uniformly use ISO format (e.g., "2023-12-31T23:59:59")  |


---
## IV. Interaction Details (Frontend Description)

| Functionality  | User Operation                                         | System Response                                 |
|----------------|--------------------------------------------------------|-------------------------------------------------|
| Add task       | Enter content + select category/priority/deadline + click add | Call POST /tasks, refresh task list             |
| Mark as completed | Click "Complete" button                               | Task turns gray with strikethrough, call PUT interface |
| Delete task    | Click "Delete" button                                  | Call DELETE interface, refresh list             |
| Search tasks   | Enter keywords + click search (or press enter)         | Call GET with search parameter, display matching results |
| Filter tasks   | Select category/priority/completion status             | Call GET with corresponding parameters, display filtered results |
| Sort tasks     | Select time sorting method                             | Call GET with sort parameter, reorder by time   |
| Show all       | Click "Show All" button                                | Call GET without filter parameters, display all tasks |
| Overdue prompt | Task deadline is earlier than current time and incomplete | Automatically mark as "overdue" and highlight  |