import { describe, it, expect, vi, beforeEach } from 'vitest';
import { expectSaga } from 'redux-saga-test-plan';
import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { throwError } from 'redux-saga-test-plan/providers';

import {
  fetchTodosSaga,
  addTodoSaga,
  updateTodoSaga,
  deleteTodoSaga,
  toggleTodoSaga,
  watchTodoSagas,
} from '../todoSagas';

import {
  TODO_ACTIONS,
  fetchTodosSuccess,
  fetchTodosFailure,
  addTodoSuccess,
  addTodoFailure,
  updateTodoSuccess,
  updateTodoFailure,
  deleteTodoSuccess,
  deleteTodoFailure,
  toggleTodoSuccess,
  toggleTodoFailure,
} from '../../actions/todoActions';

import { todoApi } from '../../services/todoApi';

// Mock the entire todoApi module
vi.mock('../../services/todoApi', () => ({
  todoApi: {
    fetchTodos: vi.fn(),
    addTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    toggleTodo: vi.fn(),
  },
}));

describe('Todo Sagas', () => {
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
  });

  describe('fetchTodosSaga', () => {
    it('should fetch todos successfully', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };

      return expectSaga(fetchTodosSaga, action)
        .provide([
          [call(todoApi.fetchTodos), mockTodos]
        ])
        .put(fetchTodosSuccess(mockTodos))
        .run();
    });

    it('should handle fetch todos failure with Error object', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };
      const error = new Error('Network error');

      return expectSaga(fetchTodosSaga, action)
        .provide([
          [call(todoApi.fetchTodos), throwError(error)]
        ])
        .put(fetchTodosFailure(error.message))
        .run();
    });

    it('should handle fetch todos failure with string error', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };
      const error = 'String error';

      return expectSaga(fetchTodosSaga, action)
        .provide([
          [call(todoApi.fetchTodos), throwError(error)]
        ])
        .put(fetchTodosFailure(error))
        .run();
    });

    it('should handle fetch todos failure with null error', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };

      return expectSaga(fetchTodosSaga, action)
        .provide([
          [call(todoApi.fetchTodos), throwError(null)]
        ])
        .put(fetchTodosFailure('Failed to fetch todos'))
        .run();
    });

    it('should handle empty todos array', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };

      return expectSaga(fetchTodosSaga, action)
        .provide([
          [call(todoApi.fetchTodos), []]
        ])
        .put(fetchTodosSuccess([]))
        .run();
    });
  });

  describe('addTodoSaga', () => {
    const newTodoData = { text: 'New todo item' };
    const createdTodo = {
      id: '4',
      text: 'New todo item',
      completed: false,
      createdAt: '2023-01-04T00:00:00.000Z'
    };

    it('should add todo successfully', () => {
      const action = { 
        type: TODO_ACTIONS.ADD_TODO_REQUEST, 
        payload: newTodoData 
      };

      return expectSaga(addTodoSaga, action)
        .provide([
          [call(todoApi.addTodo, newTodoData), createdTodo]
        ])
        .put(addTodoSuccess(createdTodo))
        .run();
    });

    it('should handle add todo failure', () => {
      const action = { 
        type: TODO_ACTIONS.ADD_TODO_REQUEST, 
        payload: newTodoData 
      };
      const error = new Error('Failed to add todo');

      return expectSaga(addTodoSaga, action)
        .provide([
          [call(todoApi.addTodo, newTodoData), throwError(error)]
        ])
        .put(addTodoFailure(error.message))
        .run();
    });

    it('should handle missing payload', () => {
      const action = { type: TODO_ACTIONS.ADD_TODO_REQUEST };

      return expectSaga(addTodoSaga, action)
        .provide([
          [call(todoApi.addTodo, undefined), createdTodo]
        ])
        .put(addTodoSuccess(createdTodo))
        .run();
    });
  });

  describe('updateTodoSaga', () => {
    const updatePayload = {
      id: '1',
      updates: {
        text: 'Updated todo text',
        completed: true
      }
    };
    const updatedTodo = {
      id: '1',
      text: 'Updated todo text',
      completed: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T01:00:00.000Z'
    };

    it('should update todo successfully', () => {
      const action = { 
        type: TODO_ACTIONS.UPDATE_TODO_REQUEST, 
        payload: updatePayload 
      };

      return expectSaga(updateTodoSaga, action)
        .provide([
          [call(todoApi.updateTodo, updatePayload.id, updatePayload.updates), updatedTodo]
        ])
        .put(updateTodoSuccess(updatedTodo))
        .run();
    });

    it('should handle update todo failure', () => {
      const action = { 
        type: TODO_ACTIONS.UPDATE_TODO_REQUEST, 
        payload: updatePayload 
      };
      const error = new Error('Todo not found');

      return expectSaga(updateTodoSaga, action)
        .provide([
          [call(todoApi.updateTodo, updatePayload.id, updatePayload.updates), throwError(error)]
        ])
        .put(updateTodoFailure(error.message))
        .run();
    });

    it('should handle missing payload', () => {
      const action = { type: TODO_ACTIONS.UPDATE_TODO_REQUEST };

      return expectSaga(updateTodoSaga, action)
        .provide([
          [call(todoApi.updateTodo, undefined, undefined), updatedTodo]
        ])
        .put(updateTodoSuccess(updatedTodo))
        .run();
    });
  });

  describe('deleteTodoSaga', () => {
    const todoId = '1';

    it('should delete todo successfully', () => {
      const action = { 
        type: TODO_ACTIONS.DELETE_TODO_REQUEST, 
        payload: todoId 
      };

      return expectSaga(deleteTodoSaga, action)
        .provide([
          [call(todoApi.deleteTodo, todoId), undefined]
        ])
        .put(deleteTodoSuccess(todoId))
        .run();
    });

    it('should handle delete todo failure', () => {
      const action = { 
        type: TODO_ACTIONS.DELETE_TODO_REQUEST, 
        payload: todoId 
      };
      const error = new Error('Cannot delete todo');

      return expectSaga(deleteTodoSaga, action)
        .provide([
          [call(todoApi.deleteTodo, todoId), throwError(error)]
        ])
        .put(deleteTodoFailure(error.message))
        .run();
    });

    it('should handle missing payload', () => {
      const action = { type: TODO_ACTIONS.DELETE_TODO_REQUEST };

      return expectSaga(deleteTodoSaga, action)
        .provide([
          [call(todoApi.deleteTodo, undefined), undefined]
        ])
        .put(deleteTodoSuccess(undefined))
        .run();
    });
  });

  describe('toggleTodoSaga', () => {
    const todoId = '1';
    const toggledTodo = {
      ...mockTodos[0],
      completed: !mockTodos[0].completed,
      updatedAt: '2023-01-01T01:00:00.000Z'
    };

    it('should toggle todo successfully', () => {
      const action = { 
        type: TODO_ACTIONS.TOGGLE_TODO_REQUEST, 
        payload: todoId 
      };

      return expectSaga(toggleTodoSaga, action)
        .provide([
          [call(todoApi.toggleTodo, todoId), toggledTodo]
        ])
        .put(toggleTodoSuccess(toggledTodo))
        .run();
    });

    it('should handle toggle todo failure', () => {
      const action = { 
        type: TODO_ACTIONS.TOGGLE_TODO_REQUEST, 
        payload: todoId 
      };
      const error = new Error('Failed to toggle todo');

      return expectSaga(toggleTodoSaga, action)
        .provide([
          [call(todoApi.toggleTodo, todoId), throwError(error)]
        ])
        .put(toggleTodoFailure(error.message))
        .run();
    });

    it('should handle missing payload', () => {
      const action = { type: TODO_ACTIONS.TOGGLE_TODO_REQUEST };

      return expectSaga(toggleTodoSaga, action)
        .provide([
          [call(todoApi.toggleTodo, undefined), toggledTodo]
        ])
        .put(toggleTodoSuccess(toggledTodo))
        .run();
    });
  });

  describe('Error Handling', () => {
    it('should handle different error types in fetchTodosSaga', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };
      const errorTypes = [
        { error: new Error('Network error'), expected: 'Network error' },
        { error: 'String error', expected: 'String error' },
        { error: null, expected: 'Failed to fetch todos' },
        { error: undefined, expected: 'Failed to fetch todos' },
        { error: { message: 'Object error' }, expected: 'Object error' }
      ];

      return Promise.all(
        errorTypes.map(({ error, expected }) =>
          expectSaga(fetchTodosSaga, action)
            .provide([
              [call(todoApi.fetchTodos), throwError(error)]
            ])
            .put(fetchTodosFailure(expected))
            .run()
        )
      );
    });

    it('should handle different error types in addTodoSaga', () => {
      const action = { type: TODO_ACTIONS.ADD_TODO_REQUEST, payload: { text: 'test' } };
      const errorTypes = [
        { error: new Error('Add failed'), expected: 'Add failed' },
        { error: 'String error', expected: 'String error' },
        { error: null, expected: 'Failed to add todo' }
      ];

      return Promise.all(
        errorTypes.map(({ error, expected }) =>
          expectSaga(addTodoSaga, action)
            .provide([
              [call(todoApi.addTodo, { text: 'test' }), throwError(error)]
            ])
            .put(addTodoFailure(expected))
            .run()
        )
      );
    });
  });

  describe('watchTodoSagas', () => {
    it('should be defined and exportable', () => {
      expect(watchTodoSagas).toBeDefined();
      expect(typeof watchTodoSagas).toBe('function');
    });

    it('should handle actions when dispatched', () => {
      // Integration test that verifies the watcher actually works
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };

      return expectSaga(watchTodoSagas)
        .provide([
          [call(todoApi.fetchTodos), mockTodos]
        ])
        .dispatch(action)
        .put(fetchTodosSuccess(mockTodos))
        .silentRun(500);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete fetch workflow', () => {
      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };

      return expectSaga(watchTodoSagas)
        .provide([
          [call(todoApi.fetchTodos), mockTodos]
        ])
        .dispatch(action)
        .put(fetchTodosSuccess(mockTodos))
        .silentRun(1000);
    });

    it('should handle complete add workflow', () => {
      const newTodo = { text: 'New todo' };
      const createdTodo = { id: '4', text: 'New todo', completed: false };
      const action = { type: TODO_ACTIONS.ADD_TODO_REQUEST, payload: newTodo };

      return expectSaga(watchTodoSagas)
        .provide([
          [call(todoApi.addTodo, newTodo), createdTodo]
        ])
        .dispatch(action)
        .put(addTodoSuccess(createdTodo))
        .silentRun(1000);
    });

    it('should handle mixed success and failure', () => {
      const successAction = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };
      const failAction = { type: TODO_ACTIONS.ADD_TODO_REQUEST, payload: { text: 'fail' } };

      return expectSaga(watchTodoSagas)
        .provide([
          [call(todoApi.fetchTodos), mockTodos],
          [call(todoApi.addTodo, { text: 'fail' }), throwError(new Error('Add failed'))]
        ])
        .dispatch(successAction)
        .dispatch(failAction)
        .put(fetchTodosSuccess(mockTodos))
        .put(addTodoFailure('Add failed'))
        .silentRun(1000);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large todo arrays efficiently', () => {
      const largeTodos = Array.from({ length: 100 }, (_, i) => ({
        id: `todo-${i}`,
        text: `Todo ${i}`,
        completed: i % 2 === 0,
        createdAt: new Date().toISOString()
      }));

      const action = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };

      return expectSaga(fetchTodosSaga, action)
        .provide([
          [call(todoApi.fetchTodos), largeTodos]
        ])
        .put(fetchTodosSuccess(largeTodos))
        .run();
    });

    it('should handle rapid successive calls', () => {
      const action1 = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };
      const action2 = { type: TODO_ACTIONS.FETCH_TODOS_REQUEST };

      return expectSaga(watchTodoSagas)
        .provide([
          [call(todoApi.fetchTodos), mockTodos],
          [call(todoApi.fetchTodos), mockTodos]
        ])
        .dispatch(action1)
        .dispatch(action2)
        .put(fetchTodosSuccess(mockTodos))
        .put(fetchTodosSuccess(mockTodos))
        .silentRun(1000);
    });
  });
});