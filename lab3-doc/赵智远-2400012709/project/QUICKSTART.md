# 🚀 Quick Start Guide

## Installation (One-Time Setup)

### Step 1: Navigate to Project
```bash
cd /home/zhaozayanami/notes/todo-app
```

### Step 2: Install Dependencies
```bash
pip install flask flask-cors
```

That's it! No Node.js, npm, or build tools needed.

## Running the Application

### Option 1: Simple Start
```bash
python app.py
```

### Option 2: Using Start Script
```bash
./start.sh
```

### Option 3: Background Mode
```bash
nohup python app.py &
```

## Accessing the App

Once started, open your browser and visit:
```
http://localhost:5000
```

Or use VS Code's Simple Browser (already opened).

## Using the App

### Adding a Task
1. Type task description in the input field
2. Select priority (Low/Medium/High)
3. Pick a due date
4. Click "Add Task" or press Enter

### Managing Tasks
- **Complete**: Click the checkbox ✓
- **Edit**: Click "Edit" button, modify, then click "Save"
- **Delete**: Click "Delete" button

### Viewing Tasks
- Click "Pending Tasks" to see active todos
- Click "Completed Tasks" to see finished items
- Numbers show count in each category

## Data Storage

Your todos are automatically saved to:
```
/home/zhaozayanami/notes/todo-app/todos.json
```

- Auto-saves on every change
- Auto-loads on startup
- Survives server restarts
- Human-readable JSON format

## Stopping the Server

Press `Ctrl+C` in the terminal running the app.

## Project Structure

```
todo-app/
├── app.py              # Backend server
├── todos.json          # Your data
├── start.sh            # Startup script
├── README.md           # Full documentation
├── SUMMARY.md          # Project summary
├── DESIGN.md           # Design guide
├── QUICKSTART.md       # This file
└── static/
    ├── index.html      # Web page
    ├── style.css       # Styling
    └── script.js       # Interactions
```

## Troubleshooting

### Port 5000 is busy?
```bash
# Kill existing process
lsof -ti:5000 | xargs kill -9

# Or change port in app.py (last line)
app.run(debug=True, port=5001)  # Use 5001 instead
```

### Dependencies missing?
```bash
pip install --upgrade flask flask-cors
```

### Browser not showing changes?
- Clear cache (Ctrl+Shift+R)
- Or use incognito mode

### Can't see todos?
- Check `todos.json` exists
- Check terminal for error messages
- Verify server is running

## Features at a Glance

✅ Add, edit, delete todos
✅ Mark as complete/incomplete  
✅ Priority levels (High/Medium/Low)
✅ Due date tracking
✅ Smart date display (Today, Tomorrow, etc.)
✅ Separate pending/completed views
✅ Auto-save to JSON file
✅ Beautiful gradient UI
✅ Smooth animations
✅ Mobile responsive
✅ No framework needed

## API Endpoints (for developers)

```
GET    /api/todos        # Get all todos
POST   /api/todos        # Create todo
PATCH  /api/todos/:id    # Update todo
DELETE /api/todos/:id    # Delete todo
```

## Requirements

- Python 3.7+
- Flask
- Flask-CORS

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Tips

💡 Press Enter to quickly add tasks
💡 Click task badges to see priority
💡 Hover over dates for full date info
💡 Edit tasks inline - no popups needed
💡 Deleted tasks slide out smoothly
💡 Completed tasks move to separate tab

---

**Ready to go!** Start the app and visit http://localhost:5000 🎉
