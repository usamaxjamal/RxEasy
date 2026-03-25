// ══ SERVICE WORKER REGISTRATION ══
// FUNC-01 FIX: Proper structured caching — API/CDN calls always go to network,
// static assets use cache-first. Added cdnjs.cloudflare.com and fonts.gstatic.com
// to the network-only list so new CDN updates are never accidentally cached.
if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE = 'rxeasy-v5';
    const CORE = ['./', location.href];

    const NETWORK_ONLY = [
      'supabase.co',
      'groq.com',
      'googleapis.com',
      'cdnjs.cloudflare.com',
      'fonts.gstatic.com',
    ];

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
      const isNetworkOnly = NETWORK_ONLY.some(d => e.request.url.includes(d));
      if (isNetworkOnly) {
        e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
        return;
      }
      e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return resp;
        }))
      );
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
