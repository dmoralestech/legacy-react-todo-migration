import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TodoItem from './TodoItem';

class LegacyTodoList extends Component {
  render() {
    const { todos, onToggle, onUpdate, onDelete } = this.props;
    const safeTodos = todos || [];

    if (safeTodos.length === 0) {
      return (
        <div className="todo-list-empty">
          <p>No todos yet. Add one above!</p>
        </div>
      );
    }

    return (
      <ul className="todo-list">
        {safeTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </ul>
    );
  }
}

LegacyTodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default LegacyTodoList;