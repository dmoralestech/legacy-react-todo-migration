import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  todosAtom,
  filteredTodosAtom, 
  todoStatsAtom, 
  filterAtom,
  loadingAtom,
  errorAtom,
  addTodoActionAtom,
  updateTodoActionAtom,
  deleteTodoActionAtom,
  toggleTodoActionAtom,
} from '../atoms/todoAtoms';
import { Todo, TodoFilter, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

// Modern state management hooks using Jotai
export function useModernTodos() {
  // Use base atoms directly to avoid derived atom issues
  const allTodos = useAtomValue(todosAtom);
  const [filter, setFilter] = useAtom(filterAtom);
  const [loading] = useAtom(loadingAtom);
  const [error] = useAtom(errorAtom);
  
  // Calculate filtered todos manually to avoid derived atom issues
  const todos = React.useMemo(() => {
    if (!Array.isArray(allTodos)) return [];
    
    switch (filter) {
      case 'active':
        return allTodos.filter(todo => !todo.completed);
      case 'completed':
        return allTodos.filter(todo => todo.completed);
      default:
        return allTodos;
    }
  }, [allTodos, filter]);
  
  // Calculate stats manually
  const stats = React.useMemo(() => {
    if (!Array.isArray(allTodos)) return { total: 0, active: 0, completed: 0 };
    
    return {
      total: allTodos.length,
      active: allTodos.filter(todo => !todo.completed).length,
      completed: allTodos.filter(todo => todo.completed).length,
    };
  }, [allTodos]);
  
  const addTodo = useSetAtom(addTodoActionAtom);
  const updateTodo = useSetAtom(updateTodoActionAtom);
  const deleteTodo = useSetAtom(deleteTodoActionAtom);
  const toggleTodo = useSetAtom(toggleTodoActionAtom);

  return {
    todos,
    stats,
    filter,
    loading,
    error,
    setFilter,
    addTodo: (todo: CreateTodoRequest) => addTodo(todo),
    updateTodo: (id: string, updates: UpdateTodoRequest) => updateTodo({ id, updates }),
    deleteTodo: (id: string) => deleteTodo(id),
    toggleTodo: (id: string) => toggleTodo(id),
  };
}

// Main hook for Jotai-only state management
export function useTodos() {
  return useModernTodos();
}