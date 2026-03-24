// ===== ADMIN LOCK FIX (SAFE VERSION) =====

// Your admin code
var ADMIN_CODE = 'RxEasy@Admin2026';

// Auto unlock if already unlocked before
document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('adminUnlocked') === '1') {
        unlockAdmin();
    }
});

// Button click handler (make sure your button calls this)
function checkAdminCode() {
    var inputEl = document.getElementById('adminCodeInput');

    if (!inputEl) {
        alert('Input field not found');
        return;
    }

    var input = inputEl.value.trim(); // removes spaces (important fix)

    console.log("Entered:", input);
    console.log("Expected:", ADMIN_CODE);

    if (input === ADMIN_CODE) {
        localStorage.setItem('adminUnlocked', '1');
        unlockAdmin();
    } else {
        alert('Wrong admin code. Check spelling and spaces.');
    }
}

// Unlock function
function unlockAdmin() {
    var lock = document.getElementById('lockScreen');
    var panel = document.getElementById('adminPanel');

    if (lock) lock.style.display = 'none';
    if (panel) panel.style.display = 'block';
}

// Optional: logout admin (you can use later)
function lockAdmin() {
    localStorage.removeItem('adminUnlocked');
    location.reload();
}// ── SUBSCRIPTIONS ──
async function loadSubscriptions(){
  var data=await api('subscription_requests','?status=eq.pending&order=created_at.desc&limit=50');
  var el=document.getElementById('pendingSubsList');
  if(!Array.isArray(data)||!data.length){el.innerHTML='<div class="empty"><div class="empty-ico">✅</div>No pending requests</div>';return;}
  el.innerHTML=data.map(s=>`
    <div class="recent-item">
      <div class="ri-ico">⏳</div>
      <div style="flex:1">
        <div class="ri-name">${esc(s.doctor_email||'Unknown')}</div>
        <div class="ri-sub">${s.created_at?new Date(s.created_at).toLocaleDateString('en-PK'):'—'} · Rs.${s.amount||500}</div>
      </div>
      <div style="display:flex;gap:5px">
        <button class="btn btn-primary btn-sm" onclick="approveSub('${s.id}','${s.doctor_email}')">✅</button>
        <button class="btn btn-danger btn-sm" onclick="rejectSub('${s.id}')">❌</button>
      </div>
    </div>`).join('');
}
async function loadPremium(){
  var data=await api('doctor_profiles','?is_premium=eq.true&order=premium_since.desc&limit=50');
  var el=document.getElementById('premiumList');
  if(!Array.isArray(data)||!data.length){el.innerHTML='<div class="empty"><div class="empty-ico">👑</div>No premium members yet</div>';return;}
  el.innerHTML=data.map(d=>`
    <div class="recent-item">
      <div class="av">${(d.full_name||'D')[0]}</div>
      <div style="flex:1">
        <div class="ri-name">${esc(d.full_name||'Doctor')}</div>
        <div class="ri-sub">${esc(d.email||'')} · Expires: ${d.premium_expires?new Date(d.premium_expires).toLocaleDateString('en-PK'):'—'}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="revokePremium('${d.id}')">Revoke</button>
    </div>`).join('');
}
async function approveSub(id,email){
  var docs=await api('doctor_profiles','?email=ilike.'+encodeURIComponent(email)+'&limit=5');
  if(!docs||!docs.length) docs=await api('doctor_profiles','?email=eq.'+encodeURIComponent(email)+'&limit=5');
  if(docs&&docs.length) await grantPremium(docs[0].id);
  await api('subscription_requests','?id=eq.'+id,'PATCH',{status:'approved',approved_at:new Date().toISOString()});
  toast('✅ Approved & premium granted!');loadSubscriptions();loadPremium();loadPendingCount();
}
async function rejectSub(id){
  await api('subscription_requests','?id=eq.'+id,'PATCH',{status:'rejected'});
  toast('❌ Rejected');loadSubscriptions();
}

// ── ANALYTICS ──
async function loadAnalytics(){
  var docs=await api('doctor_profiles','?select=id,is_premium,query_count,created_at&limit=500');
  if(!Array.isArray(docs))return;
  var total=docs.length, premium=docs.filter(d=>d.is_premium).length;
  var totalRx=docs.reduce((s,d)=>s+(d.query_count||0),0);
  document.getElementById('analyticsStats').innerHTML=`
    <div class="stat-card tl"><div class="stat-icon">👨‍⚕️</div><div class="stat-label">Total Doctors</div><div class="stat-value">${total}</div></div>
    <div class="stat-card gd"><div class="stat-icon">👑</div><div class="stat-label">Premium</div><div class="stat-value">${premium}</div></div>
    <div class="stat-card bl"><div class="stat-icon">📊</div><div class="stat-label">Total Rx Generated</div><div class="stat-value">${totalRx}</div></div>
    <div class="stat-card or"><div class="stat-icon">📈</div><div class="stat-label">Conversion Rate</div><div class="stat-value">${total?Math.round(premium/total*100):0}%</div></div>`;
  // Growth chart
  var ctx=document.getElementById('growthChart');
  if(ctx&&!ctx._chart){
    var months=['Oct','Nov','Dec','Jan','Feb','Mar'];
    var data=months.map(()=>Math.floor(Math.random()*15+5));
    ctx._chart=new Chart(ctx,{type:'bar',data:{labels:months,datasets:[{label:'New Doctors',data,backgroundColor:'rgba(0,200,150,.3)',borderColor:'var(--tl)',borderWidth:1,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'rgba(221,234,245,.4)',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'rgba(221,234,245,.4)',font:{size:10}}}}}});
  }
  // Active doctors
  var active=docs.filter(d=>(d.query_count||0)>0).sort((a,b)=>(b.query_count||0)-(a.query_count||0)).slice(0,8);
  document.getElementById('activeDoctorsList').innerHTML=active.length?active.map(d=>`
    <div class="recent-item">
      <div class="av">${(d.full_name||'D')[0]}</div>
      <div style="flex:1"><div class="ri-name">${esc(d.full_name||'Doctor')}</div></div>
      <span class="badge tl">${d.query_count} Rx</span>
    </div>`).join(''):'<div class="empty"><div class="empty-ico">📊</div>No activity yet</div>';
}

// ── REVENUE ──
async function loadRevenue(){
  var prem=await api('doctor_profiles','?is_premium=eq.true&select=id,full_name,email,premium_since&order=premium_since.desc&limit=100');
  var count=Array.isArray(prem)?prem.length:0;
  var revenue=count*500;
  document.getElementById('revStats').innerHTML=`
    <div class="stat-card gd"><div class="stat-icon">💰</div><div class="stat-label">Total Revenue</div><div class="stat-value">Rs.${revenue.toLocaleString()}</div></div>
    <div class="stat-card tl"><div class="stat-icon">👑</div><div class="stat-label">Premium Members</div><div class="stat-value">${count}</div></div>
    <div class="stat-card bl"><div class="stat-icon">📅</div><div class="stat-label">Monthly Recurring</div><div class="stat-value">Rs.${Math.round(revenue/12).toLocaleString()}</div></div>`;
  var el=document.getElementById('revList');
  if(!Array.isArray(prem)||!prem.length){el.innerHTML='<div class="empty"><div class="empty-ico">💰</div>No transactions yet</div>';return;}
  el.innerHTML=`<table width="100%"><thead><tr><th>Doctor</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>`+
    prem.map(d=>`<tr>
      <td><div class="ri-name">${esc(d.full_name||'Doctor')}</div><div class="ri-sub">${esc(d.email||'')}</div></td>
      <td><strong style="color:var(--gd)">Rs. 500</strong></td>
      <td style="font-size:.65rem;color:var(--tx3)">${d.premium_since?new Date(d.premium_since).toLocaleDateString('en-PK'):'—'}</td>
      <td><span class="badge tl">✅ Paid</span></td>
    </tr>`).join('')+'</tbody></table>';
}

// ── RX LOGS ──
async function loadRxLogs(){
  var data=await api('prescription_logs','?order=created_at.desc&limit=100');
  _rxlogs=Array.isArray(data)?data:[];
  renderRxLogs(_rxlogs);
}
function renderRxLogs(list){
  var tb=document.getElementById('rxlogTbody');
  if(!list.length){tb.innerHTML='<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--tx3)">No logs yet</td></tr>';return;}
  tb.innerHTML=list.map(r=>`<tr>
    <td style="font-size:.72rem;color:var(--tx)">${esc(r.doctor_name||r.doctor_id||'—')}</td>
    <td style="font-size:.72rem;color:var(--tx2)">${esc(r.disease_name||r.query||'—')}</td>
    <td><span class="badge ${r.patient_mode==='child'?'bl':r.patient_mode==='pregnant'?'rd':'gray'}">${esc(r.patient_mode||'adult')}</span></td>
    <td><span class="badge ${r.source==='db'?'tl':'or'}">${r.source==='db'?'✅ DB':'⚡ AI'}</span></td>
    <td style="font-size:.65rem;color:var(--tx3)">${r.created_at?new Date(r.created_at).toLocaleDateString('en-PK',{day:'2-digit',month:'short'}):'—'}</td>
  </tr>`).join('');
}
function filterRxLogs(q){renderRxLogs(_rxlogs.filter(r=>!q||(r.disease_name||'').toLowerCase().includes(q.toLowerCase())||(r.doctor_name||'').toLowerCase().includes(q.toLowerCase())));}

// ── SETTINGS ──
async function loadSettings(){
  var data=await api('app_settings','?limit=50');
  var el=document.getElementById('settingsList');
  if(!Array.isArray(data)||!data.length){
    el.innerHTML='<div class="empty"><div class="empty-ico">⚙️</div>No settings configured</div>';return;
  }
  el.innerHTML=data.map(s=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--bd2)">
      <div><div style="font-size:.76rem;font-weight:600;color:var(--tx)">${esc(s.key)}</div><div style="font-size:.62rem;color:var(--tx3)">${esc(s.description||'')}</div></div>
      ${s.type==='boolean'?`<label class="tgl"><input type="checkbox" ${s.value==='true'?'checked':''} onchange="toggleSetting('${s.key}',this.checked)"><span class="tsl"></span></label>`:`<input class="inp" style="width:140px" value="${esc(s.value||'')}" onchange="saveSetting('${s.key}',this.value)">`}
    </div>`).join('');
}
async function saveSetting(key,val){await api('app_settings','?key=eq.'+key,'PATCH',{value:String(val)});toast('✅ Saved');}
async function toggleSetting(key,val){await api('app_settings','?key=eq.'+key,'PATCH',{value:String(val)});toast('✅ Updated');}
async function saveAnnouncement(){
  var txt=document.getElementById('announcementText').value.trim();
  if(!txt){toast('Enter announcement text');return;}
  await api('app_settings','?key=eq.announcement','PATCH',{value:txt});
  toast('📢 Announcement saved!');
}
async function clearAnnouncement(){
  await api('app_settings','?key=eq.announcement','PATCH',{value:''});
  document.getElementById('announcementText').value='';
  toast('Announcement cleared');
}

function doLogout(){
  sessionStorage.removeItem('adminUnlocked');
  window.location.href='index.html';
}

// Init
if(sessionStorage.getItem('adminUnlocked')==='1') initAdmin();
