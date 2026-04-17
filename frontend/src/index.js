// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';  // ← ADD THIS
import App from './App';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';  // ← ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>  {/* ← ADD THIS */}
        <App />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);