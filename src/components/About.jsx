import React, { Component } from 'react';

class About extends Component {
  render() {
    return (
      <div className="about-page">
        <h1>About Legacy TODO App</h1>
        <div className="about-content">
          <p>
            This is a legacy TODO application built with the technology stack 
            that was popular in 2018-2019:
          </p>
          
          <ul>
            <li><strong>React 16.13.1</strong> - Component-based UI library</li>
            <li><strong>Redux 4.0.5</strong> - State management</li>
            <li><strong>Redux Saga 1.1.3</strong> - Side effect management</li>
            <li><strong>React Router 5.1.2</strong> - Client-side routing</li>
            <li><strong>Class Components</strong> - Pre-hooks React pattern</li>
            <li><strong>PropTypes</strong> - Runtime type checking</li>
          </ul>
          
          <h2>Features</h2>
          <ul>
            <li>Create, read, update, and delete todos</li>
            <li>Toggle todo completion status</li>
            <li>Filter todos by status (all, active, completed)</li>
            <li>Mock API with simulated network delays</li>
            <li>Error handling and loading states</li>
          </ul>
          
          <h2>Architecture</h2>
          <p>
            The app follows the traditional Redux pattern with separate 
            action creators, reducers, and sagas for handling side effects. 
            Components are organized into presentational and container components.
          </p>
        </div>
      </div>
    );
  }
}

export default About;