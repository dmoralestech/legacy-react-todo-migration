import { TODO_ACTIONS } from '../actions/todoActions';

const initialState = {
  todos: [],
  loading: false,
  error: null
};

const todoReducer = (state = initialState, action) => {
  if (!action || typeof action !== 'object') {
    return state;
  }
  
  switch (action.type) {
    case TODO_ACTIONS.FETCH_TODOS_REQUEST:
    case TODO_ACTIONS.ADD_TODO_REQUEST:
    case TODO_ACTIONS.UPDATE_TODO_REQUEST:
    case TODO_ACTIONS.DELETE_TODO_REQUEST:
    case TODO_ACTIONS.TOGGLE_TODO_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case TODO_ACTIONS.FETCH_TODOS_SUCCESS:
      return {
        ...state,
        loading: false,
        todos: action.payload,
        error: null
      };

    case TODO_ACTIONS.ADD_TODO_SUCCESS:
      return {
        ...state,
        loading: false,
        todos: [...state.todos, action.payload],
        error: null
      };

    case TODO_ACTIONS.UPDATE_TODO_SUCCESS:
    case TODO_ACTIONS.TOGGLE_TODO_SUCCESS:
      return {
        ...state,
        loading: false,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        ),
        error: null
      };

    case TODO_ACTIONS.DELETE_TODO_SUCCESS:
      return {
        ...state,
        loading: false,
        todos: state.todos.filter(todo => todo.id !== action.payload),
        error: null
      };

    case TODO_ACTIONS.FETCH_TODOS_FAILURE:
    case TODO_ACTIONS.ADD_TODO_FAILURE:
    case TODO_ACTIONS.UPDATE_TODO_FAILURE:
    case TODO_ACTIONS.DELETE_TODO_FAILURE:
    case TODO_ACTIONS.TOGGLE_TODO_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default todoReducer;