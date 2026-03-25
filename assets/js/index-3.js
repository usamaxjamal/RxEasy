// ══════════════════════════════════════════════════
// ROTATING HERO QUOTES
// ══════════════════════════════════════════════════
const HERO_QUOTES = [
  {q:"The good physician treats the disease; the great physician treats the patient.", a:"Sir William Osler"},
  {q:"To cure sometimes, to relieve often, to comfort always.", a:"Edward Trudeau"},
  {q:"Medicine is not only a science — it is also an art of humanity.", a:"Paracelsus"},
  {q:"Wherever the art of medicine is loved, there is love of humanity.", a:"Hippocrates"},
  {q:"Heal with precision. Care with compassion. Prescribe with wisdom.", a:""},
  {q:"The best prescription is knowledge, empathy, and the right drug.", a:""},
  {q:"A great doctor listens twice as much as they speak.", a:""},
  {q:"Science tells you what is wrong. Art tells you how to heal.", a:""},
  {q:"Every prescription is a promise — keep it safe, keep it right.", a:""},
  {q:"Medicine is a science of uncertainty and an art of probability.", a:"William Osler"},
  {q:"Do not wait for the perfect moment — treat the patient in front of you.", a:""},
  {q:"The secret of patient care is in caring for the patient.", a:"Francis Peabody"},
  {q:"A physician who heals the body but ignores the soul heals nothing.", a:""},
  {q:"The doctor who knows one disease knows none.", a:"Sir William Osler"},
  {q:"In Pakistan's clinics, every prescription carries hope for a family.", a:""},
  {q:"First do no harm — then do everything in your power to help.", a:"Hippocratic Tradition"},
  {q:"Diagnosis is the beginning. Compassion is the treatment.", a:""},
];

let heroQuoteIdx = 0;
let heroQuoteTimer = null;

function initHeroQuotes() {
  const total = HERO_QUOTES.length;
  const dotsEl = document.getElementById('heroQuoteDots');
  if (dotsEl) {
    dotsEl.innerHTML = HERO_QUOTES.map((_,i) =>
      `<div class="dot${i===0?' active':''}" id="hqdot${i}"></div>`
    ).join('');
  }
  showHeroQuote(0);
  heroQuoteTimer = setInterval(() => {
    const next = (heroQuoteIdx + 1) % HERO_QUOTES.length;
    transitionHeroQuote(next);
  }, 4500);
}

function showHeroQuote(idx) {
  const qt = document.getElementById('heroQuoteText');
  const qa = document.getElementById('heroQuoteAuthor');
  if (!qt) return;
  const q = HERO_QUOTES[idx];
  qt.textContent = '“' + q.q + '”';
  qa.textContent = q.a ? '— ' + q.a : '';
  heroQuoteIdx = idx;
  // Update dots
  document.querySelectorAll('#heroQuoteDots .dot').forEach((d,i) => {
    d.classList.toggle('active', i === idx);
  });
}

function transitionHeroQuote(idx) {
  const qt = document.getElementById('heroQuoteText');
  const qa = document.getElementById('heroQuoteAuthor');
  if (!qt) return;
  qt.classList.add('fade-out');
  qa.classList.add('fade-out');
  setTimeout(() => {
    showHeroQuote(idx);
    qt.classList.remove('fade-out');
    qa.classList.remove('fade-out');
    qt.classList.add('fade-in');
    setTimeout(() => qt.classList.remove('fade-in'), 500);
  }, 500);
}

// ══════════════════════════════════════════════════
// VOICE COMMAND — speak diagnosis → auto fills input
// ══════════════════════════════════════════════════
let voiceRecog = null;
let voiceActive = false;

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    toast('❌ Voice not supported in this browser. Try Chrome.');
    return;
  }
  if (voiceActive) {
    voiceRecog?.stop();
    voiceActive = false;
    document.getElementById('vb').textContent = '🎤';
    document.getElementById('vb').style.color = '';
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecog = new SR();
  voiceRecog.lang = 'en-US';
  voiceRecog.continuous = false;
  voiceRecog.interimResults = false;

  voiceRecog.onstart = () => {
    voiceActive = true;
    document.getElementById('vb').textContent = '🔴';
    document.getElementById('vb').style.color = '#e74c3c';
    toast('🎤 Listening... speak the diagnosis');
    haptic('medium');
  };
  voiceRecog.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById('qi').value = transcript;
    toast('✅ Heard: ' + transcript);
    voiceActive = false;
    document.getElementById('vb').textContent = '🎤';
    document.getElementById('vb').style.color = '';
    haptic('success');
    // Auto send after 0.8s
    setTimeout(() => sendMsg(), 800);
  };
  voiceRecog.onerror = (e) => {
    toast('❌ Voice error: ' + e.error);
    voiceActive = false;
    document.getElementById('vb').textContent = '🎤';
    document.getElementById('vb').style.color = '';
  };
  voiceRecog.onend = () => {
    voiceActive = false;
    document.getElementById('vb').textContent = '🎤';
    document.getElementById('vb').style.color = '';
  };
  voiceRecog.start();
}

// ══════════════════════════════════════════════════
// CAMERA — photograph notes → AI reads → fills input
// ══════════════════════════════════════════════════
let camStream = null;

async function openCamera() {
  const overlay = document.getElementById('cameraOverlay');
  overlay.style.display = 'flex';
  document.getElementById('camStatus').textContent = 'Starting camera...';
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    document.getElementById('camStream').srcObject = camStream;
    document.getElementById('camStatus').textContent = 'Camera ready — point at prescription or notes';
  } catch(err) {
    document.getElementById('camStatus').textContent = '⚠️ Camera unavailable — use upload below';
    console.warn('Camera error:', err);
  }
}

function closeCamera() {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  document.getElementById('cameraOverlay').style.display = 'none';
  document.getElementById('camStream').srcObject = null;
}

async function snapPhoto() {
  const video = document.getElementById('camStream');
  const canvas = document.getElementById('camCanvas');
  if (!video.srcObject) { toast('No camera stream'); return; }
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const imageData = canvas.toDataURL('image/jpeg', 0.85);
  closeCamera();
  await readImageWithAI(imageData);
}

function readUploadedImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    closeCamera();
    await readImageWithAI(e.target.result);
  };
  reader.readAsDataURL(file);
}

async function readImageWithAI(dataUrl) {
  toast('🔍 Reading prescription image...');
  document.getElementById('qi').value = '⏳ Reading image...';
  document.getElementById('qi').disabled = true;

  try {
    const cfg = window.__RXEASY_CONFIG__;
    const PROXY_URL = cfg.supabaseUrl + '/functions/v1/ai-proxy';
    const imagePrompt = 'This is a medical note, handwritten prescription, or patient complaint. Extract the main diagnosis or medical condition mentioned. Reply with ONLY the diagnosis/condition in 3-8 words, nothing else. Example: "Typhoid fever with hepatitis" or "URTI with dry cough and fever".';

    const resp = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': cfg.supabaseKey },
      body: JSON.stringify({ prompt: imagePrompt, maxTokens: 50 })
    });
    const data = await resp.json();
    const diagnosis = data.text?.trim() || '';
    if (diagnosis) {
      document.getElementById('qi').value = diagnosis;
      document.getElementById('qi').disabled = false;
      toast('✅ Read: ' + diagnosis);
      haptic('success');
      setTimeout(() => sendMsg(), 600);
    } else {
      throw new Error('No diagnosis returned');
    }
  } catch(err) {
    document.getElementById('qi').value = '';
    document.getElementById('qi').disabled = false;
    toast('❌ Image read failed. Please type the diagnosis manually.');
  }
}

// ══════════════════════════════════════════════════
// PRINT — elegant prescription pad for current Rx
// ══════════════════════════════════════════════════
function printRx(btn) {
  // Find the closest rxcard to this button
  const card = btn.closest('.rxcard') || document.querySelector('.rxcard');
  if (!card) { toast('No prescription to print'); return; }
  printRxEl(card);
}

function printRxEl(card) {
  const body = card.querySelector('.rxbody');
  const header = card.querySelector('.rxlh');
  if (!body) return;

  // Extract patient name, age, date from header
  const ptText = header?.querySelector('.rxlh-pt')?.textContent || '';
  const dtText = header?.querySelector('.rxlh-dt')?.textContent || '';
  const diagText = card.querySelector('.rxsym')?.textContent || '';

  // Clone and clean the body content
  const bodyClone = body.cloneNode(true);
  // Remove badge if needed, keep content
  const badgeEl = bodyClone.querySelector('.mbadge');

  const win = window.open('', '_blank', 'width=800,height=900');
  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Prescription — Dr. Usama Jamal</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #fff;
    color: #1a1a2e;
    padding: 0;
    min-height: 100vh;
  }
  .page {
    max-width: 680px;
    margin: 0 auto;
    padding: 28px 32px 40px;
    min-height: 100vh;
    position: relative;
  }
  /* ── Prescription Header ── */
  .rx-header {
    border-bottom: 3px double #0c2240;
    padding-bottom: 14px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .rx-dr-info { flex: 1; }
  .rx-dr-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0c2240;
    letter-spacing: -.3px;
    font-family: 'Georgia', serif;
  }
  .rx-dr-qual {
    font-size: .75rem;
    color: #2a5a8a;
    margin-top: 2px;
    font-weight: 600;
    letter-spacing: .3px;
  }
  .rx-dr-spec {
    font-size: .68rem;
    color: #555;
    margin-top: 3px;
  }
  .rx-dr-contact {
    font-size: .63rem;
    color: #888;
    margin-top: 6px;
    line-height: 1.7;
  }
  .rx-logo {
    font-size: 2.8rem;
    color: #0c2240;
    font-family: 'Georgia', serif;
    font-weight: 900;
    line-height: 1;
    opacity: .12;
    letter-spacing: -2px;
  }
  /* Gold accent line */
  .rx-gold-line {
    height: 2px;
    background: linear-gradient(90deg, #c9a84c, rgba(201,168,76,.1));
    border-radius: 2px;
    margin-bottom: 16px;
  }
  /* Patient info bar */
  .rx-patient-bar {
    display: flex;
    gap: 20px;
    background: #f5f8fc;
    border: 1px solid #d5dfe8;
    border-radius: 6px;
    padding: 8px 14px;
    margin-bottom: 18px;
  }
  .rx-patient-field { flex: 1; }
  .rx-patient-label { font-size: .58rem; color: #888; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 1px; }
  .rx-patient-value { font-size: .78rem; font-weight: 600; color: #1a1a2e; }
  /* Rx symbol + Diagnosis */
  .rx-diag-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 14px;
  }
  .rx-symbol {
    font-size: 1.8rem;
    color: #0c2240;
    font-family: serif;
    font-weight: 900;
    line-height: 1;
    opacity: .7;
  }
  .rx-diag-label { font-size: .6rem; color: #888; text-transform: uppercase; letter-spacing: .5px; }
  .rx-diag-text { font-size: .95rem; font-weight: 700; color: #0c2240; }
  /* Medicines */
  .rx-section-title {
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #888;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e8eef4;
  }
  .rx-med-row {
    display: flex;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px dashed #e8eef4;
    align-items: flex-start;
  }
  .rx-med-num {
    font-size: .75rem;
    font-weight: 700;
    color: #0c2240;
    min-width: 18px;
  }
  .rx-med-name { font-size: .85rem; font-weight: 700; color: #1a1a2e; }
  .rx-med-brand { font-size: .7rem; color: #2a5a8a; font-style: italic; }
  .rx-med-dose { font-size: .72rem; color: #555; margin-top: 1px; }
  /* Other sections */
  .rx-box {
    background: #f9fbfd;
    border: 1px solid #d5dfe8;
    border-left: 3px solid #0c2240;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 10px;
  }
  .rx-box-title { font-size: .6rem; text-transform: uppercase; letter-spacing: .8px; color: #2a5a8a; font-weight: 700; margin-bottom: 5px; }
  .rx-box-line { font-size: .72rem; color: #444; line-height: 1.7; }
  .rx-box.advice { border-left-color: #14b88a; }
  .rx-box.advice .rx-box-title { color: #0d7a5f; }
  .rx-box.warn { border-left-color: #e74c3c; }
  .rx-box.warn .rx-box-title { color: #c0392b; }
  .rx-box.urdu { border-left-color: #c9a84c; direction: rtl; text-align: right; }
  .rx-box.urdu .rx-box-title { color: #a07820; text-align: right; direction: rtl; font-size: .7rem; }
  .rx-box.urdu .rx-box-line { font-family: 'Noto Nastaliq Urdu', 'Arial Unicode MS', serif; font-size: .82rem; line-height: 2.2; color: #2a1a00; }
  /* Footer */
  .rx-footer {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 12px;
    border-top: 1px solid #d5dfe8;
  }
  .rx-footer-note { font-size: .6rem; color: #aaa; max-width: 60%; line-height: 1.6; }
  .rx-sign-area { text-align: center; }
  .rx-sign-line { width: 120px; height: 1px; background: #0c2240; margin: 0 auto 4px; }
  .rx-sign-name { font-size: .65rem; color: #0c2240; font-weight: 700; }
  .rx-sign-sub { font-size: .57rem; color: #888; margin-top: 1px; }
  .rx-watermark {
    position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
    font-size: 5rem; color: rgba(12,34,64,.04); font-weight: 900;
    font-family: serif; letter-spacing: -4px; white-space: nowrap;
    z-index: 0; pointer-events: none;
  }
  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .page { padding: 20px 24px; }
    .no-print { display: none !important; }
  }
</style>
<\/head>
<\body>
<div class="page">
  <div class="rx-watermark">RxEasy</div>

  <!-- Header -->
  <div class="rx-header">
    <div class="rx-dr-info">
      <div class="rx-dr-name">Dr. Usama Jamal</div>
      <div class="rx-dr-qual">MBBS / MD · General Practitioner</div>
      <div class="rx-dr-spec">Primary Care · Internal Medicine · Pakistan Formulary</div>
      <div class="rx-dr-contact">
        📍 Mardan, Khyber Pakhtunkhwa, Pakistan<br>
        📞 +92 319 568 1808 &nbsp;·&nbsp; 🤖 RxEasy AI Platform
      </div>
    </div>
    <div class="rx-logo">Rx</div>
  </div>
  <div class="rx-gold-line"></div>

  <!-- Patient Bar -->
  <div class="rx-patient-bar">
    <div class="rx-patient-field">
      <div class="rx-patient-label">Patient</div>
      <div class="rx-patient-value">${ptText.replace(/·/g,' ').replace(/Age/,'').trim() || 'Not specified'}</div>
    </div>
    <div class="rx-patient-field">
      <div class="rx-patient-label">Date</div>
      <div class="rx-patient-value">${dtText}</div>
    </div>
    <div class="rx-patient-field">
      <div class="rx-patient-label">Rx No.</div>
      <div class="rx-patient-value">#${String(Date.now()).slice(-5)}</div>
    </div>
  </div>

  <!-- Diagnosis -->
  <div class="rx-diag-row">
    <div class="rx-symbol">℞</div>
    <div>
      <div class="rx-diag-label">Diagnosis</div>
      <div class="rx-diag-text">${diagText}</div>
    </div>
  </div>
  __RX_CONTENT__

  <!-- Footer -->
  <div class="rx-footer">
    <div class="rx-footer-note">
      This prescription is valid for 30 days from issue date.<br>
      Generated via RxEasy AI — clinically reviewed by prescribing doctor.<br>
      <strong>For medical emergencies call: 1122</strong>
    </div>
    <div class="rx-sign-area">
      <div class="rx-sign-line"></div>
      <div class="rx-sign-name">Dr. Usama Jamal</div>
      <div class="rx-sign-sub">MBBS / MD · GP</div>
    </div>
  </div>
</div>
\u003cscript\u003e
  window.addEventListener('load', () => {
    setTimeout(() => { window.print(); window.close(); }, 500);
  });
\u003c\/script\u003e


<\/body>
<\/html>`);

  // Now extract and inject content from the actual rxcard
  // Build rx content from the card's sections
  let rxContent = '<div class="rx-section-title">Prescription</div>';

  // Extract medicine rows
  const meds = card.querySelectorAll('.rxmed');
  if (meds.length) {
    meds.forEach(med => {
      const num  = med.querySelector('.rxnum')?.textContent || '';
      const name = med.querySelector('.rxmn')?.textContent || '';
      const brand= med.querySelector('.rxmb')?.textContent || '';
      const dose = med.querySelector('.rxmd')?.textContent || '';
      rxContent += `<div class="rx-med-row">
        <div class="rx-med-num">${num}</div>
        <div>
          <div class="rx-med-name">${name}</div>
          ${brand ? `<div class="rx-med-brand">(${brand})</div>` : ''}
          <div class="rx-med-dose">${dose}</div>
        </div>
      </div>`;
    });
  }

  // Extract other sections (advice, urdu, warnings etc.)
  const boxes = card.querySelectorAll('.rxbx');
  boxes.forEach(box => {
    const title = box.querySelector('.bxt')?.textContent || '';
    const lines = [...box.querySelectorAll('.bxi')].map(l => l.textContent).join('<br>');
    let cls = 'rx-box';
    if (title.includes('ADVICE') || title.includes('Advice')) cls += ' advice';
    else if (title.includes('⚠️') || title.includes('Red')) cls += ' warn';
    else if (title.includes('URDU') || title.includes('ہدایات')) cls += ' urdu';
    rxContent += `<div class="${cls}" style="margin-bottom:10px">
      <div class="rx-box-title">${title}</div>
      <div class="rx-box-line">${lines}</div>
    </div>`;
  });

  win.document.body.innerHTML = win.document.body.innerHTML.replace('__RX_CONTENT__', rxContent);
  win.document.close();
}

// ══════════════════════════════════════════════════
// OVERRIDE showAchievement — no owl, clean toast
// ══════════════════════════════════════════════════
function showAchievement(ach) {
  // Remove any existing achievement toasts
  document.querySelectorAll('.ach-toast').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = 'ach-toast';
  el.innerHTML = `<div class="ach-icon">${ach.icon}</div>
    <div class="ach-body">
      <div class="ach-title">${ach.title}</div>
      <div class="ach-sub">${ach.sub}</div>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3500);
  haptic('success');
}

// ══════════════════════════════════════════════════
// INIT ALL NEW FEATURES ON LOAD
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initHeroQuotes();
});
