// ═══════════════════════════════════════════════
// utils.js — Shared utility functions
// esc, toast, rsz, onKey, ask, exportData, clearAll
// ═══════════════════════════════════════════════

function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toast(msg,dur=2200){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
function rsz(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,72)+'px';}
function onKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}
function ask(q){document.getElementById('qi').value=q;sendMsg();}

// API keys are managed server-side via Supabase Edge Function secrets.
// saveKey() has been intentionally removed — no client-side key storage.

function exportData(){const d={history:rxHist,favorites:favs,patients};const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='prescription_data.json';a.click();toast('📤 Exported!');}
function clearAll(){if(!confirm('Delete ALL data? This cannot be undone.'))return;['rxh','rxf','rxp','dark','alg','pin_enabled','app_pin'].forEach(k=>localStorage.removeItem(k));rxHist=[];favs=[];patients=[];location.reload();}
