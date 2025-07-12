import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { todoApi } from '../services/todoApi';
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
  toggleTodoFailure
} from '../actions/todoActions';

function* fetchTodosSaga() {
  try {
    const todos = yield call(todoApi.fetchTodos);
    yield put(fetchTodosSuccess(todos));
  } catch (error) {
    const errorMessage = error?.message || error || 'Failed to fetch todos';
    yield put(fetchTodosFailure(errorMessage));
  }
}

function* addTodoSaga(action) {
  try {
    const todo = yield call(todoApi.addTodo, action.payload);
    yield put(addTodoSuccess(todo));
  } catch (error) {
    const errorMessage = error?.message || error || 'Failed to add todo';
    yield put(addTodoFailure(errorMessage));
  }
}

function* updateTodoSaga(action) {
  try {
    const { id, updates } = action.payload || {};
    const todo = yield call(todoApi.updateTodo, id, updates);
    yield put(updateTodoSuccess(todo));
  } catch (error) {
    const errorMessage = error?.message || error || 'Failed to update todo';
    yield put(updateTodoFailure(errorMessage));
  }
}

function* deleteTodoSaga(action) {
  try {
    yield call(todoApi.deleteTodo, action.payload);
    yield put(deleteTodoSuccess(action.payload));
  } catch (error) {
    const errorMessage = error?.message || error || 'Failed to delete todo';
    yield put(deleteTodoFailure(errorMessage));
  }
}

function* toggleTodoSaga(action) {
  try {
    const todo = yield call(todoApi.toggleTodo, action.payload);
    yield put(toggleTodoSuccess(todo));
  } catch (error) {
    const errorMessage = error?.message || error || 'Failed to toggle todo';
    yield put(toggleTodoFailure(errorMessage));
  }
}

function* watchTodoSagas() {
  yield takeLatest(TODO_ACTIONS.FETCH_TODOS_REQUEST, fetchTodosSaga);
  yield takeEvery(TODO_ACTIONS.ADD_TODO_REQUEST, addTodoSaga);
  yield takeEvery(TODO_ACTIONS.UPDATE_TODO_REQUEST, updateTodoSaga);
  yield takeEvery(TODO_ACTIONS.DELETE_TODO_REQUEST, deleteTodoSaga);
  yield takeEvery(TODO_ACTIONS.TOGGLE_TODO_REQUEST, toggleTodoSaga);
}

export {
  fetchTodosSaga,
  addTodoSaga,
  updateTodoSaga,
  deleteTodoSaga,
  toggleTodoSaga,
  watchTodoSagas,
};

export default watchTodoSagas;