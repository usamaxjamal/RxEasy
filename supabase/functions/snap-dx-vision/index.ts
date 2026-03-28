// ═══════════════════════════════════════════════════════════════
//  RxEasy · snap-dx-vision · Supabase Edge Function  (v2)
//
//  Gemini has been REMOVED. This version uses a 3-API free
//  vision fallback chain:
//
//    1st → OpenRouter  (qwen/qwen2-vl-7b-instruct:free)
//    2nd → Together.ai (meta-llama/Llama-Vision-Free)
//    3rd → Groq        (meta-llama/llama-4-scout-17b-16e-instruct)
//
//  If API 1 fails for any reason, API 2 is tried automatically.
//  If API 2 also fails, API 3 is tried.
//  The user never sees which API was used.
//
//  SECRETS REQUIRED in Supabase Edge Function Secrets:
//    OPENROUTER_KEY  — from https://openrouter.ai/keys
//    TOGETHER_KEY    — from https://api.together.ai/settings/api-keys
//    GROQ_KEY        — from https://console.groq.com/keys
//
//  The old GEMINI_KEY secret can be deleted from Supabase.
// ═══════════════════════════════════════════════════════════════

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Type Definitions ────────────────────────────────────────────────────────

interface Differential {
  rank: number;
  condition: string;
  icd_code: string;
  confidence: 'High' | 'Medium' | 'Low';
  confidence_pct: number;
  explanation: string;
  key_features: string[];
  watch_for: string[];
}

interface VisionResult {
  description: string;
  image_type: string;
  differentials: Differential[];
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

/**
 * Extracts the text content from an OpenAI-compatible chat completion response.
 */
function extractText(data: Record<string, unknown>): string | null {
  try {
    const choices = data?.choices as Array<Record<string, unknown>>;
    const message = choices?.[0]?.message as Record<string, unknown>;
    return (message?.content as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * Strips markdown fences and parses the JSON response from the vision model.
 * Tries a clean parse first, then falls back to regex extraction.
 */
function parseVisionResult(rawText: string): VisionResult {
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned) as VisionResult;
  } catch {
    // Some models wrap output in prose — extract the JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as VisionResult;
    }
    throw new Error('Could not parse AI response as JSON. Raw: ' + cleaned.slice(0, 200));
  }
}

/**
 * Builds the OpenAI-compatible vision message array.
 * All three APIs accept this standard format.
 */
function buildMessages(
  base64Data: string,
  mimeType: string,
  prompt: string
): Array<Record<string, unknown>> {
  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Data}` },
        },
      ],
    },
  ];
}

// ─── API 1 : OpenRouter ───────────────────────────────────────────────────────
// Free model: qwen/qwen2-vl-7b-instruct:free
// Quota: ~200 free requests/day. Very capable at medical image analysis.

async function callOpenRouter(
  base64Data: string,
  mimeType: string,
  prompt: string,
  key: string
): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://rxeasy.vercel.app',
      'X-Title': 'RxEasy SnapDx',
    },
    body: JSON.stringify({
      model: 'qwen/qwen2-vl-7b-instruct:free',
      messages: buildMessages(base64Data, mimeType, prompt),
      max_tokens: 2048,
      temperature: 0.1,
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const errMsg =
      (data?.error as Record<string, unknown>)?.message ??
      `HTTP ${res.status}`;
    throw new Error(`OpenRouter: ${errMsg}`);
  }

  const text = extractText(data);
  if (!text) throw new Error('OpenRouter: empty response content');
  return text;
}

// ─── API 2 : Together.ai ──────────────────────────────────────────────────────
// Free model: meta-llama/Llama-Vision-Free
// No daily hard cap on free tier; generous rate limits for low-volume use.

async function callTogether(
  base64Data: string,
  mimeType: string,
  prompt: string,
  key: string
): Promise<string> {
  const res = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-Vision-Free',
      messages: buildMessages(base64Data, mimeType, prompt),
      max_tokens: 2048,
      temperature: 0.1,
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const errMsg =
      (data?.error as Record<string, unknown>)?.message ??
      `HTTP ${res.status}`;
    throw new Error(`Together.ai: ${errMsg}`);
  }

  const text = extractText(data);
  if (!text) throw new Error('Together.ai: empty response content');
  return text;
}

// ─── API 3 : Groq ─────────────────────────────────────────────────────────────
// Free model: meta-llama/llama-4-scout-17b-16e-instruct (vision-capable)
// Extremely fast inference. Free tier with generous daily token limits.

async function callGroq(
  base64Data: string,
  mimeType: string,
  prompt: string,
  key: string
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: buildMessages(base64Data, mimeType, prompt),
      max_tokens: 2048,
      temperature: 0.1,
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const errMsg =
      (data?.error as Record<string, unknown>)?.message ??
      `HTTP ${res.status}`;
    throw new Error(`Groq: ${errMsg}`);
  }

  const text = extractText(data);
  if (!text) throw new Error('Groq: empty response content');
  return text;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { base64Data, mimeType, imageType } = await req.json() as {
      base64Data: string;
      mimeType: string;
      imageType?: string;
    };

    // ── Input validation ──────────────────────────────────────────────────────
    if (!base64Data || !mimeType) {
      return new Response(
        JSON.stringify({ error: 'Missing base64Data or mimeType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PDF is not supported by any of these vision APIs.
    // Ask the doctor to upload a photo/screenshot of the lab report.
    if (mimeType === 'application/pdf') {
      return new Response(
        JSON.stringify({
          error:
            'PDF upload is not supported by the vision AI engine. Please take a clear photo or screenshot of your lab report and upload that image instead.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Load secrets ──────────────────────────────────────────────────────────
    const openrouterKey = Deno.env.get('OPENROUTER_KEY') ?? '';
    const togetherKey   = Deno.env.get('TOGETHER_KEY')   ?? '';
    const groqKey       = Deno.env.get('GROQ_KEY')       ?? '';

    if (!openrouterKey && !togetherKey && !groqKey) {
      console.error('snap-dx-vision: no vision API keys configured');
      return new Response(
        JSON.stringify({ error: 'Vision AI not configured. Please contact support.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Build clinical context note for the prompt ────────────────────────────
    const contextNote =
      imageType === 'xray'
        ? 'This is a chest X-ray or radiograph image.'
        : imageType === 'ct'
        ? 'This is a CT scan image.'
        : imageType === 'mri'
        ? 'This is an MRI scan image.'
        : imageType === 'lab'
        ? 'This is a medical lab report or clinical document (image/photo of a report).'
        : 'This is a clinical photo (skin, wound, lesion, oral, eye, or other clinical finding).';

    // ── System prompt ─────────────────────────────────────────────────────────
    const systemPrompt = `You are a senior clinical AI assistant for RxEasy, a medical platform used by PMDC-registered doctors in Pakistan.
${contextNote}

Analyze the provided medical image carefully and return ONLY a valid JSON object (no markdown, no backticks, no preamble) in this EXACT format:

{
  "description": "2-3 sentence clinical description of key findings visible in the image",
  "image_type": "clinical_photo|xray|ct|mri|lab_report",
  "differentials": [
    {
      "rank": 1,
      "condition": "Full condition name",
      "icd_code": "ICD-10 code if known, else empty string",
      "confidence": "High",
      "confidence_pct": 85,
      "explanation": "Why this diagnosis fits — mechanism and key matching findings",
      "key_features": ["feature1", "feature2", "feature3"],
      "watch_for": ["red flag 1", "red flag 2"]
    },
    {
      "rank": 2,
      "condition": "Second most likely condition",
      "icd_code": "",
      "confidence": "Medium",
      "confidence_pct": 60,
      "explanation": "Why this could fit",
      "key_features": ["feature1", "feature2"],
      "watch_for": ["red flag"]
    }
  ]
}

Rules:
- Provide 2 to 4 differential diagnoses, ranked by likelihood
- Confidence: High (>70%), Medium (40-70%), Low (<40%)
- key_features: 2-4 concise tags (the specific visual clues that support this diagnosis)
- watch_for: 1-3 clinical red flags that would change management
- Use standard medical condition names familiar in Pakistani GP practice
- For X-rays: describe the radiological findings (consolidation, effusion, cardiomegaly, etc.)
- For CT/MRI: describe the imaging findings clearly
- For lab report photos: analyze visible values and list relevant diagnoses
- Always include ICD-10 code where known
- CRITICAL: Return ONLY raw JSON. No markdown. No explanation outside the JSON object.`;

    // ── Fallback chain ────────────────────────────────────────────────────────
    // Build the list of APIs that have keys configured.
    // Attempted in order; first success wins silently.
    type ApiAttempt = { name: string; fn: () => Promise<string> };
    const attempts: ApiAttempt[] = [];

    if (openrouterKey) {
      attempts.push({
        name: 'openrouter',
        fn: () => callOpenRouter(base64Data, mimeType, systemPrompt, openrouterKey),
      });
    }
    if (togetherKey) {
      attempts.push({
        name: 'together',
        fn: () => callTogether(base64Data, mimeType, systemPrompt, togetherKey),
      });
    }
    if (groqKey) {
      attempts.push({
        name: 'groq',
        fn: () => callGroq(base64Data, mimeType, systemPrompt, groqKey),
      });
    }

    let lastError = 'Unknown error';

    for (const attempt of attempts) {
      try {
        console.log(`snap-dx-vision: trying ${attempt.name}`);
        const rawText = await attempt.fn();
        const result = parseVisionResult(rawText);

        // Validate the structure has the required fields before returning
        if (!result.description || !Array.isArray(result.differentials)) {
          throw new Error(`${attempt.name}: response missing required fields`);
        }

        console.log(`snap-dx-vision: success via ${attempt.name}`);
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        lastError = (err as Error).message;
        console.error(`snap-dx-vision: ${attempt.name} failed —`, lastError);
        // Continue to next API silently
      }
    }

    // All APIs failed
    console.error('snap-dx-vision: all APIs exhausted. Last error:', lastError);
    return new Response(
      JSON.stringify({
        error:
          'Vision analysis temporarily unavailable. Please try again in a few minutes.',
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('snap-dx-vision: unhandled error —', err);
    return new Response(
      JSON.stringify({ error: 'Analysis error: ' + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
