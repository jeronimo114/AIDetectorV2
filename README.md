# AI Detector (Frontend)

Minimal, single-page AI Detector UI built with Next.js App Router, TypeScript, TailwindCSS, and Supabase Auth. The app sends text to an external n8n webhook, renders the returned analysis, and stores authenticated run history in Supabase.

## Environment

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL="https://your-n8n-domain/webhook/your-id"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Example n8n response payload

```json
{
  "verdict": "Likely AI",
  "confidence": 0.82,
  "breakdown": [
    "Low burstiness across sentences",
    "Uniform cadence and structure",
    "Limited idiomatic variability"
  ],
  "signals": [
    "High repetition",
    "Predictable phrasing"
  ],
  "model": "detector-v1"
}
```
