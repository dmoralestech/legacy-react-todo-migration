import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LegacyTodoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      editText: props.todo.text
    };
    this.isCancelling = false;
  }

  handleEdit = () => {
    this.setState({ isEditing: true, editText: this.props.todo.text });
  }

  handleSave = () => {
    if (this.isCancelling) {
      return;
    }
    if (this.state.editText.trim()) {
      this.props.onUpdate(this.props.todo.id, { text: this.state.editText.trim() });
      this.setState({ isEditing: false });
    }
  }

  handleCancel = () => {
    this.isCancelling = true;
    this.setState({ isEditing: false, editText: this.props.todo.text }, () => {
      // Reset cancelling flag after state update
      setTimeout(() => {
        this.isCancelling = false;
      }, 10);
    });
  }

  handleBlur = () => {
    // Only save on blur if we're not cancelling
    if (!this.isCancelling) {
      this.handleSave();
    }
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSave();
    } else if (e.key === 'Escape') {
      this.handleCancel();
    }
  }

  handleTextChange = (e) => {
    this.setState({ editText: e.target.value });
  }

  render() {
    const { todo, onToggle, onDelete } = this.props;
    const { isEditing, editText } = this.state;

    return (
      <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
        <div className="todo-content">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="todo-checkbox"
          />
          
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={this.handleTextChange}
              onKeyDown={this.handleKeyPress}
              onBlur={this.handleBlur}
              className="todo-edit-input"
              autoFocus
            />
          ) : (
            <span
              className={`todo-text ${todo.completed ? 'completed' : ''}`}
              onDoubleClick={this.handleEdit}
            >
              {todo.text}
            </span>
          )}
        </div>

        <div className="todo-actions">
          {!isEditing && (
            <>
              <button onClick={this.handleEdit} className="btn btn-edit">
                Edit
              </button>
              <button onClick={() => onDelete(todo.id)} className="btn btn-delete">
                Delete
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button onClick={this.handleSave} className="btn btn-save">
                Save
              </button>
              <button 
                onMouseDown={() => { this.isCancelling = true; }}
                onClick={this.handleCancel} 
                className="btn btn-cancel"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </li>
    );
  }
}

LegacyTodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default LegacyTodoItem;