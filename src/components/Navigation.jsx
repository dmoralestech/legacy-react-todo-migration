import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

class Navigation extends Component {
  render() {
    const { location } = this.props;
    
    return (
      <nav className="navigation">
        <div className="nav-brand">
          <Link to="/">Legacy TODO</Link>
        </div>
        
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={location.pathname === '/about' ? 'active' : ''}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
}

Navigation.propTypes = {
  location: PropTypes.object.isRequired
};

export default withRouter(Navigation);