import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TodoItem from '../TodoItem';
import * as featureFlags from '../../utils/featureFlags';

// Mock the feature flag module
vi.mock('../../utils/featureFlags');

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

describe('TodoItem Component Switcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders legacy component when feature flag is disabled', () => {
    // Mock feature flag to return false (legacy)
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(false);
    
    render(<TodoItem {...mockProps} />);
    
    // Should render the todo text
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    
    // Verify feature flag was checked
    expect(vi.mocked(featureFlags.useFeatureFlag)).toHaveBeenCalledWith('USE_MODERN_TODO_ITEM');
  });

  test('renders modern component when feature flag is enabled', () => {
    // Mock feature flag to return true (modern)
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(true);
    
    render(<TodoItem {...mockProps} />);
    
    // Should render the same interface (API compatibility)
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    
    // Verify feature flag was checked
    expect(vi.mocked(featureFlags.useFeatureFlag)).toHaveBeenCalledWith('USE_MODERN_TODO_ITEM');
  });

  test('both implementations have identical rendering output', () => {
    // Test legacy implementation
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(false);
    const { container: legacyContainer } = render(<TodoItem {...mockProps} />);
    
    // Test modern implementation
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(true);
    const { container: modernContainer } = render(<TodoItem {...mockProps} />);
    
    // Both should have the same structure
    expect(legacyContainer.innerHTML).toBe(modernContainer.innerHTML);
  });

  test('feature flag switching works correctly', () => {
    const { rerender } = render(<TodoItem {...mockProps} />);
    
    // Start with legacy
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(false);
    rerender(<TodoItem {...mockProps} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    
    // Switch to modern
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(true);
    rerender(<TodoItem {...mockProps} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    
    // Switch back to legacy
    vi.mocked(featureFlags.useFeatureFlag).mockReturnValue(false);
    rerender(<TodoItem {...mockProps} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });
});