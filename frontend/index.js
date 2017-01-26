import 'babel-core/polyfill';
import React from 'react';
import ReactDom from 'react-dom';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './containers/App';
import * as reducers from './reducers';
import * as api from './api/api';

let injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

let todoApp = combineReducers(reducers);
let store = createStore(todoApp);

let rootElement = document.getElementById('root');
ReactDom.render(
  <Provider store={store}>
    <MuiThemeProvider>
      <App />
    </MuiThemeProvider>
  </Provider>,
  rootElement
);
