// ═══════════════════════════════════════════════
// navigation.js — Bottom nav, command palette,
// keyboard shortcuts, auto-lock, swipe, context menu,
// undo system, session log, achievements render
// ═══════════════════════════════════════════════

// ═══ PART 2: SMART UX & NAVIGATION ═══

// ── Bottom Navigation ──
function bnav(tab){
  document.querySelectorAll('.bnav-item').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById('bn-'+tab);
  if(el)el.classList.add('active');
  haptic('light');
  if(tab==='about'){
    const aboutTab=document.getElementById('tab-about');
    if(aboutTab)aboutTab.style.display='block';
    window.scrollTo(0,0);
  } else {
    const aboutTab=document.getElementById('tab-about');
    if(aboutTab)aboutTab.style.display='none';
    if(tab==='home'){
      const chat=document.getElementById('chat');
      if(chat)chat.scrollTop=chat.scrollHeight;
    } else {
      openSheet(tab);
      setTimeout(()=>{
        document.querySelectorAll('.bnav-item').forEach(el=>el.classList.remove('active'));
        document.getElementById('bn-home')?.classList.add('active');
      },300);
    }
  }
}
function initBottomNav(){
  updateBnavBadges();
}
function updateBnavBadges(){
  const ph=document.getElementById('bn-hist-badge');
  const pp=document.getElementById('bn-pts-badge');
  const hc=rxHist?.length||0;
  const pc=patients?.length||0;
  if(ph){ph.textContent=hc>99?'99+':hc;ph.classList.toggle('show',hc>0);}
  if(pp){pp.textContent=pc>99?'99+':pc;pp.classList.toggle('show',pc>0);}
}

// ── Command Palette ──
const CMD_COMMANDS=[
  {icon:'💊',label:'New Prescription',sub:'Start typing a diagnosis',action:()=>{document.getElementById('qi').focus();},kbd:'/'},
  {icon:'🌙',label:'Toggle Dark Mode',sub:'Switch light/dark',action:toggleDark},
  {icon:'👤',label:'Patients',sub:'View patient list',action:()=>openSheet('pts')},
  {icon:'🕒',label:'History',sub:'Prescription history',action:()=>openSheet('history')},
  {icon:'💉',label:'Drug Reference',sub:'Search drug database',action:()=>openSheet('drugs')},
  {icon:'🧮',label:'Calculators',sub:'BMI, eGFR, Peds dose...',action:()=>openSheet('calc')},
  {icon:'⚙️',label:'Settings',sub:'API key, preferences',action:()=>openSheet('settings')},
  {icon:'📤',label:'Export Data',sub:'Download all data as JSON',action:exportData},
  {icon:'🖨️',label:'Print Last Rx',sub:'Print the last prescription',action:()=>{const last=document.querySelector('.rxcard');if(last)printRxEl(last);else window.print();}},
  {icon:'🗑️',label:'Clear All Data',sub:'Delete everything (irreversible)',action:clearAll},
  {icon:'👶',label:'Child Mode',sub:'Switch to pediatric syrups',action:()=>setFlag('child')},
  {icon:'🤰',label:'Pregnancy Mode',sub:'Category B drugs only',action:()=>setFlag('preg')},
  {icon:'🧓',label:'Elderly Mode',sub:'Adjusted doses',action:()=>setFlag('elderly')},
  {icon:'👤',label:'Adult Mode',sub:'Standard prescribing',action:()=>setFlag('adult')},
];

// Quick diagnoses for command palette
const CMD_DIAGNOSES=[
  'URTI fever cough','UTI urinary tract infection','GERD acidity heartburn',
  'H.Pylori','Typhoid fever','Malaria','Hypertension','Diabetes mellitus type 2',
  'Asthma wheeze','IBS irritable bowel','Anxiety depression','Sore throat tonsillitis',
  'Diarrhea gastroenteritis','Constipation','Back pain muscle spasm',
];

let cmdSelectedIdx=0;
function openCmdPalette(){
  document.getElementById('cmdPalette').classList.add('show');
  document.getElementById('cmdInput').value='';
  document.getElementById('cmdInput').focus();
  renderCmdResults('');
  haptic('light');
}
function closeCmdPalette(){
  document.getElementById('cmdPalette').classList.remove('show');
}
function filterCmd(val){
  renderCmdResults(val.trim().toLowerCase());
  cmdSelectedIdx=0;
}
function renderCmdResults(q){
  const el=document.getElementById('cmdResults');
  if(!q){
    // Show default commands
    el.innerHTML=`<div class="cmd-group"><div class="cmd-group-label">Commands</div>`+
      CMD_COMMANDS.slice(0,6).map((c,i)=>`
        <div class="cmd-item${i===0?' selected':''}" onclick="runCmd(${i})">
          <div class="cmd-item-icon">${c.icon}</div>
          <div class="cmd-item-txt"><div class="cmd-item-label">${c.label}</div><div class="cmd-item-sub">${c.sub}</div></div>
          ${c.kbd?`<div class="cmd-item-kbd">${c.kbd}</div>`:''}
        </div>`).join('')+
      `</div><div class="cmd-group"><div class="cmd-group-label">Quick Diagnoses</div>`+
      CMD_DIAGNOSES.slice(0,5).map(d=>`
        <div class="cmd-item" onclick="cmdDiagnose('${d}')">
          <div class="cmd-item-icon">🔬</div>
          <div class="cmd-item-txt"><div class="cmd-item-label">${d}</div></div>
        </div>`).join('')+`</div>`;
    return;
  }
  const cmds=CMD_COMMANDS.filter(c=>c.label.toLowerCase().includes(q)||c.sub.toLowerCase().includes(q));
  const diags=CMD_DIAGNOSES.filter(d=>d.toLowerCase().includes(q));
  if(!cmds.length&&!diags.length){
    // treat as diagnosis query
    el.innerHTML=`<div class="cmd-group"><div class="cmd-group-label">Search</div>
      <div class="cmd-item selected" onclick="cmdDiagnose('${q}')">
        <div class="cmd-item-icon">🔬</div>
        <div class="cmd-item-txt"><div class="cmd-item-label">Prescribe for: ${q}</div><div class="cmd-item-sub">Generate prescription</div></div>
      </div></div>`;
    return;
  }
  el.innerHTML=
    (cmds.length?`<div class="cmd-group"><div class="cmd-group-label">Commands</div>`+cmds.map((c,i)=>`
      <div class="cmd-item${i===0?' selected':''}" onclick="runCmd(${CMD_COMMANDS.indexOf(c)})">
        <div class="cmd-item-icon">${c.icon}</div>
        <div class="cmd-item-txt"><div class="cmd-item-label">${c.label}</div><div class="cmd-item-sub">${c.sub}</div></div>
      </div>`).join('')+`</div>`:'')
    +(diags.length?`<div class="cmd-group"><div class="cmd-group-label">Diagnoses</div>`+diags.map(d=>`
      <div class="cmd-item" onclick="cmdDiagnose('${d}')">
        <div class="cmd-item-icon">🔬</div>
        <div class="cmd-item-txt"><div class="cmd-item-label">${d}</div></div>
      </div>`).join('')+`</div>`:'');
}
function runCmd(idx){
  closeCmdPalette();
  CMD_COMMANDS[idx]?.action();
}
function cmdDiagnose(q){
  closeCmdPalette();
  document.getElementById('qi').value=q;
  sendMsg();
}
function cmdKey(e){
  const items=document.querySelectorAll('#cmdResults .cmd-item');
  if(e.key==='ArrowDown'){cmdSelectedIdx=Math.min(cmdSelectedIdx+1,items.length-1);}
  else if(e.key==='ArrowUp'){cmdSelectedIdx=Math.max(cmdSelectedIdx-1,0);}
  else if(e.key==='Enter'){items[cmdSelectedIdx]?.click();return;}
  else if(e.key==='Escape'){closeCmdPalette();return;}
  items.forEach((el,i)=>el.classList.toggle('selected',i===cmdSelectedIdx));
  items[cmdSelectedIdx]?.scrollIntoView({block:'nearest'});
}
function initCommandPalette(){
  // "/" key opens palette when not in input
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&document.activeElement!==document.getElementById('qi')&&document.activeElement!==document.getElementById('cmdInput')){
      e.preventDefault();openCmdPalette();
    }
  });
}

// ── Keyboard Shortcuts ──
function initKeyboardShortcuts(){
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey){
      switch(e.key){
        case 'k':e.preventDefault();openCmdPalette();break;
        case 'p':e.preventDefault();window.print();break;
        case 'd':e.preventDefault();toggleDark();break;
        case 'n':e.preventDefault();document.getElementById('qi').focus();break;
      }
    }
  });
}

// ── Auto-Lock on Idle (5 min) ──
let idleTimer=null;
const IDLE_LIMIT=5*60*1000; // 5 minutes
function resetIdleTimer(){
  clearTimeout(idleTimer);
  idleTimer=setTimeout(showLockScreen,IDLE_LIMIT);
}
function showLockScreen(){
  // Only lock if PIN is enabled
  if(!localStorage.getItem('pin_enabled'))return;
  document.getElementById('lockScreen')?.classList.add('show');
}
function unlockSession(){
  const lock=document.getElementById('lockScreen');
  // If PIN enabled, show PIN overlay; else just unlock
  if(localStorage.getItem('pin_enabled')){
    lock?.classList.remove('show');
    document.getElementById('pinLock')?.classList.add('show');
  } else {
    lock?.classList.remove('show');
  }
  resetIdleTimer();
}
function initAutoLock(){
  ['click','touchstart','keydown','mousemove','scroll'].forEach(ev=>{
    document.addEventListener(ev,resetIdleTimer,{passive:true});
  });
  resetIdleTimer();
}

// ── Swipe Gestures ──
function initSwipeGestures(){
  let startX=0,startY=0,startT=0;
  const chat=document.getElementById('chat');
  if(!chat)return;
  chat.addEventListener('touchstart',e=>{
    startX=e.touches[0].clientX;
    startY=e.touches[0].clientY;
    startT=Date.now();
  },{passive:true});
  chat.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-startX;
    const dy=e.changedTouches[0].clientY-startY;
    const dt=Date.now()-startT;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>60&&dt<400){
      if(dx>0){
        // Swipe right → open patients
        openSheet('pts');haptic('light');
      } else {
        // Swipe left → open history
        openSheet('history');haptic('light');
      }
    }
    // Pull down to refresh = scroll to top + clear input
    if(dy>80&&Math.abs(dx)<30&&chat.scrollTop===0){
      document.getElementById('qi').value='';
      document.getElementById('qi').focus();
      toast('🔄 Ready for new prescription');
      haptic('medium');
    }
  },{passive:true});
}

// ── Context Menu (long press on prescription cards) ──
let ctxTarget=null;
let longPressTimer=null;
function initContextMenu(){
  document.addEventListener('contextmenu',e=>{e.preventDefault();});
  document.addEventListener('touchstart',e=>{
    const card=e.target.closest('.rxcard');
    if(!card)return;
    ctxTarget=card;
    longPressTimer=setTimeout(()=>{
      showCtxMenu(e.touches[0].clientX,e.touches[0].clientY,card);
    },600);
  },{passive:true});
  document.addEventListener('touchend',()=>clearTimeout(longPressTimer),{passive:true});
  document.addEventListener('touchmove',()=>clearTimeout(longPressTimer),{passive:true});
  // Close on outside click
  document.addEventListener('click',e=>{
    if(!e.target.closest('#ctxMenu'))hideCtxMenu();
  });
}
function showCtxMenu(x,y,card){
  haptic('medium');
  const menu=document.getElementById('ctxMenu');
  menu.classList.add('show');
  // Position near touch
  const mw=170,mh=180;
  const vw=window.innerWidth,vh=window.innerHeight;
  menu.style.left=Math.min(x,vw-mw-10)+'px';
  menu.style.top=Math.min(y,vh-mh-10)+'px';
}
function hideCtxMenu(){document.getElementById('ctxMenu')?.classList.remove('show');}
function ctxAction(action){
  hideCtxMenu();
  if(!ctxTarget)return;
  const btnWa=ctxTarget.querySelector('.bwa');
  const btnCp=ctxTarget.querySelector('.bcp');
  const btnSv=ctxTarget.querySelector('.bsv');
  switch(action){
    case 'copy':btnCp?.click();break;
    case 'share':btnWa?.click();break;
    case 'save':btnSv?.click();break;
    case 'print':window.print();break;
    case 'delete':
      const msgEl=ctxTarget.closest('.msg');
      if(msgEl){
        const html=msgEl.outerHTML;
        msgEl.remove();
        showUndoBar('Prescription deleted',()=>{
          const chat=document.getElementById('chat');
          const tmp=document.createElement('div');
          tmp.innerHTML=html;
          chat.appendChild(tmp.firstChild);
        });
      }
      break;
  }
}

// ── Undo System ──
let undoCallback=null;
let undoTimer=null;
function showUndoBar(msg,cb){
  undoCallback=cb;
  document.getElementById('undoMsg').textContent=msg;
  document.getElementById('undoBar').classList.add('show');
  clearTimeout(undoTimer);
  undoTimer=setTimeout(()=>{
    document.getElementById('undoBar').classList.remove('show');
    undoCallback=null;
  },5000);
}
function doUndo(){
  if(undoCallback){undoCallback();undoCallback=null;}
  document.getElementById('undoBar').classList.remove('show');
  toast('↩ Undone!');haptic('light');
}

// ── Session Log ──
const sessionLog=[];
function logSession(action){
  const now=new Date();
  const time=now.toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit',hour12:true});
  sessionLog.unshift({time,action});
  if(sessionLog.length>20)sessionLog.pop();
  loadSessionLog();
  updateBnavBadges();
}
function loadSessionLog(){
  const el=document.getElementById('sessionLog');
  if(!el)return;
  if(!sessionLog.length){el.innerHTML='<div style="font-size:.68rem;color:var(--tx2);padding:4px">No activity yet this session</div>';return;}
  el.innerHTML=sessionLog.map(l=>`
    <div class="slog-item">
      <div class="slog-time">${l.time}</div>
      <div class="slog-action">${l.action}</div>
    </div>`).join('');
}

// ── Achievements Render ──
function renderAchievements(){
  const el=document.getElementById('achList');
  if(!el)return;
  const earned=JSON.parse(localStorage.getItem('achievements')||'[]');
  if(!earned.length){el.innerHTML='<div style="font-size:.68rem;color:var(--tx2)">No achievements yet — keep prescribing! 💊</div>';return;}
  el.innerHTML=Object.entries(ACHIEVEMENTS).map(([key,ach])=>{
    const got=earned.includes(key);
    return `<div style="background:${got?'var(--sf2)':'rgba(0,0,0,.04)'};border:1px solid ${got?'var(--nv3)':'var(--bd)'};border-radius:8px;padding:5px 8px;font-size:.63rem;opacity:${got?'1':'.4'};display:flex;align-items:center;gap:5px">
      <span>${ach.icon}</span><span style="color:var(--tx);font-weight:${got?'600':'400'}">${ach.title}</span>
    </div>`;
  }).join('');
}

