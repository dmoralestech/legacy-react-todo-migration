// Core Todo types
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// API Request types
export interface CreateTodoRequest {
  text: string;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
}

// Filter types
export type TodoFilter = 'all' | 'active' | 'completed';

// State types
export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  filter: TodoFilter;
}

// Component prop types
export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
}

export interface TodoFormProps {
  onAdd: (todo: CreateTodoRequest) => void;
}

export interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
}

export interface TodoFiltersProps {
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  todoCount: {
    total: number;
    active: number;
    completed: number;
  };
}

// Feature flag types
export type FeatureFlagKey = 
  | 'USE_MODERN_COMPONENTS'
  | 'USE_JOTAI'
  | 'USE_TANSTACK_QUERY'
  | 'USE_TYPESCRIPT'
  | 'USE_MODERN_TODO_ITEM'
  | 'USE_MODERN_TODO_FORM'
  | 'USE_MODERN_TODO_LIST'
  | 'USE_MODERN_TODO_FILTERS';

export interface FeatureFlags {
  [key: string]: boolean;
}