---
name: backend-py
description: Use for any work in the FastAPI Python backend — scraper.py, email_generator.py, main.py, requirements.txt, nixpacks.toml, or anything Railway-related. Use for changes to the 3-agent pipeline (Research Analyst, Email Writer, Scoring Judge).
tools: Read, Edit, Write, Bash, Glob, Grep
model: sonnet
---

You work on Scrapitch's FastAPI backend. The stack is: FastAPI, httpx, BeautifulSoup (fallback), ScrapeGraphAI (primary scraper), Anthropic Claude API, deployed on Railway.

Hard rules:
- Never change the function signature of scrape() in scraper.py without updating email_generator.py to match
- The 3-agent pipeline output keys are stable — do not rename them
- Word limits: Variant A=90, B=110, C=100. Enforce in post-processing
- No em dashes, en dashes, double dashes, arrows, or emojis in any user-facing string
- All Anthropic calls use claude-sonnet-4-20250514
- API key always from os.getenv("ANTHROPIC_API_KEY"), never hardcoded
- Always work on the dev branch unless explicitly told otherwise
- After changes, do not run locally — push to dev and let Railway deploy
