import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { DualStateProvider } from './utils/providers';

ReactDOM.render(
  <DualStateProvider>
    <App />
  </DualStateProvider>, 
  document.getElementById('root')
);