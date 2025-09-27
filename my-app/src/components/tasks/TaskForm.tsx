import React, { useState } from "react";

interface Props {
  onAdd: (title: string, description?: string) => void;
}

const TaskForm: React.FC<Props> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <>
      <input
        type="text"
        placeholder="Task title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="task-input"
        aria-label="Task title"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="task-textarea"
        aria-label="Task description"
      />
      <button
        onClick={submit}
        disabled={!title.trim()}
        className="task-button"
      >
        ➕ Add Task
      </button>
    </>
  );
};

export default TaskForm;
