// Service Worker 版本號和快取名稱
const CACHE_NAME = 'travel-itinerary-v1';

// 定義需要預快取的檔案列表
// 這裡包含了所有在離線狀態下運行 APP 所需的靜態資源
const urlsToCache = [
  '/', // 根目錄，通常是 index.html
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/logo-48.png', // 您的 App Logo
  '/apple-touch-icon.png', // 您的 iOS Logo
  '/logo-192.png', // 其他 PWA 圖標
  '/logo-512.png'
  // 記得加入所有您在 index.html 中連結的靜態資源
];

/**
 * 1. 安裝 (Install) 事件：預快取核心資源
 * 當 Service Worker 第一次安裝時觸發。
 */
self.addEventListener('install', (event) => {
  // 阻止 Service Worker 進入活動狀態，直到快取完成
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker 已安裝並開啟快取。');
        // 將所有 urlsToCache 中的資源加入快取
        return cache.addAll(urlsToCache);
      })
  );
});

/**
 * 2. 啟動/活動 (Activate) 事件：清理舊的快取
 * 當 Service Worker 啟動後觸發。用於清理舊版本 Service Worker 留下的快取。
 */
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 檢查 cacheNames 中是否有不在白名單內的快取
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: 正在清理舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * 3. 獲取/請求 (Fetch) 事件：快取優先策略
 * 攔截所有網路請求，實現在線和離線的內容服務。
 */
self.addEventListener('fetch', (event) => {
  // 忽略跨域的請求或 Chrome 擴展請求
  if (!(event.request.url.startsWith('http'))) {
      return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 策略：快取優先 (Cache First)
        // 1. 如果在快取中找到資源，立即回傳 (離線可用)
        if (response) {
          return response;
        }

        // 2. 如果快取中沒有，則進行網路請求
        return fetch(event.request)
          .then((response) => {
            // 檢查是否收到有效的回應
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆回應，因為回應只能被消費一次
            const responseToCache = response.clone();
            
            // 將新的回應加入快取（適用於動態內容或新檔案）
            caches.open(CACHE_NAME)
              .then((cache) => {
                // 排除不希望快取的請求 (例如 Google Analytics 或 API)
                if (urlsToCache.includes(event.request.url) || event.request.url.includes('google')) {
                    // 通常 API 呼叫不快取，但為了範例，我們假設只快取靜態資源
                } else {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          });
      })
      .catch(() => {
        // 如果網路和快取都失敗了 (例如離線且請求的資源不在預快取列表中)
        console.log('Fetch 失敗：網路和快取均不可用。');
        // 可以在這裡回傳一個離線專用的預設頁面
        // return caches.match('/offline.html');
      })
  );
});