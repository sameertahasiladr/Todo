# Todo API Backend

A modern, production-ready Todo API built with FastAPI and SQLite.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs with Python 3.7+
- **SQLite Database**: Lightweight, serverless database for local storage
- **SQLAlchemy ORM**: Powerful SQL toolkit and Object-Relational Mapping library
- **Pydantic Models**: Data validation using Python type annotations
- **CORS Support**: Cross-Origin Resource Sharing for frontend integration
- **RESTful API**: Full CRUD operations for todo management
- **Error Handling**: Comprehensive error handling with meaningful messages
- **API Documentation**: Auto-generated documentation with Swagger UI

## Requirements

- Python 3.7 or higher
- pip (Python package installer)

## Installation & Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

The API will be available at `http://localhost:8000`

### Main Endpoints

- `GET /` - API health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

### Todo Endpoints

- `GET /todos` - Get all todos (with optional filtering)
- `GET /todos/{todo_id}` - Get a specific todo
- `POST /todos` - Create a new todo
- `PUT /todos/{todo_id}` - Update an existing todo
- `DELETE /todos/{todo_id}` - Delete a todo
- `GET /todos/stats/summary` - Get todo statistics

### Query Parameters for GET /todos

- `skip` (int): Number of todos to skip (default: 0)
- `limit` (int): Maximum number of todos to return (default: 100)
- `completed` (bool): Filter by completion status
- `priority` (string): Filter by priority ("low", "medium", "high")

## Data Models

### Todo Object
```json
{
  "id": 1,
  "title": "Complete project",
  "description": "Finish the todo application",
  "completed": false,
  "priority": "high",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Create Todo Request
```json
{
  "title": "New todo",
  "description": "Optional description",
  "priority": "medium"
}
```

### Update Todo Request
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "priority": "low"
}
```

## Database

The application uses SQLite with a file-based database (`todos.db`) that will be created automatically when you first run the server. The database schema includes:

- **todos** table with columns:
  - `id` (Primary Key, Auto-increment)
  - `title` (String, Required)
  - `description` (String, Optional)
  - `completed` (Boolean, Default: false)
  - `priority` (String, Default: "medium")
  - `created_at` (DateTime, Auto-generated)
  - `updated_at` (DateTime, Auto-updated)

## Development

### Running in Development Mode

For development with auto-reload:
```bash
uvicorn main:app --reload
```

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Testing the API

You can test the API using:
- The interactive documentation at `/docs`
- curl commands
- Postman or similar API testing tools
- The provided React frontend
## Error Handling

The API includes comprehensive error handling:
- 400: Bad Request (validation errors)
- 404: Not Found (todo doesn't exist)
- 500: Internal Server Error (unexpected errors)

All errors return JSON responses with meaningful error messages.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

### Images
![alt text](<Screenshot 2025-06-10 162512.png>) ![alt text](<Screenshot 2025-06-10 162525.png>) ![alt text](<Screenshot 2025-06-10 162553.png>) ![alt text](<Screenshot 2025-06-10 162643.png>) ![alt text](<Screenshot 2025-06-10 162701.png>) ![alt text](<Screenshot 2025-06-10 162715.png>) ![alt text](<Screenshot 2025-06-10 162729.png>)