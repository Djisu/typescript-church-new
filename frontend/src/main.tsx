import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { store } from './app/store.ts'
import { Provider } from 'react-redux'
//import React from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL || 
(import.meta.env.MODE === 'development' ? 'http://localhost:3000' : 'https://church-management-backend.onrender.com');

console.log('BASE_URL:', BASE_URL);

// Polyfill for process
(window as any).process = {
  env: {
    NODE_ENV: 'development', // or 'production' based on your needs
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
    
  </StrictMode>,
)

