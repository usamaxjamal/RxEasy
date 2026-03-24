// SEC-01 FIX: Keys loaded from window.__RXEASY_CONFIG__ (injected by config.js).
// config.js must be included BEFORE this script in login.html.
// Copy config.example.js → config.js, fill in your values, and NEVER commit it.
const _cfg = (typeof window !== 'undefined' && window.__RXEASY_CONFIG__) || {};
const SB  = _cfg.supabaseUrl  || '';
const KEY = _cfg.supabaseKey  || '';
if (!SB || !KEY) console.error('[RxEasy] Missing Supabase config. Did you include config.js?');

// ── Helpers ──
function se(m) { const e = document.getElementById('errMsg'); e.textContent = m; e.className = 'msg err show'; document.getElementById('okMsg').className = 'msg ok'; }
function so(m) { const e = document.getElementById('okMsg'); e.textContent = m; e.className = 'msg ok show'; document.getElementById('errMsg').className = 'msg err'; }
function cm() { document.getElementById('errMsg').className = 'msg err'; document.getElementById('okMsg').className = 'msg ok'; }

// Bug #14 Fix: Track active tab in a variable for reliable Enter-key handling
let activeTab = 'login';

function showTab(t) {
  cm();
  activeTab = t;
  const lf = document.getElementById('loginForm');
  const rf = document.getElementById('regForm');
  const tl = document.getElementById('tab-login');
  const tr = document.getElementById('tab-reg');
  if (t === 'login') {
    lf.style.display = 'block'; rf.style.display = 'none';
    tl.className = 'tab active'; tr.className = 'tab';
  } else {
    lf.style.display = 'none'; rf.style.display = 'block';
    tl.className = 'tab'; tr.className = 'tab active';
  }
}

function setBtn(id, loading, txt) {
  const btn = document.getElementById(id);
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spin"></span>Please wait...' : txt;
}

// SEC-03 FIX: Verify token validity AND expiry before redirecting.
// An expired token in localStorage is just as dangerous as a stolen one.
window.addEventListener('load', async function () {
  try {
    const s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (s && s.access_token) {
      // Check local expiry first — avoids a network round-trip for expired tokens
      const now = Math.floor(Date.now() / 1000);
      if (s.expires_at && s.expires_at < now) {
        localStorage.removeItem('sb_session');
        return;
      }
      const r = await fetch(SB + '/auth/v1/user', {
        headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + s.access_token }
      });
      if (r.ok) {
        window.location.href = 'index.html';
      } else {
        localStorage.removeItem('sb_session');
      }
    }
  } catch (e) {
    localStorage.removeItem('sb_session');
  }
});

// ── Login ──
async function doLogin() {
  cm();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { se('Please enter your email and password'); return; }
  setBtn('loginBtn', true, 'Login to RxEasy');
  try {
    const r = await fetch(SB + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY },
      body: JSON.stringify({ email, password: pass })
    });
    const d = await r.json();
    if (!r.ok) { se(d.error_description || d.msg || 'Login failed. Check your credentials.'); setBtn('loginBtn', false, 'Login to RxEasy'); return; }
    // SEC-03 NOTE: Tokens are stored in localStorage which is accessible to
    // any JS running on this page. The CSP meta tag in login.html significantly
    // reduces XSS risk, but the ideal long-term fix is to migrate to the
    // official @supabase/supabase-js client configured with httpOnly cookies.
    // Until then, the session is cleared on any 401 and on logout.
    localStorage.setItem('sb_session', JSON.stringify({
      access_token: d.access_token,
      refresh_token: d.refresh_token || '',
      expires_at: d.expires_at || (Math.floor(Date.now() / 1000) + (d.expires_in || 3600)),
      user: d.user || {}
    }));
    so('Welcome back! Loading RxEasy...');
    setTimeout(function () { window.location.href = 'index.html'; }, 900);
  } catch (e) {
    se('Network error. Check your connection.');
    setBtn('loginBtn', false, 'Login to RxEasy');
  }
}

// ── Register ──
async function doRegister() {
  cm();
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  const qual  = document.getElementById('regQual').value;
  let city    = document.getElementById('regCity').value.trim();
  let pmdc    = document.getElementById('regPmdc').value.trim();

  // Bug #13 Fix: Full input validation
  if (!name) { se('Please enter your full name'); return; }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) { se('Please enter your email'); return; }
  if (!emailRegex.test(email)) { se('Please enter a valid email address'); return; }

  if (!pass || pass.length < 8) { se('Password must be at least 8 characters'); return; }

  if (pmdc) {
    const pmdcRegex = /^\d{5,6}-[A-Z]$/;
    if (!pmdcRegex.test(pmdc)) { se('Invalid PMDC format (e.g., 12345-P)'); return; }
  }

  // Bug #13 Fix: Sanitize free-text inputs to prevent stored XSS
  const sanitize = (s) => s.replace(/[<>"']/g, '');
  const safeName = sanitize(name);
  city = sanitize(city);

  setBtn('regBtn', true, 'Create Doctor Account');
  try {
    const r = await fetch(SB + '/auth/v1/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY },
      body: JSON.stringify({ email, password: pass, data: { full_name: safeName } })
    });
    const d = await r.json();
    if (!r.ok) { se(d.error_description || d.msg || 'Registration failed.'); setBtn('regBtn', false, 'Create Doctor Account'); return; }
    if (d.user && d.access_token) {
      await fetch(SB + '/rest/v1/doctor_profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + d.access_token, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          id: d.user.id,
          full_name: safeName,
          email,
          qualification: qual,
          city: city || null,
          pmdc_number: pmdc || null,
          is_approved: true,
          is_admin: false
        })
      });
      localStorage.setItem('sb_session', JSON.stringify({
        access_token: d.access_token,
        refresh_token: d.refresh_token || '',
        expires_at: d.expires_at || (Math.floor(Date.now() / 1000) + (d.expires_in || 3600)),
        user: d.user
      }));
      so('Account created! Redirecting...');
      setTimeout(function () { window.location.href = 'index.html'; }, 1000);
    } else {
      so('Check your email to verify your account, then login.');
      setBtn('regBtn', false, 'Create Doctor Account');
    }
  } catch (e) {
    se('Network error. Check your connection.');
    setBtn('regBtn', false, 'Create Doctor Account');
  }
}

// Bug #12 Fix: Use dynamic origin instead of hardcoded domain
function doGoogle() {
  const redirectUrl = window.location.origin + '/callback.html';
  window.location.href = SB + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirectUrl);
}

// ── Forgot password ──
async function doReset(e) {
  e.preventDefault(); cm();
  const email = document.getElementById('loginEmail').value.trim();
  if (!email) { se('Enter your email address first'); return; }
  const r = await fetch(SB + '/auth/v1/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': KEY },
    body: JSON.stringify({ email })
  });
  if (r.ok) so('Password reset email sent! Check your inbox.');
  else se('Could not send reset email.');
}

// Bug #14 Fix: Use activeTab variable instead of checking style.display
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  if (activeTab === 'login') doLogin();
  else doRegister();
});
