// public/service-worker.js

const CACHE_NAME = 'checklist-pwa-v1'
const RUNTIME_CACHE = 'checklist-runtime-v1'

// Файлове за кеширане при инсталация
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Не кешираме bundle.js и CSS тук, за да избегнем грешки при първоначална инсталация
]

// Домейни които НЕ трябва да се кешират
const SKIP_CACHE_DOMAINS = [
  'supabase.co',
  'googleapis.com',
  'gstatic.com',
  'reasonlabsapi.com', // Добавено за блокиране на external analytics/tracking APIs
]

// Install event - кешира статични файлове
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets')
        // Кешираме само основните файлове, без грешки ако някой липсва
        return cache.addAll(STATIC_ASSETS)
          .catch(err => {
            console.warn('[Service Worker] Some assets failed to cache:', err)
          })
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - изчиства стари кешове
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - Network First strategy с fallback към cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // КРИТИЧНА ПРОВЕРКА: Игнорираме заявки към external домейни (различни от origin на приложението)
  if (url.origin !== location.origin) {
    // Проверяваме дали е към одобрено external API
    const isAllowedExternal = url.hostname.includes('supabase.co')
    
    // Ако не е към нашия origin и не е одобрено external API, просто връщаме fetch без кеширане
    if (!isAllowedExternal) {
      console.log('[Service Worker] Skipping external domain:', url.hostname)
      return // Важно: не обработваме този request
    }
  }

  // Пропускаме кеширане за external APIs
  if (SKIP_CACHE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    console.log('[Service Worker] Skipping cache for domain:', url.hostname)
    return
  }

  // Пропускаме non-GET заявки
  if (request.method !== 'GET') {
    return
  }

  // Network First стратегия за API заявки
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Cache First стратегия за статични файлове
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
    const networkResponse = await fetch(request)
    
    // Кешираме само успешните отговори
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Връщаме offline страница или JSON отговор
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
    
    // Кешираме само успешните отговори
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

// Background Sync - за offline submissions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag)
  
  if (event.tag === 'sync-submissions') {
    event.waitUntil(syncSubmissions())
  }
})

async function syncSubmissions() {
  console.log('[Service Worker] Syncing offline submissions...')
  
  try {
    // Тук ще извикаме sync функцията от offlineDB
    const syncResponse = await fetch('/api/sync-offline-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (syncResponse.ok) {
      console.log('[Service Worker] Sync successful')
      
      // Уведоми всички клиенти че sync е успешен
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
    throw error // Ще се опита пак автоматично
  }
}

// Push Notifications (за бъдещо използване)
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
        // Ако има отворен прозорец, фокусирай го
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Иначе отвори нов прозорец
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

console.log('[Service Worker] Loaded')