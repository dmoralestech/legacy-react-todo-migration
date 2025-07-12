import { describe, it, expect } from 'vitest';
import todoReducer from '../todoReducer';
import { TODO_ACTIONS } from '../../actions/todoActions';

describe('todoReducer', () => {
  const initialState = {
    todos: [],
    loading: false,
    error: null
  };

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

  describe('Initial State', () => {
    it('returns correct initial state when state is undefined', () => {
      const action = { type: 'UNKNOWN_ACTION' };
      const state = todoReducer(undefined, action);
      
      expect(state).toEqual(initialState);
    });

    it('returns initial state with correct structure', () => {
      const state = todoReducer(undefined, {});
      
      expect(state).toHaveProperty('todos');
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('error');
      expect(Array.isArray(state.todos)).toBe(true);
      expect(typeof state.loading).toBe('boolean');
    });

    it('has correct initial values', () => {
      const state = todoReducer(undefined, {});
      
      expect(state.todos).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('Unknown Actions', () => {
    it('returns current state for unknown action types', () => {
      const currentState = {
        todos: mockTodos,
        loading: true,
        error: 'Some error'
      };
      
      const action = { type: 'UNKNOWN_ACTION_TYPE' };
      const newState = todoReducer(currentState, action);
      
      expect(newState).toBe(currentState);
      expect(newState).toEqual(currentState);
    });

    it('does not mutate state for unknown actions', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: false,
        error: null
      };
      
      const stateBefore = JSON.parse(JSON.stringify(currentState));
      
      todoReducer(currentState, { type: 'RANDOM_ACTION' });
      
      expect(currentState).toEqual(stateBefore);
    });
  });

  describe('Request Actions (Loading States)', () => {
    const requestActions = [
      TODO_ACTIONS.FETCH_TODOS_REQUEST,
      TODO_ACTIONS.ADD_TODO_REQUEST,
      TODO_ACTIONS.UPDATE_TODO_REQUEST,
      TODO_ACTIONS.DELETE_TODO_REQUEST,
      TODO_ACTIONS.TOGGLE_TODO_REQUEST
    ];

    requestActions.forEach(actionType => {
      it(`sets loading to true and clears error for ${actionType}`, () => {
        const currentState = {
          todos: mockTodos,
          loading: false,
          error: 'Previous error'
        };
        
        const action = { type: actionType };
        const newState = todoReducer(currentState, action);
        
        expect(newState).toEqual({
          todos: mockTodos,
          loading: true,
          error: null
        });
      });
    });

    it('preserves todos array when setting loading state', () => {
      const currentState = {
        todos: mockTodos,
        loading: false,
        error: null
      };
      
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toBe(currentState.todos);
      expect(newState.todos).toEqual(mockTodos);
    });

    it('does not mutate original state', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: false,
        error: null
      };
      
      const stateBefore = JSON.parse(JSON.stringify(currentState));
      const action = { type: TODO_ACTIONS.ADD_TODO_REQUEST };
      
      todoReducer(currentState, action);
      
      expect(currentState).toEqual(stateBefore);
    });
  });

  describe('FETCH_TODOS_SUCCESS', () => {
    it('sets todos and resets loading and error', () => {
      const currentState = {
        todos: [],
        loading: true,
        error: 'Some error'
      };
      
      const action = {
        type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
        payload: mockTodos
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState).toEqual({
        todos: mockTodos,
        loading: false,
        error: null
      });
    });

    it('replaces existing todos', () => {
      const existingTodos = [
        { id: '99', text: 'Old todo', completed: false }
      ];
      
      const currentState = {
        todos: existingTodos,
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
        payload: mockTodos
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toEqual(mockTodos);
      expect(newState.todos).not.toContain(existingTodos[0]);
    });

    it('handles empty todos array', () => {
      const currentState = {
        todos: mockTodos,
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
        payload: []
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toEqual([]);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(null);
    });

    it('does not mutate payload', () => {
      const payload = [...mockTodos];
      const payloadBefore = JSON.parse(JSON.stringify(payload));
      
      const action = {
        type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
        payload
      };
      
      todoReducer(initialState, action);
      
      expect(payload).toEqual(payloadBefore);
    });
  });

  describe('ADD_TODO_SUCCESS', () => {
    it('adds new todo to existing todos', () => {
      const currentState = {
        todos: mockTodos.slice(0, 2), // First 2 todos
        loading: true,
        error: null
      };
      
      const newTodo = {
        id: '4',
        text: 'New todo',
        completed: false,
        createdAt: '2023-01-04T00:00:00.000Z'
      };
      
      const action = {
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: newTodo
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toHaveLength(3);
      expect(newState.todos).toContain(newTodo);
      expect(newState.todos[2]).toEqual(newTodo);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(null);
    });

    it('adds todo to empty todos array', () => {
      const currentState = {
        todos: [],
        loading: true,
        error: null
      };
      
      const newTodo = mockTodos[0];
      
      const action = {
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: newTodo
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toEqual([newTodo]);
    });

    it('preserves existing todos when adding new one', () => {
      const existingTodos = mockTodos.slice(0, 2);
      const currentState = {
        todos: existingTodos,
        loading: true,
        error: null
      };
      
      const newTodo = mockTodos[2];
      
      const action = {
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: newTodo
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos.slice(0, 2)).toEqual(existingTodos);
      expect(newState.todos[2]).toEqual(newTodo);
    });

    it('does not mutate existing todos array', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: true,
        error: null
      };
      
      const todosBefore = [...currentState.todos];
      const newTodo = { id: '999', text: 'New', completed: false };
      
      const action = {
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: newTodo
      };
      
      todoReducer(currentState, action);
      
      expect(currentState.todos).toEqual(todosBefore);
    });
  });

  describe('UPDATE_TODO_SUCCESS and TOGGLE_TODO_SUCCESS', () => {
    const updateActions = [
      TODO_ACTIONS.UPDATE_TODO_SUCCESS,
      TODO_ACTIONS.TOGGLE_TODO_SUCCESS
    ];

    updateActions.forEach(actionType => {
      describe(`${actionType}`, () => {
        it('updates existing todo', () => {
          const currentState = {
            todos: [...mockTodos],
            loading: true,
            error: null
          };
          
          const updatedTodo = {
            ...mockTodos[1],
            text: 'Updated todo text',
            completed: !mockTodos[1].completed,
            updatedAt: '2023-01-02T01:00:00.000Z'
          };
          
          const action = {
            type: actionType,
            payload: updatedTodo
          };
          
          const newState = todoReducer(currentState, action);
          
          expect(newState.todos).toHaveLength(mockTodos.length);
          expect(newState.todos[1]).toEqual(updatedTodo);
          expect(newState.loading).toBe(false);
          expect(newState.error).toBe(null);
        });

        it('preserves other todos when updating one', () => {
          const currentState = {
            todos: [...mockTodos],
            loading: true,
            error: null
          };
          
          const updatedTodo = {
            ...mockTodos[1],
            text: 'Updated text'
          };
          
          const action = {
            type: actionType,
            payload: updatedTodo
          };
          
          const newState = todoReducer(currentState, action);
          
          expect(newState.todos[0]).toEqual(mockTodos[0]);
          expect(newState.todos[2]).toEqual(mockTodos[2]);
          expect(newState.todos[1]).toEqual(updatedTodo);
        });

        it('handles todo not found gracefully', () => {
          const currentState = {
            todos: [...mockTodos],
            loading: true,
            error: null
          };
          
          const nonExistentTodo = {
            id: '999',
            text: 'Non-existent todo',
            completed: false
          };
          
          const action = {
            type: actionType,
            payload: nonExistentTodo
          };
          
          const newState = todoReducer(currentState, action);
          
          // Should not add the todo, just preserve existing ones
          expect(newState.todos).toEqual(mockTodos);
          expect(newState.loading).toBe(false);
          expect(newState.error).toBe(null);
        });

        it('updates correct todo when multiple todos exist', () => {
          const currentState = {
            todos: [...mockTodos],
            loading: true,
            error: null
          };
          
          const updatedTodo = {
            ...mockTodos[0],
            completed: true
          };
          
          const action = {
            type: actionType,
            payload: updatedTodo
          };
          
          const newState = todoReducer(currentState, action);
          
          expect(newState.todos[0].completed).toBe(true);
          expect(newState.todos[1].completed).toBe(mockTodos[1].completed);
          expect(newState.todos[2].completed).toBe(mockTodos[2].completed);
        });

        it('does not mutate original todos array', () => {
          const currentState = {
            todos: [...mockTodos],
            loading: true,
            error: null
          };
          
          const todosBefore = JSON.parse(JSON.stringify(currentState.todos));
          
          const updatedTodo = {
            ...mockTodos[0],
            text: 'Updated'
          };
          
          const action = {
            type: actionType,
            payload: updatedTodo
          };
          
          todoReducer(currentState, action);
          
          expect(currentState.todos).toEqual(todosBefore);
        });
      });
    });
  });

  describe('DELETE_TODO_SUCCESS', () => {
    it('removes todo from todos array', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
        payload: mockTodos[1].id
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toHaveLength(mockTodos.length - 1);
      expect(newState.todos).not.toContain(mockTodos[1]);
      expect(newState.todos).toContain(mockTodos[0]);
      expect(newState.todos).toContain(mockTodos[2]);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(null);
    });

    it('handles deleting first todo', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
        payload: mockTodos[0].id
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toEqual([mockTodos[1], mockTodos[2]]);
    });

    it('handles deleting last todo', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
        payload: mockTodos[2].id
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toEqual([mockTodos[0], mockTodos[1]]);
    });

    it('handles deleting only todo', () => {
      const singleTodo = [mockTodos[0]];
      const currentState = {
        todos: singleTodo,
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
        payload: mockTodos[0].id
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toEqual([]);
    });

    it('handles deleting non-existent todo', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
        payload: 'non-existent-id'
      };
      
      const newState = todoReducer(currentState, action);
      
      // Should preserve all todos if ID not found
      expect(newState.todos).toEqual(mockTodos);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(null);
    });

    it('does not mutate original todos array', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: true,
        error: null
      };
      
      const todosBefore = JSON.parse(JSON.stringify(currentState.todos));
      
      const action = {
        type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
        payload: mockTodos[0].id
      };
      
      todoReducer(currentState, action);
      
      expect(currentState.todos).toEqual(todosBefore);
    });
  });

  describe('Failure Actions', () => {
    const failureActions = [
      TODO_ACTIONS.FETCH_TODOS_FAILURE,
      TODO_ACTIONS.ADD_TODO_FAILURE,
      TODO_ACTIONS.UPDATE_TODO_FAILURE,
      TODO_ACTIONS.DELETE_TODO_FAILURE,
      TODO_ACTIONS.TOGGLE_TODO_FAILURE
    ];

    failureActions.forEach(actionType => {
      it(`sets error and resets loading for ${actionType}`, () => {
        const currentState = {
          todos: mockTodos,
          loading: true,
          error: null
        };
        
        const errorMessage = 'Something went wrong';
        
        const action = {
          type: actionType,
          payload: errorMessage
        };
        
        const newState = todoReducer(currentState, action);
        
        expect(newState).toEqual({
          todos: mockTodos,
          loading: false,
          error: errorMessage
        });
      });
    });

    it('preserves todos when error occurs', () => {
      const currentState = {
        todos: mockTodos,
        loading: true,
        error: null
      };
      
      const action = {
        type: TODO_ACTIONS.ADD_TODO_FAILURE,
        payload: 'Network error'
      };
      
      const newState = todoReducer(currentState, action);
      
      expect(newState.todos).toBe(currentState.todos);
      expect(newState.todos).toEqual(mockTodos);
    });

    it('handles different error types', () => {
      const errorTypes = [
        'String error',
        { message: 'Object error', code: 500 },
        new Error('Error object'),
        null,
        undefined
      ];
      
      errorTypes.forEach(error => {
        const action = {
          type: TODO_ACTIONS.FETCH_TODOS_FAILURE,
          payload: error
        };
        
        const newState = todoReducer(initialState, action);
        
        expect(newState.error).toBe(error);
        expect(newState.loading).toBe(false);
      });
    });
  });

  describe('State Immutability', () => {
    it('never mutates the input state', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: false,
        error: null
      };
      
      const stateBefore = JSON.parse(JSON.stringify(currentState));
      
      const actions = [
        { type: TODO_ACTIONS.FETCH_TODOS_REQUEST },
        { type: TODO_ACTIONS.FETCH_TODOS_SUCCESS, payload: [] },
        { type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: { id: '99', text: 'New', completed: false } },
        { type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: { ...mockTodos[0], text: 'Updated' } },
        { type: TODO_ACTIONS.DELETE_TODO_SUCCESS, payload: mockTodos[0].id },
        { type: TODO_ACTIONS.FETCH_TODOS_FAILURE, payload: 'Error' }
      ];
      
      actions.forEach(action => {
        todoReducer(currentState, action);
        expect(currentState).toEqual(stateBefore);
      });
    });

    it('returns new state object for all actions that change state', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: false,
        error: null
      };
      
      const changeActions = [
        { type: TODO_ACTIONS.FETCH_TODOS_REQUEST },
        { type: TODO_ACTIONS.FETCH_TODOS_SUCCESS, payload: mockTodos },
        { type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: { id: '99', text: 'New', completed: false } },
        { type: TODO_ACTIONS.FETCH_TODOS_FAILURE, payload: 'Error' }
      ];
      
      changeActions.forEach(action => {
        const newState = todoReducer(currentState, action);
        expect(newState).not.toBe(currentState);
      });
    });

    it('returns same state object for unknown actions', () => {
      const currentState = {
        todos: [...mockTodos],
        loading: false,
        error: null
      };
      
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const newState = todoReducer(currentState, unknownAction);
      
      expect(newState).toBe(currentState);
    });
  });

  describe('Edge Cases', () => {
    it('handles null payload gracefully', () => {
      const actions = [
        { type: TODO_ACTIONS.FETCH_TODOS_SUCCESS, payload: null },
        { type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: null },
        { type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: null },
        { type: TODO_ACTIONS.DELETE_TODO_SUCCESS, payload: null },
        { type: TODO_ACTIONS.FETCH_TODOS_FAILURE, payload: null }
      ];
      
      actions.forEach(action => {
        expect(() => todoReducer(initialState, action)).not.toThrow();
      });
    });

    it('handles undefined payload gracefully', () => {
      const actions = [
        { type: TODO_ACTIONS.FETCH_TODOS_SUCCESS },
        { type: TODO_ACTIONS.ADD_TODO_SUCCESS },
        { type: TODO_ACTIONS.UPDATE_TODO_SUCCESS },
        { type: TODO_ACTIONS.DELETE_TODO_SUCCESS },
        { type: TODO_ACTIONS.FETCH_TODOS_FAILURE }
      ];
      
      actions.forEach(action => {
        expect(() => todoReducer(initialState, action)).not.toThrow();
      });
    });

    it('handles malformed action objects', () => {
      const malformedActions = [
        null,
        undefined,
        {},
        { payload: 'no type' },
        { type: null },
        { type: undefined }
      ];
      
      malformedActions.forEach(action => {
        expect(() => todoReducer(initialState, action)).not.toThrow();
        const result = todoReducer(initialState, action);
        expect(result).toEqual(initialState);
      });
    });

    it('handles empty todos array in state', () => {
      const emptyState = {
        todos: [],
        loading: false,
        error: null
      };
      
      const newTodo = { id: '1', text: 'First todo', completed: false };
      const action = {
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: newTodo
      };
      
      const newState = todoReducer(emptyState, action);
      
      expect(newState.todos).toEqual([newTodo]);
    });

    it('handles very large todos array', () => {
      const largeTodos = Array.from({ length: 10000 }, (_, i) => ({
        id: `todo-${i}`,
        text: `Todo ${i}`,
        completed: i % 2 === 0,
        createdAt: new Date().toISOString()
      }));
      
      const currentState = {
        todos: largeTodos,
        loading: false,
        error: null
      };
      
      const newTodo = { id: 'new', text: 'New todo', completed: false };
      const action = {
        type: TODO_ACTIONS.ADD_TODO_SUCCESS,
        payload: newTodo
      };
      
      const startTime = performance.now();
      const newState = todoReducer(currentState, action);
      const endTime = performance.now();
      
      expect(newState.todos).toHaveLength(10001);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe('Reducer Composition', () => {
    it('works correctly in sequence of actions', () => {
      let state = todoReducer(undefined, {});
      
      // Fetch todos
      state = todoReducer(state, { type: TODO_ACTIONS.FETCH_TODOS_REQUEST });
      expect(state.loading).toBe(true);
      
      state = todoReducer(state, { type: TODO_ACTIONS.FETCH_TODOS_SUCCESS, payload: mockTodos });
      expect(state.todos).toEqual(mockTodos);
      expect(state.loading).toBe(false);
      
      // Add a todo
      const newTodo = { id: '4', text: 'New todo', completed: false };
      state = todoReducer(state, { type: TODO_ACTIONS.ADD_TODO_REQUEST });
      expect(state.loading).toBe(true);
      
      state = todoReducer(state, { type: TODO_ACTIONS.ADD_TODO_SUCCESS, payload: newTodo });
      expect(state.todos).toHaveLength(4);
      expect(state.loading).toBe(false);
      
      // Update a todo
      const updatedTodo = { ...newTodo, completed: true };
      state = todoReducer(state, { type: TODO_ACTIONS.UPDATE_TODO_SUCCESS, payload: updatedTodo });
      expect(state.todos[3].completed).toBe(true);
      
      // Delete a todo
      state = todoReducer(state, { type: TODO_ACTIONS.DELETE_TODO_SUCCESS, payload: newTodo.id });
      expect(state.todos).toHaveLength(3);
      expect(state.todos.find(t => t.id === newTodo.id)).toBeUndefined();
    });
  });
});