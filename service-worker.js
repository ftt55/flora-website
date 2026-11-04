const CACHE_NAME = 'flora-cache-v2';
const urlsToCache = [
  '/flora-website/',
  '/flora-website/index.html',
  '/flora-website/style.css',
  '/flora-website/script.js',
  '/flora-website/manifest.json'
];

// УСТАНОВКА: сохраняем файлы в кэш при первом заходе
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Открыт кэш:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// ПЕРЕХВАТ ЗАПРОСОВ: отдаём файлы из кэша, если есть интернет — обновляем
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// АКТИВАЦИЯ: удаляем старый кэш при обновлении версии
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});