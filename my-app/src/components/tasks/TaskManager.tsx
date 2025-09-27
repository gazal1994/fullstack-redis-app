import React, { useState } from "react";
import "./TaskManager.scss";
import type { Task } from "./types";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { 
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} from "../../store/apiSlice";

const TaskManager: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  
  // RTK Query hooks
  const { data: tasksResponse, isLoading, isError, error: queryError, refetch } = useGetTasksQuery(undefined);
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  
  // Extract tasks from the API response
  const tasks = tasksResponse?.data || [];

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
    } catch (err: any) {
      setError(err.data?.error || err.message || "Failed to create task");
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
    } catch (err: any) {
      setError(err.data?.error || err.message || "Failed to update task");
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
      setError(err.data?.error || err.message || "Failed to update task");
      console.error("Error updating task completion:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await deleteTask(id).unwrap();
    } catch (err: any) {
      setError(err.data?.error || err.message || "Failed to delete task");
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

      <h2 className="task-title">View Tasks</h2>
      <TaskList
        tasks={tasks}
        onUpdate={handleUpdateTask}
        onToggleComplete={setCompleted}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default TaskManager;
