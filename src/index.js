import React from 'react';
import ReactDOM from 'react-dom/client'; // Import ReactDOM from 'react-dom/client'
import './index.css';
import App from './App';
import { getAuthorizationUrl } from './spotifyAuth';

// Create a root element and render the app inside it
const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
  <React.StrictMode>
    <App getAuthorizationUrl={getAuthorizationUrl} />
  </React.StrictMode>
);
