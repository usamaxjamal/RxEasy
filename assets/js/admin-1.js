var SB  = 'https://epvfbxzuziihhcaaaizp.supabase.co';
var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdmZieHp1emlpaGhjYWFhaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDQ2MzIsImV4cCI6MjA4OTY4MDYzMn0.Yq7vX7TWzQ-VXwHl9E4lwHhL-gbzSMKUYcd2CLT8rKw';
var ADMIN_CODE = 'RxEasy@Admin2026';
var SESSION = null;
var _diseases = [], _drugs = [], _doctors = [], _rxlogs = [];

// ── Helpers ──
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toast(msg,dur=2500){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
function openModal(id){document.getElementById(id).classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('show');}

async function api(path,params='',method='GET',body=null){
  var token = SESSION ? SESSION.access_token : KEY;
  var opts = {method, headers:{'apikey':KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'}};
  if(body) opts.body = JSON.stringify(body);
  var r = await fetch(SB+'/rest/v1/'+path+params, opts);
  if(r.status===204) return null;
  return r.json();
}

// ── LOCK ──
function checkCode(){var v=document.getElementById('codeInp').value.trim();return v===ADMIN_CODE;}
function unlockAdmin(){
  if(!checkCode()){
    document.getElementById('lockErr').textContent='❌ Invalid access code';
    document.getElementById('codeInp').value='';
    return;
  }
  sessionStorage.setItem('adminUnlocked','1');
  document.getElementById('lockScreen').style.display='none';
  document.getElementById('adminApp').style.display='block';
  initAdmin();
}
document.getElementById('codeInp').addEventListener('keydown',function(e){if(e.key==='Enter')unlockAdmin();});
// Auto-unlock if already unlocked
if(sessionStorage.getItem('adminUnlocked')==='1'){
  document.getElementById('lockScreen').style.display='none';
  document.getElementById('adminApp').style.display='block';
}

// ── NAVIGATION ──
function showPage(id, el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(el) el.classList.add('active');
  else {
    document.querySelectorAll('.nav-item').forEach(n=>{
      if(n.getAttribute('onclick')&&n.getAttribute('onclick').includes("'"+id+"'")) n.classList.add('active');
    });
  }
  var titles={dashboard:'Dashboard',analytics:'Analytics',diseases:'Diseases DB',drugs:'Drug DB',doctors:'Doctors',subscriptions:'Subscriptions',revenue:'Revenue',rxlogs:'Rx Logs',settings:'Settings'};
  document.getElementById('topbarTitle').textContent = titles[id]||id;
  // Load data for page
  var loaders={diseases:loadDiseases,drugs:loadDrugs,doctors:loadDoctors,subscriptions:()=>{loadSubscriptions();loadPremium();},analytics:loadAnalytics,revenue:loadRevenue,rxlogs:loadRxLogs,settings:loadSettings};
  if(loaders[id]) loaders[id]();
}

function toggleSidebar(){
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  if(window.innerWidth <= 768){
    sb.classList.toggle('mobile-open');
    ov.classList.toggle('show');
  } else {
    sb.classList.toggle('collapsed');
  }
}
function closeSidebar(){
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sbOverlay');
  sb.classList.remove('mobile-open');
  ov.classList.remove('show');
}

// ── INIT ──
function initAdmin(){
  startClock();
  initDashboard();
  loadPendingCount();
  // Get session from parent app if available
  try{SESSION=JSON.parse(localStorage.getItem('sb_session')||'null');}catch(e){}
}

function startClock(){
  function tick(){
    var now=new Date();
    var el=document.getElementById('adminClock');
    if(el) el.textContent=now.toLocaleString('en-PK',{hour:'2-digit',minute:'2-digit',hour12:true,day:'2-digit',month:'short'});
  }
  tick(); setInterval(tick,60000);
}

// ── DASHBOARD ──
async function initDashboard(){
  try{
    var [docs, prem, dis, drugs, rx] = await Promise.all([
      api('doctor_profiles','?select=id,is_premium,query_count,created_at&limit=1000'),
      api('doctor_profiles','?is_premium=eq.true&select=id'),
      api('diseases','?select=id&limit=1'),
      api('drugs','?select=id&limit=1'),
      api('prescription_logs','?select=id&limit=1'),
    ]);
    document.getElementById('s-docs').textContent = Array.isArray(docs)?docs.length:'—';
    document.getElementById('s-prem').textContent = Array.isArray(prem)?prem.length:'—';
    document.getElementById('s-dis').textContent  = '—';
    document.getElementById('s-rx').textContent   = '—';
    // Pending
    var pend = await api('subscription_requests','?status=eq.pending&select=id');
    document.getElementById('s-pend').textContent = Array.isArray(pend)?pend.length:'0';
    // Recent docs
    if(Array.isArray(docs)){
      loadRecentDocs(docs.slice(-5).reverse());
    }
    // Chart
    initRxChart();
    loadTopDiseases();
  }catch(e){console.error('Dashboard error:',e);}
}

function loadRecentDocs(docs){
  var el=document.getElementById('recentDocs');
  if(!docs||!docs.length){el.innerHTML='<div class="empty"><div class="empty-ico">👨‍⚕️</div>No doctors yet</div>';return;}
  el.innerHTML=docs.map(d=>`
    <div class="recent-item">
      <div class="ri-ico">👨‍⚕️</div>
      <div><div class="ri-name">${esc(d.full_name||'Doctor')}</div><div class="ri-sub">${esc(d.email||'')}</div></div>
      <div>${d.is_premium?'<span class="badge gd">👑 Premium</span>':'<span class="badge gray">Free</span>'}</div>
    </div>`).join('');
}

function initRxChart(){
  var ctx=document.getElementById('rxChart');
  if(!ctx)return;
  var labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var data=labels.map(()=>Math.floor(Math.random()*40+10));
  new Chart(ctx,{
    type:'line',
    data:{labels,datasets:[{label:'Prescriptions',data,borderColor:'#00c896',backgroundColor:'rgba(0,200,150,.08)',borderWidth:2,pointBackgroundColor:'#00c896',pointRadius:3,tension:.4,fill:true}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'rgba(221,234,245,.4)',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'rgba(221,234,245,.4)',font:{size:10}}}}}
  });
}

async function loadTopDiseases(){
  var el=document.getElementById('topDiseaseList');
  if(!el)return;
  var data=await api('prescription_logs','?select=disease_name&limit=100');
  if(!Array.isArray(data)||!data.length){
    el.innerHTML='<div class="empty"><div class="empty-ico">🦠</div>No data yet</div>';return;
  }
  var counts={};
  data.forEach(r=>{if(r.disease_name)counts[r.disease_name]=(counts[r.disease_name]||0)+1;});
  var sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  var max=sorted[0]?sorted[0][1]:1;
  el.innerHTML=sorted.map(([name,count])=>`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:.72rem;margin-bottom:3px">
        <span style="color:var(--tx)">${esc(name)}</span>
        <span style="color:var(--tx3)">${count}</span>
      </div>
      <div style="background:var(--sf2);border-radius:4px;height:4px;overflow:hidden">
        <div style="background:var(--tl);height:100%;width:${Math.round(count/max*100)}%;border-radius:4px;transition:width .5s"></div>
      </div>
    </div>`).join('');
}

async function loadPendingCount(){
  try{
    var pend=await api('subscription_requests','?status=eq.pending&select=id');
    var count=Array.isArray(pend)?pend.length:0;
    var badge=document.getElementById('pendingBadge');
    if(badge){badge.textContent=count;badge.style.display=count>0?'inline-flex':'none';}
    var el=document.getElementById('s-pend');
    if(el) el.textContent=count;
  }catch(e){}
}

// ── DISEASES ──
async function loadDiseases(){
  var data=await api('diseases','?order=name.asc&limit=200');
  _diseases=Array.isArray(data)?data:[];
  document.getElementById('disCount').textContent=_diseases.length+' diseases in database';
  renderDiseases(_diseases);
}
function renderDiseases(list){
  var tb=document.getElementById('diseaseTbody');
  if(!list.length){tb.innerHTML='<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--tx3)">No diseases found</td></tr>';return;}
  tb.innerHTML=list.map(d=>`<tr>
    <td><strong style="color:var(--tx)">${esc(d.name)}</strong></td>
    <td><span class="badge bl">${esc(d.category||'—')}</span></td>
    <td><span style="font-family:'JetBrains Mono',monospace;font-size:.68rem;color:var(--tx3)">${esc(d.icd10||'—')}</span></td>
    <td><span class="badge tl">${d.treatment_count||0} drugs</span></td>
    <td style="display:flex;gap:5px">
      <button class="btn btn-ghost btn-sm" onclick="editDisease('${d.id}')">✏️ Edit</button>
      <button class="btn btn-danger btn-sm" onclick="delDisease('${d.id}')">🗑️</button>
    </td>
  </tr>`).join('');
}
function filterDiseases(q){renderDiseases(_diseases.filter(d=>!q||d.name.toLowerCase().includes(q.toLowerCase())));}
function resetDiseaseForm(){document.getElementById('d-id').value='';document.getElementById('d-name').value='';document.getElementById('d-cat').value='';document.getElementById('d-icd').value='';document.getElementById('d-alias').value='';document.getElementById('d-notes').value='';document.getElementById('disModalTitle').textContent='Add Disease';}
function editDisease(id){
  var d=_diseases.find(x=>x.id===id);if(!d)return;
  document.getElementById('d-id').value=d.id;
  document.getElementById('d-name').value=d.name||'';
  document.getElementById('d-cat').value=d.category||'';
  document.getElementById('d-icd').value=d.icd10||'';
  document.getElementById('d-alias').value=(d.aliases||[]).join(', ');
  document.getElementById('d-notes').value=d.notes||'';
  document.getElementById('disModalTitle').textContent='Edit Disease';
  openModal('diseaseModal');
}
async function saveDisease(){
  var id=document.getElementById('d-id').value;
  var body={name:document.getElementById('d-name').value.trim(),category:document.getElementById('d-cat').value.trim(),icd10:document.getElementById('d-icd').value.trim(),aliases:document.getElementById('d-alias').value.split(',').map(s=>s.trim()).filter(Boolean),notes:document.getElementById('d-notes').value.trim()};
  if(!body.name){toast('Disease name required');return;}
  try{
    if(id){await api('diseases','?id=eq.'+id,'PATCH',body);}
    else{await api('diseases','','POST',body);}
    toast('✅ Disease saved!');closeModal('diseaseModal');loadDiseases();
  }catch(e){toast('❌ Error: '+e.message);}
}
async function delDisease(id){
  if(!confirm('Delete this disease?'))return;
  await api('diseases','?id=eq.'+id,'DELETE');
  toast('🗑️ Deleted');loadDiseases();
}

// ── DRUGS ──
async function loadDrugs(){
  var data=await api('drugs','?order=generic_name.asc&limit=300');
  _drugs=Array.isArray(data)?data:[];
  document.getElementById('drugCount').textContent=_drugs.length+' drugs in database';
  renderDrugs(_drugs);
}
function renderDrugs(list){
  var tb=document.getElementById('drugTbody');
  if(!list.length){tb.innerHTML='<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--tx3)">No drugs found</td></tr>';return;}
  tb.innerHTML=list.map(d=>`<tr>
    <td><strong style="color:var(--tx)">${esc(d.generic_name)}</strong></td>
    <td><span style="font-size:.68rem;color:var(--tl)">${(d.brand_names||[]).slice(0,3).join(', ')||'—'}</span></td>
    <td><span class="badge bl">${esc(d.category||'—')}</span></td>
    <td><span style="font-family:'JetBrains Mono',monospace;font-size:.68rem">${esc(d.standard_dose_adult||'—')}</span></td>
    <td style="display:flex;gap:5px">
      <button class="btn btn-ghost btn-sm" onclick="editDrug('${d.id}')">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="delDrug('${d.id}')">🗑️</button>
    </td>
  </tr>`).join('');
}
function filterDrugs(q){renderDrugs(_drugs.filter(d=>!q||d.generic_name.toLowerCase().includes(q.toLowerCase())||(d.brand_names||[]).some(b=>b.toLowerCase().includes(q.toLowerCase()))));}
function resetDrugForm(){['dr-id','dr-name','dr-brands','dr-cat','dr-adose','dr-cdose','dr-ci'].forEach(id=>{var el=document.getElementById(id);if(el)el.value='';});document.getElementById('drugModalTitle').textContent='Add Drug';}
function editDrug(id){
  var d=_drugs.find(x=>x.id===id);if(!d)return;
  document.getElementById('dr-id').value=d.id;
  document.getElementById('dr-name').value=d.generic_name||'';
  document.getElementById('dr-brands').value=(d.brand_names||[]).join(', ');
  document.getElementById('dr-cat').value=d.category||'';
  document.getElementById('dr-adose').value=d.standard_dose_adult||'';
  document.getElementById('dr-cdose').value=d.standard_dose_child||'';
  document.getElementById('dr-ci').value=d.contraindications||'';
  document.getElementById('drugModalTitle').textContent='Edit Drug';
  openModal('drugModal');
}
async function saveDrug(){
  var id=document.getElementById('dr-id').value;
  var body={generic_name:document.getElementById('dr-name').value.trim(),brand_names:document.getElementById('dr-brands').value.split(',').map(s=>s.trim()).filter(Boolean),category:document.getElementById('dr-cat').value.trim(),standard_dose_adult:document.getElementById('dr-adose').value.trim(),standard_dose_child:document.getElementById('dr-cdose').value.trim(),contraindications:document.getElementById('dr-ci').value.trim(),pregnancy_safe:document.getElementById('dr-preg').value};
  if(!body.generic_name){toast('Drug name required');return;}
  try{
    if(id){await api('drugs','?id=eq.'+id,'PATCH',body);}
    else{await api('drugs','','POST',body);}
    toast('✅ Drug saved!');closeModal('drugModal');loadDrugs();
  }catch(e){toast('❌ Error: '+e.message);}
}
async function delDrug(id){
  if(!confirm('Delete this drug?'))return;
  await api('drugs','?id=eq.'+id,'DELETE');
  toast('🗑️ Deleted');loadDrugs();
}

// ── DOCTORS ──
async function loadDoctors(){
  var data=await api('doctor_profiles','?order=created_at.desc&limit=200');
  _doctors=Array.isArray(data)?data:[];
  document.getElementById('docCount').textContent=_doctors.length+' registered doctors';
  renderDoctors(_doctors);
}
function renderDoctors(list){
  var tb=document.getElementById('doctorTbody');
  if(!list.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--tx3)">No doctors found</td></tr>';return;}
  tb.innerHTML=list.map(d=>`<tr>
    <td><div style="display:flex;align-items:center;gap:8px"><div class="av">${(d.full_name||'D')[0]}</div><div><div style="font-size:.76rem;font-weight:600;color:var(--tx)">${esc(d.full_name||'—')}</div><div style="font-size:.6rem;color:var(--tx3)">${esc(d.qualification||'')}</div></div></div></td>
    <td style="font-size:.7rem;color:var(--tx2)">${esc(d.email||'—')}</td>
    <td>${d.is_premium?'<span class="badge gd">👑 Premium</span>':d.is_admin?'<span class="badge bl">⚡ Admin</span>':'<span class="badge gray">Free</span>'}</td>
    <td><span style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--tx3)">${d.query_count||0}</span></td>
    <td style="font-size:.65rem;color:var(--tx3)">${d.created_at?new Date(d.created_at).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'}):'—'}</td>
    <td style="display:flex;gap:4px">
      ${!d.is_premium?`<button class="btn btn-gold btn-sm" onclick="grantPremium('${d.id}')">👑</button>`:`<button class="btn btn-danger btn-sm" onclick="revokePremium('${d.id}')">Revoke</button>`}
      <button class="btn btn-ghost btn-sm" onclick="toggleAdmin('${d.id}',${d.is_admin})">${d.is_admin?'−Admin':'+Admin'}</button>
    </td>
  </tr>`).join('');
}
function filterDoctors(q){renderDoctors(_doctors.filter(d=>!q||(d.full_name||'').toLowerCase().includes(q.toLowerCase())||(d.email||'').toLowerCase().includes(q.toLowerCase())));}
async function toggleAdmin(id,isAdmin){
  await api('doctor_profiles','?id=eq.'+id,'PATCH',{is_admin:!isAdmin});
  toast(isAdmin?'Admin removed':'Admin granted');loadDoctors();
}
async function grantPremium(id){
  var exp=new Date();exp.setFullYear(exp.getFullYear()+1);
  await api('doctor_profiles','?id=eq.'+id,'PATCH',{is_premium:true,premium_since:new Date().toISOString(),premium_expires:exp.toISOString()});
  toast('👑 Premium granted!');loadDoctors();loadPendingCount();
}
async function revokePremium(id){
  if(!confirm('Revoke premium?'))return;
  await api('doctor_profiles','?id=eq.'+id,'PATCH',{is_premium:false});
  toast('Premium revoked');loadDoctors();
}
async function grantById(){
  var email=document.getElementById('grantEmail').value.trim().toLowerCase();
  if(!email){toast('Enter email');return;}
  // Try case-insensitive search using ilike
  var docs=await api('doctor_profiles','?email=ilike.'+encodeURIComponent(email)+'&limit=5');
  if(!docs||!docs.length){
    // Try exact match as fallback
    docs=await api('doctor_profiles','?email=eq.'+encodeURIComponent(email)+'&limit=5');
  }
  if(!docs||!docs.length){
    // Try original casing
    var orig=document.getElementById('grantEmail').value.trim();
    docs=await api('doctor_profiles','?email=ilike.'+encodeURIComponent(orig)+'&limit=5');
  }
  if(!docs||!docs.length){toast('❌ Doctor not found. Make sure they have registered first.');return;}
  await grantPremium(docs[0].id);
  document.getElementById('grantEmail').value='';
  toast('👑 Premium granted to '+docs[0].full_name+'!');
}

// ── SUBSCRIPTIONS ──
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
