import React from "react";
import type { Task } from "./types";
import TaskItem from "./TaskItem";

interface Props {
  tasks: Task[];
  onUpdate: (id: string, updates: { title?: string; description?: string }) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onUpdate, onToggleComplete, onDelete }) => {
  if (tasks.length === 0) return <p>No tasks yet.</p>;

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default TaskList;
