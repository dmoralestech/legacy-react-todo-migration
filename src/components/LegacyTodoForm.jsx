import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LegacyTodoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.text.trim()) {
      try {
        this.props.onAdd({ text: this.state.text.trim() });
      } catch (error) {
        // Handle onAdd errors gracefully
        console.error('Failed to add todo:', error);
      }
    }
    // Always clear the input after form submission
    this.setState({ text: '' });
  }

  handleChange = (e) => {
    this.setState({ text: e.target.value });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="todo-form">
        <input
          type="text"
          value={this.state.text}
          onChange={this.handleChange}
          placeholder="What needs to be done?"
          className="todo-input"
        />
        <button type="submit" className="btn btn-add" tabIndex="0">
          Add Todo
        </button>
      </form>
    );
  }
}

LegacyTodoForm.propTypes = {
  onAdd: PropTypes.func.isRequired
};

export default LegacyTodoForm;