// Service worker for the psycho-report-generator app
const CACHE_NAME = 'psycho-report-cache-v2';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install the service worker and cache the static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error caching assets:', err))
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Claim control immediately
  self.clients.claim();
});

// Special handling for shared-form routes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // First check for API requests that might be failing
  if (url.pathname.includes('/rest/v1/')) {
    handleApiRequest(event);
    return;
  }
  
  // Handle navigation requests to shared-form routes
  if (event.request.mode === 'navigate' && url.pathname.startsWith('/shared-form/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Handle other navigate requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For non-navigate requests, use cache-first strategy for better performance
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached response immediately
        // Fetch in the background to update cache for next time
        const fetchPromise = fetch(event.request).then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response as it can only be consumed once
          const responseToCache = response.clone();
          
          // Open the cache and store the new response
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(err => {
          console.warn('Background fetch failed:', err);
          // Do nothing on error - we already returned the cached response
        });
        
        // Return cached response immediately while fetch happens in background
        return cachedResponse;
      }
      
      // If not in cache, try to fetch it
      return fetch(event.request, { 
        // Add credentials to ensure cookies are sent
        credentials: 'include',
        // Preserve original request mode
        mode: event.request.mode
      })
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();
        
        // Open the cache and store the new response
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(err => {
        console.warn('Fetch failed:', err);
        
        // Special handling for shared form routes
        if (url.pathname.includes('/shared-form/')) {
          return caches.match('/index.html');
        }
        
        // For API requests, return a custom error response
        if (url.pathname.includes('/rest/v1/')) {
          return new Response(
            JSON.stringify({ 
              error: 'אין חיבור לאינטרנט. אנא בדוק את החיבור שלך ונסה שוב.',
              offline: true,
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
              },
              status: 503
            }
          );
        }
        
        // For other resources, return a generic offline response
        return new Response(
          'אין חיבור לאינטרנט. אנא בדוק את החיבור שלך ונסה שוב.',
          { 
            headers: { 'Content-Type': 'text/plain' },
            status: 503
          }
        );
      });
    })
  );
});

// Special handling for API requests
function handleApiRequest(event) {
  const url = new URL(event.request.url);
  
  // For API requests, we use a network-first strategy with more robust offline fallback
  event.respondWith(
    fetch(event.request, {
      credentials: 'include',
      mode: event.request.mode,
      // Add a longer timeout for API requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    .then(response => {
      // Clone the response before using it
      const responseToCache = response.clone();
      
      // Store in cache for offline use
      caches.open(CACHE_NAME).then(cache => {
        // Only cache successful responses
        if (response.ok) {
          cache.put(event.request, responseToCache);
        }
      });
      
      return response;
    })
    .catch(err => {
      console.error('API request failed:', err);
      
      // First try to get from cache
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // If we have a cached response, use it but mark it as potentially stale
          return new Response(
            cachedResponse.body,
            { 
              status: 200,
              statusText: 'OK (Cached)',
              headers: new Headers({
                'Content-Type': 'application/json',
                'X-Cached-Response': 'true',
                'X-Cached-At': cachedResponse.headers.get('date') || new Date().toISOString()
              })
            }
          );
        }
        
        // If no cached response, return a standard offline error
        return new Response(
          JSON.stringify({
            error: 'אין חיבור לאינטרנט. אנא בדוק את החיבור שלך ונסה שוב.',
            offline: true,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      });
    })
  );
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle network status updates from the client
  if (event.data && event.data.type === 'ONLINE_STATUS') {
    const isOnline = event.data.online;
    console.log('Network status from client:', isOnline ? 'online' : 'offline');
    
    // Notify all clients about this status change
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'ONLINE_STATUS_BROADCAST',
          online: isOnline
        });
      });
    });
  }
});