import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LegacyTodoFilters extends Component {
  render() {
    const { filter, onFilterChange, todoCount } = this.props;
    const safeCount = todoCount || { active: 0, total: 0, completed: 0 };

    return (
      <div className="todo-filters">
        <div className="todo-count">
          <span>{safeCount.active} of {safeCount.total} remaining</span>
        </div>
        
        <div className="filter-buttons">
          <button
            className={`btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange && onFilterChange('all')}
          >
            All
          </button>
          <button
            className={`btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => onFilterChange && onFilterChange('active')}
          >
            Active
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => onFilterChange && onFilterChange('completed')}
          >
            Completed
          </button>
        </div>
      </div>
    );
  }
}

LegacyTodoFilters.propTypes = {
  filter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  todoCount: PropTypes.shape({
    total: PropTypes.number.isRequired,
    active: PropTypes.number.isRequired,
    completed: PropTypes.number.isRequired
  }).isRequired
};

export default LegacyTodoFilters;