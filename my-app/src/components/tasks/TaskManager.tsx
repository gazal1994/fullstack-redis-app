import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./TaskManager.scss";
import type { Task } from "./types";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import TaskFilters from "./TaskFilters";
import { 
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} from "../../store/apiSlice";
import {
  selectTaskFilter,
  selectSearchQuery,
  selectShowCompleted,
  selectTaskSort,
  setLastAction,
} from "../../store/taskSlice";
import type { RootState } from "../../store";

const TaskManager: React.FC = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  
  // RTK Query hooks
  const { data: tasksResponse, isLoading, isError, error: queryError, refetch } = useGetTasksQuery(undefined);
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  
  // Task slice selectors
  const filter = useSelector((state: RootState) => selectTaskFilter(state));
  const searchQuery = useSelector((state: RootState) => selectSearchQuery(state));
  const showCompleted = useSelector((state: RootState) => selectShowCompleted(state));
  const { sortBy, sortOrder } = useSelector((state: RootState) => selectTaskSort(state));
  
  // Extract tasks from the API response
  const allTasks = tasksResponse?.data || [];
  
  // Filter and sort tasks based on taskSlice state
  const filteredTasks = useMemo(() => {
    let filtered = [...allTasks];
    
    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(task => 
        filter === 'completed' ? task.completed : !task.completed
      );
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false)
      );
    }
    
    // Apply show completed filter
    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'completed':
          comparison = (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [allTasks, filter, searchQuery, showCompleted, sortBy, sortOrder]);

  // Handle RTK Query errors
  React.useEffect(() => {
    if (isError) {
      setError(queryError ? 'Failed to load tasks' : 'Unknown error occurred');
    } else {
      setError(null);
    }
  }, [isError, queryError]);

  const addTask = async (title: string, description?: string) => {
    try {
      setError(null);
      await createTask({ 
        title: title.trim(), 
        description: description?.trim() 
      }).unwrap();
      
      dispatch(setLastAction({
        type: 'create',
        success: true,
        message: 'Task created successfully!',
        timestamp: Date.now()
      }));
    } catch (err: any) {
      const errorMessage = err.data?.error || err.message || "Failed to create task";
      setError(errorMessage);
      
      dispatch(setLastAction({
        type: 'create',
        success: false,
        message: errorMessage,
        timestamp: Date.now()
      }));
      console.error("Error creating task:", err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Pick<Task, "title" | "description">>) => {
    try {
      setError(null);
      await updateTask({
        id,
        data: {
          title: updates.title?.trim(),
          description: updates.description?.trim() || undefined,
        }
      }).unwrap();
      
      dispatch(setLastAction({
        type: 'update',
        success: true,
        message: 'Task updated successfully!',
        timestamp: Date.now()
      }));
    } catch (err: any) {
      const errorMessage = err.data?.error || err.message || "Failed to update task";
      setError(errorMessage);
      
      dispatch(setLastAction({
        type: 'update',
        success: false,
        message: errorMessage,
        timestamp: Date.now()
      }));
      console.error("Error updating task:", err);
    }
  };

  const setCompleted = async (id: string, completed: boolean) => {
    try {
      setError(null);
      await updateTask({
        id,
        data: { completed }
      }).unwrap();
    } catch (err: any) {
      const errorMessage = err.data?.error || err.message || "Failed to update task";
      setError(errorMessage);
      console.error("Error updating task completion:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await deleteTask(id).unwrap();
      
      dispatch(setLastAction({
        type: 'delete',
        success: true,
        message: 'Task deleted successfully!',
        timestamp: Date.now()
      }));
    } catch (err: any) {
      const errorMessage = err.data?.error || err.message || "Failed to delete task";
      setError(errorMessage);
      
      dispatch(setLastAction({
        type: 'delete',
        success: false,
        message: errorMessage,
        timestamp: Date.now()
      }));
      console.error("Error deleting task:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="task-manager">
        <div className="loading-state">
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-manager">
      {error && (
        <div className="error-state">
          <p className="error-message">⚠️ {error}</p>
          <button className="retry-button" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <h2 className="task-title">Add Task</h2>
      <TaskForm onAdd={addTask} />

      <h2 className="task-title">Manage Tasks</h2>
      <TaskFilters />

      <div className="task-stats">
        <p>
          Showing {filteredTasks.length} of {allTasks.length} tasks
          {filter !== 'all' && ` (${filter})`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      <TaskList
        tasks={filteredTasks}
        onUpdate={handleUpdateTask}
        onToggleComplete={setCompleted}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default TaskManager;
