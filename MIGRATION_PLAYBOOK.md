# Legacy React Migration Playbook

## 📋 Overview

This playbook documents the **exact steps** for migrating legacy React applications to modern Next.js stack. Use this as a template for real production migrations.

**Migration Philosophy**: *Gradual, safe, and reversible transformation with zero downtime.*

## 🎯 Migration Strategy Overview

### The "Strangler Fig" Pattern
- **Parallel Development**: New system grows alongside legacy
- **Gradual Replacement**: Feature-by-feature migration
- **Zero Downtime**: Both systems coexist during migration
- **Instant Rollback**: Can revert to legacy at any time

### Migration Phases
1. **Phase 0**: Comprehensive testing (✅ Complete)
2. **Phase 1**: Next.js foundation setup
3. **Phase 2**: Component migration (class → functional)
4. **Phase 3**: State management migration (Redux → Jotai)
5. **Phase 4**: Routing migration (React Router → Next.js)
6. **Phase 5**: Performance optimization
7. **Phase 6**: Production deployment
8. **Phase 7**: Legacy cleanup

## 🛠️ Phase 1: Next.js Foundation Setup

### Step 1.1: Create Next.js Project Structure

```bash
# Create new Next.js project alongside legacy
mkdir cra_todo_modern
cd cra_todo_modern

# Initialize Next.js with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Step 1.2: Configure Development Environment

Create `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Allow both apps to run simultaneously
  port: 3001, // Legacy runs on 3000
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig;
```

### Step 1.3: Set Up Testing Infrastructure

Install testing dependencies:
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test jsdom @types/jsdom
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '.next/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 1.4: Install Modern State Management

```bash
# Install Jotai for atomic state management
npm install jotai

# Install TanStack Query for server state
npm install @tanstack/react-query @tanstack/react-query-devtools

# Install Jotai-TanStack Query integration
npm install jotai-tanstack-query
```

### Step 1.5: Create Modern Project Structure

```bash
# Create modern project structure
mkdir -p src/{app,components,lib,types,atoms,queries,hooks,utils}
mkdir -p src/test/{unit,integration,e2e}

# Create type definitions
touch src/types/todo.ts
touch src/types/api.ts

# Create atom definitions
touch src/atoms/todoAtoms.ts
touch src/atoms/uiAtoms.ts

# Create query definitions
touch src/queries/todoQueries.ts

# Create utility functions
touch src/utils/api.ts
touch src/utils/helpers.ts
```

### Step 1.6: Set Up TypeScript Configuration

Create `src/types/todo.ts`:
```typescript
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTodoRequest {
  text: string;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}
```

### Step 1.7: Create Feature Flag System

Create `src/lib/featureFlags.ts`:
```typescript
export const FEATURE_FLAGS = {
  USE_MODERN_COMPONENTS: process.env.NEXT_PUBLIC_USE_MODERN_COMPONENTS === 'true',
  USE_JOTAI: process.env.NEXT_PUBLIC_USE_JOTAI === 'true',
  USE_TANSTACK_QUERY: process.env.NEXT_PUBLIC_USE_TANSTACK_QUERY === 'true',
  USE_NEXTJS_ROUTER: process.env.NEXT_PUBLIC_USE_NEXTJS_ROUTER === 'true',
} as const;

export const useFeatureFlag = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};
```

Create `.env.local`:
```env
NEXT_PUBLIC_USE_MODERN_COMPONENTS=false
NEXT_PUBLIC_USE_JOTAI=false
NEXT_PUBLIC_USE_TANSTACK_QUERY=false
NEXT_PUBLIC_USE_NEXTJS_ROUTER=false
```

### Step 1.8: Set Up Providers

Create `src/lib/providers.tsx`:
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as JotaiProvider } from 'jotai';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </JotaiProvider>
    </QueryClientProvider>
  );
}
```

### Step 1.9: Create Modern API Layer

Create `src/lib/api.ts`:
```typescript
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getTodos(): Promise<Todo[]> {
    return this.request<Todo[]>('/todos');
  }

  async createTodo(todo: CreateTodoRequest): Promise<Todo> {
    return this.request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  async updateTodo(id: string, updates: UpdateTodoRequest): Promise<Todo> {
    return this.request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTodo(id: string): Promise<void> {
    return this.request<void>(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTodo(id: string): Promise<Todo> {
    return this.request<Todo>(`/todos/${id}/toggle`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();
```

### Step 1.10: Phase 1 Deliverables Checklist

- [ ] Next.js 14 project initialized
- [ ] TypeScript configured with strict mode
- [ ] Testing infrastructure setup (Vitest + RTL + Playwright)
- [ ] Modern state management installed (Jotai + TanStack Query)
- [ ] Feature flag system implemented
- [ ] API client created
- [ ] Project structure established
- [ ] Development environment configured

**🎯 Phase 1 Complete: Modern foundation ready for migration**

---

## 🔄 Phase 2: Component Migration (Class → Functional)

### Step 2.1: Create Modern Component Structure

```bash
# Create component directories
mkdir -p src/components/{ui,todo,layout}
mkdir -p src/components/todo/__tests__
```

### Step 2.2: Migrate TodoItem Component

Create `src/components/todo/TodoItem.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Todo, UpdateTodoRequest } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
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
            <button onClick={() => onDelete(todo.id)} className="btn btn-delete">
              Delete
            </button>
          </>
        )}
        {isEditing && (
          <>
            <button onClick={handleSave} className="btn btn-save">
              Save
            </button>
            <button onClick={handleCancel} className="btn btn-cancel">
              Cancel
            </button>
          </>
        )}
      </div>
    </li>
  );
}
```

### Step 2.3: Create Component Tests

Create `src/components/todo/__tests__/TodoItem.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '../TodoItem';
import { Todo } from '@/types/todo';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test todo',
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z',
  };

  const mockHandlers = {
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo text correctly', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
  });

  // Add more tests following the same pattern from legacy tests
});
```

### Step 2.4: Create Hybrid Component System

Create `src/components/todo/TodoItemHybrid.tsx`:
```typescript
'use client';

import { useFeatureFlag } from '@/lib/featureFlags';
import { TodoItem as ModernTodoItem } from './TodoItem';
import { Todo, UpdateTodoRequest } from '@/types/todo';

// Legacy component import (when ready)
// import { TodoItem as LegacyTodoItem } from '../../../legacy/components/TodoItem';

interface TodoItemHybridProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
}

export function TodoItemHybrid(props: TodoItemHybridProps) {
  const useModernComponents = useFeatureFlag('USE_MODERN_COMPONENTS');

  if (useModernComponents) {
    return <ModernTodoItem {...props} />;
  }

  // For now, return modern until legacy is integrated
  return <ModernTodoItem {...props} />;
  
  // Later: return <LegacyTodoItem {...props} />;
}
```

### Step 2.5: Component Migration Checklist

For each component to migrate:

- [ ] Create modern functional component
- [ ] Convert class lifecycle methods to hooks
- [ ] Update prop types to TypeScript interfaces
- [ ] Create comprehensive tests
- [ ] Create hybrid component with feature flag
- [ ] Test both legacy and modern versions
- [ ] Document migration notes

**Component Migration Order:**
1. TodoItem (leaf component)
2. TodoForm (leaf component)
3. TodoList (composite component)
4. TodoFilters (leaf component)
5. TodoApp (container component)

### Step 2.6: Phase 2 Deliverables Checklist

- [ ] All components migrated to functional components
- [ ] TypeScript interfaces for all props
- [ ] Comprehensive test coverage maintained
- [ ] Hybrid component system implemented
- [ ] Feature flag integration working
- [ ] Performance benchmarks established

**🎯 Phase 2 Complete: Modern components ready with fallback capability**

---

## 🗃️ Phase 3: State Management Migration (Redux → Jotai)

### Step 3.1: Create Jotai Atoms

Create `src/atoms/todoAtoms.ts`:
```typescript
import { atom } from 'jotai';
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '@/types/todo';
import { apiClient } from '@/lib/api';

// Base atoms
export const todosAtom = atom<Todo[]>([]);
export const loadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
export const filterAtom = atom<TodoFilter>('all');

// Derived atoms (computed state)
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

// Server state atoms with TanStack Query
export const todosQueryAtom = atomWithQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => apiClient.getTodos(),
  onSuccess: (data) => {
    // Sync with local atom
    todosAtom.init = data;
  },
}));

export const addTodoAtom = atomWithMutation(() => ({
  mutationFn: (todo: CreateTodoRequest) => apiClient.createTodo(todo),
  onSuccess: (newTodo) => {
    // Optimistic update
    todosAtom.init = (prev) => [...prev, newTodo];
  },
}));

export const updateTodoAtom = atomWithMutation(() => ({
  mutationFn: ({ id, updates }: { id: string; updates: UpdateTodoRequest }) =>
    apiClient.updateTodo(id, updates),
  onSuccess: (updatedTodo) => {
    todosAtom.init = (prev) =>
      prev.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo);
  },
}));

export const deleteTodoAtom = atomWithMutation(() => ({
  mutationFn: (id: string) => apiClient.deleteTodo(id),
  onSuccess: (_, id) => {
    todosAtom.init = (prev) => prev.filter(todo => todo.id !== id);
  },
}));

export const toggleTodoAtom = atomWithMutation(() => ({
  mutationFn: (id: string) => apiClient.toggleTodo(id),
  onSuccess: (updatedTodo) => {
    todosAtom.init = (prev) =>
      prev.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo);
  },
}));

// Write-only atoms (actions)
export const addTodoActionAtom = atom(
  null,
  (get, set, newTodo: CreateTodoRequest) => {
    const addMutation = get(addTodoAtom);
    addMutation.mutate(newTodo);
  }
);

export const toggleTodoActionAtom = atom(
  null,
  (get, set, todoId: string) => {
    const toggleMutation = get(toggleTodoAtom);
    toggleMutation.mutate(todoId);
  }
);
```

### Step 3.2: Create State Management Hybrid

Create `src/lib/stateManager.ts`:
```typescript
import { useFeatureFlag } from './featureFlags';
import { useAtom } from 'jotai';
import { useSelector, useDispatch } from 'react-redux';
import { 
  filteredTodosAtom, 
  todoStatsAtom, 
  filterAtom,
  addTodoActionAtom,
  toggleTodoActionAtom,
} from '@/atoms/todoAtoms';
import { Todo, TodoFilter } from '@/types/todo';

// Modern state management hooks
export function useModernTodos() {
  const [todos] = useAtom(filteredTodosAtom);
  const [stats] = useAtom(todoStatsAtom);
  const [filter, setFilter] = useAtom(filterAtom);
  const [, addTodo] = useAtom(addTodoActionAtom);
  const [, toggleTodo] = useAtom(toggleTodoActionAtom);

  return {
    todos,
    stats,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
  };
}

// Legacy state management hooks (placeholder)
export function useLegacyTodos() {
  // Redux selectors and actions
  const todos = useSelector((state: any) => state.todos.todos);
  const loading = useSelector((state: any) => state.todos.loading);
  const error = useSelector((state: any) => state.todos.error);
  const dispatch = useDispatch();

  // Return legacy interface
  return {
    todos,
    loading,
    error,
    dispatch,
  };
}

// Hybrid hook that switches between modern and legacy
export function useTodos() {
  const useJotai = useFeatureFlag('USE_JOTAI');
  
  if (useJotai) {
    return useModernTodos();
  }
  
  return useLegacyTodos();
}
```

### Step 3.3: Create Migration Component

Create `src/components/todo/TodoApp.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { todosQueryAtom, filterAtom } from '@/atoms/todoAtoms';
import { TodoList } from './TodoList';
import { TodoForm } from './TodoForm';
import { TodoFilters } from './TodoFilters';
import { useFeatureFlag } from '@/lib/featureFlags';

export function TodoApp() {
  const useJotai = useFeatureFlag('USE_JOTAI');
  const [todosQuery] = useAtom(todosQueryAtom);
  const [filter, setFilter] = useAtom(filterAtom);

  if (!useJotai) {
    // Return legacy component
    return <div>Legacy TodoApp (to be implemented)</div>;
  }

  if (todosQuery.isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (todosQuery.error) {
    return <div className="error">Error: {todosQuery.error.message}</div>;
  }

  return (
    <div className="todo-app">
      <header className="todo-header">
        <h1>Modern TODO App</h1>
        <p>Built with Next.js, Jotai, and TanStack Query</p>
      </header>

      <main className="todo-main">
        <TodoForm />
        <TodoList />
        <TodoFilters />
      </main>
    </div>
  );
}
```

### Step 3.4: Create Atom Tests

Create `src/atoms/__tests__/todoAtoms.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { createStore } from 'jotai';
import { 
  todosAtom, 
  filteredTodosAtom, 
  todoStatsAtom,
  filterAtom 
} from '../todoAtoms';
import { Todo } from '@/types/todo';

describe('todoAtoms', () => {
  const mockTodos: Todo[] = [
    { id: '1', text: 'Active todo', completed: false, createdAt: '2023-01-01' },
    { id: '2', text: 'Completed todo', completed: true, createdAt: '2023-01-02' },
  ];

  it('should filter todos based on filter atom', () => {
    const store = createStore();
    
    // Set initial todos
    store.set(todosAtom, mockTodos);
    
    // Test 'all' filter
    store.set(filterAtom, 'all');
    expect(store.get(filteredTodosAtom)).toEqual(mockTodos);
    
    // Test 'active' filter
    store.set(filterAtom, 'active');
    expect(store.get(filteredTodosAtom)).toEqual([mockTodos[0]]);
    
    // Test 'completed' filter
    store.set(filterAtom, 'completed');
    expect(store.get(filteredTodosAtom)).toEqual([mockTodos[1]]);
  });

  it('should calculate todo stats correctly', () => {
    const store = createStore();
    store.set(todosAtom, mockTodos);
    
    const stats = store.get(todoStatsAtom);
    expect(stats).toEqual({
      total: 2,
      active: 1,
      completed: 1,
    });
  });
});
```

### Step 3.5: Phase 3 Deliverables Checklist

- [ ] Jotai atoms created to mirror Redux state
- [ ] TanStack Query integration for server state
- [ ] Hybrid state management system implemented
- [ ] Feature flag integration working
- [ ] Comprehensive atom tests created
- [ ] Performance comparison documented
- [ ] Migration guide created

**🎯 Phase 3 Complete: Modern state management ready with fallback**

---

## 🛣️ Phase 4: Routing Migration (React Router → Next.js)

### Step 4.1: Create Next.js App Router Structure

```bash
# Create app router pages
mkdir -p src/app/{about,legacy}
touch src/app/page.tsx
touch src/app/about/page.tsx
touch src/app/layout.tsx
touch src/app/legacy/page.tsx
```

### Step 4.2: Create Root Layout

Create `src/app/layout.tsx`:
```typescript
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { Navigation } from '@/components/layout/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Modern TODO App',
  description: 'Migrated from legacy React to Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Step 4.3: Create Modern Navigation

Create `src/components/layout/Navigation.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFeatureFlag } from '@/lib/featureFlags';

export function Navigation() {
  const pathname = usePathname();
  const useNextjsRouter = useFeatureFlag('USE_NEXTJS_ROUTER');

  if (!useNextjsRouter) {
    // Return legacy navigation
    return <div>Legacy Navigation (to be implemented)</div>;
  }

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link href="/">Modern TODO</Link>
      </div>
      
      <ul className="nav-links">
        <li>
          <Link 
            href="/" 
            className={pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            href="/about" 
            className={pathname === '/about' ? 'active' : ''}
          >
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}
```

### Step 4.4: Create Hybrid Routing System

Create `src/lib/routerManager.ts`:
```typescript
'use client';

import { useRouter as useNextRouter } from 'next/navigation';
import { useFeatureFlag } from './featureFlags';

export function useRouter() {
  const useNextjsRouter = useFeatureFlag('USE_NEXTJS_ROUTER');
  const nextRouter = useNextRouter();

  if (useNextjsRouter) {
    return {
      push: nextRouter.push,
      replace: nextRouter.replace,
      back: nextRouter.back,
      forward: nextRouter.forward,
      refresh: nextRouter.refresh,
    };
  }

  // Return legacy router interface
  return {
    push: (path: string) => console.log('Legacy push:', path),
    replace: (path: string) => console.log('Legacy replace:', path),
    back: () => console.log('Legacy back'),
    forward: () => console.log('Legacy forward'),
    refresh: () => console.log('Legacy refresh'),
  };
}
```

### Step 4.5: Create App Pages

Create `src/app/page.tsx`:
```typescript
import { TodoApp } from '@/components/todo/TodoApp';

export default function HomePage() {
  return (
    <div className="container">
      <TodoApp />
    </div>
  );
}
```

Create `src/app/about/page.tsx`:
```typescript
export default function AboutPage() {
  return (
    <div className="about-page">
      <h1>About Modern TODO App</h1>
      <div className="about-content">
        <p>
          This TODO application has been migrated from legacy React to modern Next.js stack:
        </p>
        
        <ul>
          <li><strong>Next.js 14</strong> - React framework with App Router</li>
          <li><strong>TypeScript</strong> - Static type checking</li>
          <li><strong>Tailwind CSS</strong> - Utility-first styling</li>
          <li><strong>Jotai</strong> - Atomic state management</li>
          <li><strong>TanStack Query</strong> - Server state management</li>
          <li><strong>Vitest</strong> - Fast unit testing</li>
          <li><strong>Playwright</strong> - E2E testing</li>
        </ul>
        
        <h2>Migration Benefits</h2>
        <ul>
          <li>Better performance with SSR/SSG</li>
          <li>Improved developer experience</li>
          <li>Modern tooling and patterns</li>
          <li>Better SEO capabilities</li>
          <li>Atomic state management</li>
        </ul>
      </div>
    </div>
  );
}
```

### Step 4.6: Phase 4 Deliverables Checklist

- [ ] Next.js App Router structure created
- [ ] Modern navigation implemented
- [ ] Hybrid routing system with feature flags
- [ ] SEO optimization with metadata
- [ ] Performance improvements documented
- [ ] Migration notes updated

**🎯 Phase 4 Complete: Modern routing ready with fallback**

---

## 🚀 Phase 5: Performance Optimization

### Step 5.1: Implement Server Components

Create `src/components/server/TodoServer.tsx`:
```typescript
import { Suspense } from 'react';
import { TodoApp } from '@/components/todo/TodoApp';
import { TodoSkeleton } from '@/components/ui/TodoSkeleton';

// Server Component for static generation
export async function TodoServer() {
  // This runs on the server
  return (
    <Suspense fallback={<TodoSkeleton />}>
      <TodoApp />
    </Suspense>
  );
}
```

### Step 5.2: Add Bundle Analysis

Install bundle analyzer:
```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

### Step 5.3: Implement Code Splitting

Create `src/components/lazy/LazyTodoApp.tsx`:
```typescript
'use client';

import { lazy, Suspense } from 'react';
import { TodoSkeleton } from '@/components/ui/TodoSkeleton';

const TodoApp = lazy(() => import('@/components/todo/TodoApp').then(mod => ({ default: mod.TodoApp })));

export function LazyTodoApp() {
  return (
    <Suspense fallback={<TodoSkeleton />}>
      <TodoApp />
    </Suspense>
  );
}
```

### Step 5.4: Performance Monitoring

Create `src/lib/performance.ts`:
```typescript
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
}

export function reportWebVitals(metric: any) {
  console.log('Web Vitals:', metric);
  
  // Send to analytics
  if (process.env.NODE_ENV === 'production') {
    // gtag('event', metric.name, {
    //   event_category: 'Web Vitals',
    //   value: Math.round(metric.value),
    //   event_label: metric.id,
    // });
  }
}
```

### Step 5.5: Phase 5 Deliverables Checklist

- [ ] Server Components implemented
- [ ] Code splitting configured
- [ ] Bundle analysis setup
- [ ] Performance monitoring added
- [ ] Web Vitals tracking enabled
- [ ] Performance benchmarks compared

**🎯 Phase 5 Complete: Performance optimized and monitored**

---

## 🌐 Phase 6: Production Deployment

### Step 6.1: Environment Configuration

Create production environment files:
```bash
# Production environment
touch .env.production
touch .env.staging
```

`.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_USE_MODERN_COMPONENTS=true
NEXT_PUBLIC_USE_JOTAI=true
NEXT_PUBLIC_USE_TANSTACK_QUERY=true
NEXT_PUBLIC_USE_NEXTJS_ROUTER=true
```

### Step 6.2: Deployment Configuration

Create `deploy.sh`:
```bash
#!/bin/bash

# Build and deploy script
echo "🚀 Starting deployment..."

# Run tests
npm run test
npm run test:e2e

# Build application
npm run build

# Deploy to staging first
echo "📦 Deploying to staging..."
# Add your staging deployment commands here

# Health check
echo "🔍 Running health checks..."
# Add health check commands

# Deploy to production
echo "🌟 Deploying to production..."
# Add production deployment commands

echo "✅ Deployment complete!"
```

### Step 6.3: Monitoring Setup

Create `src/lib/monitoring.ts`:
```typescript
export function setupMonitoring() {
  // Error tracking
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Send to error tracking service
  });

  // Performance monitoring
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log('Performance entry:', entry);
        // Send to analytics
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'paint'] });
  }
}
```

### Step 6.4: Feature Flag Management

Create `src/lib/featureFlagManager.ts`:
```typescript
interface FeatureFlagConfig {
  rolloutPercentage: number;
  enabled: boolean;
  description: string;
}

export class FeatureFlagManager {
  private config: Record<string, FeatureFlagConfig> = {
    USE_MODERN_COMPONENTS: {
      rolloutPercentage: 10, // Start with 10%
      enabled: true,
      description: 'Enable modern React components',
    },
    USE_JOTAI: {
      rolloutPercentage: 10,
      enabled: true,
      description: 'Enable Jotai state management',
    },
    // ... other flags
  };

  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.config[flagName];
    if (!flag || !flag.enabled) return false;

    // Simple hash-based rollout
    if (userId) {
      const hash = this.hash(userId);
      return hash < flag.rolloutPercentage;
    }

    return Math.random() * 100 < flag.rolloutPercentage;
  }

  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }
}
```

### Step 6.5: Phase 6 Deliverables Checklist

- [ ] Production environment configured
- [ ] Deployment scripts created
- [ ] Monitoring and error tracking setup
- [ ] Feature flag management implemented
- [ ] Performance monitoring active
- [ ] Health checks configured
- [ ] Rollback procedures tested

**🎯 Phase 6 Complete: Production-ready deployment**

---

## 🧹 Phase 7: Legacy Cleanup

### Step 7.1: Pre-Cleanup Checklist

Before removing legacy code, ensure:
- [ ] 30 days of stable production
- [ ] All performance targets met
- [ ] User feedback is positive
- [ ] Team is comfortable with new system
- [ ] Documentation is complete

### Step 7.2: Gradual Feature Flag Removal

Create `scripts/cleanup-feature-flags.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const flagsToRemove = [
  'USE_MODERN_COMPONENTS',
  'USE_JOTAI',
  'USE_TANSTACK_QUERY',
  'USE_NEXTJS_ROUTER',
];

function removeFeatureFlags(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeFeatureFlags(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove feature flag checks
      flagsToRemove.forEach(flag => {
        const regex = new RegExp(`useFeatureFlag\\('${flag}'\\)`, 'g');
        content = content.replace(regex, 'true');
      });
      
      fs.writeFileSync(filePath, content);
    }
  });
}

console.log('🧹 Removing feature flags...');
removeFeatureFlags('./src');
console.log('✅ Feature flags removed');
```

### Step 7.3: Legacy Code Removal

Create `scripts/remove-legacy-code.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Remove legacy directories
const legacyDirs = [
  './src/legacy',
  './src/components/legacy',
  './node_modules/react-redux',
  './node_modules/redux-saga',
];

function removeLegacyCode() {
  console.log('🗑️ Removing legacy code...');
  
  legacyDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removed ${dir}`);
    }
  });
  
  // Update package.json
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  delete packageJson.dependencies['react-redux'];
  delete packageJson.dependencies['redux'];
  delete packageJson.dependencies['redux-saga'];
  
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');
}

removeLegacyCode();
```

### Step 7.4: Final Documentation

Create `MIGRATION_COMPLETE.md`:
```markdown
# Migration Complete Report

## Overview
Successfully migrated legacy React app to modern Next.js stack.

## Results
- **Performance**: 50% improvement in bundle size
- **Developer Experience**: 60% faster development
- **User Satisfaction**: 95% positive feedback
- **Bug Reduction**: 80% fewer production issues

## Final Architecture
- Next.js 14 with App Router
- TypeScript for type safety
- Jotai for state management
- TanStack Query for server state
- Tailwind CSS for styling
- Vitest + Playwright for testing

## Lessons Learned
1. Testing first is crucial
2. Feature flags enable safe rollouts
3. Gradual migration reduces risk
4. Team training is essential
5. Performance monitoring is key

## Next Steps
1. Continue monitoring performance
2. Gather user feedback
3. Plan next features
4. Document best practices
```

### Step 7.5: Phase 7 Deliverables Checklist

- [ ] Feature flags removed
- [ ] Legacy dependencies cleaned up
- [ ] Unused code removed
- [ ] Bundle size optimized
- [ ] Documentation updated
- [ ] Migration report completed
- [ ] Team celebration! 🎉

**🎯 Phase 7 Complete: Clean, modern codebase achieved**

---

## 📊 Migration Success Metrics

### Performance Metrics
- **Bundle Size**: 50% reduction
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 90+
- **Build Time**: < 30s

### Development Metrics
- **Developer Productivity**: 60% faster
- **Bug Rate**: 80% reduction
- **Test Coverage**: 95%+
- **Type Safety**: 100% TypeScript

### Business Metrics
- **User Satisfaction**: 95%+
- **Performance Complaints**: 90% reduction
- **Feature Delivery**: 50% faster
- **Maintenance Cost**: 40% reduction

## 🎯 Final Checklist

### Migration Complete When:
- [ ] All tests passing
- [ ] Performance targets met
- [ ] User feedback positive
- [ ] Team trained on new stack
- [ ] Documentation complete
- [ ] Legacy code removed
- [ ] Monitoring active
- [ ] Success metrics achieved

---

## 🚀 Conclusion

This playbook provides a comprehensive, step-by-step approach to migrating legacy React applications to modern Next.js stack. The key principles are:

1. **Safety First**: Comprehensive testing before any changes
2. **Gradual Migration**: Feature-by-feature with feature flags
3. **Zero Downtime**: Systems coexist during migration
4. **Performance Focus**: Continuous monitoring and optimization
5. **Team Success**: Training and documentation throughout

Use this playbook as your guide for real production migrations. Each phase builds upon the previous one, ensuring a smooth, safe, and successful transformation of your legacy applications.

**Remember**: The goal isn't just to migrate the code - it's to improve the entire development experience, performance, and maintainability of your application while minimizing risk and downtime.

Happy migrating! 🚀