// ═══════════════════════════════════════════════════════════════
// subscription.js — Premium/free tier, query limits, paywall
//
// FIXED (Issue 3): loadProfile() now retries on first login.
// On fresh OAuth login the session token is written to localStorage
// by callback.html BEFORE redirect, but there can be a race with
// DOMContentLoaded. Fix: retry up to 4x with increasing delays.
// ═══════════════════════════════════════════════════════════════

var FREE_LIMIT = 3;
var _profile = null;
var _profileLoadAttempts = 0;

async function loadProfile() {
  try {
    var s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (!s || !s.access_token) return; // no session — retry will handle it

    var cfg = window.__RXEASY_CONFIG__ || {};
    var SURL = cfg.supabaseUrl || 'https://epvfbxzuziihhcaaaizp.supabase.co';
    var SKEY = cfg.supabaseKey || '';

    var res = await fetch(SURL + '/rest/v1/doctor_profiles?id=eq.' + s.user.id, {
      headers: { 'apikey': SKEY, 'Authorization': 'Bearer ' + s.access_token }
    });
    var data = await res.json();
    _profile = (data && data[0]) ? data[0] : null;

    // Sync localStorage with DB value (DB is master)
    if (_profile) {
      localStorage.setItem('rx_qc', _profile.query_count || 0);
    }

    updateSubUI();

    if (_profile && _profile.is_admin) showAdminButton();

    if (_profile && _profile.full_name) {
      var dnm = document.getElementById('dnm');
      if (dnm) dnm.innerHTML = 'Rx<span style="color:#14b88a">Easy</span>';
    }
  } catch(e) {
    console.warn('[RxEasy] Profile load error:', e);
  }
}

// Retry wrapper — handles race condition on first OAuth login
// DOMContentLoaded fires before session token is in localStorage.
// We retry up to 4x with 600/1200/1800/2400ms delays.
function loadProfileWithRetry() {
  _profileLoadAttempts = 0;
  function attempt() {
    _profileLoadAttempts++;
    var s = null;
    try { s = JSON.parse(localStorage.getItem('sb_session') || 'null'); } catch(e) {}
    if (s && s.access_token) {
      loadProfile();
    } else if (_profileLoadAttempts < 5) {
      setTimeout(attempt, _profileLoadAttempts * 600);
    }
  }
  attempt();
}

function showAdminButton() {
  if (document.getElementById('adminPanelBtn')) return;
  var clockDiv = document.getElementById('liveClock');
  if (clockDiv && clockDiv.parentNode) {
    var btn = document.createElement('button');
    btn.id = 'adminPanelBtn';
    btn.innerHTML = '⚡ Admin';
    btn.onclick = function() { window.open('admin.html', '_blank'); };
    btn.style.cssText = 'background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(201,168,76,.1));border:1px solid rgba(201,168,76,.35);border-radius:20px;padding:3px 9px;font-size:.58rem;color:#c9a84c;font-weight:700;cursor:pointer;font-family:Plus Jakarta Sans,sans-serif;margin-left:4px';
    clockDiv.parentNode.insertBefore(btn, clockDiv.nextSibling);
  }
}

function isPremium() {
  if (!_profile) return false;
  if (_profile.is_admin) return true;
  if (!_profile.is_premium) return false;
  if (_profile.premium_expires) return new Date(_profile.premium_expires) > new Date();
  return true;
}

function getQueryCount() {
  if (_profile) return _profile.query_count || 0;
  return parseInt(localStorage.getItem('rx_qc') || '0');
}

function canGenerateRx() {
  if (!_profile) return false;
  if (isPremium()) return true;
  return getQueryCount() < FREE_LIMIT;
}

async function incrementQuery() {
  if (!_profile) return;
  var n = (_profile.query_count || 0) + 1;
  _profile.query_count = n;
  localStorage.setItem('rx_qc', n);
  try {
    var s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    var cfg = window.__RXEASY_CONFIG__ || {};
    if (s && cfg.supabaseUrl) {
      await fetch(cfg.supabaseUrl + '/rest/v1/doctor_profiles?id=eq.' + s.user.id, {
        method: 'PATCH',
        headers: {
          'apikey': cfg.supabaseKey,
          'Authorization': 'Bearer ' + s.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query_count: n })
      });
    }
  } catch(e) { console.warn('[RxEasy] Query count save failed:', e); }
  updateSubUI();
}

function updateSubUI() {
  var qb = document.getElementById('queryCounterBadge');
  var pb = document.getElementById('premiumBadge');
  var premBtn  = document.getElementById('getPremiumBtn');
  var adminBtn = document.getElementById('adminPanelSbBtn');
  var docStatus = document.getElementById('docStatus');
  var docName   = document.getElementById('docName');
  if (docName && _profile && (_profile.full_name || _profile.email)) {
    docName.textContent = _profile.full_name || _profile.email;
  }
  if (isPremium()) {
    if (qb) qb.style.display = 'none';
    if (pb) pb.style.display = 'flex';
    if (premBtn) premBtn.style.display = 'none';
    if (docStatus) { docStatus.textContent = 'Premium Member'; docStatus.className = 'sb-doc-status premium'; }
  } else {
    var left = Math.max(0, FREE_LIMIT - getQueryCount());
    if (qb) {
      qb.textContent = '⚡ ' + left + ' left';
      qb.style.display = 'flex';
      if (left === 0) qb.classList.add('warn'); else qb.classList.remove('warn');
    }
    if (pb) pb.style.display = 'none';
    if (premBtn) premBtn.style.display = 'flex';
    if (docStatus) { docStatus.textContent = left + ' free quer' + (left === 1 ? 'y' : 'ies') + ' left'; docStatus.className = 'sb-doc-status free'; }
  }
  if (_profile && _profile.is_admin) { if (adminBtn) adminBtn.style.display = 'flex'; }
}

function showPaywall() {
  var el = document.getElementById('pwQueryBadge');
  if (el) el.textContent = getQueryCount() + '/' + FREE_LIMIT + ' free queries used';
  var ov = document.getElementById('paywallOverlay');
  if (ov) { ov.style.display = 'flex'; ov.classList.add('show'); }
}

function closePaywall() {
  var ov = document.getElementById('paywallOverlay');
  if (ov) { ov.classList.remove('show'); ov.style.display = 'none'; }
}

function openWhatsApp() {
  try {
    var s = JSON.parse(localStorage.getItem('sb_session') || 'null');
    var email = s ? (s.user.email || 'my email') : 'my email';
    var msg = encodeURIComponent('Hello Dr. Usama, I want to subscribe to RxEasy Premium. My registered email is: ' + email + '. Payment screenshot attached.');
    window.open('https://wa.me/923195681808?text=' + msg, '_blank');
  } catch(e) { window.open('https://wa.me/923195681808', '_blank'); }
}

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', function() {
  loadProfileWithRetry();
});

// Extra safety: if profile still null after full page load, try once more
window.addEventListener('load', function() {
  if (!_profile) setTimeout(function() { if (!_profile) loadProfile(); }, 1200);
});
