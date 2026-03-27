// ═══════════════════════════════════════════════════════════════
//  RxEasy · snap-dx-vision · Supabase Edge Function
//
//  Accepts a base64-encoded image or PDF and returns structured
//  differential diagnoses using Gemini 1.5 Flash (vision-capable).
//
//  SECRETS REQUIRED (same as ai-proxy):
//    GEMINI_KEY  — Google Gemini API key
// ═══════════════════════════════════════════════════════════════

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { base64Data, mimeType, imageType } = await req.json();

    if (!base64Data || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing base64Data or mimeType' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const geminiKey = Deno.env.get('GEMINI_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'Vision AI not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const contextNote = imageType === 'pdf'
      ? 'This is a medical lab report or clinical document in PDF format.'
      : imageType === 'xray'
      ? 'This is a chest X-ray or radiograph image.'
      : imageType === 'ct'
      ? 'This is a CT scan image.'
      : imageType === 'mri'
      ? 'This is an MRI scan image.'
      : 'This is a clinical photo (skin, wound, lesion, oral, eye, etc.).';

    const systemPrompt = `You are a senior clinical AI assistant for RxEasy, a medical platform used by PMDC-registered doctors in Pakistan.
${contextNote}
Analyze the provided medical image/document carefully and return ONLY a valid JSON object (no markdown, no backticks, no preamble) in this exact format:

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
      "confidence_pct": 65,
      "explanation": "Why this could fit",
      "key_features": ["feature1"],
      "watch_for": ["red flag"]
    }
  ]
}

Rules:
- Provide 2 to 4 differential diagnoses, ranked by likelihood
- Confidence: High (>70%), Medium (40-70%), Low (<40%)
- key_features: 2-4 concise tags (the specific visual clues)
- watch_for: 1-3 clinical red flags that would change management
- Use standard medical condition names that match Pakistani GP practice
- For lab reports: analyze the values and list relevant diagnoses
- For X-rays: describe the radiological findings
- For CT/MRI: describe the imaging findings
- Always include ICD-10 code where known
- CRITICAL: Return ONLY raw JSON. No markdown. No explanation outside JSON.`;

    // Build Gemini vision request
    let parts: object[];
    if (mimeType === 'application/pdf') {
      parts = [
        { text: systemPrompt },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ];
    } else {
      parts = [
        { text: systemPrompt },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ];
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.1, responseMimeType: 'application/json' },
        }),
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok || !geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Gemini error:', JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: 'Vision analysis failed. Please retry.' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let rawText = geminiData.candidates[0].content.parts[0].text;

    // Strip any accidental markdown fences
    rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    let result: VisionResult;
    try {
      result = JSON.parse(rawText);
    } catch (_) {
      // Try to extract JSON from response
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('snap-dx-vision error:', err);
    return new Response(JSON.stringify({ error: 'Analysis error: ' + (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
