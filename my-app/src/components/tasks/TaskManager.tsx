import React, { useState } from "react";
import "./TaskManager.scss";
import type { Task } from "./types";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (title: string, description?: string) => {
    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      description: description?.trim() || undefined,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: number, updates: Partial<Pick<Task, "title" | "description">>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, title: updates.title?.trim() ?? t.title,
        description: updates.description?.trim() || undefined } : t))
    );
  };

  const setCompleted = (id: number, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="task-manager">
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
