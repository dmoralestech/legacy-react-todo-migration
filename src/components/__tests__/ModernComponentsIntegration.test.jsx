import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { JotaiProvider } from '../../utils/providers';
import TodoItem from '../TodoItem';
import TodoForm from '../TodoForm';
import TodoList from '../TodoList';
import TodoFilters from '../TodoFilters';
import * as featureFlags from '../../utils/featureFlags';

// Mock the feature flag module
vi.mock('../../utils/featureFlags');

describe('Modern Components Integration with Jotai', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Enable all modern components
    vi.mocked(featureFlags.useFeatureFlag).mockImplementation((flag) => {
      switch (flag) {
        case 'USE_MODERN_TODO_ITEM':
        case 'USE_MODERN_TODO_FORM':
        case 'USE_MODERN_TODO_LIST':
        case 'USE_MODERN_TODO_FILTERS':
          return true;
        case 'USE_JOTAI':
        case 'USE_TANSTACK_QUERY':
          return true; // Use Jotai for state
        default:
          return false;
      }
    });
  });

  test('modern TodoItem component works with Jotai state', () => {
    const mockTodo = {
      id: '1',
      text: 'Test Todo',
      completed: false
    };

    const mockProps = {
      todo: mockTodo,
      onToggle: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };

    render(
      <JotaiProvider>
        <TodoItem {...mockProps} />
      </JotaiProvider>
    );

    // Verify modern component renders correctly
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();

    // Test interaction
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockProps.onToggle).toHaveBeenCalledWith('1');
  });

  test('modern TodoForm component works with Jotai state', () => {
    const mockOnAdd = vi.fn();

    render(
      <JotaiProvider>
        <TodoForm onAdd={mockOnAdd} />
      </JotaiProvider>
    );

    // Verify modern component renders correctly
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByText('Add Todo');

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();

    // Test form submission
    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(button);

    expect(mockOnAdd).toHaveBeenCalledWith({ text: 'New Todo' });
  });

  test('modern TodoList component works with Jotai state', () => {
    const mockTodos = [
      { id: '1', text: 'First Todo', completed: false },
      { id: '2', text: 'Second Todo', completed: true }
    ];

    const mockProps = {
      todos: mockTodos,
      onToggle: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };

    render(
      <JotaiProvider>
        <TodoList {...mockProps} />
      </JotaiProvider>
    );

    // Verify modern component renders correctly
    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
  });

  test('modern TodoFilters component works with Jotai state', () => {
    const mockProps = {
      filter: 'all',
      onFilterChange: vi.fn(),
      todoCount: { total: 5, active: 3, completed: 2 },
    };

    render(
      <JotaiProvider>
        <TodoFilters {...mockProps} />
      </JotaiProvider>
    );

    // Verify modern component renders correctly
    expect(screen.getByText('3 of 5 remaining')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Test filter interaction
    fireEvent.click(screen.getByText('Active'));
    expect(mockProps.onFilterChange).toHaveBeenCalledWith('active');
  });

  test('modern components have identical behavior to legacy', async () => {
    // Test that modern components behave identically to legacy
    const mockTodo = { id: '1', text: 'Test Todo', completed: false };
    const mockProps = {
      todo: mockTodo,
      onToggle: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };

    // Render with modern components enabled
    const { container: modernContainer } = render(
      <JotaiProvider>
        <TodoItem {...mockProps} />
      </JotaiProvider>
    );

    // Reset mocks and disable modern components
    vi.clearAllMocks();
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(false);

    // Render with legacy components
    const { container: legacyContainer } = render(
      <JotaiProvider>
        <TodoItem {...mockProps} />
      </JotaiProvider>
    );

    // Both should have identical DOM structure
    expect(modernContainer.innerHTML).toBe(legacyContainer.innerHTML);
  });

  test('feature flag switching between legacy and modern works', () => {
    const mockTodo = { id: '1', text: 'Test Todo', completed: false };
    const mockProps = {
      todo: mockTodo,
      onToggle: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };

    const { rerender } = render(
      <JotaiProvider>
        <TodoItem {...mockProps} />
      </JotaiProvider>
    );

    // Should render modern component initially
    expect(screen.getByText('Test Todo')).toBeInTheDocument();

    // Switch to legacy
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(false);
    rerender(
      <JotaiProvider>
        <TodoItem {...mockProps} />
      </JotaiProvider>
    );

    // Should still render the same content
    expect(screen.getByText('Test Todo')).toBeInTheDocument();

    // Switch back to modern
    vi.mocked(featureFlags.useFeatureFlag).mockImplementation((flag) => {
      return flag === 'USE_MODERN_TODO_ITEM';
    });
    
    rerender(
      <JotaiProvider>
        <TodoItem {...mockProps} />
      </JotaiProvider>
    );

    // Should still render the same content
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  test('performance: modern components render efficiently', async () => {
    const startTime = performance.now();
    
    const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
      id: `todo-${i}`,
      text: `Todo item ${i}`,
      completed: i % 3 === 0
    }));

    const mockProps = {
      todos: largeTodoList,
      onToggle: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    };

    render(
      <JotaiProvider>
        <TodoList {...mockProps} />
      </JotaiProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Modern components should render efficiently (relaxed for React 19)
    expect(renderTime).toBeLessThan(500); // Should render in less than 500ms
    expect(screen.getByText('Todo item 0')).toBeInTheDocument();
    expect(screen.getByText('Todo item 99')).toBeInTheDocument();
  });
});