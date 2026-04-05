# RxEasy — AI Prescription Assistant

A mobile-first PWA for PMDC-registered GPs in Pakistan.  
Generates evidence-based prescriptions with Pakistani brand names.

---

## Architecture

```
User types disease
       │
       ▼
Supabase DB lookup  ──── found ──▶  Render prescription from DB (accurate, instant)
       │
    not found
       │
       ▼
Groq AI fallback  ──── Key 1 ──▶  Key 2 (if Key 1 fails)
       │
       ▼
  Render prescription
```

- **DB-first**: All known diseases are served directly from the Supabase database — no AI, no hallucination.
- **AI fallback**: Only triggered when the disease is not in the database.
- **AI provider**: Groq only (2 keys, server-side via Supabase Edge Function secrets).

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema SQL (see `supabase/schema.sql` if present)
3. Copy your **Project URL** and **anon/public key** into `config.js`

### 2. Groq API Keys

Get free API keys at [console.groq.com](https://console.groq.com)

Add them as **Supabase Edge Function secrets**:
- Dashboard → Edge Functions → `ai-proxy` → Secrets
  - `GROQ_KEY_1` = your primary Groq key
  - `GROQ_KEY_2` = your secondary Groq key

> Keys are **never** stored in source code or the browser.

### 3. Deploy Edge Function

```bash
supabase functions deploy ai-proxy
```

### 4. SnapDx Vision (optional — image diagnosis feature)

Requires separate secrets for `snap-dx-vision` Edge Function:
- `OPENROUTER_KEY`
- `TOGETHER_KEY`
- `GROQ_KEY` (can reuse Key 1)

---

## Environment Variables

| Variable         | Where                              | Required |
|------------------|------------------------------------|----------|
| `supabaseUrl`    | `config.js`                        | ✅        |
| `supabaseKey`    | `config.js`                        | ✅        |
| `GROQ_KEY_1`     | Supabase Edge Function secret      | ✅        |
| `GROQ_KEY_2`     | Supabase Edge Function secret      | ✅        |

---

## Files

```
index.html          — Main prescription chat UI
login.html          — Auth page
admin.html          — Admin panel (doctors, subscriptions, analytics)
snap-dx.html        — SnapDx image diagnosis feature
assets/js/
  ai-engine.js      — Clean Groq proxy caller (fallback only)
  database.js       — Supabase disease search + DB prescription builder
  prescription.js   — DB-first → AI-fallback orchestration + UI render
  app-core.js       — App state, init, flags, sheets
  subscription.js   — Subscription & query count logic
  data.js           — FORMULARY (AI prompt context) + drug reference
  ...
supabase/functions/
  ai-proxy/         — 2-key Groq fallback Edge Function
  snap-dx-vision/   — Image diagnosis Edge Function (separate feature)
```
