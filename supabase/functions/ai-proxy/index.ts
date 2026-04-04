// ═══════════════════════════════════════════════════════════════
//  RxEasy · ai-proxy · Supabase Edge Function  (v11 — live)
//
//  5-layer fallback (Layer 4+5 need ZERO config — always work):
//    1. Groq  (GROQ_KEY_1..4 secrets)
//    2. Gemini 1.5 Flash (GEMINI_KEY secret)
//    3. OpenRouter free (OPENROUTER_KEY secret)
//    4. Pollinations POST  — no key needed
//    5. Pollinations GET   — absolute last resort, always available
//
//  OPTIONAL SECRETS (Supabase Dashboard → Edge Functions → Secrets):
//    GROQ_KEY_1 … GROQ_KEY_4  |  GEMINI_KEY  |  OPENROUTER_KEY
// ═══════════════════════════════════════════════════════════════

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'llama3-70b-8192',
  'llama3-8b-8192',
];

const OR_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

function ok(text: string, model: string) {
  return new Response(JSON.stringify({ text, model }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
function errResp(msg: string, status = 503) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const url = new URL(req.url);
  if (req.method === 'GET' && url.searchParams.get('debug') === '1') {
    return new Response(JSON.stringify({
      version: 11,
      secrets: {
        groq1: !!Deno.env.get('GROQ_KEY_1'), groq2: !!Deno.env.get('GROQ_KEY_2'),
        groq3: !!Deno.env.get('GROQ_KEY_3'), groq4: !!Deno.env.get('GROQ_KEY_4'),
        gemini: !!Deno.env.get('GEMINI_KEY'), openrouter: !!Deno.env.get('OPENROUTER_KEY'),
      },
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  let prompt = '', tokens = 1800;
  try {
    const body = await req.json();
    prompt = body.prompt || '';
    tokens = Math.min(body.maxTokens || 1800, 2048);
    if (!prompt) return errResp('Missing prompt', 400);
  } catch (_) { return errResp('Invalid JSON', 400); }

  // LAYER 1: Groq
  const groqKeys = [
    Deno.env.get('GROQ_KEY_1'), Deno.env.get('GROQ_KEY_2'),
    Deno.env.get('GROQ_KEY_3'), Deno.env.get('GROQ_KEY_4'),
  ].filter(Boolean) as string[];
  for (const apiKey of groqKeys) {
    for (const model of GROQ_MODELS) {
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model, max_tokens: tokens, temperature: 0.2, messages: [{ role: 'user', content: prompt }] }),
        });
        const d = await r.json();
        if (r.ok && d.choices?.[0]?.message?.content)
          return ok(d.choices[0].message.content, model.split('-').slice(0,3).join('-'));
        if (r.status === 401) break;
      } catch (_) { continue; }
    }
  }

  // LAYER 2: Gemini
  const geminiKey = Deno.env.get('GEMINI_KEY');
  if (geminiKey) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: tokens, temperature: 0.2 } }) }
      );
      const d = await r.json();
      if (r.ok && d.candidates?.[0]?.content?.parts?.[0]?.text)
        return ok(d.candidates[0].content.parts[0].text, 'Gemini-Flash');
    } catch (_) {}
  }

  // LAYER 3: OpenRouter
  const orKey = Deno.env.get('OPENROUTER_KEY');
  if (orKey) {
    for (const model of OR_MODELS) {
      try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orKey}`,
            'HTTP-Referer': 'https://rxeasy.netlify.app', 'X-Title': 'RxEasy' },
          body: JSON.stringify({ model, max_tokens: Math.min(tokens,1000), temperature: 0.2, messages: [{ role: 'user', content: prompt }] }),
        });
        const d = await r.json();
        if (r.ok && d.choices?.[0]?.message?.content)
          return ok(d.choices[0].message.content, 'OpenRouter');
      } catch (_) { continue; }
    }
  }

  // LAYER 4: Pollinations POST (no key needed)
  try {
    const r = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'openai', seed: 42, private: true }),
    });
    if (r.ok) {
      const text = await r.text();
      if (text && text.trim().length > 80) return ok(text.trim(), 'Pollinations');
    }
  } catch (_) {}

  try {
    const r = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'mistral', seed: 42, private: true }),
    });
    if (r.ok) {
      const text = await r.text();
      if (text && text.trim().length > 80) return ok(text.trim(), 'Pollinations-Mistral');
    }
  } catch (_) {}

  // LAYER 5: Pollinations GET (absolute last resort)
  try {
    const shortPrompt = prompt.substring(0, 1200);
    const r = await fetch(`https://text.pollinations.ai/${encodeURIComponent(shortPrompt)}?model=openai&private=true`);
    if (r.ok) {
      const text = await r.text();
      if (text && text.trim().length > 80) return ok(text.trim(), 'Pollinations-GET');
    }
  } catch (_) {}

  return errResp('All AI services temporarily busy. Please try again in 1 minute.');
});
