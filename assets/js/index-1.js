// ══ SERVICE WORKER REGISTRATION ══
if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE = 'rxeasy-v4';
    const CORE = ['./', location.href];
    self.addEventListener('install', e => {
      e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
      );
    });
    self.addEventListener('activate', e => {
      e.waitUntil(
        caches.keys().then(keys => Promise.all(
          keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
      );
    });
    self.addEventListener('fetch', e => {
      if (e.request.method !== 'GET') return;
      // Bug #20 Fix: Add supabase.co to network-first list so API responses are never stale
      if (
        e.request.url.includes('groq.com') ||
        e.request.url.includes('googleapis.com') ||
        e.request.url.includes('supabase.co')
      ) {
        // Network-first for ALL API calls — never serve from cache
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
      } else {
        // Cache-first for static assets only
        e.respondWith(
          caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
            if (resp && resp.status === 200 && resp.type === 'basic') {
              const clone = resp.clone();
              caches.open(CACHE).then(c => c.put(e.request, clone));
            }
            return resp;
          }))
        );
      }
    });
  `;
  const blob  = new Blob([swCode], { type: 'application/javascript' });
  const swURL = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swURL, { scope: './' })
    .then(reg => {
      console.log('[RxEasy] SW registered:', reg.scope);
      reg.addEventListener('updatefound', () => {
        console.log('[RxEasy] SW update found');
      });
    })
    .catch(err => console.warn('[RxEasy] SW registration failed:', err));
}

// ══ PWA INSTALL PROMPT ══
let _pwaPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _pwaPrompt = e;
  setTimeout(() => {
    const el = document.getElementById('installPrompt');
    if (el && !localStorage.getItem('pwaInstalled')) el.classList.add('show');
  }, 8000);
});
window.addEventListener('appinstalled', () => {
  localStorage.setItem('pwaInstalled', '1');
  document.getElementById('installPrompt')?.classList.remove('show');
  console.log('[RxEasy] App installed!');
});
function installPWA() {
  if (_pwaPrompt) {
    _pwaPrompt.prompt();
    _pwaPrompt.userChoice.then(r => {
      if (r.outcome === 'accepted') localStorage.setItem('pwaInstalled', '1');
      _pwaPrompt = null;
    });
  } else {
    toast('📱 On iOS: tap Share → "Add to Home Screen". On Android: tap menu → "Install App"');
  }
  document.getElementById('installPrompt')?.classList.remove('show');
}
