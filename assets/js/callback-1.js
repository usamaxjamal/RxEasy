// SEC-01 FIX: Keys loaded from window.__RXEASY_CONFIG__ (injected by config.js).
// config.js must be included BEFORE this script in callback.html.
const _cfg = (typeof window !== 'undefined' && window.__RXEASY_CONFIG__) || {};
const SB  = _cfg.supabaseUrl  || '';
const KEY = _cfg.supabaseKey  || '';
if (!SB || !KEY) console.error('[RxEasy] Missing Supabase config. Did you include config.js?');

function fail(msg) {
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('msg').textContent = 'Sign in failed';
  document.getElementById('sub').style.display = 'none';
  document.getElementById('err').textContent = msg;
  document.getElementById('err').style.display = 'block';
  document.getElementById('backBtn').style.display = 'inline-block';
}

// Bug #2 Note: Session stored in localStorage. Ideally migrate to Supabase JS client
// with httpOnly cookies. Ensure CSP headers are configured server-side.
function success(access_token, refresh_token, user) {
  localStorage.setItem('sb_session', JSON.stringify({
    access_token,
    refresh_token: refresh_token || '',
    user: user || {}
  }));
  document.getElementById('msg').textContent = 'Success! Loading RxEasy...';
  window.location.replace('index.html');
}

// Bug #4 Fix: createProfile now checks HTTP status and handles errors properly
// Google OAuth users are NOT auto-approved (is_approved left for admin workflow)
async function createProfile(access_token, user) {
  try {
    const check = await fetch(SB + '/rest/v1/doctor_profiles?id=eq.' + user.id, {
      headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + access_token }
    });
    if (!check.ok) {
      console.warn('Profile check failed:', check.status);
      return;
    }
    const existing = await check.json();
    if (existing && existing.length > 0) return;

    const res = await fetch(SB + '/rest/v1/doctor_profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': KEY,
        'Authorization': 'Bearer ' + access_token,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: user.id,
        full_name: user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)
          ? (user.user_metadata.full_name || user.user_metadata.name)
          : user.email,
        email: user.email,
        qualification: 'MBBS',
        is_approved: false,  // Bug #4 Fix: OAuth users need admin approval, not auto-approved
        is_admin: false
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Profile create failed:', res.status, err);
    }
  } catch (e) {
    console.warn('Profile create error:', e);
  }
}

async function handleCallback() {
  const fullUrl = window.location.href;
  const hash    = window.location.hash;
  const search  = window.location.search;

  console.log('URL:', fullUrl);
  console.log('Hash:', hash);
  console.log('Search:', search);

  // METHOD 1: access_token in hash
  if (hash && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.replace('#', ''));
    const at = params.get('access_token');
    const rt = params.get('refresh_token');
    if (at) {
      document.getElementById('sub').textContent = 'Token found, loading...';
      try {
        // Bug #4 Fix: Check HTTP status before parsing user response
        const res = await fetch(SB + '/auth/v1/user', {
          headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + at }
        });
        if (!res.ok) { fail('Token validation failed: ' + res.status); return; }
        const user = await res.json();
        await createProfile(at, user);
        success(at, rt, user);
        return;
      } catch (e) { console.error('User fetch error:', e); }
    }
  }

  // METHOD 2: code in search params
  const urlParams = new URLSearchParams(search);
  const code = urlParams.get('code');
  if (code) {
    document.getElementById('sub').textContent = 'Exchanging auth code...';
    try {
      const res = await fetch(SB + '/auth/v1/token?grant_type=pkce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': KEY },
        body: JSON.stringify({ auth_code: code })
      });
      // Bug #4 Fix: Check HTTP status on PKCE exchange
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        fail('Code exchange failed: ' + (errData.error_description || errData.message || res.status));
        return;
      }
      const data = await res.json();
      console.log('PKCE response:', data);
      if (data.access_token) {
        if (data.user) await createProfile(data.access_token, data.user);
        success(data.access_token, data.refresh_token, data.user);
        return;
      }
      fail('Code exchange failed: ' + (data.error_description || data.message || JSON.stringify(data)));
      return;
    } catch (e) {
      fail('Network error during code exchange: ' + e.message);
      return;
    }
  }

  // METHOD 3: access_token in full URL string
  if (fullUrl.includes('access_token')) {
    const match = fullUrl.match(/access_token=([^&]+)/);
    if (match) {
      const at = decodeURIComponent(match[1]);
      document.getElementById('sub').textContent = 'Token extracted, loading...';
      try {
        // Bug #4 Fix: Check HTTP status
        const res = await fetch(SB + '/auth/v1/user', {
          headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + at }
        });
        if (!res.ok) { fail('Token validation failed: ' + res.status); return; }
        const user = await res.json();
        const rtMatch = fullUrl.match(/refresh_token=([^&]+)/);
        const rt = rtMatch ? decodeURIComponent(rtMatch[1]) : '';
        await createProfile(at, user);
        success(at, rt, user);
        return;
      } catch (e) { console.error(e); }
    }
  }

  fail('No authentication data found in the URL.\n\nURL received: ' + fullUrl.substring(0, 100));
}

handleCallback();
