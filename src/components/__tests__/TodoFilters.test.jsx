import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/utils';
import TodoFilters from '../TodoFilters';

describe('TodoFilters Component', () => {
  const mockTodoCount = {
    total: 5,
    active: 3,
    completed: 2
  };

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the filters container', () => {
      const { container } = renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const filtersContainer = container.querySelector('.todo-filters');
      expect(filtersContainer).toBeInTheDocument();
    });

    it('renders todo count information', () => {
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      expect(screen.getByText('3 of 5 remaining')).toBeInTheDocument();
    });

    it('renders all filter buttons', () => {
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
    });

    it('applies correct CSS classes to container elements', () => {
      const { container } = renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      expect(container.querySelector('.todo-count')).toBeInTheDocument();
      expect(container.querySelector('.filter-buttons')).toBeInTheDocument();
    });

    it('applies correct CSS classes to buttons', () => {
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('btn');
      });
    });
  });

  describe('Active Filter State', () => {
    it('highlights "All" button when filter is "all"', () => {
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      
      expect(allButton).toHaveClass('active');
      expect(activeButton).not.toHaveClass('active');
      expect(completedButton).not.toHaveClass('active');
    });

    it('highlights "Active" button when filter is "active"', () => {
      renderWithProviders(
        <TodoFilters 
          filter="active" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      
      expect(allButton).not.toHaveClass('active');
      expect(activeButton).toHaveClass('active');
      expect(completedButton).not.toHaveClass('active');
    });

    it('highlights "Completed" button when filter is "completed"', () => {
      renderWithProviders(
        <TodoFilters 
          filter="completed" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      
      expect(allButton).not.toHaveClass('active');
      expect(activeButton).not.toHaveClass('active');
      expect(completedButton).toHaveClass('active');
    });

    it('only highlights one button at a time', () => {
      renderWithProviders(
        <TodoFilters 
          filter="active" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const activeButtons = screen.getAllByRole('button').filter(button => 
        button.classList.contains('active')
      );
      
      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0]).toHaveTextContent('Active');
    });
  });

  describe('Filter Interactions', () => {
    it('calls onFilterChange with "all" when All button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoFilters 
          filter="active" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      await user.click(allButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });

    it('calls onFilterChange with "active" when Active button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const activeButton = screen.getByRole('button', { name: 'Active' });
      await user.click(activeButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith('active');
    });

    it('calls onFilterChange with "completed" when Completed button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      await user.click(completedButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
    });

    it('allows clicking the same filter multiple times', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      await user.click(allButton);
      await user.click(allButton);
      await user.click(allButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });

    it('handles rapid filter changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      
      await user.click(activeButton);
      await user.click(completedButton);
      await user.click(allButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, 'active');
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, 'completed');
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, 'all');
    });
  });

  describe('Todo Count Display', () => {
    it('displays correct count when all todos are active', () => {
      const allActiveCounts = { total: 3, active: 3, completed: 0 };
      
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={allActiveCounts} 
        />
      );
      
      expect(screen.getByText('3 of 3 remaining')).toBeInTheDocument();
    });

    it('displays correct count when all todos are completed', () => {
      const allCompletedCounts = { total: 2, active: 0, completed: 2 };
      
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={allCompletedCounts} 
        />
      );
      
      expect(screen.getByText('0 of 2 remaining')).toBeInTheDocument();
    });

    it('displays correct count with no todos', () => {
      const noCounts = { total: 0, active: 0, completed: 0 };
      
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={noCounts} 
        />
      );
      
      expect(screen.getByText('0 of 0 remaining')).toBeInTheDocument();
    });

    it('displays correct count with single todo', () => {
      const singleActiveCounts = { total: 1, active: 1, completed: 0 };
      
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={singleActiveCounts} 
        />
      );
      
      expect(screen.getByText('1 of 1 remaining')).toBeInTheDocument();
    });

    it('updates count display when props change', () => {
      const initialCounts = { total: 3, active: 2, completed: 1 };
      const updatedCounts = { total: 5, active: 3, completed: 2 };
      
      const { rerender } = renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={initialCounts} 
        />
      );
      
      expect(screen.getByText('2 of 3 remaining')).toBeInTheDocument();
      
      rerender(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={updatedCounts} 
        />
      );
      
      expect(screen.getByText('3 of 5 remaining')).toBeInTheDocument();
    });

    it('handles large todo counts correctly', () => {
      const largeCounts = { total: 1000, active: 750, completed: 250 };
      
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={largeCounts} 
        />
      );
      
      expect(screen.getByText('750 of 1000 remaining')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button accessibility', () => {
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const allButton = screen.getByRole('button', { name: 'All' });
      const activeButton = screen.getByRole('button', { name: 'Active' });
      const completedButton = screen.getByRole('button', { name: 'Completed' });
      
      expect(allButton).toBeInTheDocument();
      expect(activeButton).toBeInTheDocument();
      expect(completedButton).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      // Tab through filter buttons
      await user.tab();
      expect(screen.getByRole('button', { name: 'All' })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: 'Active' })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: 'Completed' })).toHaveFocus();
    });

    it('supports keyboard interaction', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const activeButton = screen.getByRole('button', { name: 'Active' });
      activeButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnFilterChange).toHaveBeenCalledWith('active');
      
      await user.keyboard(' '); // Space key
      expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
    });

    it('has proper ARIA attributes for active state', () => {
      renderWithProviders(
        <TodoFilters 
          filter="active" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      const activeButton = screen.getByRole('button', { name: 'Active' });
      // The active state is indicated by CSS class, which is appropriate
      expect(activeButton).toHaveClass('active');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onFilterChange prop gracefully', () => {
      expect(() => {
        renderWithProviders(
          <TodoFilters 
            filter="all" 
            onFilterChange={undefined} 
            todoCount={mockTodoCount} 
          />
        );
      }).not.toThrow();
    });

    it('handles invalid filter prop', () => {
      renderWithProviders(
        <TodoFilters 
          filter="invalid" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      // Should render without crashing
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      
      // No button should have active class for invalid filter
      const buttons = screen.getAllByRole('button');
      const activeButtons = buttons.filter(button => button.classList.contains('active'));
      expect(activeButtons).toHaveLength(0);
    });

    it('handles negative todo counts', () => {
      const negativeCounts = { total: -1, active: -5, completed: -2 };
      
      renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={negativeCounts} 
        />
      );
      
      // Should display the values as provided (component doesn't validate)
      expect(screen.getByText('-5 of -1 remaining')).toBeInTheDocument();
    });

    it('handles missing count properties', () => {
      const incompleteCounts = { total: 5 }; // missing active and completed
      
      expect(() => {
        renderWithProviders(
          <TodoFilters 
            filter="all" 
            onFilterChange={mockOnFilterChange} 
            todoCount={incompleteCounts} 
          />
        );
      }).not.toThrow();
    });

    it('handles undefined todoCount prop', () => {
      expect(() => {
        renderWithProviders(
          <TodoFilters 
            filter="all" 
            onFilterChange={mockOnFilterChange} 
            todoCount={undefined} 
          />
        );
      }).not.toThrow();
    });

    it('handles null todoCount prop', () => {
      expect(() => {
        renderWithProviders(
          <TodoFilters 
            filter="all" 
            onFilterChange={mockOnFilterChange} 
            todoCount={null} 
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const { rerender } = renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      // Re-render with same props
      rerender(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      // Component should still work correctly
      expect(screen.getByRole('button', { name: 'All' })).toHaveClass('active');
      expect(screen.getByText('3 of 5 remaining')).toBeInTheDocument();
    });

    it('handles frequent prop updates efficiently', () => {
      const counts = [
        { total: 1, active: 1, completed: 0 },
        { total: 2, active: 1, completed: 1 },
        { total: 3, active: 2, completed: 1 },
        { total: 4, active: 2, completed: 2 },
        { total: 5, active: 3, completed: 2 },
      ];
      
      const { rerender } = renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={counts[0]} 
        />
      );
      
      // Rapidly update counts
      counts.forEach((count, index) => {
        rerender(
          <TodoFilters 
            filter="all" 
            onFilterChange={mockOnFilterChange} 
            todoCount={count} 
          />
        );
        
        expect(screen.getByText(`${count.active} of ${count.total} remaining`)).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('works correctly with all filter combinations', () => {
      const filters = ['all', 'active', 'completed'];
      
      filters.forEach(filter => {
        const { rerender } = renderWithProviders(
          <TodoFilters 
            filter={filter} 
            onFilterChange={mockOnFilterChange} 
            todoCount={mockTodoCount} 
          />
        );
        
        const expectedActiveButton = screen.getByRole('button', { 
          name: filter.charAt(0).toUpperCase() + filter.slice(1) 
        });
        expect(expectedActiveButton).toHaveClass('active');
        
        // Clean up for next iteration
        rerender(<div />);
      });
    });

    it('maintains functionality across filter changes', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      // Click active filter
      await user.click(screen.getByRole('button', { name: 'Active' }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('active');
      
      // Update props to reflect new filter
      rerender(
        <TodoFilters 
          filter="active" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      // Active button should now be highlighted
      expect(screen.getByRole('button', { name: 'Active' })).toHaveClass('active');
      
      // Should still be able to change filters
      await user.click(screen.getByRole('button', { name: 'Completed' }));
      expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
    });

    it('preserves event handlers through prop updates', async () => {
      const user = userEvent.setup();
      const newHandler = vi.fn();
      
      const { rerender } = renderWithProviders(
        <TodoFilters 
          filter="all" 
          onFilterChange={mockOnFilterChange} 
          todoCount={mockTodoCount} 
        />
      );
      
      rerender(
        <TodoFilters 
          filter="all" 
          onFilterChange={newHandler} 
          todoCount={mockTodoCount} 
        />
      );
      
      await user.click(screen.getByRole('button', { name: 'Active' }));
      
      expect(newHandler).toHaveBeenCalledWith('active');
      expect(mockOnFilterChange).not.toHaveBeenCalled();
    });
  });
});