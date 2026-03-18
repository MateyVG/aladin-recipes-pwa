// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission:', permission)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker only in production — with auto-update detection
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('SW registered:', reg.scope)

        // Проверява за нова версия при всяко отваряне
        reg.update()

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New SW version available — reloading...')
              newWorker.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            }
          })
        })
      })
      .catch(err => console.warn('SW registration failed:', err))
  })
}

// Online/offline detection
window.addEventListener('online', () => {
  console.log('App is online')
  document.body.classList.remove('offline')
})

window.addEventListener('offline', () => {
  console.log('App is offline')
  document.body.classList.add('offline')
})