# Legacy Migration Testing Playbook

## 📋 Overview

This playbook documents the **exact steps** for creating comprehensive test suites before migrating legacy React applications. Use this as a template for real production migrations.

**Golden Rule**: *You cannot refactor what you cannot test.*

## 🎯 Phase 0: Pre-Migration Testing Strategy

### Why We Test Legacy Code First
- **Preserve existing behavior**: Capture what the app currently does
- **Regression prevention**: Catch breaking changes during migration
- **Confidence building**: Team feels safe making changes
- **Documentation**: Tests serve as living documentation
- **Rollback validation**: Ensure fallback systems work

### Testing Pyramid for Legacy Migration
```
    E2E Tests (10%)
    ├── Critical user workflows
    ├── Cross-browser compatibility
    └── Performance benchmarks

  Integration Tests (30%)
  ├── Component + Redux integration
  ├── API + State management
  └── User interaction flows

Unit Tests (60%)
├── Component behavior
├── Redux actions/reducers
├── Saga effects
└── Utility functions
```

## 🛠️ Testing Infrastructure Setup

### Step 1: Install Testing Dependencies

```bash
# Navigate to legacy project
cd /Users/darwin/dev/cra_todo

# Install Vitest (faster than Jest)
npm install --save-dev vitest @vitest/ui

# Install React Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install Playwright for E2E
npm install --save-dev @playwright/test

# Install Redux testing utilities
npm install --save-dev redux-mock-store redux-saga-test-plan

# Install additional testing utilities
npm install --save-dev jsdom @types/jsdom
```

### Step 2: Configure Vitest

Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### Step 3: Create Test Setup File

Create `src/test/setup.js`:
```javascript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### Step 4: Configure Playwright

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm start',
    port: 3000,
  },
});
```

### Step 5: Create Test Utilities

Create `src/test/utils.js`:
```javascript
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducers';
import rootSaga from '../sagas';

// Create test store helper
export const createTestStore = (initialState = {}) => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  );
  sagaMiddleware.run(rootSaga);
  return store;
};

// Custom render with providers
export const renderWithProviders = (ui, {
  preloadedState = {},
  store = createTestStore(preloadedState),
  ...renderOptions
} = {}) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock API responses
export const mockTodos = [
  { id: '1', text: 'Test Todo 1', completed: false, createdAt: '2023-01-01' },
  { id: '2', text: 'Test Todo 2', completed: true, createdAt: '2023-01-02' },
  { id: '3', text: 'Test Todo 3', completed: false, createdAt: '2023-01-03' },
];

export const mockApiResponse = (data, delay = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};
```

### Step 6: Update package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 🧪 Unit Testing Strategy

### Component Testing Approach

#### Test TodoItem Component
Create `src/components/__tests__/TodoItem.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils';
import TodoItem from '../TodoItem';

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    text: 'Test todo',
    completed: false,
    createdAt: '2023-01-01'
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
    renderWithProviders(
      <TodoItem todo={mockTodo} {...mockHandlers} />
    );
    
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('shows checkbox unchecked for incomplete todo', () => {
    renderWithProviders(
      <TodoItem todo={mockTodo} {...mockHandlers} />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('shows checkbox checked for completed todo', () => {
    const completedTodo = { ...mockTodo, completed: true };
    renderWithProviders(
      <TodoItem todo={completedTodo} {...mockHandlers} />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TodoItem todo={mockTodo} {...mockHandlers} />
    );
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
  });

  it('enters edit mode when text is double-clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TodoItem todo={mockTodo} {...mockHandlers} />
    );
    
    const todoText = screen.getByText('Test todo');
    await user.dblClick(todoText);
    
    expect(screen.getByDisplayValue('Test todo')).toBeInTheDocument();
  });

  it('saves changes when Enter is pressed in edit mode', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TodoItem todo={mockTodo} {...mockHandlers} />
    );
    
    // Enter edit mode
    const todoText = screen.getByText('Test todo');
    await user.dblClick(todoText);
    
    // Edit text
    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Updated todo');
    await user.keyboard('{Enter}');
    
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { text: 'Updated todo' });
  });

  it('cancels edit when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TodoItem todo={mockTodo} {...mockHandlers} />
    );
    
    // Enter edit mode
    const todoText = screen.getByText('Test todo');
    await user.dblClick(todoText);
    
    // Edit text but cancel
    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Updated todo');
    await user.keyboard('{Escape}');
    
    expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TodoItem todo={mockTodo} {...mockHandlers} />
    );
    
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('applies completed styling for completed todos', () => {
    const completedTodo = { ...mockTodo, completed: true };
    renderWithProviders(
      <TodoItem todo={completedTodo} {...mockHandlers} />
    );
    
    const todoText = screen.getByText('Test todo');
    expect(todoText).toHaveClass('completed');
  });
});
```

#### Test TodoForm Component
Create `src/components/__tests__/TodoForm.test.jsx`:
```javascript
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils';
import TodoForm from '../TodoForm';

describe('TodoForm', () => {
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field with placeholder', () => {
    renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
    
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
    
    expect(screen.getByText('Add Todo')).toBeInTheDocument();
  });

  it('calls onAdd with trimmed text when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '  New todo  ');
    await user.click(screen.getByText('Add Todo'));
    
    expect(mockOnAdd).toHaveBeenCalledWith({ text: 'New todo' });
  });

  it('clears input after successful submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New todo');
    await user.click(screen.getByText('Add Todo'));
    
    expect(input).toHaveValue('');
  });

  it('does not submit empty or whitespace-only text', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    
    // Test empty string
    await user.click(screen.getByText('Add Todo'));
    expect(mockOnAdd).not.toHaveBeenCalled();
    
    // Test whitespace only
    await user.type(input, '   ');
    await user.click(screen.getByText('Add Todo'));
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('submits form when Enter is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New todo');
    await user.keyboard('{Enter}');
    
    expect(mockOnAdd).toHaveBeenCalledWith({ text: 'New todo' });
  });
});
```

### Redux Testing Strategy

#### Test Actions
Create `src/actions/__tests__/todoActions.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import {
  TODO_ACTIONS,
  fetchTodosRequest,
  fetchTodosSuccess,
  fetchTodosFailure,
  addTodoRequest,
  addTodoSuccess,
  // ... other actions
} from '../todoActions';

describe('Todo Actions', () => {
  describe('fetchTodos actions', () => {
    it('creates FETCH_TODOS_REQUEST action', () => {
      const action = fetchTodosRequest();
      expect(action).toEqual({
        type: TODO_ACTIONS.FETCH_TODOS_REQUEST
      });
    });

    it('creates FETCH_TODOS_SUCCESS action with todos', () => {
      const todos = [{ id: '1', text: 'Test', completed: false }];
      const action = fetchTodosSuccess(todos);
      expect(action).toEqual({
        type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
        payload: todos
      });
    });

    it('creates FETCH_TODOS_FAILURE action with error', () => {
      const error = 'Network error';
      const action = fetchTodosFailure(error);
      expect(action).toEqual({
        type: TODO_ACTIONS.FETCH_TODOS_FAILURE,
        payload: error
      });
    });
  });

  describe('addTodo actions', () => {
    it('creates ADD_TODO_REQUEST action with todo data', () => {
      const todoData = { text: 'New todo' };
      const action = addTodoRequest(todoData);
      expect(action).toEqual({
        type: TODO_ACTIONS.ADD_TODO_REQUEST,
        payload: todoData
      });
    });

    it('creates ADD_TODO_SUCCESS action with created todo', () => {
      const todo = { id: '1', text: 'New todo', completed: false };
      const action = addTodoSuccess(todo);
      expect(action).toEqual({
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: todo
      });
    });
  });
});
```

#### Test Reducers
Create `src/reducers/__tests__/todoReducer.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import todoReducer from '../todoReducer';
import { TODO_ACTIONS } from '../../actions/todoActions';

describe('todoReducer', () => {
  const initialState = {
    todos: [],
    loading: false,
    error: null
  };

  it('returns initial state', () => {
    expect(todoReducer(undefined, {})).toEqual(initialState);
  });

  describe('FETCH_TODOS', () => {
    it('sets loading to true on FETCH_TODOS_REQUEST', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };
      const state = todoReducer(initialState, action);
      
      expect(state).toEqual({
        ...initialState,
        loading: true,
        error: null
      });
    });

    it('sets todos and loading to false on FETCH_TODOS_SUCCESS', () => {
      const todos = [{ id: '1', text: 'Test', completed: false }];
      const action = { type: TODO_ACTIONS.FETCH_TODOS_SUCCESS, payload: todos };
      const state = todoReducer({ ...initialState, loading: true }, action);
      
      expect(state).toEqual({
        todos,
        loading: false,
        error: null
      });
    });

    it('sets error and loading to false on FETCH_TODOS_FAILURE', () => {
      const error = 'Network error';
      const action = { type: TODO_ACTIONS.FETCH_TODOS_FAILURE, payload: error };
      const state = todoReducer({ ...initialState, loading: true }, action);
      
      expect(state).toEqual({
        todos: [],
        loading: false,
        error
      });
    });
  });

  describe('ADD_TODO', () => {
    it('adds todo to state on ADD_TODO_SUCCESS', () => {
      const existingTodo = { id: '1', text: 'Existing', completed: false };
      const newTodo = { id: '2', text: 'New', completed: false };
      const initialStateWithTodos = { ...initialState, todos: [existingTodo] };
      
      const action = { type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: newTodo };
      const state = todoReducer(initialStateWithTodos, action);
      
      expect(state.todos).toEqual([existingTodo, newTodo]);
    });
  });

  describe('UPDATE_TODO', () => {
    it('updates existing todo on UPDATE_TODO_SUCCESS', () => {
      const todo = { id: '1', text: 'Original', completed: false };
      const updatedTodo = { id: '1', text: 'Updated', completed: true };
      const initialStateWithTodos = { ...initialState, todos: [todo] };
      
      const action = { type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: updatedTodo };
      const state = todoReducer(initialStateWithTodos, action);
      
      expect(state.todos[0]).toEqual(updatedTodo);
    });
  });

  describe('DELETE_TODO', () => {
    it('removes todo from state on DELETE_TODO_SUCCESS', () => {
      const todo1 = { id: '1', text: 'First', completed: false };
      const todo2 = { id: '2', text: 'Second', completed: false };
      const initialStateWithTodos = { ...initialState, todos: [todo1, todo2] };
      
      const action = { type: TODO_ACTIONS.DELETE_TODO_SUCCESS, payload: '1' };
      const state = todoReducer(initialStateWithTodos, action);
      
      expect(state.todos).toEqual([todo2]);
    });
  });
});
```

#### Test Sagas
Create `src/sagas/__tests__/todoSagas.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { runSaga } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { testSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';
import { fetchTodosSaga, addTodoSaga } from '../todoSagas';
import { todoApi } from '../../services/todoApi';
import {
  fetchTodosSuccess,
  fetchTodosFailure,
  addTodoSuccess,
  addTodoFailure,
} from '../../actions/todoActions';

describe('todoSagas', () => {
  describe('fetchTodosSaga', () => {
    it('fetches todos successfully', () => {
      const todos = [{ id: '1', text: 'Test', completed: false }];
      
      testSaga(fetchTodosSaga)
        .next()
        .call(todoApi.fetchTodos)
        .next(todos)
        .put(fetchTodosSuccess(todos))
        .next()
        .isDone();
    });

    it('handles fetch todos error', () => {
      const error = new Error('Network error');
      
      testSaga(fetchTodosSaga)
        .next()
        .call(todoApi.fetchTodos)
        .throw(error)
        .put(fetchTodosFailure(error.message))
        .next()
        .isDone();
    });
  });

  describe('addTodoSaga', () => {
    it('adds todo successfully', () => {
      const todoData = { text: 'New todo' };
      const action = { payload: todoData };
      const newTodo = { id: '1', text: 'New todo', completed: false };
      
      testSaga(addTodoSaga, action)
        .next()
        .call(todoApi.addTodo, todoData)
        .next(newTodo)
        .put(addTodoSuccess(newTodo))
        .next()
        .isDone();
    });

    it('handles add todo error', () => {
      const todoData = { text: 'New todo' };
      const action = { payload: todoData };
      const error = new Error('Server error');
      
      testSaga(addTodoSaga, action)
        .next()
        .call(todoApi.addTodo, todoData)
        .throw(error)
        .put(addTodoFailure(error.message))
        .next()
        .isDone();
    });
  });
});
```

## 🔗 Integration Testing Strategy

### Component + Redux Integration
Create `src/containers/__tests__/TodoApp.integration.test.jsx`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTodos } from '../../test/utils';
import TodoApp from '../TodoApp';
import { todoApi } from '../../services/todoApi';

// Mock the API
vi.mock('../../services/todoApi', () => ({
  todoApi: {
    fetchTodos: vi.fn(),
    addTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    toggleTodo: vi.fn(),
  },
}));

describe('TodoApp Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays todos on mount', async () => {
    todoApi.fetchTodos.mockResolvedValue(mockTodos);
    
    renderWithProviders(<TodoApp />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 3')).toBeInTheDocument();
    });
    
    expect(todoApi.fetchTodos).toHaveBeenCalledTimes(1);
  });

  it('shows loading state while fetching todos', async () => {
    todoApi.fetchTodos.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockTodos), 100))
    );
    
    renderWithProviders(<TodoApp />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    todoApi.fetchTodos.mockRejectedValue(new Error('Network error'));
    
    renderWithProviders(<TodoApp />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('adds new todo through form submission', async () => {
    const user = userEvent.setup();
    const newTodo = { id: '4', text: 'New todo', completed: false };
    
    todoApi.fetchTodos.mockResolvedValue(mockTodos);
    todoApi.addTodo.mockResolvedValue(newTodo);
    
    renderWithProviders(<TodoApp />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    // Add new todo
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New todo');
    await user.click(screen.getByText('Add Todo'));
    
    await waitFor(() => {
      expect(screen.getByText('New todo')).toBeInTheDocument();
    });
    
    expect(todoApi.addTodo).toHaveBeenCalledWith({ text: 'New todo' });
  });

  it('toggles todo completion status', async () => {
    const user = userEvent.setup();
    const toggledTodo = { ...mockTodos[0], completed: true };
    
    todoApi.fetchTodos.mockResolvedValue(mockTodos);
    todoApi.toggleTodo.mockResolvedValue(toggledTodo);
    
    renderWithProviders(<TodoApp />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);
    
    await waitFor(() => {
      expect(todoApi.toggleTodo).toHaveBeenCalledWith('1');
    });
  });

  it('filters todos correctly', async () => {
    const user = userEvent.setup();
    todoApi.fetchTodos.mockResolvedValue(mockTodos);
    
    renderWithProviders(<TodoApp />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    // Filter to active todos
    await user.click(screen.getByText('Active'));
    
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 3')).toBeInTheDocument();
    expect(screen.queryByText('Test Todo 2')).not.toBeInTheDocument();
    
    // Filter to completed todos
    await user.click(screen.getByText('Completed'));
    
    expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Todo 3')).not.toBeInTheDocument();
  });
});
```

## 🌐 E2E Testing Strategy

### Critical User Workflows
Create `src/test/e2e/todo-app.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('TODO App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the todo app', async ({ page }) => {
    await expect(page.getByText('Legacy TODO App')).toBeVisible();
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    const todoText = 'Test E2E Todo';
    
    await page.getByPlaceholder('What needs to be done?').fill(todoText);
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    await expect(page.getByText(todoText)).toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    // Add a todo first
    await page.getByPlaceholder('What needs to be done?').fill('Toggle test');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Toggle it
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.click();
    
    // Check if it's marked as completed
    await expect(page.locator('.todo-text.completed')).toBeVisible();
  });

  test('should edit a todo', async ({ page }) => {
    // Add a todo
    await page.getByPlaceholder('What needs to be done?').fill('Edit test');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Double-click to edit
    await page.getByText('Edit test').dblclick();
    
    // Edit the text
    await page.getByDisplayValue('Edit test').fill('Edited todo');
    await page.keyboard.press('Enter');
    
    await expect(page.getByText('Edited todo')).toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    // Add a todo
    await page.getByPlaceholder('What needs to be done?').fill('Delete test');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Delete it
    await page.getByRole('button', { name: 'Delete' }).click();
    
    await expect(page.getByText('Delete test')).not.toBeVisible();
  });

  test('should filter todos', async ({ page }) => {
    // Add multiple todos
    await page.getByPlaceholder('What needs to be done?').fill('Active todo');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    await page.getByPlaceholder('What needs to be done?').fill('Completed todo');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Complete one todo
    await page.getByRole('checkbox').last().click();
    
    // Test filtering
    await page.getByRole('button', { name: 'Active' }).click();
    await expect(page.getByText('Active todo')).toBeVisible();
    await expect(page.getByText('Completed todo')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Completed' }).click();
    await expect(page.getByText('Active todo')).not.toBeVisible();
    await expect(page.getByText('Completed todo')).toBeVisible();
    
    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.getByText('Active todo')).toBeVisible();
    await expect(page.getByText('Completed todo')).toBeVisible();
  });

  test('should persist todos after page refresh', async ({ page }) => {
    // Add a todo
    await page.getByPlaceholder('What needs to be done?').fill('Persist test');
    await page.getByRole('button', { name: 'Add Todo' }).click();
    
    // Refresh page
    await page.reload();
    
    // Check if todo is still there
    await expect(page.getByText('Persist test')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/todos', route => route.abort());
    
    await page.goto('/');
    
    // Should show error message
    await expect(page.getByText(/Error:/)).toBeVisible();
  });
});
```

### Cross-Browser Testing
Create `src/test/e2e/cross-browser.spec.ts`:
```typescript
import { test, expect, devices } from '@playwright/test';

const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  test.describe(`${browserName} compatibility`, () => {
    test(`should work correctly on ${browserName}`, async ({ page }) => {
      await page.goto('/');
      
      // Basic functionality test
      await expect(page.getByText('Legacy TODO App')).toBeVisible();
      
      // Add todo
      await page.getByPlaceholder('What needs to be done?').fill('Cross-browser test');
      await page.getByRole('button', { name: 'Add Todo' }).click();
      
      await expect(page.getByText('Cross-browser test')).toBeVisible();
    });
  });
});
```

## 📊 Test Coverage Strategy

### Coverage Requirements
- **Unit Tests**: 95% code coverage
- **Integration Tests**: 100% user workflow coverage
- **E2E Tests**: 100% critical path coverage

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage Report
Create `src/test/coverage-report.js`:
```javascript
import { readFileSync } from 'fs';

const coverageThreshold = {
  lines: 95,
  functions: 95,
  branches: 90,
  statements: 95,
};

export const validateCoverage = () => {
  const coverage = JSON.parse(readFileSync('./coverage/coverage-summary.json', 'utf8'));
  const total = coverage.total;
  
  Object.entries(coverageThreshold).forEach(([metric, threshold]) => {
    const actual = total[metric].pct;
    if (actual < threshold) {
      throw new Error(`Coverage ${metric} ${actual}% is below threshold ${threshold}%`);
    }
  });
  
  console.log('✅ All coverage thresholds met!');
};
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow
Create `.github/workflows/test.yml`:
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## 📋 Testing Checklist

### Before Migration
- [ ] Unit tests for all components
- [ ] Unit tests for all actions/reducers
- [ ] Unit tests for all sagas
- [ ] Integration tests for component + Redux
- [ ] E2E tests for critical workflows
- [ ] Performance baseline established
- [ ] Cross-browser compatibility confirmed

### During Migration
- [ ] New tests match legacy behavior
- [ ] Test coverage maintained at 95%+
- [ ] Performance tests passing
- [ ] All E2E tests passing

### After Migration
- [ ] Legacy tests still passing
- [ ] New modern tests added
- [ ] Coverage maintained or improved
- [ ] Performance improved or maintained

## 🎯 Next Steps

1. **Run the setup**: Execute all installation and configuration steps
2. **Start with unit tests**: Begin with component tests
3. **Add integration tests**: Test Redux integration
4. **Implement E2E tests**: Cover critical user workflows
5. **Establish baseline**: Document current performance
6. **Set up CI/CD**: Automate test execution

This playbook provides a comprehensive testing strategy for legacy migration. Each step is documented for real-world production use.