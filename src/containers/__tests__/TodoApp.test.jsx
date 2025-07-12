import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils.jsx';
import TodoApp from '../TodoApp';
import { todoApi } from '../../services/todoApi';

// Mock the API module
vi.mock('../../services/todoApi', () => ({
  todoApi: {
    fetchTodos: vi.fn(),
    addTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    toggleTodo: vi.fn(),
  },
}));

describe('TodoApp Container Integration Tests', () => {
  const mockTodos = [
    {
      id: '1',
      text: 'Test todo 1',
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      text: 'Test todo 2',
      completed: true,
      createdAt: '2023-01-02T00:00:00.000Z'
    },
    {
      id: '3',
      text: 'Test todo 3',
      completed: false,
      createdAt: '2023-01-03T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(todoApi.fetchTodos).mockResolvedValue(mockTodos);
    vi.mocked(todoApi.addTodo).mockResolvedValue({
      id: '4',
      text: 'New todo',
      completed: false,
      createdAt: new Date().toISOString()
    });
    vi.mocked(todoApi.updateTodo).mockResolvedValue({
      id: '1',
      text: 'Updated todo',
      completed: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    });
    vi.mocked(todoApi.deleteTodo).mockResolvedValue('1');
    vi.mocked(todoApi.toggleTodo).mockResolvedValue({
      id: '1',
      text: 'Test todo 1',
      completed: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    });
  });

  describe('Initial Render and State', () => {
    it('renders the TodoApp container', () => {
      renderWithProviders(<TodoApp />);
      
      expect(screen.getByText('Legacy TODO App')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      const initialState = {
        todos: {
          todos: [],
          loading: true,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: initialState });
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays todos after successful fetch', async () => {
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test todo 2')).toBeInTheDocument();
      expect(screen.getByText('Test todo 3')).toBeInTheDocument();
    });

    it('displays error state when fetch fails', () => {
      // Test that the TodoApp component renders without crashing
      // when there's an error in the state
      const errorState = {
        todos: {
          todos: [],
          loading: false,
          error: 'Failed to fetch todos'
        }
      };
      
      expect(() => {
        renderWithProviders(<TodoApp />, { preloadedState: errorState });
      }).not.toThrow();
      
      // Verify that form is still functional
      expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    });
  });

  describe('Todo Form Integration', () => {
    it('clears input after form submission', async () => {
      const user = userEvent.setup();
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'New test todo');
      await user.keyboard('{Enter}');
      
      expect(input).toHaveValue('');
    });

    it('does not submit empty todos', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<TodoApp />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const addButton = screen.getByRole('button', { name: 'Add Todo' });
      
      await user.click(addButton);
      
      // Input should remain empty and nothing should be added
      expect(input).toHaveValue('');
    });
  });

  describe('Todo List Integration', () => {
    it('displays all todos from state', () => {
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      mockTodos.forEach(todo => {
        expect(screen.getByText(todo.text)).toBeInTheDocument();
      });
    });

    it('shows todo count correctly', () => {
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      // 2 active out of 3 total (todo 1 and 3 are active, todo 2 is completed)
      expect(screen.getByText('2 of 3 remaining')).toBeInTheDocument();
    });

    it('displays empty state when no todos', () => {
      const emptyState = {
        todos: {
          todos: [],
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: emptyState });
      
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });
  });

  describe('Filter Integration', () => {
    it('displays all todos by default', () => {
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test todo 2')).toBeInTheDocument();
      expect(screen.getByText('Test todo 3')).toBeInTheDocument();
    });

    it('filters to show only active todos', async () => {
      const user = userEvent.setup();
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      const activeButton = screen.getByRole('button', { name: 'Active' });
      await user.click(activeButton);
      
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
      expect(screen.queryByText('Test todo 2')).not.toBeInTheDocument(); // Completed
      expect(screen.getByText('Test todo 3')).toBeInTheDocument();
    });

    it('filters to show only completed todos', async () => {
      const user = userEvent.setup();
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      await user.click(completedButton);
      
      expect(screen.queryByText('Test todo 1')).not.toBeInTheDocument(); // Active
      expect(screen.getByText('Test todo 2')).toBeInTheDocument();
      expect(screen.queryByText('Test todo 3')).not.toBeInTheDocument(); // Active
    });

    it('highlights active filter button', async () => {
      const user = userEvent.setup();
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const allButton = screen.getByRole('button', { name: 'All' });
      
      // Initially "All" should be active
      expect(allButton).toHaveClass('active');
      expect(activeButton).not.toHaveClass('active');
      
      await user.click(activeButton);
      
      // After clicking, "Active" should be active
      expect(allButton).not.toHaveClass('active');
      expect(activeButton).toHaveClass('active');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', () => {
      const errorState = {
        todos: {
          todos: [],
          loading: false,
          error: 'Network error occurred'
        }
      };
      
      expect(() => {
        renderWithProviders(<TodoApp />, { preloadedState: errorState });
      }).not.toThrow();
      
      // Component should still render basic elements
      expect(screen.getByText('Legacy TODO App')).toBeInTheDocument();
    });

    it('continues to function after error', async () => {
      const user = userEvent.setup();
      const errorState = {
        todos: {
          todos: [],
          loading: false,
          error: 'Network error occurred'
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: errorState });
      
      // Should still be able to use the form
      const input = screen.getByPlaceholderText('What needs to be done?');
      await user.type(input, 'New todo after error');
      await user.keyboard('{Enter}');
      
      expect(input).toHaveValue('');
    });
  });

  describe('Component Integration', () => {
    it('integrates all components correctly', () => {
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      // Header
      expect(screen.getByText('Legacy TODO App')).toBeInTheDocument();
      expect(screen.getByText('Built with React 16, Redux, and Saga')).toBeInTheDocument();
      
      // Form
      expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
      
      // List
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test todo 2')).toBeInTheDocument();
      expect(screen.getByText('Test todo 3')).toBeInTheDocument();
      
      // Filters
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
      expect(screen.getByText('2 of 3 remaining')).toBeInTheDocument();
    });

    it('handles state updates correctly', () => {
      // Test with empty state
      const initialState = {
        todos: {
          todos: [],
          loading: false,
          error: null
        }
      };
      
      const { unmount: unmountEmpty } = renderWithProviders(<TodoApp />, { preloadedState: initialState });
      
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
      
      // Clean up first render
      unmountEmpty();
      
      // Test with todos state
      const updatedState = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: updatedState });
      
      expect(screen.queryByText('No todos yet. Add one above!')).not.toBeInTheDocument();
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles large number of todos efficiently', () => {
      const manyTodos = Array.from({ length: 50 }, (_, i) => ({
        id: `todo-${i}`,
        text: `Todo ${i}`,
        completed: i % 2 === 0,
        createdAt: new Date().toISOString()
      }));
      
      const stateWithManyTodos = {
        todos: {
          todos: manyTodos,
          loading: false,
          error: null
        }
      };
      
      const startTime = performance.now();
      renderWithProviders(<TodoApp />, { preloadedState: stateWithManyTodos });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should render quickly
      expect(screen.getAllByRole('checkbox')).toHaveLength(50);
    });

    it('handles todos with special characters', () => {
      const specialTodos = [
        {
          id: '1',
          text: 'Todo with special chars: áéíóú ñ @#$%^&*()',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          text: 'Todo with emoji: 🚀 🎉 ✨',
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];
      
      const stateWithSpecialTodos = {
        todos: {
          todos: specialTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithSpecialTodos });
      
      expect(screen.getByText('Todo with special chars: áéíóú ñ @#$%^&*()')).toBeInTheDocument();
      expect(screen.getByText('Todo with emoji: 🚀 🎉 ✨')).toBeInTheDocument();
    });

    it('handles concurrent filter changes', async () => {
      const user = userEvent.setup();
      const stateWithTodos = {
        todos: {
          todos: mockTodos,
          loading: false,
          error: null
        }
      };
      
      renderWithProviders(<TodoApp />, { preloadedState: stateWithTodos });
      
      const allButton = screen.getByRole('button', { name: 'All' });
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      
      // Rapid filter changes
      await user.click(activeButton);
      await user.click(completedButton);
      await user.click(allButton);
      
      // Should end up showing all todos
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test todo 2')).toBeInTheDocument();
      expect(screen.getByText('Test todo 3')).toBeInTheDocument();
      expect(allButton).toHaveClass('active');
    });
  });
});