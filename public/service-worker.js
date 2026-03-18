// public/service-worker.js

const CACHE_VERSION = 'v5' // ← Смени на v6, v7... при всеки deploy!
const CACHE_NAME = `checklist-cache-${CACHE_VERSION}`
const RUNTIME_CACHE = `checklist-runtime-${CACHE_VERSION}`

// Файлове за кеширане при инсталация
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Домейни които НЕ трябва да се кешират
const SKIP_CACHE_DOMAINS = [
  'supabase.co',
  'googleapis.com',
  'gstatic.com',
  'reasonlabsapi.com',
]

// Install event - кешира статични файлове
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_VERSION)
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
          .catch(err => {
            console.warn('[Service Worker] Some assets failed to cache:', err)
          })
      })
      .then(() => self.skipWaiting()) // Активира веднага без чакане
  )
})

// Activate event - изчиства ВСИЧКИ стари кешове
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', CACHE_VERSION)
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Изтрива всичко което не е текущата версия
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim()) // Поема контрол веднага
  )
})

// SKIP_WAITING съобщение от main.jsx
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting — activating new version')
    self.skipWaiting()
  }
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Игнорираме external домейни (освен Supabase)
  if (url.origin !== location.origin) {
    const isAllowedExternal = url.hostname.includes('supabase.co')
    if (!isAllowedExternal) {
      return
    }
  }

  // Пропускаме кеширане за external APIs
  if (SKIP_CACHE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    return
  }

  // Пропускаме non-GET заявки
  if (request.method !== 'GET') {
    return
  }

  // Network First за API заявки
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Cache First за статични файлове
  if (request.destination === 'image' || 
      request.destination === 'font' || 
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Stale While Revalidate за HTML
  event.respondWith(staleWhileRevalidateStrategy(request))
})

// Network First - опитва мрежа първо, fallback към cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request, { cache: 'no-cache' })
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    if (request.headers.get('accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ 
        error: 'Offline', 
        message: 'Няма интернет връзка' 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      })
    }
    
    return new Response('Offline - Няма интернет връзка', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Cache First - проверява cache първо, fallback към мрежа
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[Service Worker] Failed to fetch:', request.url)
    return new Response('Resource not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Stale While Revalidate - връща cache веднага, обновява на заден фон
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => cachedResponse)
  
  return cachedResponse || fetchPromise
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag)
  
  if (event.tag === 'sync-submissions') {
    event.waitUntil(syncSubmissions())
  }
})

async function syncSubmissions() {
  console.log('[Service Worker] Syncing offline submissions...')
  
  try {
    const syncResponse = await fetch('/api/sync-offline-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (syncResponse.ok) {
      console.log('[Service Worker] Sync successful')
      
      const clients = await self.clients.matchAll()
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_SUCCESS',
          timestamp: Date.now()
        })
      })
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error)
    throw error
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  
  const title = data.title || 'Checklist PWA'
  const options = {
    body: data.body || 'Имате ново уведомление',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: data.url || '/',
    actions: data.actions || []
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const urlToOpen = event.notification.data || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

console.log('[Service Worker] Loaded — version:', CACHE_VERSION)