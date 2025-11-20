# TODO Application

A Django-based TODO application for managing your tasks.

## Getting Started

### Prerequisites

- Python 3.x
- Django 5.2.8 or higher

### Installation

1. Navigate to the application directory:
```bash
cd 01-todo
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

### Running the Application

1. Start the Django development server:
```bash
python manage.py runserver
```

2. Open your web browser and navigate to:
```
http://127.0.0.1:8000/
```

## How to Use the TODO App

### Adding a Task
1. Enter your task description in the input field
2. Click the "Add" button to create a new task

### Viewing Tasks
- All your tasks are displayed in a list on the main page
- Each task shows its description and current status

### Completing a Task
- Click the "Complete" button next to a task to mark it as done
- Completed tasks will be visually indicated

### Deleting a Task
- Click the "Delete" button next to any task to remove it from your list

## Project Structure

```
01-todo/
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
├── db.sqlite3         # SQLite database
├── todoproject/       # Project configuration
└── todos/             # TODO app module
```

## Features

- Create new TODO items
- Mark tasks as complete
- Delete tasks
- Persistent storage using SQLite database
- Clean and intuitive web interface
