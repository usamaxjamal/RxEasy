// ═══════════════════════════════════════════════════════════════
//  RxEasy · ai-proxy · Supabase Edge Function  (v2 — Clean Groq)
//
//  Called ONLY when a disease is not found in the Supabase DB.
//
//  Fallback chain:
//    1. Groq — GROQ_KEY_1 secret  (primary)
//    2. Groq — GROQ_KEY_2 secret  (instant fallback)
//
//  Required Supabase Edge Function Secrets:
//    GROQ_KEY_1  — your primary Groq API key   (starts with gsk_)
//    GROQ_KEY_2  — your secondary Groq API key (starts with gsk_)
//
//  To set secrets:
//    Supabase Dashboard → Edge Functions → ai-proxy → Secrets
// ═══════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Best Groq models for clinical text generation (ordered by preference)
const GROQ_MODEL = 'llama-3.3-70b-versatile';   // primary model
const GROQ_MODEL_FALLBACK = 'llama-3.1-8b-instant'; // used if primary rate-limits

// ── Response helpers ────────────────────────────────────────────
function okResponse(text: string, model: string) {
  return new Response(JSON.stringify({ text, model }), {
    status:  200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function errResponse(msg: string, status = 503) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// ── Call one Groq key + model ───────────────────────────────────
async function callGroq(
  apiKey:    string,
  model:     string,
  prompt:    string,
  maxTokens: number,
): Promise<string | null> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens:  maxTokens,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    // 401 = bad key, no point retrying this key
    if (res.status === 401) return null;

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (text && text.trim().length > 20) return text.trim();

    return null;
  } catch (_) {
    return null;
  }
}

// ── Main handler ────────────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  // Parse request body
  let prompt = '';
  let maxTokens = 1800;
  try {
    const body = await req.json();
    prompt    = (body.prompt    || '').trim();
    maxTokens = Math.min(body.maxTokens || 1800, 2048);
    if (!prompt) return errResponse('Missing prompt', 400);
  } catch (_) {
    return errResponse('Invalid JSON body', 400);
  }

  const key1 = Deno.env.get('GROQ_KEY_1') || '';
  const key2 = Deno.env.get('GROQ_KEY_2') || '';

  if (!key1 && !key2) {
    return errResponse('Groq API keys not configured. Set GROQ_KEY_1 and GROQ_KEY_2 in Edge Function secrets.', 503);
  }

  // ── Attempt 1: Key 1 + primary model ───────────────────────
  if (key1) {
    const result = await callGroq(key1, GROQ_MODEL, prompt, maxTokens);
    if (result) return okResponse(result, GROQ_MODEL);

    // Key 1 primary model failed — try key 1 with fallback model
    const result2 = await callGroq(key1, GROQ_MODEL_FALLBACK, prompt, maxTokens);
    if (result2) return okResponse(result2, GROQ_MODEL_FALLBACK);
  }

  // ── Attempt 2: Key 2 + primary model ───────────────────────
  if (key2) {
    const result = await callGroq(key2, GROQ_MODEL, prompt, maxTokens);
    if (result) return okResponse(result, GROQ_MODEL);

    // Key 2 primary model failed — try key 2 with fallback model
    const result2 = await callGroq(key2, GROQ_MODEL_FALLBACK, prompt, maxTokens);
    if (result2) return okResponse(result2, GROQ_MODEL_FALLBACK);
  }

  // ── All attempts exhausted ──────────────────────────────────
  return errResponse('AI service temporarily unavailable. Please try again in a moment.', 503);
});
