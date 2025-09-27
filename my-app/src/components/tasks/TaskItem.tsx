import React, { useState } from "react";
import type { Task } from "./types";

interface Props {
  task: Task;
  onUpdate: (id: string, updates: { title?: string; description?: string }) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<Props> = ({ task, onUpdate, onToggleComplete, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? "");

  const save = () => {
    const nextTitle = editTitle.trim();
    if (!nextTitle) return;
    onUpdate(task.id, {
      title: nextTitle,
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
  };

  const cancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setIsEditing(false);
  };

  return (
    <li className={`task-item ${task.completed ? "is-completed" : ""}`}>
      {!isEditing ? (
        <>
          <label className="task-row">
            <input
              type="checkbox"
              className="task-checkbox"
              checked={task.completed}
              onChange={(e) => onToggleComplete(task.id, e.target.checked)}
              aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "completed"}`}
            />
            <div className="task-info">
              <strong className="task-title-text">{task.title}</strong>
              {task.description && <p>{task.description}</p>}
              <span className={`task-status ${task.completed ? "completed" : "pending"}`}>
                {task.completed ? "✅ Completed" : "⏳ Pending"}
              </span>
            </div>
          </label>

          <div className="task-actions three-cols">
            <button className="secondary-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>
            <button
              className="danger-btn"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
            >
              🗑️ Delete
            </button>
          </div>
        </>
      ) : (
        <div className="edit-block">
          <input
            className="task-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title *"
            aria-label="Edit task title"
          />
          <textarea
            className="task-textarea"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            aria-label="Edit task description"
          />
          <div className="edit-actions">
            <button className="task-button" disabled={!editTitle.trim()} onClick={save}>
              💾 Save
            </button>
            <button className="secondary-btn" onClick={cancel}>
              ✖️ Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default TaskItem;
