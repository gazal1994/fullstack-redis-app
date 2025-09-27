import React, { useState, useEffect } from "react";
import "./TaskManager.scss";
import type { Task } from "./types";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { taskApi } from "../../services/api";

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskApi.getAllTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string, description?: string) => {
    try {
      const newTask = await taskApi.createTask({ 
        title: title.trim(), 
        description: description?.trim() 
      });
      setTasks((prev) => [newTask, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      console.error("Error creating task:", err);
    }
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, "title" | "description">>) => {
    try {
      const updatedTask = await taskApi.updateTask(id, {
        title: updates.title?.trim(),
        description: updates.description?.trim() || undefined,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  const setCompleted = async (id: string, completed: boolean) => {
    try {
      const updatedTask = await taskApi.updateTask(id, { completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      console.error("Error updating task completion:", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  if (loading) {
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
          <button className="retry-button" onClick={loadTasks}>
            Retry
          </button>
        </div>
      )}

      <h2 className="task-title">Add Task</h2>
      <TaskForm onAdd={addTask} />

      <h2 className="task-title">View Tasks</h2>
      <TaskList
        tasks={tasks}
        onUpdate={updateTask}
        onToggleComplete={setCompleted}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default TaskManager;
