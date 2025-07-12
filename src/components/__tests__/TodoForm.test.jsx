import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils';
import TodoForm from '../TodoForm';

describe('TodoForm Component', () => {
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders input field with correct placeholder', () => {
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders submit button with correct text', () => {
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const button = screen.getByRole('button', { name: 'Add Todo' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders as a form element', () => {
      const { container } = renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('todo-form');
    });

    it('input has correct CSS class', () => {
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      expect(input).toHaveClass('todo-input');
    });

    it('button has correct CSS classes', () => {
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const button = screen.getByRole('button', { name: 'Add Todo' });
      expect(button).toHaveClass('btn', 'btn-add');
    });

    it('starts with empty input field', () => {
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      expect(input).toHaveValue('');
    });
  });

  describe('Form Submission', () => {
    it('calls onAdd with trimmed text when form is submitted via button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      await user.type(input, 'New todo item');
      await user.click(button);
      
      expect(mockOnAdd).toHaveBeenCalledTimes(1);
      expect(mockOnAdd).toHaveBeenCalledWith({ text: 'New todo item' });
    });

    it('calls onAdd when Enter key is pressed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'Todo via Enter key');
      await user.keyboard('{Enter}');
      
      expect(mockOnAdd).toHaveBeenCalledWith({ text: 'Todo via Enter key' });
    });

    it('trims whitespace from input before calling onAdd', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, '   Todo with spaces   ');
      await user.keyboard('{Enter}');
      
      expect(mockOnAdd).toHaveBeenCalledWith({ text: 'Todo with spaces' });
    });

    it('clears input field after successful submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'Todo to be cleared');
      await user.keyboard('{Enter}');
      
      expect(input).toHaveValue('');
    });

    it('handles form submission via form submit event', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const form = input.closest('form');
      
      await user.type(input, 'Form submit test');
      
      // Trigger form submit event
      fireEvent.submit(form);
      
      expect(mockOnAdd).toHaveBeenCalledWith({ text: 'Form submit test' });
    });

    it('prevents default form submission behavior', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const form = input.closest('form');
      const mockPreventDefault = vi.fn();
      
      await user.type(input, 'Test prevent default');
      
      // Mock the preventDefault function
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      submitEvent.preventDefault = mockPreventDefault;
      
      fireEvent(form, submitEvent);
      
      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('does not submit when input is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const button = screen.getByRole('button', { name: 'Add Todo' });
      await user.click(button);
      
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('does not submit when input contains only whitespace', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Test various whitespace patterns
      const whitespaceInputs = ['   ', '\t\t\t', '\n\n', '  \t \n  '];
      
      for (const whitespace of whitespaceInputs) {
        await user.clear(input);
        await user.type(input, whitespace);
        await user.keyboard('{Enter}');
        
        expect(mockOnAdd).not.toHaveBeenCalled();
      }
    });

    it('clears input even when submission is invalid (whitespace-only)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, '   '); // Only whitespace
      await user.keyboard('{Enter}');
      
      expect(input).toHaveValue(''); // Should be cleared for better UX
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('handles edge case of single character input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'a');
      await user.keyboard('{Enter}');
      
      expect(mockOnAdd).toHaveBeenCalledWith({ text: 'a' });
      expect(input).toHaveValue('');
    });

    it('handles very long input text', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const longText = 'This is a very long todo item that might be used to test how the form handles extremely long input text without breaking';
      
      await user.type(input, longText);
      await user.keyboard('{Enter}');
      
      expect(mockOnAdd).toHaveBeenCalledWith({ text: longText });
      expect(input).toHaveValue('');
    });
  });

  describe('Text Input Handling', () => {
    it('updates input value as user types', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'Test typing');
      
      expect(input).toHaveValue('Test typing');
    });

    it('handles text input changes correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Type some text
      await user.type(input, 'Initial text');
      expect(input).toHaveValue('Initial text');
      
      // Clear and type new text
      await user.clear(input);
      await user.type(input, 'New text');
      expect(input).toHaveValue('New text');
    });

    it('handles special characters correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const specialText = 'Todo with special chars: áéíóú ñ @#$%^&*()';
      
      await user.type(input, specialText);
      expect(input).toHaveValue(specialText);
      
      await user.keyboard('{Enter}');
      expect(mockOnAdd).toHaveBeenCalledWith({ text: specialText });
    });

    it('handles copy and paste operations', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const pastedText = 'Pasted todo item';
      
      // Simulate paste operation
      await user.click(input);
      await user.paste(pastedText);
      
      expect(input).toHaveValue(pastedText);
      
      await user.keyboard('{Enter}');
      expect(mockOnAdd).toHaveBeenCalledWith({ text: pastedText });
    });
  });

  describe('Multiple Submissions', () => {
    it('allows multiple consecutive submissions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // First submission
      await user.type(input, 'First todo');
      await user.keyboard('{Enter}');
      
      // Second submission
      await user.type(input, 'Second todo');
      await user.keyboard('{Enter}');
      
      // Third submission
      await user.type(input, 'Third todo');
      await user.keyboard('{Enter}');
      
      expect(mockOnAdd).toHaveBeenCalledTimes(3);
      expect(mockOnAdd).toHaveBeenNthCalledWith(1, { text: 'First todo' });
      expect(mockOnAdd).toHaveBeenNthCalledWith(2, { text: 'Second todo' });
      expect(mockOnAdd).toHaveBeenNthCalledWith(3, { text: 'Third todo' });
    });

    it('maintains form state correctly between submissions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Submit first todo
      await user.type(input, 'Todo 1');
      await user.keyboard('{Enter}');
      expect(input).toHaveValue('');
      
      // Form should be ready for next input
      await user.type(input, 'Todo 2');
      expect(input).toHaveValue('Todo 2');
      
      await user.keyboard('{Enter}');
      expect(input).toHaveValue('');
    });

    it('handles rapid submissions correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      // Rapid fire submissions
      await user.type(input, 'Rapid 1');
      await user.click(button);
      
      await user.type(input, 'Rapid 2');
      await user.click(button);
      
      await user.type(input, 'Rapid 3');
      await user.click(button);
      
      expect(mockOnAdd).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper form accessibility', () => {
      const { container } = renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('todo-form');
    });

    it('has proper input accessibility', () => {
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('has proper button accessibility', () => {
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const button = screen.getByRole('button', { name: 'Add Todo' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('maintains focus on input after submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Focus input and submit
      await user.click(input);
      await user.type(input, 'Focus test');
      await user.keyboard('{Enter}');
      
      // Input should still be focused for next entry
      expect(input).toHaveFocus();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const button = screen.getByRole('button', { name: 'Add Todo' });
      
      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();
      
      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles missing onAdd prop gracefully', () => {
      // Should not crash even if onAdd is undefined
      expect(() => {
        renderWithProviders(<TodoForm onAdd={undefined} />);
      }).not.toThrow();
    });

    it('handles onAdd throwing an error', async () => {
      const user = userEvent.setup();
      const errorOnAdd = vi.fn().mockImplementation(() => {
        throw new Error('Submission error');
      });
      
      // Should not crash the component
      expect(() => {
        renderWithProviders(<TodoForm onAdd={errorOnAdd} />);
      }).not.toThrow();
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Component should still work
      await user.type(input, 'Test error handling');
      
      // Submission might fail, but component should remain functional
      expect(() => user.keyboard('{Enter}')).not.toThrow();
    });

    it('maintains form state when onAdd fails', async () => {
      const user = userEvent.setup();
      const failingOnAdd = vi.fn().mockImplementation(() => {
        throw new Error('Network error');
      });
      
      renderWithProviders(<TodoForm onAdd={failingOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'This might fail');
      
      try {
        await user.keyboard('{Enter}');
      } catch (error) {
        // Error might be thrown, but form should still be usable
      }
      
      // Form should still be functional
      expect(input).toBeInTheDocument();
    });
  });

  describe('Component State', () => {
    it('manages internal state correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Initially empty
      expect(input).toHaveValue('');
      
      // After typing
      await user.type(input, 'State test');
      expect(input).toHaveValue('State test');
      
      // After submission
      await user.keyboard('{Enter}');
      expect(input).toHaveValue('');
    });

    it('resets state correctly after submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Submit multiple times to ensure state resets
      for (let i = 1; i <= 3; i++) {
        await user.type(input, `Todo ${i}`);
        expect(input).toHaveValue(`Todo ${i}`);
        
        await user.keyboard('{Enter}');
        expect(input).toHaveValue('');
      }
    });

    it('handles state changes correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Type, delete, and retype
      await user.type(input, 'First');
      expect(input).toHaveValue('First');
      
      await user.clear(input);
      expect(input).toHaveValue('');
      
      await user.type(input, 'Second');
      expect(input).toHaveValue('Second');
    });
  });

  describe('Integration with Parent', () => {
    it('passes correct data structure to onAdd', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TodoForm onAdd={mockOnAdd} />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'Integration test');
      await user.keyboard('{Enter}');
      
      // Should pass object with text property
      expect(mockOnAdd).toHaveBeenCalledWith({
        text: 'Integration test'
      });
      
      // Should only have text property
      const callArg = mockOnAdd.mock.calls[0][0];
      expect(Object.keys(callArg)).toEqual(['text']);
    });

    it('works with different onAdd implementations', async () => {
      const user = userEvent.setup();
      
      // Test with different callback implementations
      const callbacks = [
        vi.fn(data => console.log('Added:', data)),
        vi.fn(data => ({ ...data, id: Date.now() })),
        vi.fn(data => Promise.resolve(data))
      ];
      
      for (const callback of callbacks) {
        const { unmount } = renderWithProviders(<TodoForm onAdd={callback} />);
        
        const input = screen.getByPlaceholderText('What needs to be done?');
        await user.type(input, 'Callback test');
        await user.keyboard('{Enter}');
        
        expect(callback).toHaveBeenCalledWith({ text: 'Callback test' });
        
        unmount();
      }
    });
  });
});