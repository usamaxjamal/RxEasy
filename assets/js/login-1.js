var SB  = 'https://epvfbxzuziihhcaaaizp.supabase.co';
var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdmZieHp1emlpaGhjYWFhaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDQ2MzIsImV4cCI6MjA4OTY4MDYzMn0.Yq7vX7TWzQ-VXwHl9E4lwHhL-gbzSMKUYcd2CLT8rKw';

// ── Helpers ──
function se(m){var e=document.getElementById('errMsg');e.textContent=m;e.className='msg err show';document.getElementById('okMsg').className='msg ok';}
function so(m){var e=document.getElementById('okMsg');e.textContent=m;e.className='msg ok show';document.getElementById('errMsg').className='msg err';}
function cm(){document.getElementById('errMsg').className='msg err';document.getElementById('okMsg').className='msg ok';}

function showTab(t){
  cm();
  var lf=document.getElementById('loginForm');
  var rf=document.getElementById('regForm');
  var tl=document.getElementById('tab-login');
  var tr=document.getElementById('tab-reg');
  if(t==='login'){
    lf.style.display='block'; rf.style.display='none';
    tl.className='tab active'; tr.className='tab';
  } else {
    lf.style.display='none'; rf.style.display='block';
    tl.className='tab'; tr.className='tab active';
  }
}

function setBtn(id, loading, txt){
  var btn=document.getElementById(id);
  btn.disabled=loading;
  btn.innerHTML=loading?'<span class="spin"></span>Please wait...':txt;
}

// ── Already logged in ──
window.addEventListener('load', function(){
  try{
    var s=JSON.parse(localStorage.getItem('sb_session')||'null');
    if(s&&s.access_token) window.location.href='index.html';
  }catch(e){}
});

// ── Login ──
async function doLogin(){
  cm();
  var email=document.getElementById('loginEmail').value.trim();
  var pass=document.getElementById('loginPass').value;
  if(!email||!pass){se('Please enter your email and password');return;}
  setBtn('loginBtn',true,'Login to RxEasy');
  try{
    var r=await fetch(SB+'/auth/v1/token?grant_type=password',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':KEY},
      body:JSON.stringify({email:email,password:pass})
    });
    var d=await r.json();
    if(!r.ok){se(d.error_description||d.msg||'Login failed. Check your credentials.');setBtn('loginBtn',false,'Login to RxEasy');return;}
    localStorage.setItem('sb_session',JSON.stringify({access_token:d.access_token,refresh_token:d.refresh_token||'',user:d.user||{}}));
    so('Welcome back! Loading RxEasy...');
    setTimeout(function(){window.location.href='index.html';},900);
  }catch(e){se('Network error. Check your connection.');setBtn('loginBtn',false,'Login to RxEasy');}
}

// ── Register ──
async function doRegister(){
  cm();
  var name=document.getElementById('regName').value.trim();
  var email=document.getElementById('regEmail').value.trim();
  var pass=document.getElementById('regPass').value;
  var qual=document.getElementById('regQual').value;
  var city=document.getElementById('regCity').value.trim();
  var pmdc=document.getElementById('regPmdc').value.trim();
  if(!name){se('Please enter your full name');return;}
  if(!email){se('Please enter your email');return;}
  if(!pass||pass.length<8){se('Password must be at least 8 characters');return;}
  setBtn('regBtn',true,'Create Doctor Account');
  try{
    var r=await fetch(SB+'/auth/v1/signup',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':KEY},
      body:JSON.stringify({email:email,password:pass,data:{full_name:name}})
    });
    var d=await r.json();
    if(!r.ok){se(d.error_description||d.msg||'Registration failed.');setBtn('regBtn',false,'Create Doctor Account');return;}
    if(d.user&&d.access_token){
      await fetch(SB+'/rest/v1/doctor_profiles',{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+d.access_token,'Prefer':'return=minimal'},
        body:JSON.stringify({id:d.user.id,full_name:name,email:email,qualification:qual,city:city||null,pmdc_number:pmdc||null,is_approved:true,is_admin:false})
      });
      localStorage.setItem('sb_session',JSON.stringify({access_token:d.access_token,refresh_token:d.refresh_token||'',user:d.user}));
      so('Account created! Redirecting...');
      setTimeout(function(){window.location.href='index.html';},1000);
    } else {
      so('Check your email to verify your account, then login.');
      setBtn('regBtn',false,'Create Doctor Account');
    }
  }catch(e){se('Network error. Check your connection.');setBtn('regBtn',false,'Create Doctor Account');}
}

// ── Google ──
function doGoogle(){
  window.location.href=SB+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent('https://rxeasy.vercel.app/callback.html');
}

// ── Forgot password ──
async function doReset(e){
  e.preventDefault(); cm();
  var email=document.getElementById('loginEmail').value.trim();
  if(!email){se('Enter your email address first');return;}
  var r=await fetch(SB+'/auth/v1/recover',{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':KEY},
    body:JSON.stringify({email:email})
  });
  if(r.ok) so('Password reset email sent! Check your inbox.');
  else se('Could not send reset email.');
}

// ── Enter key ──
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter') return;
  var lv=document.getElementById('loginForm').style.display!=='none';
  if(lv) doLogin(); else doRegister();
});
