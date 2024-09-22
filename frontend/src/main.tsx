import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { store } from './app/store.ts'
import { Provider } from 'react-redux'
//import React from 'react'

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

