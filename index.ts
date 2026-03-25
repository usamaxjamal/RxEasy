// ═══════════════════════════════════════════════════════════════
//  RxEasy · ai-proxy · Supabase Edge Function
//
//  This function holds your API keys as secrets (never in code).
//  It tries Groq first (4 keys × multiple models), then Gemini.
//
//  SECRETS REQUIRED (set via Supabase Dashboard → Edge Functions → Secrets):
//    GROQ_KEY_1  — your first Groq API key
//    GROQ_KEY_2  — your second Groq API key
//    GROQ_KEY_3  — your third Groq API key
//    GROQ_KEY_4  — your fourth Groq API key
//    GEMINI_KEY  — your Google Gemini API key
// ═══════════════════════════════════════════════════════════════

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, maxTokens } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const tokens = Math.min(maxTokens || 1800, 4096);

    // ── 1. Try Groq (4 keys × 4 models) ──
    const groqKeys = [
      Deno.env.get('GROQ_KEY_1'),
      Deno.env.get('GROQ_KEY_2'),
      Deno.env.get('GROQ_KEY_3'),
      Deno.env.get('GROQ_KEY_4'),
    ].filter(Boolean);

    for (const apiKey of groqKeys) {
      for (const model of GROQ_MODELS) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + apiKey,
            },
            body: JSON.stringify({
              model,
              max_tokens: tokens,
              temperature: 0.2,
              messages: [{ role: 'user', content: prompt }],
            }),
          });
          const data = await res.json();
          if (res.ok && data.choices?.[0]?.message?.content) {
            return new Response(JSON.stringify({
              text: data.choices[0].message.content,
              model: model.split('-').slice(0, 2).join('-'),
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          // 401 = bad key, skip to next key
          if (res.status === 401) break;
          // Rate limit = try next model
          continue;
        } catch (_) { continue; }
      }
    }

    // ── 2. Try Gemini ──
    const geminiKey = Deno.env.get('GEMINI_KEY');
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: tokens, temperature: 0.2 },
            }),
          }
        );
        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return new Response(JSON.stringify({
            text: data.candidates[0].content.parts[0].text,
            model: 'Gemini Flash',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (_) {}
    }

    // ── All failed ──
    return new Response(JSON.stringify({ error: 'All AI services busy. Please retry.' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error: ' + err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
