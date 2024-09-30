// src/components/Root.js
import React from 'react';
import { Provider } from 'react-redux';
import store from '../store/store';
import App from './App';
import Web3ProviderComponent from '../store/reducers/provider';

const Root = () => {
  console.log('Root Component Rendered');
  return (
    <Provider store={store}>
      <Web3ProviderComponent>
        <App />
      </Web3ProviderComponent>
    </Provider>
  );
};

export default Root;
