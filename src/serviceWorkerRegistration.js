// src/serviceWorkerRegistration.js

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      return
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config)
        navigator.serviceWorker.ready.then(() => {
          console.log('Service Worker is ready in localhost mode')
        })
      } else {
        registerValidSW(swUrl, config)
      }
    })
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered:', registration)
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker == null) {
          return
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.')
              
              if (config && config.onUpdate) {
                config.onUpdate(registration)
              }
              
              // Покажи notification на потребителя
              showUpdateNotification()
            } else {
              console.log('Content is cached for offline use.')
              
              if (config && config.onSuccess) {
                config.onSuccess(registration)
              }
            }
          }
        }
      }
      
      // Проверявай за updates на всеки 1 час
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error)
    })
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type')
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        registerValidSW(swUrl, config)
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.')
    })
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}

function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Налична е нова версия', {
      body: 'Кликнете за да презаредите приложението',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'app-update',
      requireInteraction: true
    }).onclick = () => {
      window.location.reload()
    }
  } else {
    // Покажи banner вместо notification
    const updateBanner = document.createElement('div')
    updateBanner.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a5d33;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      cursor: pointer;
    `
    updateBanner.innerHTML = `
      <strong>Налична е нова версия!</strong><br>
      <small>Кликнете за да презаредите</small>
    `
    updateBanner.onclick = () => {
      window.location.reload()
    }
    document.body.appendChild(updateBanner)
    
    setTimeout(() => {
      updateBanner.remove()
    }, 10000)
  }
}

// Listen за съобщения от Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_SUCCESS') {
      console.log('Offline data synced successfully')
      
      // Emit custom event за да може приложението да реагира
      window.dispatchEvent(new CustomEvent('offlineDataSynced', {
        detail: { timestamp: event.data.timestamp }
      }))
    }
  })
}

// Background Sync registration helper
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-submissions')
      console.log('Background sync registered')
      return true
    } catch (error) {
      console.error('Background sync registration failed:', error)
      return false
    }
  }
  return false
}