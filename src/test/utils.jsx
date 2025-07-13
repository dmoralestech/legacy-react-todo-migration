import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JotaiProvider } from '../utils/providers';

/**
 * Create a test wrapper with Jotai provider
 * @param {Object} initialState - Initial state (not used in Jotai, but kept for compatibility)
 * @returns {Object} Test wrapper utilities
 */
export const createTestStore = (initialState = {}) => {
  // Return a mock store interface for compatibility
  return {
    cleanup: () => {
      // No cleanup needed for Jotai
    }
  };
};

/**
 * Custom render function that includes Jotai Provider and Router
 * @param {ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result with store
 */
export const renderWithProviders = (ui, {
  preloadedState = {},
  store = createTestStore(preloadedState),
  route = '/',
  ...renderOptions
} = {}) => {
  // Wrapper component with all providers
  const Wrapper = ({ children }) => (
    <JotaiProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </JotaiProvider>
  );

  // Return the store along with render result
  const result = render(ui, { wrapper: Wrapper, ...renderOptions });
  
  return { 
    store, 
    ...result,
    // Helper to cleanup 
    cleanup: () => {
      if (store.cleanup) {
        store.cleanup();
      }
    }
  };
};

/**
 * Mock TODO data for testing
 */
export const mockTodos = [
  {
    id: '1',
    text: 'Learn React Testing',
    completed: false,
    createdAt: new Date('2023-01-01').toISOString()
  },
  {
    id: '2',
    text: 'Write comprehensive tests',
    completed: true,
    createdAt: new Date('2023-01-02').toISOString()
  },
  {
    id: '3',
    text: 'Deploy to production',
    completed: false,
    createdAt: new Date('2023-01-03').toISOString()
  }
];

/**
 * Mock API response helper
 * @param {*} data - Data to return
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} Promise that resolves with data
 */
export const mockApiResponse = (data, delay = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Mock API error helper
 * @param {string} message - Error message
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} Promise that rejects with error
 */
export const mockApiError = (message = 'API Error', delay = 100) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

/**
 * Helper to wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export const waitFor = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create mock store for Redux testing
 * @param {Object} initialState - Initial state
 * @returns {Object} Mock store
 */
export const createMockStore = (initialState = {}) => {
  const actions = [];
  
  return {
    getState: () => initialState,
    dispatch: (action) => {
      actions.push(action);
      return action;
    },
    subscribe: () => () => {},
    getActions: () => actions,
    clearActions: () => actions.splice(0, actions.length)
  };
};

/**
 * Mock event helpers
 */
export const createMockEvent = (overrides = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: { value: '' },
  ...overrides
});

export const createMockKeyboardEvent = (key, overrides = {}) => ({
  ...createMockEvent(overrides),
  key,
  keyCode: key === 'Enter' ? 13 : key === 'Escape' ? 27 : 0,
  which: key === 'Enter' ? 13 : key === 'Escape' ? 27 : 0
});