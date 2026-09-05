# Scrapitch API — Integration Guide

This guide shows how to add Scrapitch's cold-email generator to your own site.
You build your own UI; you call our API; you get back 3 personalized email
drafts (with subject lines and reply-rate scores) to render however you like.

**Your stack (React 18 + Vite + Tailwind on Vercel) is fully supported.**

---

## How it works (the shape of it)

```
Your React app (browser)
      │  POST /api/generate   (same origin — NO key in the browser)
      ▼
Your Vercel serverless function   (adds the secret X-API-Key header)
      │  POST https://web-production-f17a7.up.railway.app/generate
      ▼
Scrapitch backend   (checks your key, runs the pipeline, returns 3 drafts)
```

The **only rule that matters**: your API key must live on the *server* (the
Vercel function), never in your React/browser code. If it's in the browser,
anyone can open dev-tools and steal it.

---

## Setup (3 steps)

### 1. Add your API key to Vercel (server-side secret)

Your key was shared with you separately (it looks like `sk_propel_…`).
In your Vercel project: **Settings → Environment Variables → Add**

| Name | Value |
|------|-------|
| `SCRAPITCH_API_KEY` | *(the key you were given)* |

Do **not** prefix it with `VITE_` or `NEXT_PUBLIC_` — that would leak it to the
browser. Plain `SCRAPITCH_API_KEY` keeps it server-only. Redeploy after adding.

### 2. Add the serverless proxy function

Create **`/api/generate.js`** at the root of your repo (Vercel auto-detects the
`/api` folder and runs it as a serverless function — this works for Vite/static
projects too, no extra config):

```js
// /api/generate.js — runs on Vercel's server; your key stays secret here.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstream = await fetch(
      "https://web-production-f17a7.up.railway.app/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.SCRAPITCH_API_KEY,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Could not reach the generator." });
  }
}
```

### 3. Call it from your React UI

Fetch your **own** `/api/generate` (same origin — no key, no CORS headaches):

```jsx
async function generate(form) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      use_case: "b2b_sales",
      url: form.url,                 // OR pasted_text (see rules below)
      about_user: form.aboutYou,     // required
      user_ask: form.ask,            // required
      highlights: form.proof,        // optional
    }),
  });

  const data = await res.json();

  if (data.status === "unreadable") {
    // We couldn't read enough from that page — show data.message to the user.
    return;
  }
  // data.variants is your array of 3 drafts — render them however you like.
  return data;
}
```

That's it. Build your form + results UI around this call.

---

## Request reference

`POST /generate` — JSON body.

### Required for every request
| Field | Type | Notes |
|-------|------|-------|
| `use_case` | string | One of: `b2b_sales`, `masters_outreach`, `job_hunt`, `executive_outreach`, `networking` |
| `about_user` | string | Who *you* are / what you deliver. 1–2000 chars. |
| `user_ask` | string | Your one specific ask. 1–1000 chars. |

### The recipient — pick ONE of these
- `url` — the prospect's page (company site, lab page, job posting, etc.), **or**
- `pasted_text` — paste their bio/about text directly (≤10000 chars), **or**
- for `networking` only: `person_name` (+ optional `person_disambiguator` like company/city to narrow the search).

### Optional (sharpen the draft)
| Field | Type | Good for |
|-------|------|----------|
| `highlights` | string (≤2000) | Proof: numbers, named customers, wins |
| `tone_preference` | `auto` \| `formal` \| `warm` \| `direct` | Defaults to `auto` |
| `target_role` | string | job_hunt — the role you're after |
| `portfolio_link` | string | job_hunt — portfolio/GitHub |
| `paper_or_topic` | string | masters_outreach — a specific paper of theirs |
| `program_term` | string | masters_outreach — when you'd start |
| `accomplishment`, `current_school_year`, `company_stage`, `traction_metric` | string | context per use case |

---

## Response reference

**Success (HTTP 200):**
```json
{
  "url": "https://prospect.com/",
  "company_name": "Prospect Inc",
  "limited_personalization": false,
  "variants": [
    {
      "variant": "A",
      "name": "specific role context",
      "subject_lines": ["...", "...", "..."],
      "body": "Full email body text...",
      "score": 7,
      "score_reasoning": "Why this one is strong..."
    }
    // ...3 variants total
  ]
}
```
- Render `variants` however you like. `score` (0–10) lets you rank/highlight the strongest.
- `limited_personalization: true` means we could only read thin detail from the page — the drafts are more generic; you may want to show a small note.

**Page unreadable (also HTTP 200):**
```json
{ "status": "unreadable", "message": "We couldn't read enough from that page..." }
```
Check for `data.status === "unreadable"` and show `message` — it's guidance, not an error.

---

## Errors

| Status | Meaning | What to do |
|--------|---------|------------|
| `401` | Invalid or missing API key | Check `SCRAPITCH_API_KEY` is set in Vercel and the function sends it |
| `422` | Bad input, or the page couldn't be reached | Show a "check the URL / fields" message |
| `429` | Rate limit exceeded | Back off and retry shortly (see limits below) |
| `5xx` | Server issue | Retry; if it persists, ping the Scrapitch owner |

---

## Rate limits

Your key is capped at **10 requests/minute** and **200 requests/day**.
Exceeding either returns `429`. Ask the Scrapitch owner if you need more.

---

## Local development

Vercel serverless functions in `/api` do **not** run under plain `vite dev`.
To test the full flow locally, run **`vercel dev`** instead (it runs both your
Vite app and the `/api` functions together). Or, while developing, just point at
your deployed preview URL.

---

## Resume parsing (optional)

If your use case involves resumes (job hunt / master's), there's also
`POST /parse-resume` — a multipart upload (field name `file`, PDF or DOCX, ≤10MB)
that returns a one-line summary you can drop into `about_user`. Proxy it the same
way (a second `/api/parse-resume.js` function that forwards the FormData with the
`X-API-Key` header — don't set Content-Type manually for multipart). Ask if you
want a ready-made snippet.

---

*Questions? Contact the Scrapitch owner. Keep your API key secret — if it leaks,
ask for a rotation.*
