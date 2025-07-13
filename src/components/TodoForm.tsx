import React, { useState, useCallback } from 'react';
import { CreateTodoRequest } from '../types/todo';

interface TodoFormProps {
  onAdd: (todo: CreateTodoRequest) => void;
}

const ModernTodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  // State hook replaces class component state
  const [text, setText] = useState('');

  // Event handlers with useCallback for performance optimization
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (text.trim()) {
      try {
        onAdd({ text: text.trim() });
      } catch (error) {
        // Handle onAdd errors gracefully (same as legacy)
        console.error('Failed to add todo:', error);
      }
    }
    // Always clear the input after form submission (same as legacy)
    setText('');
  }, [text, onAdd]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="What needs to be done?"
        className="todo-input"
      />
      <button type="submit" className="btn btn-add" tabIndex={0}>
        Add Todo
      </button>
    </form>
  );
};

export default ModernTodoForm;