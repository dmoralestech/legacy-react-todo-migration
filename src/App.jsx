import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Navigation from './components/Navigation';
import TodoApp from './containers/TodoApp';
import About from './components/About';
import './App.css';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navigation />
            <Switch>
              <Route exact path="/" component={TodoApp} />
              <Route path="/about" component={About} />
              <Route render={() => <div>404 - Page Not Found</div>} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;