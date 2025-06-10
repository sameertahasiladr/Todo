from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Boolean, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./todos.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database Models
class TodoDB(Base):
    __tablename__ = "todos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None

class Todo(TodoBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI(
    title="Todo API",
    description="A simple Todo API built with FastAPI and SQLite",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Routes
@app.get("/")
async def root():
    return {"message": "Todo API is running! Visit /docs for API documentation."}

@app.get("/todos", response_model=List[Todo])
async def get_todos(
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all todos with optional filtering
    """
    try:
        query = db.query(TodoDB)
        
        if completed is not None:
            query = query.filter(TodoDB.completed == completed)
        
        if priority:
            query = query.filter(TodoDB.priority == priority)
        
        todos = query.order_by(TodoDB.created_at.desc()).offset(skip).limit(limit).all()
        return todos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving todos: {str(e)}")

@app.get("/todos/{todo_id}", response_model=Todo)
async def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """
    Get a specific todo by ID
    """
    try:
        todo = db.query(TodoDB).filter(TodoDB.id == todo_id).first()
        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found")
        return todo
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving todo: {str(e)}")

@app.post("/todos", response_model=Todo)
async def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    """
    Create a new todo
    """
    try:
        # Validate priority
        valid_priorities = ["low", "medium", "high"]
        if todo.priority not in valid_priorities:
            raise HTTPException(status_code=400, detail=f"Priority must be one of: {valid_priorities}")
        
        db_todo = TodoDB(
            title=todo.title.strip(),
            description=todo.description.strip() if todo.description else "",
            priority=todo.priority
        )
        
        if not db_todo.title:
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        
        db.add(db_todo)
        db.commit()
        db.refresh(db_todo)
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating todo: {str(e)}")

@app.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, todo_update: TodoUpdate, db: Session = Depends(get_db)):
    """
    Update an existing todo
    """
    try:
        db_todo = db.query(TodoDB).filter(TodoDB.id == todo_id).first()
        if not db_todo:
            raise HTTPException(status_code=404, detail="Todo not found")
        
        # Update fields if provided
        update_data = todo_update.dict(exclude_unset=True)
        
        if "priority" in update_data:
            valid_priorities = ["low", "medium", "high"]
            if update_data["priority"] not in valid_priorities:
                raise HTTPException(status_code=400, detail=f"Priority must be one of: {valid_priorities}")
        
        if "title" in update_data:
            if not update_data["title"].strip():
                raise HTTPException(status_code=400, detail="Title cannot be empty")
            update_data["title"] = update_data["title"].strip()
        
        if "description" in update_data:
            update_data["description"] = update_data["description"].strip() if update_data["description"] else ""
        
        for field, value in update_data.items():
            setattr(db_todo, field, value)
        
        db_todo.updated_at = func.now()
        db.commit()
        db.refresh(db_todo)
        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating todo: {str(e)}")

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """
    Delete a todo
    """
    try:
        db_todo = db.query(TodoDB).filter(TodoDB.id == todo_id).first()
        if not db_todo:
            raise HTTPException(status_code=404, detail="Todo not found")
        
        db.delete(db_todo)
        db.commit()
        return {"message": "Todo deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting todo: {str(e)}")

@app.get("/todos/stats/summary")
async def get_todo_stats(db: Session = Depends(get_db)):
    """
    Get todo statistics
    """
    try:
        total = db.query(TodoDB).count()
        completed = db.query(TodoDB).filter(TodoDB.completed == True).count()
        pending = total - completed
        
        high_priority = db.query(TodoDB).filter(TodoDB.priority == "high", TodoDB.completed == False).count()
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "high_priority_pending": high_priority
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)