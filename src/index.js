import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom";

import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import configureStore, { history } from './configureStore'


const store = configureStore( { history } );

ReactDOM.render(
	<Provider store={store}>
	    <Router history={history} basename={process.env.PUBLIC_URL}>
	      <App />
	    </Router>
	</Provider>, 
    document.getElementById("root")
  );
