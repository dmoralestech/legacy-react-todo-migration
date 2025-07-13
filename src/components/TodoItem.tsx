import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Todo, UpdateTodoRequest } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
}

const ModernTodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onUpdate, onDelete }) => {
  // State hooks replace class component state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  
  // Ref to track cancellation state (replaces instance variable)
  const isCancellingRef = useRef(false);
  
  // Update editText when todo.text changes (similar to getDerivedStateFromProps)
  useEffect(() => {
    setEditText(todo.text);
  }, [todo.text]);

  // Event handlers with useCallback for performance optimization
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(todo.text);
  }, [todo.text]);

  const handleSave = useCallback(() => {
    if (isCancellingRef.current) {
      return;
    }
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim() });
      setIsEditing(false);
    }
  }, [editText, onUpdate, todo.id]);

  const handleCancel = useCallback(() => {
    isCancellingRef.current = true;
    setIsEditing(false);
    setEditText(todo.text);
    
    // Reset cancelling flag after state update (using setTimeout like legacy)
    setTimeout(() => {
      isCancellingRef.current = false;
    }, 10);
  }, [todo.text]);

  const handleBlur = useCallback(() => {
    // Only save on blur if we're not cancelling (same logic as legacy)
    if (!isCancellingRef.current) {
      handleSave();
    }
  }, [handleSave]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  }, []);

  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [onToggle, todo.id]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [onDelete, todo.id]);

  const handleMouseDown = useCallback(() => {
    isCancellingRef.current = true;
  }, []);

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="todo-checkbox"
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            className="todo-edit-input"
            autoFocus
          />
        ) : (
          <span
            className={`todo-text ${todo.completed ? 'completed' : ''}`}
            onDoubleClick={handleEdit}
          >
            {todo.text}
          </span>
        )}
      </div>

      <div className="todo-actions">
        {!isEditing && (
          <>
            <button onClick={handleEdit} className="btn btn-edit">
              Edit
            </button>
            <button onClick={handleDelete} className="btn btn-delete">
              Delete
            </button>
          </>
        )}
        {isEditing && (
          <>
            <button onClick={handleSave} className="btn btn-save">
              Save
            </button>
            <button 
              onMouseDown={handleMouseDown}
              onClick={handleCancel} 
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </li>
  );
};

export default ModernTodoItem;