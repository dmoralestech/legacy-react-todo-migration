import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockEvent, createMockKeyboardEvent } from '../../test/utils';
import TodoItem from '../TodoItem';

describe('TodoItem Component', () => {
  // Mock todo data
  const mockTodo = {
    id: '1',
    text: 'Test todo item',
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  const completedTodo = {
    ...mockTodo,
    completed: true
  };

  // Mock handlers
  const mockHandlers = {
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders todo text correctly', () => {
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      expect(screen.getByText('Test todo item')).toBeInTheDocument();
    });

    it('renders checkbox for todo completion status', () => {
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders checkbox as checked for completed todo', () => {
      renderWithProviders(
        <TodoItem todo={completedTodo} {...mockHandlers} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders edit and delete buttons', () => {
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('applies completed class to completed todos', () => {
      renderWithProviders(
        <TodoItem todo={completedTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      expect(todoText).toHaveClass('completed');
    });

    it('applies correct CSS classes', () => {
      const { container } = renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toBeInTheDocument();
      expect(todoItem).not.toHaveClass('completed');
    });

    it('applies completed class to container for completed todos', () => {
      const { container } = renderWithProviders(
        <TodoItem todo={completedTodo} {...mockHandlers} />
      );
      
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toHaveClass('completed');
    });
  });

  describe('Checkbox Interactions', () => {
    it('calls onToggle when checkbox is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(mockHandlers.onToggle).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
    });

    it('calls onToggle with correct id for different todos', async () => {
      const user = userEvent.setup();
      const differentTodo = { ...mockTodo, id: '999' };
      
      renderWithProviders(
        <TodoItem todo={differentTodo} {...mockHandlers} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(mockHandlers.onToggle).toHaveBeenCalledWith('999');
    });

    it('handles rapid checkbox clicks correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      
      // Rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);
      
      expect(mockHandlers.onToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edit Mode', () => {
    it('enters edit mode when text is double-clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      expect(screen.getByDisplayValue('Test todo item')).toBeInTheDocument();
      expect(screen.queryByText('Test todo item')).not.toBeInTheDocument();
    });

    it('shows save and cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const editButton = screen.getByText('Edit');
      await user.click(editButton);
      
      expect(screen.getByDisplayValue('Test todo item')).toBeInTheDocument();
    });

    it('focuses input field when entering edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      expect(input).toHaveFocus();
    });

    it('preserves original text when entering edit mode', async () => {
      const user = userEvent.setup();
      const todoWithLongText = {
        ...mockTodo,
        text: 'This is a very long todo item text that should be preserved'
      };
      
      renderWithProviders(
        <TodoItem todo={todoWithLongText} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('This is a very long todo item text that should be preserved');
      await user.dblClick(todoText);
      
      expect(screen.getByDisplayValue('This is a very long todo item text that should be preserved')).toBeInTheDocument();
    });
  });

  describe('Edit Mode - Text Changes', () => {
    it('allows editing the todo text', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      // Edit the text
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, 'Updated todo text');
      
      expect(input).toHaveValue('Updated todo text');
    });

    it('handles partial text editing', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.type(input, ' - modified');
      
      expect(input).toHaveValue('Test todo item - modified');
    });

    it('handles empty text input', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      
      expect(input).toHaveValue('');
    });
  });

  describe('Save Operations', () => {
    it('saves changes when Enter is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode and modify text
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, 'Updated todo');
      await user.keyboard('{Enter}');
      
      expect(mockHandlers.onUpdate).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { text: 'Updated todo' });
    });

    it('saves changes when save button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode and modify text
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, 'Saved todo');
      
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);
      
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { text: 'Saved todo' });
    });

    it('saves changes when input loses focus', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode and modify text
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, 'Blurred todo');
      
      // Simulate blur by clicking outside
      await user.tab();
      
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { text: 'Blurred todo' });
    });

    it('exits edit mode after saving', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode, modify, and save
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, 'Updated todo');
      await user.keyboard('{Enter}');
      
      // Should exit edit mode
      expect(screen.queryByDisplayValue('Updated todo')).not.toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('trims whitespace when saving', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, '   Trimmed todo   ');
      await user.keyboard('{Enter}');
      
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', { text: 'Trimmed todo' });
    });

    it('does not save empty or whitespace-only text', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      
      // Test empty string
      await user.clear(input);
      await user.keyboard('{Enter}');
      expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
      
      // Test whitespace only
      await user.type(input, '   ');
      await user.keyboard('{Enter}');
      expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Operations', () => {
    it('cancels edit when Escape is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode and modify text
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, 'This should be cancelled');
      await user.keyboard('{Escape}');
      
      // Should not call onUpdate
      expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
      
      // Should exit edit mode and restore original text
      expect(screen.queryByDisplayValue('This should be cancelled')).not.toBeInTheDocument();
      expect(screen.getByText('Test todo item')).toBeInTheDocument();
    });

    it('cancels edit when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode and modify text
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      await user.clear(input);
      await user.type(input, 'This will be cancelled');
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('Test todo item')).toBeInTheDocument();
    });

    it('restores original text when cancelling', async () => {
      const user = userEvent.setup();
      const originalTodo = { ...mockTodo, text: 'Original text to restore' };
      
      renderWithProviders(
        <TodoItem todo={originalTodo} {...mockHandlers} />
      );
      
      // Enter edit mode and modify text
      const todoText = screen.getByText('Original text to restore');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Original text to restore');
      await user.clear(input);
      await user.type(input, 'Completely different text');
      await user.keyboard('{Escape}');
      
      // Original text should be restored
      expect(screen.getByText('Original text to restore')).toBeInTheDocument();
    });

    it('exits edit mode when cancelling', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      // Cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      // Should be back to normal mode
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  describe('Delete Operations', () => {
    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);
      
      expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
    });

    it('calls onDelete with correct id for different todos', async () => {
      const user = userEvent.setup();
      const differentTodo = { ...mockTodo, id: 'delete-test-123' };
      
      renderWithProviders(
        <TodoItem todo={differentTodo} {...mockHandlers} />
      );
      
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);
      
      expect(mockHandlers.onDelete).toHaveBeenCalledWith('delete-test-123');
    });

    it('does not show delete button in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Enter edit mode
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      // Delete button should not be visible
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper checkbox accessibility', () => {
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('has proper button accessibility', () => {
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const editButton = screen.getByRole('button', { name: 'Edit' });
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    it('has proper input accessibility in edit mode', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long todo text', () => {
      const longTextTodo = {
        ...mockTodo,
        text: 'This is a very long todo text that might cause issues with layout or rendering if not handled properly in the component'
      };
      
      renderWithProviders(
        <TodoItem todo={longTextTodo} {...mockHandlers} />
      );
      
      expect(screen.getByText(longTextTodo.text)).toBeInTheDocument();
    });

    it('handles special characters in todo text', () => {
      const specialCharTodo = {
        ...mockTodo,
        text: 'Todo with special chars: áéíóú ñ @#$%^&*()[]{}|\\:";\'<>?,./'
      };
      
      renderWithProviders(
        <TodoItem todo={specialCharTodo} {...mockHandlers} />
      );
      
      expect(screen.getByText(specialCharTodo.text)).toBeInTheDocument();
    });

    it('handles empty string todo text', () => {
      const emptyTodo = { ...mockTodo, text: '' };
      
      renderWithProviders(
        <TodoItem todo={emptyTodo} {...mockHandlers} />
      );
      
      // Should still render the component structure
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('handles missing handlers gracefully', () => {
      // This test ensures the component doesn't crash if handlers are undefined
      expect(() => {
        renderWithProviders(
          <TodoItem 
            todo={mockTodo} 
            onToggle={undefined} 
            onUpdate={undefined} 
            onDelete={undefined} 
          />
        );
      }).not.toThrow();
    });

    it('handles rapid mode switching', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Rapidly enter and exit edit mode
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      // Should be able to enter edit mode again
      await user.dblClick(screen.getByText('Test todo item'));
      expect(screen.getByDisplayValue('Test todo item')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('maintains internal edit state correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      // Initially not in edit mode
      expect(screen.queryByDisplayValue('Test todo item')).not.toBeInTheDocument();
      
      // Enter edit mode
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      expect(screen.getByDisplayValue('Test todo item')).toBeInTheDocument();
      
      // Exit edit mode
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      expect(screen.queryByDisplayValue('Test todo item')).not.toBeInTheDocument();
    });

    it('updates edit text state correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoItem todo={mockTodo} {...mockHandlers} />
      );
      
      const todoText = screen.getByText('Test todo item');
      await user.dblClick(todoText);
      
      const input = screen.getByDisplayValue('Test todo item');
      
      // Change the text multiple times
      await user.clear(input);
      await user.type(input, 'First change');
      expect(input).toHaveValue('First change');
      
      await user.clear(input);
      await user.type(input, 'Second change');
      expect(input).toHaveValue('Second change');
    });
  });
});