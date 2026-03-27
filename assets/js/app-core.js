// ═══════════════════════════════════════════════
// app-core.js — App state, init, PIN, flags, sheets
// ═══════════════════════════════════════════════

// ═══ APP STATE ═══
let flags={adult:true,child:false,elderly:false,preg:false,renal:false,hepatic:false};
let rxHist=[],favs=[],patients=[],recog=null,isListening=false,pinEntry='';

// ═══ INIT ═══
window.onload=()=>{
  const pin=localStorage.getItem('app_pin');
  const pinOn=localStorage.getItem('pin_enabled')==='1';
  if(pinOn&&pin)document.getElementById('pinLock').classList.add('show');
  const k=localStorage.getItem('gkey');
  if(k){
    const el1=document.getElementById('k1');if(el1)el1.value=k;
    const el2=document.getElementById('k2');if(el2)el2.value=k;
    const ac=document.getElementById('ac');if(ac)ac.style.display='none';
  }
  updateModelBadge();
  if(localStorage.getItem('dark')==='1'){document.body.classList.add('dark');document.getElementById('dkT').checked=true;document.getElementById('dkBtn').textContent='☀️';}
  const h=localStorage.getItem('rxh');if(h)rxHist=JSON.parse(h);
  const f=localStorage.getItem('rxf');if(f)favs=JSON.parse(f);
  const p=localStorage.getItem('rxp');if(p)patients=JSON.parse(p);
  const al=localStorage.getItem('alg');if(al)document.getElementById('alg').value=al;
  ['urT','invT','altT','inT','rfT','qtyT','acmT'].forEach(id=>{
    const sv=localStorage.getItem(id);
    if(sv!==null)document.getElementById(id).checked=sv==='1';
    document.getElementById(id).addEventListener('change',e=>localStorage.setItem(id,e.target.checked?'1':'0'));
  });
  document.getElementById('alg').addEventListener('input',e=>localStorage.setItem('alg',e.target.value));
  renderDrugs(DRUGS);
};

// ═══ PIN ═══
function pk(k){
  const stored=localStorage.getItem('app_pin');
  if(k==='clr')pinEntry='';
  else if(k==='del')pinEntry=pinEntry.slice(0,-1);
  else if(pinEntry.length<4)pinEntry+=k;
  updPD();
  if(pinEntry.length===4){
    if(pinEntry===stored){document.getElementById('pinLock').classList.remove('show');pinEntry='';updPD();}
    else{document.getElementById('pinErr').textContent='Wrong PIN';setTimeout(()=>{pinEntry='';updPD();document.getElementById('pinErr').textContent='';},800);}
  }
}
function updPD(){for(let i=0;i<4;i++)document.getElementById('pd'+i).classList.toggle('filled',i<pinEntry.length);}
function togglePin(){const on=document.getElementById('pinT').checked;document.getElementById('pinSetup').style.display=on?'block':'none';if(!on){localStorage.removeItem('app_pin');localStorage.setItem('pin_enabled','0');}}
function savePin(){const p=document.getElementById('pinInp').value;if(p.length!==4||isNaN(p)){toast('Enter 4-digit PIN');return;}localStorage.setItem('app_pin',p);localStorage.setItem('pin_enabled','1');document.getElementById('pinInp').value='';toast('✅ PIN set!');closeSheet('settings');}

// ═══ FLAGS ═══
function setFlag(f){
  if(['adult','child','elderly'].includes(f)){['adult','child','elderly'].forEach(n=>flags[n]=false);flags[f]=true;}
  else flags[f]=!flags[f];
  ['adult','child','elderly','preg','renal','hepatic'].forEach(n=>document.getElementById('f-'+n).classList.toggle('on',flags[n]));
  if(f==='child')toast(flags.child?'👶 Child mode ON — syrups only!':'👤 Adult mode');
  if(f==='preg')toast(flags.preg?'🤰 Pregnant — Category B drugs only':'🤰 Pregnant OFF');
  if(f==='renal')toast(flags.renal?'🫘 Renal mode ON':'🫘 Renal OFF');
  if(f==='hepatic')toast(flags.hepatic?'🫀 Hepatic mode ON':'🫀 Hepatic OFF');
}
function autoChildMode(){
  if(!document.getElementById('acmT').checked)return;
  const age=parseInt(document.getElementById('ptA').value);
  if(!isNaN(age)&&age>0&&age<12&&!flags.child){
    flags.adult=false;flags.child=true;flags.elderly=false;
    ['adult','child','elderly'].forEach(n=>document.getElementById('f-'+n).classList.toggle('on',flags[n]));
    toast('👶 Auto child mode — age '+age+'y → syrups');
  }else if(!isNaN(age)&&age>=12&&flags.child){
    flags.child=false;flags.adult=true;
    ['adult','child','elderly'].forEach(n=>document.getElementById('f-'+n).classList.toggle('on',flags[n]));
  }
}

// ═══ DARK MODE ═══
function showAbout(){
  var aboutTab = document.getElementById('tab-about');
  if(aboutTab){
    aboutTab.style.display='block';
    window.scrollTo(0,0);
  }
}

function doLogout(){
  if(!confirm('Logout from RxEasy?')) return;
  localStorage.removeItem('sb_session');
  localStorage.removeItem('rx_qc');
  window.location.href='login.html';
}

function uploadAvatar(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var avatar = document.getElementById('docAvatar');
    if (avatar) {
      avatar.style.backgroundImage = 'url('+e.target.result+')';
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
      avatar.style.fontSize = '0';
    }
    localStorage.setItem('rx_avatar', e.target.result);
    toast('✅ Profile photo updated!');
  };
  reader.readAsDataURL(file);
}

// Restore saved avatar on load
(function(){
  var saved = localStorage.getItem('rx_avatar');
  if(saved){
    document.addEventListener('DOMContentLoaded', function(){
      var av = document.getElementById('docAvatar');
      if(av){
        av.style.backgroundImage='url('+saved+')';
        av.style.backgroundSize='cover';
        av.style.backgroundPosition='center';
        av.textContent='';
        av.style.fontSize='0';
      }
    });
  }
})();

// Load saved avatar
(function() {
  var saved = localStorage.getItem('rx_avatar');
  if (saved) {
    document.addEventListener('DOMContentLoaded', function() {
      var avatar = document.getElementById('docAvatar');
      if (avatar) {
        avatar.style.backgroundImage = 'url('+saved+')';
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
      }
    });
  }
})();

function doLogout_old(){
  if(confirm('Logout from RxEasy?')){
    localStorage.removeItem('sb_session');
    window.location.href='login.html';
  }
}
function toggleDark(){}

// ═══ SHEETS ═══
// ACC-01 FIX: openSheet and closeSheet now manage ARIA attributes so screen
// readers know when a dialog is open. Focus is moved into the sheet when
// opened and returned to the trigger element when closed.
let _sheetLastFocus = null;
function openSheet(n){
  if(n==='history')renderHist();
  if(n==='favs')renderFavs();
  if(n==='analytics')renderAnalytics();
  if(n==='pts')renderPts();
  const ov = document.getElementById('ov-'+n);
  ov.classList.add('show');
  ov.setAttribute('aria-hidden','false');
  const sheet = ov.querySelector('.sheet');
  if(sheet){
    sheet.setAttribute('role','dialog');
    sheet.setAttribute('aria-modal','true');
  }
  _sheetLastFocus = document.activeElement;
  // Move focus to the close button inside the sheet
  const closeBtn = ov.querySelector('.shdc');
  if(closeBtn) setTimeout(()=>closeBtn.focus(), 50);
}
function closeSheet(n){
  const ov = document.getElementById('ov-'+n);
  ov.classList.remove('show');
  ov.setAttribute('aria-hidden','true');
  if(_sheetLastFocus) _sheetLastFocus.focus();
}

// ─── SNAP DX RETURN HANDLER ───────────────────────────────────
// When a doctor hits "Open in Prescribe" from snap-dx.html,
// the diagnosis is stored in localStorage('snapdx_pending').
// We pick it up here on index.html load and pre-fill the input.
(function checkSnapDxReturn(){
  const snapPending = localStorage.getItem('snapdx_pending');
  if (!snapPending) return;
  try {
    const snap = JSON.parse(snapPending);
    localStorage.removeItem('snapdx_pending');
    if (!snap.diagnosis) return;
    // Wait for DOM ready
    const tryFill = () => {
      const qi = document.getElementById('qi');
      if (qi) {
        qi.value = snap.diagnosis;
        if (typeof rsz === 'function') rsz(qi);
        if (typeof toast === 'function') toast('📸 Snap Dx: "' + snap.diagnosis + '" loaded');
      } else {
        setTimeout(tryFill, 300);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryFill);
    } else {
      setTimeout(tryFill, 400);
    }
  } catch(_) {}
})();
