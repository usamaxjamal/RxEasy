// ═══════════════════════════════════════════════
// subscription.js — Premium/free tier, query limits,
// paywall, WhatsApp upgrade, admin button
// ═══════════════════════════════════════════════

// ═══ SUBSCRIPTION ENGINE ═══
var FREE_LIMIT = 3;
var _profile = null;

async function loadProfile() {
  try {
    var s = JSON.parse(localStorage.getItem('sb_session')||'null');
    if (!s || !s.access_token) return;
    var res = await fetch('https://epvfbxzuziihhcaaaizp.supabase.co/rest/v1/doctor_profiles?id=eq.'+s.user.id, {
      headers: {'apikey':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdmZieHp1emlpaGhjYWFhaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDQ2MzIsImV4cCI6MjA4OTY4MDYzMn0.Yq7vX7TWzQ-VXwHl9E4lwHhL-gbzSMKUYcd2CLT8rKw','Authorization':'Bearer '+s.access_token}
    });
    var data = await res.json();
    _profile = data && data[0] ? data[0] : null;

    // Sync localStorage with DB value (DB is master)
    if (_profile) {
      localStorage.setItem('rx_qc', _profile.query_count || 0);
    }

    updateSubUI();

    // Show admin button if user is admin
    if (_profile && _profile.is_admin) {
      showAdminButton();
    }

    // Show doctor name in header
    if (_profile && _profile.full_name) {
      var dnm = document.getElementById('dnm');
      if (dnm) dnm.textContent = 'Rx' + '<span style="color:#14b88a">Easy</span>';
    }
  } catch(e) { console.warn('Profile load:', e); }
}

function showAdminButton() {
  // Check if already added
  if (document.getElementById('adminPanelBtn')) return;
  // Add admin button to header
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
  // ONLY use database count — localStorage is just a cache
  if (_profile) return _profile.query_count || 0;
  return parseInt(localStorage.getItem('rx_qc')||'0');
}

function canGenerateRx() {
  // If profile hasn't loaded yet, block and wait
  if (!_profile) return false;
  if (isPremium()) return true;
  return getQueryCount() < FREE_LIMIT;
}

async function incrementQuery() {
  if (!_profile) return;
  var n = (_profile.query_count || 0) + 1;
  _profile.query_count = n;
  localStorage.setItem('rx_qc', n); // local cache only
  try {
    var s = JSON.parse(localStorage.getItem('sb_session')||'null');
    if (s) {
      await fetch('https://epvfbxzuziihhcaaaizp.supabase.co/rest/v1/doctor_profiles?id=eq.'+s.user.id, {
        method:'PATCH',
        headers:{
          'apikey':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdmZieHp1emlpaGhjYWFhaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDQ2MzIsImV4cCI6MjA4OTY4MDYzMn0.Yq7vX7TWzQ-VXwHl9E4lwHhL-gbzSMKUYcd2CLT8rKw',
          'Authorization':'Bearer '+s.access_token,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({query_count:n})
      });
    }
  } catch(e) { console.warn('Query count save failed:', e); }
  updateSubUI();
}

function updateSubUI() {
  var qb  = document.getElementById('queryCounterBadge');
  var pb  = document.getElementById('premiumBadge');
  var premBtn   = document.getElementById('getPremiumBtn');
  var adminBtn  = document.getElementById('adminPanelSbBtn');
  var docStatus = document.getElementById('docStatus');
  var docName   = document.getElementById('docName');
  if(docName && _profile && (_profile.full_name||_profile.email)){
    docName.textContent=_profile.full_name||_profile.email;
  }
  if(isPremium()){
    if(qb) qb.style.display='none';
    if(pb) pb.style.display='flex';
    if(premBtn) premBtn.style.display='none';
    if(docStatus){docStatus.textContent='Premium Member';docStatus.className='sb-doc-status premium';}
  } else {
    var left=Math.max(0,FREE_LIMIT-getQueryCount());
    if(qb){qb.textContent='⚡ '+left+' left';qb.style.display='flex';if(left===0)qb.classList.add('warn');else qb.classList.remove('warn');}
    if(pb) pb.style.display='none';
    if(premBtn) premBtn.style.display='flex';
    if(docStatus){docStatus.textContent=left+' free quer'+(left===1?'y':'ies')+' left';docStatus.className='sb-doc-status free';}
  }
  if(_profile&&_profile.is_admin){if(adminBtn)adminBtn.style.display='flex';}
}

function showPaywall() {
  var el = document.getElementById('pwQueryBadge');
  var used = getQueryCount();
  if (el) el.textContent = used + '/' + FREE_LIMIT + ' free queries used';
  var ov = document.getElementById('paywallOverlay');
  if (ov) {
    ov.style.display = 'flex';
    ov.classList.add('show');
  }
}

function closePaywall() {
  var ov = document.getElementById('paywallOverlay');
  if (ov) {
    ov.classList.remove('show');
    ov.style.display = 'none';
  }
}

function openWhatsApp() {
  try {
    var s = JSON.parse(localStorage.getItem('sb_session')||'null');
    var email = s ? (s.user.email || 'my email') : 'my email';
    var msg = encodeURIComponent('Hello Dr. Usama, I want to subscribe to RxEasy Premium. My registered email is: '+email+'. Payment screenshot attached.');
    window.open('https://wa.me/923195681808?text='+msg,'_blank');
  } catch(e) { window.open('https://wa.me/923195681808','_blank'); }
}

// Load profile when app starts
document.addEventListener('DOMContentLoaded', function() {
  loadProfile();
});
