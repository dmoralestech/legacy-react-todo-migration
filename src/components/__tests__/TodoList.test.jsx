import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockTodos } from '../../test/utils';
import TodoList from '../TodoList';

describe('TodoList Component', () => {
  const mockHandlers = {
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders as an unordered list', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe('UL');
      expect(list).toHaveClass('todo-list');
    });

    it('renders all todos as list items', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(mockTodos.length);
    });

    it('renders correct todo text for each item', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      mockTodos.forEach(todo => {
        expect(screen.getByText(todo.text)).toBeInTheDocument();
      });
    });

    it('renders empty state when no todos', () => {
      renderWithProviders(
        <TodoList todos={[]} {...mockHandlers} />
      );
      
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('renders empty state with correct styling', () => {
      const { container } = renderWithProviders(
        <TodoList todos={[]} {...mockHandlers} />
      );
      
      const emptyState = container.querySelector('.todo-list-empty');
      expect(emptyState).toBeInTheDocument();
    });

    it('displays todos in the order provided', () => {
      const orderedTodos = [
        { id: '1', text: 'First todo', completed: false, createdAt: '2023-01-01' },
        { id: '2', text: 'Second todo', completed: false, createdAt: '2023-01-02' },
        { id: '3', text: 'Third todo', completed: false, createdAt: '2023-01-03' },
      ];

      renderWithProviders(
        <TodoList todos={orderedTodos} {...mockHandlers} />
      );
      
      const listItems = screen.getAllByRole('listitem');
      expect(within(listItems[0]).getByText('First todo')).toBeInTheDocument();
      expect(within(listItems[1]).getByText('Second todo')).toBeInTheDocument();
      expect(within(listItems[2]).getByText('Third todo')).toBeInTheDocument();
    });
  });

  describe('Todo Item Props', () => {
    it('passes correct props to each TodoItem', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      // Check that each todo has its checkbox and buttons
      mockTodos.forEach(() => {
        // Each todo should have a checkbox
        expect(screen.getAllByRole('checkbox')).toHaveLength(mockTodos.length);
      });
      
      // Check that edit and delete buttons are present
      expect(screen.getAllByText('Edit')).toHaveLength(mockTodos.length);
      expect(screen.getAllByText('Delete')).toHaveLength(mockTodos.length);
    });

    it('passes unique keys to TodoItems', () => {
      const { container } = renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      // Each list item should have a unique key (React will use it internally)
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(mockTodos.length);
    });

    it('handles todos with different completion states', () => {
      const mixedTodos = [
        { id: '1', text: 'Active todo', completed: false, createdAt: '2023-01-01' },
        { id: '2', text: 'Completed todo', completed: true, createdAt: '2023-01-02' },
      ];

      renderWithProviders(
        <TodoList todos={mixedTodos} {...mockHandlers} />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });
  });

  describe('Event Handling', () => {
    it('forwards onToggle calls to parent', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      
      expect(mockHandlers.onToggle).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodos[0].id);
    });

    it('forwards onDelete calls to parent', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);
      
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodos[0].id);
    });

    it('forwards onUpdate calls to parent', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      // Double-click first todo to enter edit mode
      const todoTexts = screen.getAllByText(mockTodos[0].text);
      await user.dblClick(todoTexts[0]);
      
      // Edit and save
      const input = screen.getByDisplayValue(mockTodos[0].text);
      await user.clear(input);
      await user.type(input, 'Updated text');
      await user.keyboard('{Enter}');
      
      expect(mockHandlers.onUpdate).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(
        mockTodos[0].id, 
        { text: 'Updated text' }
      );
    });

    it('handles events on different todos correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      // Toggle different todos
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Second todo
      await user.click(checkboxes[2]); // Third todo
      
      expect(mockHandlers.onToggle).toHaveBeenCalledTimes(2);
      expect(mockHandlers.onToggle).toHaveBeenNthCalledWith(1, mockTodos[1].id);
      expect(mockHandlers.onToggle).toHaveBeenNthCalledWith(2, mockTodos[2].id);
    });

    it('handles multiple events on same todo', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      
      // Multiple toggles on same todo
      await user.click(firstCheckbox);
      await user.click(firstCheckbox);
      await user.click(firstCheckbox);
      
      expect(mockHandlers.onToggle).toHaveBeenCalledTimes(3);
      expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodos[0].id);
    });
  });

  describe('Edge Cases', () => {
    it('handles single todo correctly', () => {
      const singleTodo = [mockTodos[0]];
      
      renderWithProviders(
        <TodoList todos={singleTodo} {...mockHandlers} />
      );
      
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText(singleTodo[0].text)).toBeInTheDocument();
    });

    it('handles large number of todos', () => {
      const manyTodos = Array.from({ length: 100 }, (_, i) => ({
        id: `todo-${i}`,
        text: `Todo item ${i}`,
        completed: i % 2 === 0,
        createdAt: `2023-01-${String(i % 30 + 1).padStart(2, '0')}`
      }));

      renderWithProviders(
        <TodoList todos={manyTodos} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(100);
      expect(screen.getAllByRole('checkbox')).toHaveLength(100);
    });

    it('handles todos with very long text', () => {
      const longTextTodos = [
        {
          id: '1',
          text: 'This is a very long todo item text that might cause layout issues if not handled properly by the component and its styling',
          completed: false,
          createdAt: '2023-01-01'
        }
      ];

      renderWithProviders(
        <TodoList todos={longTextTodos} {...mockHandlers} />
      );
      
      expect(screen.getByText(longTextTodos[0].text)).toBeInTheDocument();
    });

    it('handles todos with special characters', () => {
      const specialCharTodos = [
        {
          id: '1',
          text: 'Todo with special chars: áéíóú ñ @#$%^&*()[]{}|\\:";\'<>?,./',
          completed: false,
          createdAt: '2023-01-01'
        }
      ];

      renderWithProviders(
        <TodoList todos={specialCharTodos} {...mockHandlers} />
      );
      
      expect(screen.getByText(specialCharTodos[0].text)).toBeInTheDocument();
    });

    it('handles empty string todo text', () => {
      const emptyTextTodos = [
        { id: '1', text: '', completed: false, createdAt: '2023-01-01' }
      ];

      renderWithProviders(
        <TodoList todos={emptyTextTodos} {...mockHandlers} />
      );
      
      // Should still render the list and item structure
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('handles malformed todo objects gracefully', () => {
      const malformedTodos = [
        { id: '1', text: 'Valid todo', completed: false, createdAt: '2023-01-01' },
        { id: '2', text: null, completed: false, createdAt: '2023-01-02' },
        { id: '3', completed: true, createdAt: '2023-01-03' }, // missing text
      ];

      // Should not crash even with malformed data
      expect(() => {
        renderWithProviders(
          <TodoList todos={malformedTodos} {...mockHandlers} />
        );
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper list accessibility', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('has proper list item accessibility', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(mockTodos.length);
    });

    it('maintains checkbox accessibility', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('maintains button accessibility', () => {
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      
      expect(editButtons).toHaveLength(mockTodos.length);
      expect(deleteButtons).toHaveLength(mockTodos.length);
    });

    it('has proper keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      // Tab through interactive elements
      await user.tab(); // First checkbox
      expect(screen.getAllByRole('checkbox')[0]).toHaveFocus();
      
      await user.tab(); // First edit button
      expect(screen.getAllByText('Edit')[0]).toHaveFocus();
      
      await user.tab(); // First delete button
      expect(screen.getAllByText('Delete')[0]).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many todos', () => {
      const manyTodos = Array.from({ length: 1000 }, (_, i) => ({
        id: `todo-${i}`,
        text: `Todo ${i}`,
        completed: false,
        createdAt: '2023-01-01'
      }));

      const startTime = performance.now();
      
      renderWithProviders(
        <TodoList todos={manyTodos} {...mockHandlers} />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in reasonable time (less than 1.5 seconds to account for CI environment)
      expect(renderTime).toBeLessThan(1500);
      expect(screen.getAllByRole('listitem')).toHaveLength(1000);
    });

    it('handles prop changes efficiently', () => {
      const initialTodos = mockTodos.slice(0, 2);
      const updatedTodos = [...initialTodos, {
        id: '4',
        text: 'New todo',
        completed: false,
        createdAt: '2023-01-04'
      }];

      const { rerender } = renderWithProviders(
        <TodoList todos={initialTodos} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      
      // Update props
      rerender(
        <TodoList todos={updatedTodos} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText('New todo')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing handlers gracefully', () => {
      expect(() => {
        renderWithProviders(
          <TodoList 
            todos={mockTodos} 
            onToggle={undefined}
            onUpdate={undefined}
            onDelete={undefined}
          />
        );
      }).not.toThrow();
    });

    it('handles undefined todos prop', () => {
      expect(() => {
        renderWithProviders(
          <TodoList 
            todos={undefined} 
            {...mockHandlers}
          />
        );
      }).not.toThrow();
    });

    it('handles null todos prop', () => {
      expect(() => {
        renderWithProviders(
          <TodoList 
            todos={null} 
            {...mockHandlers}
          />
        );
      }).not.toThrow();
    });
  });

  describe('State Updates', () => {
    it('reflects todo updates correctly', () => {
      const initialTodos = [
        { id: '1', text: 'Original text', completed: false, createdAt: '2023-01-01' }
      ];
      
      const updatedTodos = [
        { id: '1', text: 'Updated text', completed: true, createdAt: '2023-01-01' }
      ];

      const { rerender } = renderWithProviders(
        <TodoList todos={initialTodos} {...mockHandlers} />
      );
      
      expect(screen.getByText('Original text')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      
      rerender(
        <TodoList todos={updatedTodos} {...mockHandlers} />
      );
      
      expect(screen.getByText('Updated text')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('handles todo deletion correctly', () => {
      const initialTodos = mockTodos;
      const todosAfterDeletion = mockTodos.slice(1); // Remove first todo

      const { rerender } = renderWithProviders(
        <TodoList todos={initialTodos} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText(mockTodos[0].text)).toBeInTheDocument();
      
      rerender(
        <TodoList todos={todosAfterDeletion} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      expect(screen.queryByText(mockTodos[0].text)).not.toBeInTheDocument();
    });

    it('handles todo addition correctly', () => {
      const initialTodos = mockTodos.slice(0, 2);
      const newTodo = {
        id: '4',
        text: 'Brand new todo',
        completed: false,
        createdAt: '2023-01-04'
      };
      const todosAfterAddition = [...initialTodos, newTodo];

      const { rerender } = renderWithProviders(
        <TodoList todos={initialTodos} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      
      rerender(
        <TodoList todos={todosAfterAddition} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText('Brand new todo')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('works correctly with empty array after having todos', () => {
      const { rerender } = renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      expect(screen.getAllByRole('listitem')).toHaveLength(mockTodos.length);
      
      rerender(
        <TodoList todos={[]} {...mockHandlers} />
      );
      
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });

    it('maintains event handlers through updates', async () => {
      const user = userEvent.setup();
      const updatedHandlers = {
        onToggle: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      };

      const { rerender } = renderWithProviders(
        <TodoList todos={mockTodos} {...mockHandlers} />
      );
      
      rerender(
        <TodoList todos={mockTodos} {...updatedHandlers} />
      );
      
      // Test that new handlers are used
      const checkbox = screen.getAllByRole('checkbox')[0];
      await user.click(checkbox);
      
      expect(updatedHandlers.onToggle).toHaveBeenCalledWith(mockTodos[0].id);
      expect(mockHandlers.onToggle).not.toHaveBeenCalled();
    });
  });
});