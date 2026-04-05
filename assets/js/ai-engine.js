// ═══════════════════════════════════════════════════════════════
//  RxEasy · ai-engine.js  (v2 — Clean Groq Edition)
//
//  This module is the AI FALLBACK ONLY.
//  It is only called when a disease is NOT found in the Supabase DB.
//
//  Flow:
//    Browser → Supabase Edge Function (ai-proxy)
//              → Groq Key 1  (primary)
//              → Groq Key 2  (secondary, instant fallback)
//              → Error shown to user
//
//  NO browser-side AI calls.
//  NO Pollinations, Gemini, OpenRouter, or any other service.
//  All credentials live in Supabase Edge Function secrets only.
// ═══════════════════════════════════════════════════════════════

// ── Prescription cache (keyed by prompt hash) ──────────────────
// Referenced in prescription.js OUTSIDE the try block — must exist.
const rxCache = {};

// ── Model badge (shows which model responded) ──────────────────
let _curModel = 'Groq AI';

function updateModelBadge() {
  const el = document.getElementById('modelBadge');
  if (el) el.textContent = '🤖 ' + _curModel;
}

// ═══════════════════════════════════════════════════════════════
//  callAI(prompt, maxTokens)
//
//  Main entry point — called ONLY when disease is not in DB.
//  Sends prompt to the Supabase ai-proxy Edge Function.
//  The Edge Function handles key rotation and Groq fallback.
//  Returns the AI-generated text string.
// ═══════════════════════════════════════════════════════════════
async function callAI(prompt, maxTokens) {
  maxTokens = maxTokens || 1800;

  const cfg   = window.__RXEASY_CONFIG__;
  const PROXY = cfg.supabaseUrl + '/functions/v1/ai-proxy';

  // Get current user JWT for authenticated proxy call
  let authToken = cfg.supabaseKey;
  try {
    const sess = JSON.parse(localStorage.getItem('sb_session') || 'null');
    if (sess && sess.access_token) authToken = sess.access_token;
  } catch (_) { /* use anon key */ }

  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 35000); // 35s total budget

  try {
    const res = await fetch(PROXY, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        cfg.supabaseKey,
        'Authorization': 'Bearer ' + authToken,
      },
      body:   JSON.stringify({ prompt, maxTokens }),
      signal: ctrl.signal,
    });

    clearTimeout(timer);

    const data = await res.json();

    if (res.ok && data.text) {
      _curModel = data.model || 'Groq AI';
      updateModelBadge();
      return data.text;
    }

    // Proxy returned an error body
    const errMsg = data?.error || 'AI service unavailable';
    throw new Error(errMsg);

  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new Error('⏳ AI request timed out. Please try again.');
    }
    throw e;
  }
}

// ── Simple string hash for prescription cache keys ─────────────
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
