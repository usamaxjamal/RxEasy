// ═══════════════════════════════════════════════
// clinic-management.js — Clinic management features
// Stats dashboard, token/queue system, revenue tracker,
// patient satisfaction, appointment calendar
// ═══════════════════════════════════════════════

// ═══ PART 4: CLINIC MANAGEMENT ═══

// ─────────────────────────────
// 1. STATS DASHBOARD
// ─────────────────────────────
function openStatsSheet(){
  openSheet('stats');
  setTimeout(()=>{renderStats();renderHeatmap();renderTopDiags();},100);
}

function animateCount(el,target,prefix='',suffix='',dur=900){
  const start=0;const step=target/60;let cur=0;
  const t=setInterval(()=>{
    cur=Math.min(cur+step,target);
    el.textContent=prefix+Math.floor(cur).toLocaleString()+suffix;
    if(cur>=target)clearInterval(t);
  },dur/60);
}

function renderStats(){
  const el=document.getElementById('statsGrid');
  if(!el)return;
  const rxCount=parseInt(localStorage.getItem('rxCount')||'0');
  const pts=patients?.length||0;
  const favs_count=favs?.length||0;
  const revEntries=JSON.parse(localStorage.getItem('revEntries')||'[]');
  const todayStr=new Date().toDateString();
  const todayRev=revEntries.filter(e=>new Date(e.ts).toDateString()===todayStr).reduce((s,e)=>s+e.amt,0);
  const todayRx=JSON.parse(localStorage.getItem('dailyRx')||'{}')[todayStr]||0;
  const sessMin=Math.floor((Date.now()-sessionStart)/60000);

  el.innerHTML=`
    <div class="stat-big">
      <div class="stat-num" id="sn1">0</div>
      <div class="stat-lbl">Total Prescriptions</div>
      <div class="stat-ico">💊</div>
      <div class="stat-trend up">All time</div>
    </div>
    <div class="stat-big">
      <div class="stat-num" id="sn2">0</div>
      <div class="stat-lbl">Patients</div>
      <div class="stat-ico">👤</div>
      <div class="stat-trend up">Saved</div>
    </div>
    <div class="stat-big">
      <div class="stat-num" id="sn3">0</div>
      <div class="stat-lbl">Today's Rx</div>
      <div class="stat-ico">📋</div>
      <div class="stat-trend up">Today</div>
    </div>
    <div class="stat-big">
      <div class="stat-num" id="sn4">0</div>
      <div class="stat-lbl">Today's Revenue</div>
      <div class="stat-ico">💰</div>
      <div class="stat-trend up">Rs. today</div>
    </div>
    <div class="stat-big">
      <div class="stat-num" id="sn5">0</div>
      <div class="stat-lbl">Favourites Saved</div>
      <div class="stat-ico">⭐</div>
    </div>
    <div class="stat-big">
      <div class="stat-num" id="sn6">0</div>
      <div class="stat-lbl">Session (mins)</div>
      <div class="stat-ico">⏱</div>
    </div>`;
  setTimeout(()=>{
    animateCount(document.getElementById('sn1'),rxCount);
    animateCount(document.getElementById('sn2'),pts);
    animateCount(document.getElementById('sn3'),todayRx);
    animateCount(document.getElementById('sn4'),todayRev,'Rs. ');
    animateCount(document.getElementById('sn5'),favs_count);
    animateCount(document.getElementById('sn6'),sessMin);
  },100);
}

function renderHeatmap(){
  const grid=document.getElementById('heatmapGrid');
  const months=document.getElementById('hmMonths');
  if(!grid)return;
  const daily=JSON.parse(localStorage.getItem('dailyRx')||'{}');
  const days=84; // 12 weeks
  const cells=[];
  const now=new Date();
  const monthLabels={};
  for(let i=days-1;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);
    const key=d.toDateString();
    const count=daily[key]||0;
    const level=count===0?0:count<=2?1:count<=4?2:count<=6?3:4;
    cells.push(`<div class="hm-day hm-${level}" title="${key}: ${count} Rx"></div>`);
    if(d.getDate()===1||i===days-1){
      const mIdx=Math.floor((days-1-i)/7);
      monthLabels[mIdx]=d.toLocaleDateString('en',{month:'short'});
    }
  }
  grid.innerHTML=cells.join('');
  // Month labels
  const mArr=Array(12).fill('');
  Object.entries(monthLabels).forEach(([i,m])=>mArr[Math.min(parseInt(i),11)]=m);
  months.innerHTML=mArr.map(m=>`<span>${m}</span>`).join('');
}

function renderTopDiags(){
  const hist=rxHist||[];
  const diagCount={};
  hist.forEach(h=>{if(h.q){const k=h.q.split(' ')[0];diagCount[k]=(diagCount[k]||0)+1;}});
  const sorted=Object.entries(diagCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const max=sorted[0]?.[1]||1;
  const el=document.getElementById('topDiags');
  if(el){
    if(!sorted.length){el.innerHTML='<div style="font-size:.68rem;color:var(--tx2)">No history yet</div>';return;}
    el.innerHTML=sorted.map(([k,v])=>`
      <div style="margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;font-size:.68rem;margin-bottom:2px">
          <span style="color:var(--tx);font-weight:500">${esc(k)}</span>
          <span style="color:var(--tx2)">${v}x</span>
        </div>
        <div style="height:5px;background:var(--bd);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${(v/max*100).toFixed(0)}%;background:linear-gradient(90deg,var(--nv2),var(--nv3));border-radius:3px;transition:width .6s ease"></div>
        </div>
      </div>`).join('');
  }
  // Top drugs from history text
  const drugEl=document.getElementById('topDrugs');
  const drugCount={};
  const commonDrugs=['Paracetamol','Augmentin','Amoxil','Flagyl','Risek','Panadol','Brufen','Cefspan','Azithromycin','Metronidazole','Omeprazole','Ciprofloxacin','Levofloxacin','Domperidone'];
  hist.forEach(h=>{
    if(h.rx){commonDrugs.forEach(d=>{if(h.rx.toLowerCase().includes(d.toLowerCase()))drugCount[d]=(drugCount[d]||0)+1;});}
  });
  const sortedDrugs=Object.entries(drugCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(drugEl){
    if(!sortedDrugs.length){drugEl.innerHTML='<div style="font-size:.68rem;color:var(--tx2)">No data yet</div>';return;}
    const dmax=sortedDrugs[0]?.[1]||1;
    drugEl.innerHTML=sortedDrugs.map(([k,v])=>`
      <div style="margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;font-size:.68rem;margin-bottom:2px">
          <span style="color:var(--tx);font-weight:500">💊 ${esc(k)}</span>
          <span style="color:var(--tx2)">${v}x</span>
        </div>
        <div style="height:5px;background:var(--bd);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${(v/dmax*100).toFixed(0)}%;background:linear-gradient(90deg,var(--tl),var(--tl2));border-radius:3px;transition:width .6s ease"></div>
        </div>
      </div>`).join('');
  }
}

// Track daily Rx count
function trackDailyRx(){
  const daily=JSON.parse(localStorage.getItem('dailyRx')||'{}');
  const key=new Date().toDateString();
  daily[key]=(daily[key]||0)+1;
  localStorage.setItem('dailyRx',JSON.stringify(daily));
}

// ─────────────────────────────
// 2. TOKEN / QUEUE SYSTEM
// ─────────────────────────────
let tokenQueue=JSON.parse(localStorage.getItem('tokenQueue')||'[]');
let tokenCurrent=parseInt(localStorage.getItem('tokenCurrent')||'0');
let tokenDone=parseInt(localStorage.getItem('tokenDone')||'0');

function saveQueue(){
  localStorage.setItem('tokenQueue',JSON.stringify(tokenQueue));
  localStorage.setItem('tokenCurrent',tokenCurrent);
  localStorage.setItem('tokenDone',tokenDone);
}

function renderQueue(){
  const el=document.getElementById('tokenQueueList');
  const cur=document.getElementById('tokenCurrent');
  const curName=document.getElementById('tokenCurrentName');
  const doneEl=document.getElementById('tokenDoneCount');
  if(doneEl)doneEl.textContent=tokenDone;
  if(cur)cur.textContent=tokenCurrent||'—';
  const active=tokenQueue.find(t=>t.status==='now');
  if(curName)curName.textContent=active?active.name:'No active patient';
  if(!el)return;
  if(!tokenQueue.length){el.innerHTML='<div style="font-size:.68rem;color:var(--tx2);padding:6px">Queue is empty — add patients</div>';return;}
  el.innerHTML=tokenQueue.map((t,i)=>`
    <div class="token-item">
      <div class="token-n">${t.num}</div>
      <div class="token-name">${esc(t.name)}</div>
      <div class="token-time">${t.time}</div>
      <div class="token-status ts-${t.status}">${t.status==='wait'?'Waiting':t.status==='next'?'Next Up':t.status==='now'?'Now':t.status==='done'?'✓ Done':''}</div>
      ${t.status!=='done'?`<button onclick="removeToken(${i})" style="background:none;border:none;color:var(--tx2);cursor:pointer;font-size:.75rem">✕</button>`:''}
    </div>`).join('');
}

function addTokenPrompt(){
  const name=prompt('Patient name:');
  if(!name)return;
  const num=tokenQueue.length+tokenDone+1;
  const time=new Date().toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit',hour12:true});
  // First in queue gets 'next' status
  const status=tokenQueue.filter(t=>t.status!=='done').length===0?'next':'wait';
  tokenQueue.push({num,name:name.trim(),time,status});
  saveQueue();renderQueue();
  toast('✅ Token #'+num+' added for '+name);
  haptic('success');
}

function nextToken(){
  // Mark current 'now' as done
  const nowIdx=tokenQueue.findIndex(t=>t.status==='now');
  if(nowIdx>=0){tokenQueue[nowIdx].status='done';tokenDone++;}
  // Find next
  const nextIdx=tokenQueue.findIndex(t=>t.status==='next'||t.status==='wait');
  if(nextIdx>=0){
    tokenQueue[nextIdx].status='now';
    tokenCurrent=tokenQueue[nextIdx].num;
    // Mark following as 'next'
    const afterIdx=tokenQueue.findIndex((t,i)=>i>nextIdx&&t.status==='wait');
    if(afterIdx>=0)tokenQueue[afterIdx].status='next';
    haptic('double');
    toast('🎫 Now serving: '+tokenQueue[nextIdx].name);
  } else {
    tokenCurrent=0;
    toast('✅ Queue complete! All patients seen.');
  }
  saveQueue();renderQueue();
}

function removeToken(i){
  tokenQueue.splice(i,1);
  saveQueue();renderQueue();
}

function resetQueue(){
  if(!confirm('Reset today\'s queue?'))return;
  tokenQueue=[];tokenCurrent=0;tokenDone=0;
  saveQueue();renderQueue();
  toast('🔄 Queue reset');
}

// ─────────────────────────────
// 3. REVENUE TRACKER
// ─────────────────────────────
let revEntries=JSON.parse(localStorage.getItem('revEntries')||'[]');

function addRevEntry(){
  const type=document.getElementById('rev_type').value;
  const amt=parseFloat(document.getElementById('rev_amt').value);
  const note=document.getElementById('rev_note').value.trim();
  if(!amt||amt<=0){toast('Enter a valid amount');return;}
  revEntries.push({type,amt,note,ts:Date.now()});
  localStorage.setItem('revEntries',JSON.stringify(revEntries));
  document.getElementById('rev_amt').value='';
  document.getElementById('rev_note').value='';
  renderRevenue();
  toast('💰 Rs. '+amt+' added!');
  haptic('success');
}

function deleteRevEntry(i){
  const entry=revEntries[i];
  revEntries.splice(i,1);
  localStorage.setItem('revEntries',JSON.stringify(revEntries));
  renderRevenue();
  showUndoBar('Entry deleted',()=>{revEntries.splice(i,0,entry);localStorage.setItem('revEntries',JSON.stringify(revEntries));renderRevenue();});
}

function renderRevenue(){
  const now=new Date();
  const todayStr=now.toDateString();
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay());
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);

  const today=revEntries.filter(e=>new Date(e.ts).toDateString()===todayStr).reduce((s,e)=>s+e.amt,0);
  const week=revEntries.filter(e=>new Date(e.ts)>=weekStart).reduce((s,e)=>s+e.amt,0);
  const month=revEntries.filter(e=>new Date(e.ts)>=monthStart).reduce((s,e)=>s+e.amt,0);
  const total=revEntries.reduce((s,e)=>s+e.amt,0);

  const fmt=n=>'Rs. '+n.toLocaleString();
  const setT=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=fmt(v);};
  setT('revTodayAmt',today);setT('revWeekAmt',week);setT('revMonthAmt',month);setT('revTotalAmt',total);

  const el=document.getElementById('revEntries');
  if(!el)return;
  const recent=revEntries.slice(-20).reverse();
  if(!recent.length){el.innerHTML='<div style="font-size:.68rem;color:var(--tx2)">No entries yet</div>';return;}
  el.innerHTML=recent.map((e,i)=>{
    const ri=revEntries.length-1-i;
    const d=new Date(e.ts).toLocaleDateString('en-PK',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:true});
    return `<div class="rev-entry">
      <div class="rev-entry-type">${esc(e.type)}</div>
      <div class="rev-entry-note">${esc(e.note||d)}</div>
      <div class="rev-entry-amt">Rs. ${e.amt.toLocaleString()}</div>
      <button class="rev-entry-del" onclick="deleteRevEntry(${ri})">🗑️</button>
    </div>`;
  }).join('');
}

// ─────────────────────────────
// 4. PATIENT SATISFACTION
// ─────────────────────────────
let satRatings=JSON.parse(localStorage.getItem('satRatings')||'[]');
const SAT_LABELS=['','Very Poor 😞','Poor 😕','Okay 😐','Good 😊','Excellent 🤩'];
const SAT_MSGS=['','We\'re sorry to hear that. We\'ll strive to improve.','Thank you for your feedback. We\'ll work harder.','Thank you! We hope to serve you better next time.','Great! We\'re glad you had a good experience.','Wonderful! Your satisfaction means everything to us! 🙏'];

function rateSat(score){
  document.querySelectorAll('.sat-emoji').forEach((el,i)=>el.classList.toggle('sel',i+1===score));
  haptic(score>=4?'success':'medium');
  const el=document.getElementById('satResult');
  el.innerHTML=`<div style="color:var(--tl);font-weight:600;margin-bottom:4px">${SAT_LABELS[score]}</div><div>${SAT_MSGS[score]}</div>`;
  // Save after brief delay
  setTimeout(()=>{
    satRatings.push({score,ts:Date.now(),patient:document.getElementById('ptN').value||'Anonymous'});
    localStorage.setItem('satRatings',JSON.stringify(satRatings));
    renderSatStats();
    logSession('😊 Satisfaction rating: '+SAT_LABELS[score]);
  },500);
}

function renderSatStats(){
  const el=document.getElementById('satStats');
  if(!el||!satRatings.length)return;
  const avg=(satRatings.reduce((s,r)=>s+r.score,0)/satRatings.length).toFixed(1);
  const dist=[1,2,3,4,5].map(s=>({s,c:satRatings.filter(r=>r.score===s).length}));
  const max=Math.max(...dist.map(d=>d.c))||1;
  el.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="font-size:2rem;font-weight:700;color:var(--nv2)">${avg}</div>
      <div>
        <div style="font-size:.65rem;color:var(--tx);font-weight:600">${avg>=4.5?'Excellent':avg>=4?'Very Good':avg>=3?'Good':avg>=2?'Fair':'Needs Work'}</div>
        <div style="font-size:.6rem;color:var(--tx2)">${satRatings.length} ratings</div>
      </div>
    </div>
    ${dist.reverse().map(d=>`
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <div style="font-size:.75rem;width:20px">${['😞','😕','😐','😊','🤩'][d.s-1]}</div>
        <div style="flex:1;height:8px;background:var(--bd);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${(d.c/max*100).toFixed(0)}%;background:linear-gradient(90deg,var(--nv2),var(--tl2));border-radius:4px"></div>
        </div>
        <div style="font-size:.6rem;color:var(--tx2);width:16px;text-align:right">${d.c}</div>
      </div>`).join('')}`;
}

// ─────────────────────────────
// 5. APPOINTMENT CALENDAR
// ─────────────────────────────
let apptDate=new Date();
let appointments=JSON.parse(localStorage.getItem('appointments')||'{}');
const APPT_TIMES=['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

function apptNavDay(d){apptDate.setDate(apptDate.getDate()+d);renderApptCalendar();}

function renderApptCalendar(){
  const dateKey=apptDate.toDateString();
  const label=apptDate.toLocaleDateString('en-PK',{weekday:'long',day:'numeric',month:'long'});
  const el=document.getElementById('apptDateLabel');
  if(el)el.textContent=label;
  const slots=document.getElementById('apptSlots');
  if(!slots)return;
  const dayAppts=appointments[dateKey]||{};
  slots.innerHTML=APPT_TIMES.map(t=>{
    const appt=dayAppts[t];
    return `<div class="appt-slot${appt?' booked':''}" onclick="toggleAppt('${t}')">
      <div class="slot-time">${t}</div>
      <div class="slot-patient">${appt?esc(appt.name):'Available'}</div>
      <div class="slot-status ${appt?'slot-taken':'slot-free'}">${appt?'● Booked':'○ Free'}</div>
    </div>`;
  }).join('');
  renderUpcomingAppts();
}

function toggleAppt(time){
  const dateKey=apptDate.toDateString();
  if(!appointments[dateKey])appointments[dateKey]={};
  if(appointments[dateKey][time]){
    if(confirm('Remove appointment for '+time+'?')){
      delete appointments[dateKey][time];
      if(!Object.keys(appointments[dateKey]).length)delete appointments[dateKey];
    }
  } else {
    const name=prompt('Patient name for '+time+':');
    if(!name)return;
    appointments[dateKey][time]={name:name.trim(),note:''};
    haptic('success');toast('📅 '+name+' booked at '+time);
  }
  localStorage.setItem('appointments',JSON.stringify(appointments));
  renderApptCalendar();
}

function addApptPrompt(){
  const time=prompt('Time (e.g. 09:00):');
  if(!time)return;
  toggleAppt(time);
}

function renderUpcomingAppts(){
  const el=document.getElementById('apptUpcoming');
  if(!el)return;
  const now=new Date();
  const upcoming=[];
  Object.entries(appointments).forEach(([dateStr,slots])=>{
    const d=new Date(dateStr);
    if(d>=new Date(now.toDateString())){
      Object.entries(slots).forEach(([t,a])=>{
        upcoming.push({date:dateStr,time:t,name:a.name});
      });
    }
  });
  upcoming.sort((a,b)=>new Date(a.date+' '+a.time)-new Date(b.date+' '+b.time));
  if(!upcoming.length){el.innerHTML='<div style="font-size:.68rem;color:var(--tx2)">No upcoming appointments</div>';return;}
  el.innerHTML=upcoming.slice(0,10).map(a=>`
    <div style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:7px 10px;margin-bottom:5px;display:flex;align-items:center;gap:8px">
      <div style="font-size:1rem">📅</div>
      <div style="flex:1">
        <div style="font-size:.74rem;font-weight:600;color:var(--tx)">${esc(a.name)}</div>
        <div style="font-size:.62rem;color:var(--tx2)">${a.date} · ${a.time}</div>
      </div>
    </div>`).join('');
  // ── Daily tracking
  trackDailyRx();
  // Auto-prompt satisfaction after every 5th prescription
  const rxCount=parseInt(localStorage.getItem('rxCount')||'0');
  if(rxCount>0&&rxCount%5===0){
    setTimeout(()=>{
      toast('😊 Tip: Ask patient to rate their experience!',3500);
    },2000);
  }
}
// ── Add Part 4 commands to palette ──
CMD_COMMANDS.push(
  {icon:'📊',label:'Clinic Dashboard',sub:'Stats, heatmap, top diagnoses',action:openStatsSheet},
  {icon:'🎫',label:'Patient Queue',sub:'Token & queue management',action:()=>{renderQueue();openSheet('token');}},
  {icon:'💰',label:'Revenue Tracker',sub:'Log consultation fees',action:()=>{renderRevenue();openSheet('revenue');}},
  {icon:'😊',label:'Patient Satisfaction',sub:'Emoji rating system',action:()=>{renderSatStats();openSheet('satisfaction');}},
  {icon:'📅',label:'Appointments',sub:'Book & manage slots',action:()=>{renderApptCalendar();openSheet('calendar');}},
);

// ── Add Part 4 to init ──
document.addEventListener('DOMContentLoaded',()=>{
  // Reload revenue on open
  revEntries=JSON.parse(localStorage.getItem('revEntries')||'[]');
  satRatings=JSON.parse(localStorage.getItem('satRatings')||'[]');
  tokenQueue=JSON.parse(localStorage.getItem('tokenQueue')||'[]');
});

// ── Add quick access buttons to welcome card ──
// Inject stats button to header
document.addEventListener('DOMContentLoaded',()=>{
  // Add stats icon to header actions
  const hacts=document.querySelector('.hacts');
  if(hacts){
    const statsBtn=document.createElement('div');
    statsBtn.className='ib';statsBtn.title='Dashboard';statsBtn.textContent='📊';
    statsBtn.onclick=openStatsSheet;
    const tokenBtn=document.createElement('div');
    tokenBtn.className='ib';tokenBtn.title='Queue';tokenBtn.textContent='🎫';
    tokenBtn.onclick=()=>{renderQueue();openSheet('token');};
    hacts.insertBefore(statsBtn,hacts.firstChild);
    hacts.insertBefore(tokenBtn,hacts.children[1]);
  }
});

