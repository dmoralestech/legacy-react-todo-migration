import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import TodoFilters from '../components/TodoFilters';
import {
  fetchTodosRequest,
  addTodoRequest,
  updateTodoRequest,
  deleteTodoRequest,
  toggleTodoRequest
} from '../actions/todoActions';

class TodoApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: 'all'
    };
  }

  componentDidMount() {
    this.props.fetchTodos();
  }

  handleFilterChange = (filter) => {
    this.setState({ filter });
  }

  getFilteredTodos = () => {
    const { todos } = this.props;
    const { filter } = this.state;

    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }

  getTodoCount = () => {
    const { todos } = this.props;
    return {
      total: todos.length,
      active: todos.filter(todo => !todo.completed).length,
      completed: todos.filter(todo => todo.completed).length
    };
  }

  render() {
    const { loading, error, addTodo, updateTodo, deleteTodo, toggleTodo } = this.props;
    const { filter } = this.state;
    const filteredTodos = this.getFilteredTodos();
    const todoCount = this.getTodoCount();

    return (
      <div className="todo-app">
        <header className="todo-header">
          <h1>Legacy TODO App</h1>
          <p>Built with React 16, Redux, and Saga</p>
        </header>

        <main className="todo-main">
          <TodoForm onAdd={addTodo} />
          
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">Error: {error}</div>}
          
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
          />
          
          <TodoFilters
            filter={filter}
            onFilterChange={this.handleFilterChange}
            todoCount={todoCount}
          />
        </main>
      </div>
    );
  }
}

TodoApp.propTypes = {
  todos: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  fetchTodos: PropTypes.func.isRequired,
  addTodo: PropTypes.func.isRequired,
  updateTodo: PropTypes.func.isRequired,
  deleteTodo: PropTypes.func.isRequired,
  toggleTodo: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  todos: state.todos.todos,
  loading: state.todos.loading,
  error: state.todos.error
});

const mapDispatchToProps = {
  fetchTodos: fetchTodosRequest,
  addTodo: addTodoRequest,
  updateTodo: updateTodoRequest,
  deleteTodo: deleteTodoRequest,
  toggleTodo: toggleTodoRequest
};

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp);