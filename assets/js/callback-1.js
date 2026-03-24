var SB  = 'https://epvfbxzuziihhcaaaizp.supabase.co';
var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdmZieHp1emlpaGhjYWFhaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDQ2MzIsImV4cCI6MjA4OTY4MDYzMn0.Yq7vX7TWzQ-VXwHl9E4lwHhL-gbzSMKUYcd2CLT8rKw';

function fail(msg) {
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('msg').textContent = 'Sign in failed';
  document.getElementById('sub').style.display = 'none';
  document.getElementById('err').textContent = msg;
  document.getElementById('err').style.display = 'block';
  document.getElementById('backBtn').style.display = 'inline-block';
}

function success(access_token, refresh_token, user) {
  localStorage.setItem('sb_session', JSON.stringify({
    access_token: access_token,
    refresh_token: refresh_token || '',
    user: user || {}
  }));
  document.getElementById('msg').textContent = 'Success! Loading RxEasy...';
  window.location.replace('index.html');
}

async function createProfile(access_token, user) {
  try {
    var check = await fetch(SB+'/rest/v1/doctor_profiles?id=eq.'+user.id, {
      headers: {'apikey': KEY, 'Authorization': 'Bearer '+access_token}
    });
    var existing = await check.json();
    if (existing && existing.length > 0) return;
    await fetch(SB+'/rest/v1/doctor_profiles', {
      method: 'POST',
      headers: {'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+access_token,'Prefer':'return=minimal'},
      body: JSON.stringify({
        id: user.id,
        full_name: user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name) ? (user.user_metadata.full_name || user.user_metadata.name) : user.email,
        email: user.email,
        qualification: 'MBBS',
        is_approved: true,
        is_admin: false
      })
    });
  } catch(e) { console.warn('Profile create:', e); }
}

async function handleCallback() {
  var fullUrl = window.location.href;
  var hash = window.location.hash;
  var search = window.location.search;

  console.log('URL:', fullUrl);
  console.log('Hash:', hash);
  console.log('Search:', search);

  // METHOD 1: access_token in hash
  if (hash && hash.includes('access_token')) {
    var params = new URLSearchParams(hash.replace('#',''));
    var at = params.get('access_token');
    var rt = params.get('refresh_token');
    if (at) {
      document.getElementById('sub').textContent = 'Token found, loading...';
      try {
        var res = await fetch(SB+'/auth/v1/user', {
          headers: {'apikey': KEY, 'Authorization': 'Bearer '+at}
        });
        var user = await res.json();
        await createProfile(at, user);
        success(at, rt, user);
        return;
      } catch(e) { console.error('User fetch error:', e); }
    }
  }

  // METHOD 2: code in search params
  var urlParams = new URLSearchParams(search);
  var code = urlParams.get('code');
  if (code) {
    document.getElementById('sub').textContent = 'Exchanging auth code...';
    try {
      var res = await fetch(SB+'/auth/v1/token?grant_type=pkce', {
        method: 'POST',
        headers: {'Content-Type':'application/json','apikey': KEY},
        body: JSON.stringify({auth_code: code})
      });
      var data = await res.json();
      console.log('PKCE response:', data);
      if (data.access_token) {
        if (data.user) await createProfile(data.access_token, data.user);
        success(data.access_token, data.refresh_token, data.user);
        return;
      }
      fail('Code exchange failed: ' + (data.error_description || data.message || JSON.stringify(data)));
      return;
    } catch(e) {
      fail('Network error during code exchange: ' + e.message);
      return;
    }
  }

  // METHOD 3: Check if token is in a different format in the URL
  if (fullUrl.includes('access_token')) {
    // Try to extract from full URL
    var match = fullUrl.match(/access_token=([^&]+)/);
    if (match) {
      var at = decodeURIComponent(match[1]);
      document.getElementById('sub').textContent = 'Token extracted, loading...';
      try {
        var res = await fetch(SB+'/auth/v1/user', {
          headers: {'apikey': KEY, 'Authorization': 'Bearer '+at}
        });
        var user = await res.json();
        var rtMatch = fullUrl.match(/refresh_token=([^&]+)/);
        var rt = rtMatch ? decodeURIComponent(rtMatch[1]) : '';
        await createProfile(at, user);
        success(at, rt, user);
        return;
      } catch(e) { console.error(e); }
    }
  }

  fail('No authentication data found in the URL.\n\nURL received: ' + fullUrl.substring(0, 100));
}

handleCallback();
