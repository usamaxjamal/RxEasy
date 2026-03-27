// ═══════════════════════════════════════════════
// utils.js — Shared utility functions
// esc, toast, rsz, onKey, ask, saveKey, exportData, clearAll
// ═══════════════════════════════════════════════

// ═══ UTILITIES ═══
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toast(msg,dur=2200){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
function rsz(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,72)+'px';}
function onKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}
function ask(q){document.getElementById('qi').value=q;sendMsg();}
function saveKey(){
  const k=(document.getElementById('k1')||{value:''}).value.trim();
  if(!k){toast('⚠️ Paste a key first');return;}
  if(k.startsWith('gsk_'))localStorage.setItem('gkey',k);
  else if(k.startsWith('sk-or-'))localStorage.setItem('or_key',k);
  else if(k.length>10)localStorage.setItem('gemini_key',k);
  else{toast('⚠️ Unknown key format');return;}
  const ac=document.getElementById('ac');if(ac)ac.style.display='none';
  ['k1','k2'].forEach(id=>{const el=document.getElementById(id);if(el&&k.startsWith('gsk_'))el.value=k;});
  toast('✅ Key saved!');
  closeSheet('settings');
}

function exportData(){const d={history:rxHist,favorites:favs,patients};const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='prescription_data.json';a.click();toast('📤 Exported!');}
function clearAll(){if(!confirm('Delete ALL data? This cannot be undone.'))return;['rxh','rxf','rxp','gkey','dark','alg','pin_enabled','app_pin'].forEach(k=>localStorage.removeItem(k));rxHist=[];favs=[];patients=[];location.reload();}
