import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  syncWithReduxAtom,
} from '../atoms/todoAtoms';
import { useFeatureFlag } from './featureFlags';
import { 
  addTodoRequest, 
  updateTodoRequest, 
  deleteTodoRequest, 
  toggleTodoRequest 
} from '../actions/todoActions';
import { Todo, TodoFilter, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

// Modern state management hooks using Jotai
export function useModernTodos() {
  const todos = useAtomValue(filteredTodosAtom);
  const stats = useAtomValue(todoStatsAtom);
  const [filter, setFilter] = useAtom(filterAtom);
  const [loading] = useAtom(loadingAtom);
  const [error] = useAtom(errorAtom);
  
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

// Legacy state management hooks using Redux
export function useLegacyTodos() {
  const todos = useSelector((state: any) => {
    const allTodos = state.todos.todos || [];
    const filter = state.todos.filter || 'all';
    
    switch (filter) {
      case 'active':
        return allTodos.filter((todo: Todo) => !todo.completed);
      case 'completed':
        return allTodos.filter((todo: Todo) => todo.completed);
      default:
        return allTodos;
    }
  });
  
  const allTodos = useSelector((state: any) => state.todos.todos || []);
  const loading = useSelector((state: any) => state.todos.loading);
  const error = useSelector((state: any) => state.todos.error);
  const filter = useSelector((state: any) => state.todos.filter || 'all');
  const dispatch = useDispatch();

  const stats = {
    total: allTodos.length,
    active: allTodos.filter((todo: Todo) => !todo.completed).length,
    completed: allTodos.filter((todo: Todo) => todo.completed).length,
  };

  return {
    todos,
    stats,
    filter,
    loading,
    error,
    setFilter: (newFilter: TodoFilter) => {
      // Redux doesn't have a setFilter action in current implementation
      // This would need to be added to Redux actions
      console.log('Setting filter in Redux:', newFilter);
    },
    addTodo: (todo: CreateTodoRequest) => dispatch(addTodoRequest(todo)),
    updateTodo: (id: string, updates: UpdateTodoRequest) => dispatch(updateTodoRequest(id, updates)),
    deleteTodo: (id: string) => dispatch(deleteTodoRequest(id)),
    toggleTodo: (id: string) => dispatch(toggleTodoRequest(id)),
  };
}

// Hybrid hook that switches between modern and legacy based on feature flag
export function useTodos() {
  const useJotai = useFeatureFlag('USE_JOTAI');
  
  if (useJotai) {
    return useModernTodos();
  }
  
  return useLegacyTodos();
}

// Individual component-level feature flag hooks
export function useTodoItem() {
  const useModern = useFeatureFlag('USE_MODERN_TODO_ITEM');
  return useModern ? useModernTodos() : useLegacyTodos();
}

export function useTodoForm() {
  const useModern = useFeatureFlag('USE_MODERN_TODO_FORM');
  return useModern ? useModernTodos() : useLegacyTodos();
}

export function useTodoList() {
  const useModern = useFeatureFlag('USE_MODERN_TODO_LIST');
  return useModern ? useModernTodos() : useLegacyTodos();
}

export function useTodoFilters() {
  const useModern = useFeatureFlag('USE_MODERN_TODO_FILTERS');
  return useModern ? useModernTodos() : useLegacyTodos();
}

// Development helper to sync Redux state to Jotai atoms
export function useStateSyncer() {
  const reduxState = useSelector((state: any) => state);
  const setSync = useSetAtom(syncWithReduxAtom);
  
  React.useEffect(() => {
    setSync(reduxState);
  }, [reduxState, setSync]);
}