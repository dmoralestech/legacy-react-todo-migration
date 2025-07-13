import React from 'react';
import { Todo, UpdateTodoRequest } from '../types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
}

const ModernTodoList: React.FC<TodoListProps> = ({ todos, onToggle, onUpdate, onDelete }) => {
  // Safe handling of todos array (same as legacy)
  const safeTodos = todos || [];

  // Empty state rendering (same as legacy)
  if (safeTodos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p>No todos yet. Add one above!</p>
      </div>
    );
  }

  // Render todo list (same as legacy)
  return (
    <ul className="todo-list">
      {safeTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default ModernTodoList;