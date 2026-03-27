// ═══════════════════════════════════════════════
// ai-engine.js — AI fallback chain
// Groq, HuggingFace, OpenRouter models + callAI()
// ═══════════════════════════════════════════════

// ═══ GROQ AI ENGINE ═══
// GROQ_API_KEY now handled by GROQ_KEYS array in tryGroq()
// GROQ_MODELS kept for badge display reference
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

// ═══ AI FALLBACK CHAIN ═══
// Multiple Groq keys for rotation (each has separate daily limit)


// Extended Groq models list
const GROQ_MODELS_ALL = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'qwen/qwen-3-32b',
  'mixtral-8x7b-32768',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'llama-3.1-70b-versatile',
  'deepseek-r1-distill-llama-70b',
];

// OpenRouter free models
const OPENROUTER_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
];

// ═══ SECURE AI PROXY ═══
// All API keys are stored securely in Supabase Edge Function secrets.
// No keys are stored in this file. Do NOT add keys here.

async function callAI(prompt, maxTokens) {
  if(!maxTokens) maxTokens = 1800;

  const cfg = window.__RXEASY_CONFIG__;
  const PROXY_URL = cfg.supabaseUrl + '/functions/v1/ai-proxy';

  // 1. Try Groq + Gemini via secure Supabase proxy
  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': cfg.supabaseKey },
      body: JSON.stringify({ prompt, maxTokens })
    });
    const data = await res.json();
    if (res.ok && data.text) {
      _curModel = data.model || 'AI';
      updateModelBadge();
      return data.text;
    }
    console.warn('Proxy failed:', data?.error);
  } catch(e) {
    console.warn('Proxy unreachable:', e);
  }

  // 2. Fallback: Hugging Face (completely free, no key needed)
  const hfResult = await tryHuggingFace(prompt, maxTokens);
  if(hfResult) return hfResult;

  throw new Error('⏳ AI services are temporarily busy. Please try again in 1 minute.');
}

async function tryHuggingFace(prompt, maxTokens) {
  const HF_MODELS = [
    'mistralai/Mistral-7B-Instruct-v0.3',
    'HuggingFaceH4/zephyr-7b-beta',
    'microsoft/DialoGPT-large',
  ];
  for(const model of HF_MODELS) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model, max_tokens:Math.min(maxTokens,500), temperature:0.2,
          messages:[{role:'user', content:prompt}]
        })
      });
      const data = await res.json();
      if(res.ok && data.choices?.[0]?.message?.content) {
        _curModel = model.split('/').pop().substring(0,15);
        updateModelBadge();
        return data.choices[0].message.content;
      }
      continue;
    } catch(e) { continue; }
  }
  return null;
}

// Simple hash for cache key
function hashStr(s){let h=0;for(let i=0;i<s.length;i++){h=(Math.imul(31,h)+s.charCodeAt(i))|0;}return h;}

