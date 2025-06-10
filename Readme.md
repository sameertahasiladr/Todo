# TodoMaster - Full Stack Todo Application

A beautiful, modern todo application built with React frontend and Python FastAPI backend.

## Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.7 or higher)
- pip (Python package installer)

### Starting Both Servers

#### Option 1: Using Two Terminals (Recommended)

**Terminal 1 - Start Backend Server:**
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```
The backend will start on `http://localhost:8000`

**Terminal 2 - Start Frontend Server:**
```bash
# Make sure you're in the root directory
# Install frontend dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```
The frontend will start on `http://localhost:5173`

#### Option 2: Using Scripts (Alternative)

You can also use the provided npm scripts:

```bash
# Start backend (from root directory)
npm run start:backend

# Start frontend (from root directory) 
npm run start:frontend
```

### Verification

1. **Backend Running**: Visit `http://localhost:8000` - you should see: `{"message": "Todo API is running! Visit /docs for API documentation."}`

2. **Frontend Running**: Visit `http://localhost:5173` - you should see the TodoMaster application

3. **API Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation

### Troubleshooting

**Backend Issues:**
- Make sure Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

**Frontend Issues:**
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 5173 is available

**Connection Issues:**
- The frontend will show a red banner if it can't connect to the backend
- Make sure both servers are running
- Check that backend is on port 8000 and frontend on port 5173

### Features

- ✅ Create, read, update, delete todos
- ✅ Priority levels (low, medium, high)
- ✅ Search and filter functionality
- ✅ Responsive design
- ✅ Real-time backend connection status
- ✅ Beautiful UI with shadcn/ui components
- ✅ SQLite database for persistence

### Project Structure

```
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── src/                    # React frontend
│   ├── App.tsx            # Main application component
│   ├── components/        # UI components
│   └── ...
├── package.json           # Frontend dependencies
└── README.md             # This file
```

### Development

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- Database file: `backend/todos.db` (created automatically)
- API documentation: `http://localhost:8000/docs`



### Images

![alt text](<Screenshot 2025-06-10 162512.png>) ![alt text](<Screenshot 2025-06-10 162525.png>) ![alt text](<Screenshot 2025-06-10 162553.png>) ![alt text](<Screenshot 2025-06-10 162643.png>) ![alt text](<Screenshot 2025-06-10 162701.png>) ![alt text](<Screenshot 2025-06-10 162715.png>) ![alt text](<Screenshot 2025-06-10 162729.png>)