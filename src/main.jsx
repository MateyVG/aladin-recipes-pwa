// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

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

// Register service worker only in production
if (import.meta.env.PROD) {
  serviceWorkerRegistration.register({
    onSuccess: (registration) => {
      console.log('Service Worker registered successfully')
    },
    onUpdate: (registration) => {
      console.log('New version available')
    }
  })
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('App is online')
  document.body.classList.remove('offline')
  
  // Trigger background sync when back online
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('sync-submissions')
    }).catch(err => {
      console.log('Background sync failed:', err)
    })
  }
})

window.addEventListener('offline', () => {
  console.log('App is offline')
  document.body.classList.add('offline')
})

// PWA Install prompt
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  
  // Show custom install button after 30 seconds
  setTimeout(() => {
    showInstallPrompt()
  }, 30000)
})

function showInstallPrompt() {
  if (!deferredPrompt) return
  
  const installBanner = document.createElement('div')
  installBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a5d33;
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 90%;
    text-align: center;
  `
  installBanner.innerHTML = `
    <div style="margin-bottom: 15px;">
      <strong style="font-size: 16px;">Инсталирай приложението</strong><br>
      <small style="opacity: 0.9;">За по-бързо зареждане и офлайн достъп</small>
    </div>
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="install-btn" style="
        padding: 10px 20px;
        background: white;
        color: #1a5d33;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      ">Инсталирай</button>
      <button id="dismiss-btn" style="
        padding: 10px 20px;
        background: transparent;
        color: white;
        border: 1px solid white;
        border-radius: 6px;
        cursor: pointer;
      ">Не сега</button>
    </div>
  `
  document.body.appendChild(installBanner)
  
  document.getElementById('install-btn').onclick = async () => {
    installBanner.remove()
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log('Install prompt outcome:', outcome)
    deferredPrompt = null
  }
  
  document.getElementById('dismiss-btn').onclick = () => {
    installBanner.remove()
  }
  
  // Auto remove after 20 seconds
  setTimeout(() => {
    if (document.body.contains(installBanner)) {
      installBanner.remove()
    }
  }, 20000)
}

window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully')
  deferredPrompt = null
})