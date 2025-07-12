import { describe, it, expect } from 'vitest';
import {
  TODO_ACTIONS,
  fetchTodosRequest,
  fetchTodosSuccess,
  fetchTodosFailure,
  addTodoRequest,
  addTodoSuccess,
  addTodoFailure,
  updateTodoRequest,
  updateTodoSuccess,
  updateTodoFailure,
  deleteTodoRequest,
  deleteTodoSuccess,
  deleteTodoFailure,
  toggleTodoRequest,
  toggleTodoSuccess,
  toggleTodoFailure,
} from '../todoActions';

describe('Todo Actions', () => {
  describe('Action Types', () => {
    it('defines all required action types', () => {
      expect(TODO_ACTIONS).toEqual({
        FETCH_TODOS_REQUEST: 'FETCH_TODOS_REQUEST',
        FETCH_TODOS_SUCCESS: 'FETCH_TODOS_SUCCESS',
        FETCH_TODOS_FAILURE: 'FETCH_TODOS_FAILURE',
        
        ADD_TODO_REQUEST: 'ADD_TODO_REQUEST',
        ADD_TODO_SUCCESS: 'ADD_TODO_SUCCESS',
        ADD_TODO_FAILURE: 'ADD_TODO_FAILURE',
        
        UPDATE_TODO_REQUEST: 'UPDATE_TODO_REQUEST',
        UPDATE_TODO_SUCCESS: 'UPDATE_TODO_SUCCESS',
        UPDATE_TODO_FAILURE: 'UPDATE_TODO_FAILURE',
        
        DELETE_TODO_REQUEST: 'DELETE_TODO_REQUEST',
        DELETE_TODO_SUCCESS: 'DELETE_TODO_SUCCESS',
        DELETE_TODO_FAILURE: 'DELETE_TODO_FAILURE',
        
        TOGGLE_TODO_REQUEST: 'TOGGLE_TODO_REQUEST',
        TOGGLE_TODO_SUCCESS: 'TOGGLE_TODO_SUCCESS',
        TOGGLE_TODO_FAILURE: 'TOGGLE_TODO_FAILURE'
      });
    });

    it('has unique action type values', () => {
      const actionTypes = Object.values(TODO_ACTIONS);
      const uniqueTypes = [...new Set(actionTypes)];
      expect(actionTypes).toHaveLength(uniqueTypes.length);
    });

    it('uses consistent naming convention', () => {
      const actionTypes = Object.keys(TODO_ACTIONS);
      
      actionTypes.forEach(type => {
        expect(type).toMatch(/^[A-Z_]+$/); // Only uppercase letters and underscores
        expect(type).toMatch(/_REQUEST$|_SUCCESS$|_FAILURE$/); // Ends with request/success/failure
      });
    });
  });

  describe('Fetch Todos Actions', () => {
    describe('fetchTodosRequest', () => {
      it('creates correct action', () => {
        const action = fetchTodosRequest();
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_REQUEST
        });
      });

      it('creates action without parameters', () => {
        const action = fetchTodosRequest();
        
        expect(action).not.toHaveProperty('payload');
        expect(Object.keys(action)).toEqual(['type']);
      });
    });

    describe('fetchTodosSuccess', () => {
      it('creates correct action with todos payload', () => {
        const todos = [
          { id: '1', text: 'Test todo 1', completed: false },
          { id: '2', text: 'Test todo 2', completed: true }
        ];
        
        const action = fetchTodosSuccess(todos);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
          payload: todos
        });
      });

      it('handles empty todos array', () => {
        const action = fetchTodosSuccess([]);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
          payload: []
        });
      });

      it('handles null todos', () => {
        const action = fetchTodosSuccess(null);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
          payload: null
        });
      });

      it('handles undefined todos', () => {
        const action = fetchTodosSuccess(undefined);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
          payload: undefined
        });
      });
    });

    describe('fetchTodosFailure', () => {
      it('creates correct action with error message', () => {
        const error = 'Network error occurred';
        
        const action = fetchTodosFailure(error);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_FAILURE,
          payload: error
        });
      });

      it('handles Error object', () => {
        const error = new Error('Something went wrong');
        
        const action = fetchTodosFailure(error);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_FAILURE,
          payload: error
        });
      });

      it('handles empty error message', () => {
        const action = fetchTodosFailure('');
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_FAILURE,
          payload: ''
        });
      });

      it('handles null error', () => {
        const action = fetchTodosFailure(null);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.FETCH_TODOS_FAILURE,
          payload: null
        });
      });
    });
  });

  describe('Add Todo Actions', () => {
    describe('addTodoRequest', () => {
      it('creates correct action with todo data', () => {
        const todoData = { text: 'New todo item' };
        
        const action = addTodoRequest(todoData);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.ADD_TODO_REQUEST,
          payload: todoData
        });
      });

      it('handles complex todo data', () => {
        const todoData = {
          text: 'Complex todo',
          priority: 'high',
          dueDate: '2023-12-31',
          tags: ['work', 'urgent']
        };
        
        const action = addTodoRequest(todoData);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.ADD_TODO_REQUEST,
          payload: todoData
        });
      });

      it('handles empty todo data', () => {
        const action = addTodoRequest({});
        
        expect(action).toEqual({
          type: TODO_ACTIONS.ADD_TODO_REQUEST,
          payload: {}
        });
      });
    });

    describe('addTodoSuccess', () => {
      it('creates correct action with created todo', () => {
        const todo = {
          id: '123',
          text: 'New todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z'
        };
        
        const action = addTodoSuccess(todo);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.ADD_TODO_SUCCESS,
          payload: todo
        });
      });

      it('preserves all todo properties', () => {
        const todo = {
          id: '456',
          text: 'Another todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T01:00:00.000Z',
          priority: 'medium',
          tags: ['personal']
        };
        
        const action = addTodoSuccess(todo);
        
        expect(action.payload).toEqual(todo);
      });
    });

    describe('addTodoFailure', () => {
      it('creates correct action with error', () => {
        const error = 'Failed to add todo';
        
        const action = addTodoFailure(error);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.ADD_TODO_FAILURE,
          payload: error
        });
      });

      it('handles validation errors', () => {
        const validationError = {
          field: 'text',
          message: 'Text is required',
          code: 'VALIDATION_ERROR'
        };
        
        const action = addTodoFailure(validationError);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.ADD_TODO_FAILURE,
          payload: validationError
        });
      });
    });
  });

  describe('Update Todo Actions', () => {
    describe('updateTodoRequest', () => {
      it('creates correct action with id and updates', () => {
        const id = '123';
        const updates = { text: 'Updated text', completed: true };
        
        const action = updateTodoRequest(id, updates);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.UPDATE_TODO_REQUEST,
          payload: { id, updates }
        });
      });

      it('handles partial updates', () => {
        const id = '456';
        const updates = { text: 'Only text updated' };
        
        const action = updateTodoRequest(id, updates);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.UPDATE_TODO_REQUEST,
          payload: { id, updates }
        });
      });

      it('handles empty updates', () => {
        const id = '789';
        const updates = {};
        
        const action = updateTodoRequest(id, updates);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.UPDATE_TODO_REQUEST,
          payload: { id, updates }
        });
      });

      it('handles complex update data', () => {
        const id = '101';
        const updates = {
          text: 'Updated todo',
          completed: true,
          priority: 'low',
          tags: ['updated'],
          updatedAt: new Date().toISOString()
        };
        
        const action = updateTodoRequest(id, updates);
        
        expect(action.payload).toEqual({ id, updates });
      });
    });

    describe('updateTodoSuccess', () => {
      it('creates correct action with updated todo', () => {
        const updatedTodo = {
          id: '123',
          text: 'Updated todo text',
          completed: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T01:00:00.000Z'
        };
        
        const action = updateTodoSuccess(updatedTodo);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.UPDATE_TODO_SUCCESS,
          payload: updatedTodo
        });
      });
    });

    describe('updateTodoFailure', () => {
      it('creates correct action with error', () => {
        const error = 'Todo not found';
        
        const action = updateTodoFailure(error);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.UPDATE_TODO_FAILURE,
          payload: error
        });
      });
    });
  });

  describe('Delete Todo Actions', () => {
    describe('deleteTodoRequest', () => {
      it('creates correct action with todo id', () => {
        const id = '123';
        
        const action = deleteTodoRequest(id);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.DELETE_TODO_REQUEST,
          payload: id
        });
      });

      it('handles string id', () => {
        const action = deleteTodoRequest('abc-123');
        
        expect(action.payload).toBe('abc-123');
      });

      it('handles numeric id', () => {
        const action = deleteTodoRequest(123);
        
        expect(action.payload).toBe(123);
      });
    });

    describe('deleteTodoSuccess', () => {
      it('creates correct action with deleted todo id', () => {
        const id = '123';
        
        const action = deleteTodoSuccess(id);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
          payload: id
        });
      });
    });

    describe('deleteTodoFailure', () => {
      it('creates correct action with error', () => {
        const error = 'Cannot delete todo';
        
        const action = deleteTodoFailure(error);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.DELETE_TODO_FAILURE,
          payload: error
        });
      });
    });
  });

  describe('Toggle Todo Actions', () => {
    describe('toggleTodoRequest', () => {
      it('creates correct action with todo id', () => {
        const id = '123';
        
        const action = toggleTodoRequest(id);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.TOGGLE_TODO_REQUEST,
          payload: id
        });
      });
    });

    describe('toggleTodoSuccess', () => {
      it('creates correct action with toggled todo', () => {
        const toggledTodo = {
          id: '123',
          text: 'Todo text',
          completed: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T01:00:00.000Z'
        };
        
        const action = toggleTodoSuccess(toggledTodo);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.TOGGLE_TODO_SUCCESS,
          payload: toggledTodo
        });
      });
    });

    describe('toggleTodoFailure', () => {
      it('creates correct action with error', () => {
        const error = 'Failed to toggle todo';
        
        const action = toggleTodoFailure(error);
        
        expect(action).toEqual({
          type: TODO_ACTIONS.TOGGLE_TODO_FAILURE,
          payload: error
        });
      });
    });
  });

  describe('Action Creator Consistency', () => {
    it('all request actions have consistent structure', () => {
      const requestActions = [
        fetchTodosRequest(),
        addTodoRequest({ text: 'test' }),
        updateTodoRequest('1', { completed: true }),
        deleteTodoRequest('1'),
        toggleTodoRequest('1')
      ];
      
      requestActions.forEach(action => {
        expect(action).toHaveProperty('type');
        expect(action.type).toMatch(/_REQUEST$/);
      });
    });

    it('all success actions have consistent structure', () => {
      const mockTodo = { id: '1', text: 'test', completed: false };
      const successActions = [
        fetchTodosSuccess([mockTodo]),
        addTodoSuccess(mockTodo),
        updateTodoSuccess(mockTodo),
        deleteTodoSuccess('1'),
        toggleTodoSuccess(mockTodo)
      ];
      
      successActions.forEach(action => {
        expect(action).toHaveProperty('type');
        expect(action).toHaveProperty('payload');
        expect(action.type).toMatch(/_SUCCESS$/);
      });
    });

    it('all failure actions have consistent structure', () => {
      const error = 'Test error';
      const failureActions = [
        fetchTodosFailure(error),
        addTodoFailure(error),
        updateTodoFailure(error),
        deleteTodoFailure(error),
        toggleTodoFailure(error)
      ];
      
      failureActions.forEach(action => {
        expect(action).toHaveProperty('type');
        expect(action).toHaveProperty('payload');
        expect(action.type).toMatch(/_FAILURE$/);
        expect(action.payload).toBe(error);
      });
    });
  });

  describe('Action Creator Edge Cases', () => {
    it('handles undefined parameters gracefully', () => {
      expect(() => {
        fetchTodosSuccess(undefined);
        addTodoRequest(undefined);
        updateTodoRequest(undefined, undefined);
        deleteTodoRequest(undefined);
        toggleTodoRequest(undefined);
      }).not.toThrow();
    });

    it('handles null parameters gracefully', () => {
      expect(() => {
        fetchTodosSuccess(null);
        addTodoRequest(null);
        updateTodoRequest(null, null);
        deleteTodoRequest(null);
        toggleTodoRequest(null);
      }).not.toThrow();
    });

    it('preserves parameter types', () => {
      const numberParam = 123;
      const stringParam = 'test';
      const objectParam = { test: true };
      const arrayParam = [1, 2, 3];
      
      expect(addTodoRequest(numberParam).payload).toBe(numberParam);
      expect(deleteTodoRequest(stringParam).payload).toBe(stringParam);
      expect(addTodoRequest(objectParam).payload).toBe(objectParam);
      expect(fetchTodosSuccess(arrayParam).payload).toBe(arrayParam);
    });

    it('does not mutate input parameters', () => {
      const originalTodo = { id: '1', text: 'original', completed: false };
      const originalUpdates = { text: 'updated' };
      
      // Create deep copies to test mutation
      const todoBeforeAction = JSON.parse(JSON.stringify(originalTodo));
      const updatesBeforeAction = JSON.parse(JSON.stringify(originalUpdates));
      
      addTodoSuccess(originalTodo);
      updateTodoRequest('1', originalUpdates);
      
      expect(originalTodo).toEqual(todoBeforeAction);
      expect(originalUpdates).toEqual(updatesBeforeAction);
    });
  });

  describe('Integration with Flux Standard Actions', () => {
    it('follows FSA format for success actions', () => {
      const todo = { id: '1', text: 'test', completed: false };
      const action = addTodoSuccess(todo);
      
      // FSA format: { type, payload?, error?, meta? }
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('payload');
      expect(action).not.toHaveProperty('error');
      expect(typeof action.type).toBe('string');
    });

    it('follows FSA format for failure actions', () => {
      const error = 'Test error';
      const action = addTodoFailure(error);
      
      // For error actions, payload contains the error
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('payload');
      expect(typeof action.type).toBe('string');
      expect(action.payload).toBe(error);
    });

    it('actions are serializable', () => {
      const todo = { id: '1', text: 'test', completed: false };
      const actions = [
        fetchTodosRequest(),
        fetchTodosSuccess([todo]),
        addTodoRequest({ text: 'new' }),
        addTodoSuccess(todo),
        updateTodoRequest('1', { completed: true }),
        updateTodoSuccess(todo),
        deleteTodoRequest('1'),
        deleteTodoSuccess('1'),
        toggleTodoRequest('1'),
        toggleTodoSuccess(todo)
      ];
      
      actions.forEach(action => {
        expect(() => JSON.stringify(action)).not.toThrow();
        expect(() => JSON.parse(JSON.stringify(action))).not.toThrow();
      });
    });
  });
});