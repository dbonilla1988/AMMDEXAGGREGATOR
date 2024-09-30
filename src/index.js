import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store'; // Import the store
import './index.css';
import App from './components/App'; 

// Select the root element
const rootElement = document.getElementById('root');

// Ensure the root element exists
if (rootElement) {
  const root = createRoot(rootElement);

  // Render the App component wrapped with the Redux Provider
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found. Make sure your HTML has a div with id='root'.");
}