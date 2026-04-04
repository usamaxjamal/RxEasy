// ═══════════════════════════════════════════════════════════════
// ai-engine.js — AI fallback chain  (FIXED v3)
//
// Chain:
//   1. Supabase secure proxy (Groq → Gemini → OpenRouter → Pollinations)
//   2. Pollinations AI — called DIRECTLY from browser (CORS OK, no key needed)
//   3. Error shown to user
//
// Layer 2 is the key fix: even if the proxy fails entirely, the browser
// calls Pollinations directly — bypassing any server-side issues.
// ═══════════════════════════════════════════════════════════════

const GROQ_MODELS = ['llama-3.3-70b-versatile','llama-3.1-8b-instant','gemma2-9b-it'];
const rxCache = {};
let _curModel = 'LLaMA 3.3 70B';

function updateModelBadge(){
  const el = document.getElementById('modelBadge');
  if(el) el.textContent = '🤖 ' + _curModel;
}

function saveKey(){
  const k = (document.getElementById('k1')||{}).value.trim() || (document.getElementById('k2')||{}).value.trim();
  if(!k || !k.startsWith('gsk_')){ toast('⚠️ Invalid key — must start with gsk_'); return; }
  localStorage.setItem('gkey', k);
  const el1=document.getElementById('k1'); if(el1) el1.value=k;
  const el2=document.getElementById('k2'); if(el2) el2.value=k;
  const ac=document.getElementById('ac'); if(ac) ac.style.display='none';
  toast('✅ API key saved!');
  closeSheet('settings');
}

// ════════════════════════════════════════════════
// callAI — main entry point for prescription AI
// ════════════════════════════════════════════════
async function callAI(prompt, maxTokens) {
  if (!maxTokens) maxTokens = 1800;

  const cfg = window.__RXEASY_CONFIG__;
  const PROXY_URL = cfg.supabaseUrl + '/functions/v1/ai-proxy';

  // ── LAYER 1: Supabase secure proxy (tries Groq/Gemini/OpenRouter/Pollinations server-side) ──
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000); // 30s max wait for proxy
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': cfg.supabaseKey },
      body: JSON.stringify({ prompt, maxTokens }),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    const data = await res.json();
    if (res.ok && data.text) {
      _curModel = data.model || 'AI';
      updateModelBadge();
      return data.text;
    }
    console.warn('[RxEasy] Proxy returned:', data?.error || 'no text');
  } catch (e) {
    console.warn('[RxEasy] Proxy failed/timed out:', e.message);
  }

  // ── LAYER 2: Direct Pollinations AI from browser (CORS-enabled, no key needed) ──
  // This bypasses the proxy entirely — runs straight in the user's browser.
  // Pollinations is a free aggregator that routes to OpenAI/Mistral/LLaMA models.
  const polResult = await _tryPollinationsDirect(prompt, maxTokens);
  if (polResult) return polResult;

  // ── All failed ──
  throw new Error('⏳ AI services are temporarily busy. Please try again in 1 minute.');
}

// Direct browser call to Pollinations — no API key, CORS enabled, always free
async function _tryPollinationsDirect(prompt, maxTokens) {
  const models = ['openai', 'mistral', 'llama'];

  for (const model of models) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 25000); // 25s per model

      // POST to /openai endpoint — returns OpenAI-compatible JSON
      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: Math.min(maxTokens, 1000),
          temperature: 0.3,
          private: true,
          seed: 42,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 50) {
          _curModel = 'Pollinations';
          updateModelBadge();
          return text.trim();
        }
      }
    } catch (e) {
      console.warn('[RxEasy] Pollinations/' + model + ' failed:', e.message);
    }
  }

  // Last resort: Pollinations simple GET endpoint (prompt in URL)
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 20000);
    // Use only first 800 chars of prompt to avoid URL length limits
    const shortPrompt = prompt.substring(0, 800);
    const res = await fetch(
      'https://text.pollinations.ai/' + encodeURIComponent(shortPrompt) + '?model=openai&private=true',
      { method: 'GET', signal: ctrl.signal }
    );
    clearTimeout(tid);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 50) {
        _curModel = 'Pollinations';
        updateModelBadge();
        return text.trim();
      }
    }
  } catch (e) {
    console.warn('[RxEasy] Pollinations GET failed:', e.message);
  }

  return null;
}

// Simple hash for cache key
function hashStr(s){let h=0;for(let i=0;i<s.length;i++){h=(Math.imul(31,h)+s.charCodeAt(i))|0;}return h;}
