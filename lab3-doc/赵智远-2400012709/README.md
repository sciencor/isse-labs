# 📝 Modern ToDo List Web Application

A beautiful, minimalist ToDo List application built with Flask and vanilla JavaScript.

## ✨ Features

- ✅ Add, edit, delete, and complete tasks
- 🎨 Modern gradient UI with smooth animations
- 📊 Priority levels (High/Medium/Low) with color coding
- 📅 Due date tracking with smart date formatting
- 📑 Separate tabs for pending and completed tasks
- 💾 Persistent storage using JSON file
- 📱 Fully responsive design
- 🚀 No frontend frameworks - pure HTML/CSS/JavaScript

## 🛠️ Technology Stack

- **Backend**: Python 3 + Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: JSON file (todos.json)
- **API**: RESTful architecture

## 📦 Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Setup

1. **Navigate to the project directory**:
   ```bash
   cd todo-app
   ```

2. **Install dependencies**:
   ```bash
   pip install flask flask-cors
   ```

## 🚀 Running the Application

1. **Start the Flask server**:
   ```bash
   python app.py
   ```

2. **Open your browser** and visit:
   ```
   http://localhost:5000
   ```

3. **Start managing your tasks!**

## 📁 Project Structure

```
todo-app/
├── app.py              # Flask backend server
├── todos.json          # Data persistence file (auto-created)
├── static/
│   ├── index.html      # Main HTML structure
│   ├── style.css       # All styling and animations
│   └── script.js       # Frontend logic and API calls
└── README.md           # This file
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Fetch all todos |
| POST | `/api/todos` | Create a new todo |
| PATCH | `/api/todos/<id>` | Update a todo |
| DELETE | `/api/todos/<id>` | Delete a todo |

## 🎨 Design Features

### Visual Elements
- **Gradient Background**: Purple-to-blue gradient
- **Card-Based UI**: White cards with shadows and rounded corners
- **Priority Colors**:
  - 🔴 High: Red
  - 🟠 Medium: Orange
  - 🟢 Low: Green
- **Smooth Animations**: Fade-in, slide-in, and slide-out effects

### Layout Sections
1. **Header**: Large centered title
2. **Input Toolbar**: Task input, priority selector, date picker, and add button
3. **Todo Display**: Tabbed interface with pending and completed tasks

## 🎯 Usage Guide

### Adding a Task
1. Enter task description in the input field
2. Select priority level (Low/Medium/High)
3. Choose a due date
4. Click "Add Task" or press Enter

### Managing Tasks
- **Complete**: Click the checkbox to mark as done
- **Edit**: Click "Edit" button to modify task details
- **Delete**: Click "Delete" button to remove task

### Viewing Tasks
- Switch between "Pending Tasks" and "Completed Tasks" tabs
- Task counts are displayed on each tab

## 💾 Data Persistence

All tasks are automatically saved to `todos.json` file:
- Created automatically on first task addition
- Updated on every change (add/edit/delete)
- Loaded automatically on server restart

## 🔧 Customization

### Changing Colors
Edit the gradient colors in `static/style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Changing Port
Edit `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Change port here
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Dependencies Issue
```bash
# Reinstall dependencies
pip install --upgrade flask flask-cors
```

### Browser Cache
Clear browser cache or use incognito mode if changes don't appear.

## 📝 Notes

- All data is stored locally in `todos.json`
- No database required
- No Node.js or npm needed
- Works on all modern browsers
- Mobile-friendly responsive design

## 🚀 Production Deployment

For production use:
1. Set `debug=False` in `app.py`
2. Use a production WSGI server like Gunicorn
3. Add proper authentication if needed
4. Consider using a real database (SQLite/PostgreSQL)

## 📄 License

Free to use and modify for personal and commercial projects.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

---

**Built with ❤️ using Flask and Vanilla JavaScript**
