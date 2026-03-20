// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  // БЕЗ StrictMode — спира двойния render
  <App />
)

// Online/offline detection
window.addEventListener('online', () => document.body.classList.remove('offline'))
window.addEventListener('offline', () => document.body.classList.add('offline'))