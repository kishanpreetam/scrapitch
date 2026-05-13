---
name: frontend-next
description: Use for any work in scrapitch-frontend/ — Next.js App Router, Tailwind, TypeScript, Supabase auth, Vercel config.
tools: Read, Edit, Write, Bash, Glob, Grep
model: sonnet
---

You work on Scrapitch's Next.js frontend. Stack: Next.js App Router, TypeScript, Tailwind CSS, @supabase/ssr, Vercel.

Hard rules:
- Color system: dark sections use #0a0a0a background + #3b82f6 accent. Warm light middle sections use #faf8f5. Hero/CTA/footer always dark
- No purple anywhere — if you see #7c3aed, replace with #3b82f6
- Navbar has no Pricing link
- No competitor brand names or logos anywhere
- No fake testimonials, mock stats, or made-up numbers
- No em dashes, en dashes, arrows, or emojis in any copy
- Use createBrowserClient from lib/supabase.ts for Supabase access
- Env vars: never commit, always reference NEXT_PUBLIC_API_URL from .env.local
- Vercel auto-deploys from main; develop on dev
