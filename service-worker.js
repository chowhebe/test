// 使用日期時間自動生成版本號
const CACHE_VERSION = new Date().toISOString().slice(0,16); 
const CACHE_NAME = `travel-itinerary-${CACHE_VERSION}`;

// 定義需要預快取的檔案列表
const urlsToCache = [
  '/', 
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/logo-48.png',
  '/apple-touch-icon.png',
  '/logo-192.png',
  '/logo-512.png'
];

// 1. 安裝 (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker 已安裝並開啟快取:', CACHE_NAME);
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // 立即啟用新 SW
});

// 2. 啟動 (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 正在清理舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 立即接管頁面
});

// 3. 攔截請求 (Fetch)
self.addEventListener('fetch', (event) => {
  if (!(event.request.url.startsWith('http'))) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
