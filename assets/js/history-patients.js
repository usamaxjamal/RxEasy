// ═══════════════════════════════════════════════
// history-patients.js — History, Favourites, Patients, Analytics
// ═══════════════════════════════════════════════

// ═══ HISTORY ═══
function addHist(q){
  const pt=document.getElementById('ptN').value.trim();
  const mode=flags.child?'Child':flags.preg?'Pregnant':flags.elderly?'Elderly':flags.renal?'Renal':flags.hepatic?'Hepatic':'Adult';
  rxHist.unshift({q,pt,flags:{...flags},mode,t:new Date().toLocaleDateString('en-PK')+' '+new Date().toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})});
  if(rxHist.length>60)rxHist.pop();
  localStorage.setItem('rxh',JSON.stringify(rxHist));
}
function renderHist(filter=''){
  const el=document.getElementById('histB');
  const list=filter?rxHist.filter(h=>h.q.toLowerCase().includes(filter.toLowerCase())||(h.pt||'').toLowerCase().includes(filter.toLowerCase())):rxHist;
  if(!list.length){el.innerHTML='<div style="color:var(--tx2);font-size:.74rem;text-align:center;padding:18px 0">'+(filter?'No results.':'No history yet.')+'</div>';return;}
  el.innerHTML=list.map((h,i)=>`<div class="li" onclick="replayH(${rxHist.indexOf(h)})"><div class="lt">${esc(h.q)}</div><div class="ls">${h.t}${h.pt?' · '+esc(h.pt):''}${h.mode?' · '+h.mode:''}</div></div>`).join('');
}
function searchHist(v){renderHist(v);}
function replayH(i){const h=rxHist[i];if(h.flags){Object.assign(flags,h.flags);['adult','child','elderly','preg','renal','hepatic'].forEach(n=>document.getElementById('f-'+n).classList.toggle('on',flags[n]));}document.getElementById('qi').value=h.q;closeSheet('history');sendMsg();}

// ═══ FAVS ═══
function saveFav(q){if(favs.some(f=>f.q===q)){toast('Already saved!');return;}favs.unshift({q,t:new Date().toLocaleDateString('en-PK')});localStorage.setItem('rxf',JSON.stringify(favs));toast('⭐ Saved!');}
function renderFavs(){
  const el=document.getElementById('favB');
  if(!favs.length){el.innerHTML='<div style="color:var(--tx2);font-size:.74rem;text-align:center;padding:18px 0">No saved prescriptions.<br>Tap ⭐ to save.</div>';return;}
  el.innerHTML=favs.map((f,i)=>`<div class="li" style="display:flex;justify-content:space-between;align-items:center"><div onclick="replayF(${i})" style="flex:1"><div class="lt">${esc(f.q)}</div><div class="ls">${f.t}</div></div><button onclick="event.stopPropagation();delFav(${i})" style="background:none;border:none;color:var(--rd);font-size:.9rem;cursor:pointer;padding:4px">🗑️</button></div>`).join('');
}
function delFav(i){favs.splice(i,1);localStorage.setItem('rxf',JSON.stringify(favs));renderFavs();}
function replayF(i){document.getElementById('qi').value=favs[i].q;closeSheet('favs');sendMsg();}

// ═══ PATIENTS ═══
function renderPts(){
  const el=document.getElementById('ptsB');
  if(!patients.length){el.innerHTML='<div style="color:var(--tx2);font-size:.74rem;text-align:center;padding:18px 0">No patients saved.<br>Tap + Add to save a patient.</div>';return;}
  el.innerHTML=patients.map((p,i)=>`<div class="pt-card"><div style="display:flex;justify-content:space-between"><div onclick="loadPt(${i})" style="flex:1"><div class="pt-nm">${esc(p.name)}</div><div class="pt-dt">${esc([p.age?p.age+'y':'',p.gender||'',p.conditions||''].filter(Boolean).join(' · '))}</div>${p.allergies?`<div class="pt-dt" style="color:var(--rd);margin-top:2px">⚠️ ${esc(p.allergies)}</div>`:''}</div><button onclick="delPt(${i})" style="background:none;border:none;color:var(--rd);font-size:.88rem;cursor:pointer">🗑️</button></div></div>`).join('');
}
function addPt(){
  const name=prompt('Patient Name:');if(!name)return;
  const age=prompt('Age:');const gender=prompt('Gender (M/F):');
  const conditions=prompt('Chronic conditions (e.g. DM, HTN):');
  const allergies=prompt('Allergies (e.g. Penicillin):');
  patients.unshift({name:name.trim(),age,gender,conditions,allergies});
  localStorage.setItem('rxp',JSON.stringify(patients));renderPts();toast('✅ Patient saved!');
}
function loadPt(i){
  const p=patients[i];
  document.getElementById('ptN').value=p.name;
  if(p.age)document.getElementById('ptA').value=p.age;
  if(p.allergies)document.getElementById('alg').value=p.allergies;
  autoChildMode();closeSheet('pts');toast('👤 '+p.name+' loaded');
}
function delPt(i){patients.splice(i,1);localStorage.setItem('rxp',JSON.stringify(patients));renderPts();}

// ═══ ANALYTICS ═══
function renderAnalytics(){
  const el=document.getElementById('analyticsB');
  const today=new Date().toLocaleDateString('en-PK');
  const todayC=rxHist.filter(h=>h.t.startsWith(today)).length;
  const modeC={};rxHist.forEach(h=>{const m=h.mode||'Adult';modeC[m]=(modeC[m]||0)+1;});
  const condC={};rxHist.forEach(h=>{condC[h.q]=(condC[h.q]||0)+1;});
  const top=Object.entries(condC).sort((a,b)=>b[1]-a[1]).slice(0,8);
  let html=`<div class="stat-row"><div class="stat-card"><div class="stat-val">${todayC}</div><div class="stat-lbl">Today</div></div><div class="stat-card"><div class="stat-val">${rxHist.length}</div><div class="stat-lbl">Total Rx</div></div><div class="stat-card"><div class="stat-val">${favs.length}</div><div class="stat-lbl">Saved</div></div><div class="stat-card"><div class="stat-val">${patients.length}</div><div class="stat-lbl">Patients</div></div></div>`;
  if(top.length){
    html+='<div style="font-size:.66rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px">Top Conditions</div>';
    top.forEach(([q,c])=>{const pct=rxHist.length?Math.round(c/rxHist.length*100):0;html+=`<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:.72rem;margin-bottom:2px"><span>${esc(q.length>38?q.slice(0,38)+'…':q)}</span><span style="color:var(--nv2);font-weight:600">${c}</span></div><div style="background:var(--bd);border-radius:3px;height:4px;overflow:hidden"><div style="width:${pct}%;background:var(--nv2);height:100%;border-radius:3px"></div></div></div>`;});
  }
  if(Object.keys(modeC).length){
    html+='<div style="font-size:.66rem;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px">Patient Types</div>';
    Object.entries(modeC).forEach(([m,c])=>{html+=`<div style="display:flex;justify-content:space-between;font-size:.72rem;padding:4px 0;border-bottom:1px solid var(--bd)"><span>${m}</span><span style="color:var(--nv2);font-weight:600">${c}</span></div>`;});
  }
  el.innerHTML=html;
}
