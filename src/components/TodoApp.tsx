import React from 'react';
import { useAtom } from 'jotai';
import { 
  filteredTodosAtom, 
  filterAtom, 
  todoStatsAtom,
  addTodoAtom,
  updateTodoAtom,
  deleteTodoAtom,
  toggleTodoAtom
} from '../atoms/todoAtoms';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import TodoFilters from './TodoFilters';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

export const TodoApp: React.FC = () => {
  // Jotai state management
  const [filteredTodos] = useAtom(filteredTodosAtom);
  const [filter, setFilter] = useAtom(filterAtom);
  const [stats] = useAtom(todoStatsAtom);
  const [, addTodo] = useAtom(addTodoAtom);
  const [, updateTodo] = useAtom(updateTodoAtom);
  const [, deleteTodo] = useAtom(deleteTodoAtom);
  const [, toggleTodo] = useAtom(toggleTodoAtom);

  // Event handlers
  const handleAddTodo = (todo: CreateTodoRequest) => {
    addTodo(todo);
  };

  const handleToggleTodo = (id: string) => {
    toggleTodo(id);
  };

  const handleUpdateTodo = (id: string, updates: UpdateTodoRequest) => {
    updateTodo({ id, updates });
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
  };

  const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    setFilter(newFilter);
  };

  return (
    <div className="todo-app">
      <header>
        <h1>Modern TODO App</h1>
        <p>Next.js 15 + React 19 + Jotai</p>
      </header>
      
      <main>
        <TodoForm onAdd={handleAddTodo} />
        
        <div className="todo-stats">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Completed: {stats.completed}</span>
        </div>
        
        <TodoFilters 
          filter={filter}
          onFilterChange={handleFilterChange}
          todoCount={stats}
        />
        
        <TodoList
          todos={filteredTodos}
          onToggle={handleToggleTodo}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />
        
        {filteredTodos.length === 0 && (
          <div className="empty-state">
            {filter === 'all' ? 'No todos yet. Add one above!' : `No ${filter} todos.`}
          </div>
        )}
      </main>
    </div>
  );
};