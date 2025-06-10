import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, CheckCircle2, Circle, Edit3, Trash2, Check, X, AlertCircle, Calendar, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTodo, setNewTodo] = useState<CreateTodoRequest>({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [editTodo, setEditTodo] = useState<UpdateTodoRequest>({});
  const [backendConnected, setBackendConnected] = useState(false);
  const [creating, setCreatingState] = useState(false);
  const { toast } = useToast();

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (response.ok) {
        setBackendConnected(true);
        return true;
      }
    } catch (error) {
      setBackendConnected(false);
      return false;
    }
    return false;
  };

  const fetchTodos = async () => {
    try {
      const isConnected = await checkBackendConnection();
      if (!isConnected) {
        toast({
          title: "Backend Not Connected",
          description: "Please start the Python backend server on port 8000. See console for instructions.",
          variant: "destructive",
        });
        console.log("🚀 To start the backend server:");
        console.log("1. Open a new terminal");
        console.log("2. cd backend");
        console.log("3. pip install -r requirements.txt");
        console.log("4. python main.py");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setBackendConnected(true);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setBackendConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to backend. Make sure the Python server is running on port 8000.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData: CreateTodoRequest) => {
    if (!backendConnected) {
      toast({
        title: "Backend Notification",
        description: "Please start the Python backend server first.",
        variant: "destructive",
      });
      return;
    }

    setCreatingState(true);
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create todo');
      }
      
      const newTodoItem = await response.json();
      setTodos(prev => [newTodoItem, ...prev]);
      toast({
        title: "Success",
        description: "Todo created successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error creating todo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create todo",
        variant: "destructive",
      });
      return false;
    } finally {
      setCreatingState(false);
    }
  };

  const updateTodo = async (id: number, todoData: UpdateTodoRequest) => {
    if (!backendConnected) {
      toast({
        title: "Backend Notification",
        description: "Please start the Python backend server first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update todo');
      }
      
      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
      toast({
        title: "Success",
        description: "Todo updated successfully!",
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id: number) => {
    if (!backendConnected) {
      toast({
        title: "Backend Notification",
        description: "Please start the Python backend server first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete todo');
      }
      
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast({
        title: "Success",
        description: "Todo deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a todo title.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await createTodo(newTodo);
    if (success) {
      setNewTodo({ title: '', description: '', priority: 'medium' });
      setIsCreating(false);
    }
  };

  const handleUpdateTodo = async (id: number) => {
    if (!editTodo.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a todo title.",
        variant: "destructive",
      });
      return;
    }
    
    await updateTodo(id, editTodo);
    setEditingId(null);
    setEditTodo({});
  };

  const toggleComplete = async (todo: Todo) => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTodo({});
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="w-3 h-3 fill-current" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      case 'low': return <Circle className="w-3 h-3" />;
      default: return <Circle className="w-3 h-3" />;
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && todo.completed) ||
                         (filterStatus === 'pending' && !todo.completed);
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const pendingCount = totalCount - completedCount;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 overflow-auto">
      {/* Global and component-specific styles */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
      `}</style>

      <div className="flex-1 flex flex-col w-full max-w-[100vw] mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Backend Connection Status */}
        {!backendConnected && (
          <Card className="mb-4 bg-red-50 border-red-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1 sm:mt-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-red-800 text-lg">Backend Server Not Running</h3>
                  <p className="text-red-700 mt-1 text-sm sm:text-base">
                    To use the todo app, please start the Python backend server:
                  </p>
                  <div className="mt-3 text-sm font-mono bg-red-100 p-3 rounded-lg border border-red-200 overflow-x-auto">
                    <div className="whitespace-nowrap">1. Open a new terminal</div>
                    <div className="whitespace-nowrap">2. cd backend</div>
                    <div className="whitespace-nowrap">3. pip install -r requirements.txt</div>
                    <div className="whitespace-nowrap">4. python main.py</div>
                  </div>
                  <Button 
                    onClick={fetchTodos} 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-red-300 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Retry Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
            Todo<span className="text-violet-600">Master</span>
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl mb-6">Organize your tasks with style and efficiency</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto mb-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-violet-600">{totalCount}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{completedCount}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Done</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className={`flex items-center justify-center gap-1 text-sm ${backendConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{backendConnected ? 'Online' : 'Offline'}</span>
                </div>
                <div className="text-xs text-gray-600 font-medium">Status</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 sm:mb-6 bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search todos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400 transition-colors"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: 'all' | 'completed' | 'pending') => setFilterStatus(value)}>
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={(value: 'all' | 'low' | 'medium' | 'high') => setFilterPriority(value)}>
                <SelectTrigger className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setIsCreating(true)}
                disabled={!backendConnected}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Todo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Todo Form */}
        {isCreating && (
          <Card className="mb-4 sm:mb-6 bg-white/90 backdrop-blur-sm border-white/50 shadow-xl animate-in slide-in-from-top duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-600" />
                Create New Todo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleCreateTodo} className="space-y-4">
                <Input
                  placeholder="What needs to be done?"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400 text-lg py-3"
                  required
                />
                <Textarea
                  placeholder="Add a description (optional)..."
                  value={newTodo.description}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400 min-h-[100px] resize-none"
                />
                <Select value={newTodo.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTodo(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3 text-emerald-600" />
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-red-600 fill-current" />
                        High Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={creating || !backendConnected}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex-1 sm:flex-none"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Create Todo
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                    className="border-gray-300 hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Todo List */}
        <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto hide-scrollbar">
          {filteredTodos.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl h-full flex items-center justify-center">
              <CardContent className="py-16 sm:py-20 text-center">
                <div className="text-gray-300 mb-6">
                  <Circle className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">No todos found</h3>
                <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
                  {todos.length === 0 
                    ? backendConnected 
                      ? "Ready to get organized? Create your first todo to get started!" 
                      : "Connect to the backend server to see your todos."
                    : "Try adjusting your search or filters to find what you're looking for."}
                </p>
                {todos.length === 0 && backendConnected && (
                  <Button 
                    onClick={() => setIsCreating(true)}
                    className="mt-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Todo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <Card 
                key={todo.id} 
                className={`bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] ${
                  todo.completed ? 'opacity-75' : ''
                } animate-in slide-in-from-bottom duration-300`}
              >
                <CardContent className="p-4 sm:p-6">
                  {editingId === todo.id ? (
                    <div className="space-y-4">
                      <Input
                        value={editTodo.title || ''}
                        onChange={(e) => setEditTodo(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400 text-lg"
                      />
                      <Textarea
                        value={editTodo.description || ''}
                        onChange={(e) => setEditTodo(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400 min-h-[100px] resize-none"
                      />
                      <Select value={editTodo.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditTodo(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="bg-white/80 border-gray-200 focus:border-violet-400 focus:ring-violet-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <Circle className="w-3 h-3 text-emerald-600" />
                              Low Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Medium Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-red-600 fill-current" />
                              High Priority
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button 
                          onClick={() => handleUpdateTodo(todo.id)} 
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          onClick={cancelEdit} 
                          variant="outline" 
                          className="border-gray-300 hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 sm:gap-4">
                      <button
                        onClick={() => toggleComplete(todo)}
                        className="mt-1 transition-all duration-300 hover:scale-110"
                        disabled={!backendConnected}
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-violet-600" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-lg sm:text-xl leading-tight ${
                              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {todo.title}
                            </h3>
                            {todo.description && (
                              <p className={`mt-2 text-sm sm:text-base leading-relaxed ${
                                todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
                              }`}>
                                {todo.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                              <Badge className={`text-xs font-medium px-2 py-1 ${getPriorityColor(todo.priority)} transition-colors`}>
                                <div className="flex items-center gap-1">
                                  {getPriorityIcon(todo.priority)}
                                  {todo.priority} priority
                                </div>
                              </Badge>
                              <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-600 border-gray-200">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(todo.created_at).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={() => startEdit(todo)}
                              variant="ghost"
                              size="sm"
                              disabled={!backendConnected}
                              className="text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-all duration-300 hover:scale-105"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteTodo(todo.id)}
                              variant="ghost"
                              size="sm"
                              disabled={!backendConnected}
                              className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-sm text-gray-500">
          <p>All rights reserved by sameer</p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;