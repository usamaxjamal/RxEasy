# RxEasy — Snap Dx Feature

## What is Snap Dx?

**Snap Dx** is a new AI-powered clinical image analysis page added to RxEasy. Doctors can upload a medical image or document and receive ranked differential diagnoses with confidence levels, ICD codes, key features, red-flag warnings, and a one-tap "Generate Prescription" button.

---

## How to Access

1. Open RxEasy and tap the **hamburger menu** (top-left)
2. Under **Clinical**, tap **📸 Snap Dx**
3. You will be navigated to `/snap-dx.html`

---

## Supported Input Types

| Type | Examples |
|------|----------|
| Clinical Photo | Skin rash, lesion, wound, oral condition, eye |
| X-Ray | Chest X-ray, bone fracture |
| CT Scan | Head CT, abdominal CT |
| MRI | Brain MRI, spine MRI |
| Lab Report (Image) | CBC, LFT, RFT as photo |
| Lab Report (PDF) | Any PDF lab report, up to 20 MB |

---

## Feature Walkthrough

### Upload
- Drag & drop a file, click **Choose File**, or tap **Camera** (mobile)
- Select image type (or leave on Auto-detect for AI to identify)
- Tap **Analyze Image**

### AI Analysis
- The image is sent to the `snap-dx-vision` Supabase Edge Function
- Gemini 1.5 Flash (vision model) analyzes it and returns structured JSON
- Loading skeleton shown with progressive labels during analysis

### Results
- **AI Clinical Summary** — 2–3 sentence description of findings
- **AI Focus Overlay** — animated highlight boxes on the image (regions of clinical interest)
- **Differential Diagnoses** — 2–4 ranked cards, each showing:
  - Condition name + Primary Dx badge (#1 rank)
  - Confidence level + percentage bar (High/Medium/Low)
  - ICD-10 code
  - Clinical explanation
  - Key feature tags
  - Watch For red-flag warnings

### Generate Prescription
Each diagnosis card has a **Generate Prescription** button. Tapping it:

1. **Smart DB Match** — searches the Supabase `diseases` table using:
   - ILIKE exact name match
   - ILIKE alias match
   - JS fuzzy + Levenshtein scoring
   - Postgres trigram RPC (`search_diseases_trgm`)
2. **If matched** → builds a full structured prescription from DB (drugs, doses, investigations, red flags, referral criteria)
3. **If no match** → falls back to AI via `ai-proxy` Edge Function

The prescription slides up in a panel with options to **Copy** or **Open in Prescribe**.

### Back to Prescribe
- Tap **← Prescribe** in the header to return to `index.html`
- If "Open in Prescribe" was tapped, the diagnosis is pre-filled in the main input via `localStorage('snapdx_pending')`

---

## Supabase Changes Applied

### New Table: `snap_dx_analyses`
Stores each analysis with file path, AI description, and differentials JSON.
```
user_id · file_path · file_type · file_name · ai_description · differentials (jsonb) · created_at
```
RLS: doctors can only read/write/delete their own rows.

### New Storage Bucket: `snap-dx-uploads`
- **Name:** `snap-dx-uploads`
- **Public:** No (private, signed URLs only)
- **Max file size:** 20 MB
- **Allowed types:** JPEG, PNG, WebP, GIF, PDF
- **RLS:** Each doctor's uploads are in a `{user_id}/` folder — only they can access their files

### New Edge Function: `snap-dx-vision`
Deployed at: `https://epvfbxzuziihhcaaaizp.supabase.co/functions/v1/snap-dx-vision`
- Accepts `{ base64Data, mimeType, imageType }`
- Uses `GEMINI_KEY` secret (same Gemini setup as `ai-proxy`)
- Returns structured differential diagnosis JSON

---

## Required Supabase Secret

The Vision Edge Function needs your **Gemini API key** added as a secret:

1. Go to [Supabase Dashboard](https://supabase.com) → Your Project
2. **Edge Functions** → **snap-dx-vision** → **Secrets**
3. Add: `GEMINI_KEY` = `your-gemini-api-key`

> Get a free Gemini key at: https://aistudio.google.com/app/apikey

---

## Testing Checklist

### 1. Sidebar Button
- Open RxEasy → hamburger menu
- Confirm **📸 Snap Dx** appears under Clinical with teal styling

### 2. Navigation
- Tap Snap Dx → lands on `snap-dx.html` with full RxEasy header
- Tap **← Prescribe** → returns to `index.html`

### 3. Upload — Clinical Photo
- Upload a JPG of a skin rash/lesion
- Leave type as Auto-detect → Analyze
- Confirm AI description + 2-4 differentials

### 4. Upload — PDF Lab Report
- Upload any PDF lab report
- Type auto-selects to Lab Report
- Confirm PDF name/size shown in preview

### 5. Smart Disease Matching — UTI vs "Urinary Tract Infection"
- After getting UTI in differentials, tap Generate Prescription
- Should match from DB (green "✅ From RxEasy Disease Database" badge)
- Test with exact name "Urinary Tract Infection" AND abbreviation "UTI" — both should match

### 6. AI Fallback
- For a rare condition not in DB (e.g. "Hamman-Rich Syndrome")
- Should fall back to AI (blue "🤖 AI-Generated" badge)

### 7. Copy & Open in Prescribe
- In prescription panel → Copy → check clipboard
- Open in Prescribe → returns to index.html with diagnosis pre-filled

### 8. Mobile Camera
- On mobile, tap Camera button → device camera opens
- Take photo → analyze

---

## Modified Files

| File | Change |
|------|--------|
| `index.html` | Added Snap Dx sidebar button + CSS styles |
| `assets/js/app-core.js` | Added `snapdx_pending` return handler |

## New Files

| File | Description |
|------|-------------|
| `snap-dx.html` | Complete Snap Dx page (~1,100 lines) |
| `supabase/functions/snap-dx-vision/index.ts` | Vision Edge Function |
