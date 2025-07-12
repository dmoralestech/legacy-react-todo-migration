export const TODO_ACTIONS = {
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
};

export const fetchTodosRequest = () => ({
  type: TODO_ACTIONS.FETCH_TODOS_REQUEST
});

export const fetchTodosSuccess = (todos) => ({
  type: TODO_ACTIONS.FETCH_TODOS_SUCCESS,
  payload: todos
});

export const fetchTodosFailure = (error) => ({
  type: TODO_ACTIONS.FETCH_TODOS_FAILURE,
  payload: error
});

export const addTodoRequest = (todo) => ({
  type: TODO_ACTIONS.ADD_TODO_REQUEST,
  payload: todo
});

export const addTodoSuccess = (todo) => ({
  type: TODO_ACTIONS.ADD_TODO_SUCCESS,
  payload: todo
});

export const addTodoFailure = (error) => ({
  type: TODO_ACTIONS.ADD_TODO_FAILURE,
  payload: error
});

export const updateTodoRequest = (id, updates) => ({
  type: TODO_ACTIONS.UPDATE_TODO_REQUEST,
  payload: { id, updates }
});

export const updateTodoSuccess = (todo) => ({
  type: TODO_ACTIONS.UPDATE_TODO_SUCCESS,
  payload: todo
});

export const updateTodoFailure = (error) => ({
  type: TODO_ACTIONS.UPDATE_TODO_FAILURE,
  payload: error
});

export const deleteTodoRequest = (id) => ({
  type: TODO_ACTIONS.DELETE_TODO_REQUEST,
  payload: id
});

export const deleteTodoSuccess = (id) => ({
  type: TODO_ACTIONS.DELETE_TODO_SUCCESS,
  payload: id
});

export const deleteTodoFailure = (error) => ({
  type: TODO_ACTIONS.DELETE_TODO_FAILURE,
  payload: error
});

export const toggleTodoRequest = (id) => ({
  type: TODO_ACTIONS.TOGGLE_TODO_REQUEST,
  payload: id
});

export const toggleTodoSuccess = (todo) => ({
  type: TODO_ACTIONS.TOGGLE_TODO_SUCCESS,
  payload: todo
});

export const toggleTodoFailure = (error) => ({
  type: TODO_ACTIONS.TOGGLE_TODO_FAILURE,
  payload: error
});