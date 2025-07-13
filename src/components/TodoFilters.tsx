import React, { useCallback } from 'react';
import { TodoFilter } from '../types/todo';

interface TodoCount {
  total: number;
  active: number;
  completed: number;
}

interface TodoFiltersProps {
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  todoCount: TodoCount;
}

const ModernTodoFilters: React.FC<TodoFiltersProps> = ({ filter, onFilterChange, todoCount }) => {
  // Safe handling of todoCount (same as legacy)
  const safeCount = todoCount || { active: 0, total: 0, completed: 0 };

  // Event handlers with useCallback for performance optimization
  const handleAllClick = useCallback(() => {
    onFilterChange && onFilterChange('all');
  }, [onFilterChange]);

  const handleActiveClick = useCallback(() => {
    onFilterChange && onFilterChange('active');
  }, [onFilterChange]);

  const handleCompletedClick = useCallback(() => {
    onFilterChange && onFilterChange('completed');
  }, [onFilterChange]);

  return (
    <div className="todo-filters">
      <div className="todo-count">
        <span>{safeCount.active} of {safeCount.total} remaining</span>
      </div>
      
      <div className="filter-buttons">
        <button
          className={`btn ${filter === 'all' ? 'active' : ''}`}
          onClick={handleAllClick}
        >
          All
        </button>
        <button
          className={`btn ${filter === 'active' ? 'active' : ''}`}
          onClick={handleActiveClick}
        >
          Active
        </button>
        <button
          className={`btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={handleCompletedClick}
        >
          Completed
        </button>
      </div>
    </div>
  );
};

export default ModernTodoFilters;