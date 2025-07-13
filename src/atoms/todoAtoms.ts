import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { Todo, TodoFilter, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

// Basic atoms that mirror Redux state
export const todosAtom = atom<Todo[]>([]);
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
export const filterAtom = atom<TodoFilter>('all');

// Derived atoms (computed state) - replaces Redux selectors
export const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);
  
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
});

export const todoStatsAtom = atom((get) => {
  const todos = get(todosAtom);
  return {
    total: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
  };
});

// Server state atom using TanStack Query integration
// TODO: Re-enable atomWithQuery after basic Jotai integration is working
// export const todosQueryAtom = atomWithQuery(() => ({
//   queryKey: ['todos'],
//   queryFn: async (): Promise<Todo[]> => {
//     // Mock API call - replace with real API
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve([
//           {
//             id: '1',
//             text: 'Learn Jotai atomic state management',
//             completed: false,
//             createdAt: new Date().toISOString(),
//           },
//           {
//             id: '2', 
//             text: 'Migrate from Redux to Jotai gradually',
//             completed: false,
//             createdAt: new Date().toISOString(),
//           }
//         ]);
//       }, 1000);
//     });
//   },
//   staleTime: 5 * 60 * 1000, // 5 minutes
//   refetchOnWindowFocus: false,
// }));

// Write-only atoms (actions) - replaces Redux actions
export const addTodoActionAtom = atom(
  null,
  (get, set, newTodo: CreateTodoRequest) => {
    const currentTodos = get(todosAtom);
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    set(todosAtom, [...currentTodos, todo]);
  }
);

export const updateTodoActionAtom = atom(
  null,
  (get, set, { id, updates }: { id: string; updates: UpdateTodoRequest }) => {
    const todos = get(todosAtom);
    set(todosAtom, todos.map(todo =>
      todo.id === id 
        ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
        : todo
    ));
  }
);

export const deleteTodoActionAtom = atom(
  null,
  (get, set, todoId: string) => {
    const todos = get(todosAtom);
    set(todosAtom, todos.filter(todo => todo.id !== todoId));
  }
);

export const toggleTodoActionAtom = atom(
  null,
  (get, set, todoId: string) => {
    const todos = get(todosAtom);
    set(todosAtom, todos.map(todo =>
      todo.id === todoId 
        ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
        : todo
    ));
  }
);

// Atom to sync between Jotai and Redux (for gradual migration)
export const syncWithReduxAtom = atom(
  null,
  (get, set, reduxState: any) => {
    if (reduxState?.todos?.todos) {
      set(todosAtom, reduxState.todos.todos);
    }
    if (reduxState?.todos?.loading !== undefined) {
      set(loadingAtom, reduxState.todos.loading);
    }
    if (reduxState?.todos?.error !== undefined) {
      set(errorAtom, reduxState.todos.error);
    }
  }
);