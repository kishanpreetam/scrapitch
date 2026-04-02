import json
import re
import os
import anthropic
from dotenv import load_dotenv

load_dotenv()


def generate_emails(scraped_data: dict) -> list[dict]:
    """
    Generate 3 cold email variants using Claude Opus 4.6.
    Returns a list of email variant dicts.
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    company_name = scraped_data.get("company_name", "the company")
    what_they_do = scraped_data.get("what_they_do", "")
    who_they_serve = scraped_data.get("who_they_serve", "")
    value_proposition = scraped_data.get("value_proposition", "")
    tone = scraped_data.get("tone", "professional")
    raw_snippet = scraped_data.get("raw_text_snippet", "")
    url = scraped_data.get("url", "")
    preferred_framework = scraped_data.get("preferred_framework", "All 3 Variants")
    preferred_tone = scraped_data.get("preferred_tone", "Professional")
    sender_industry = scraped_data.get("sender_industry", "B2B Agency")

    prompt = f"""You are an expert B2B cold email copywriter specializing in outreach for agency owners.

You have scraped the following data about a prospect's website:
- URL: {url}
- Company Name: {company_name}
- What they do: {what_they_do}
- Who they serve: {who_they_serve}
- Value proposition: {value_proposition}
- Tone/style of their website: {tone}
- Raw text snippet from their site: {raw_snippet[:800]}

SENDER CONTEXT (the person sending this email):
- Industry: {sender_industry}
- Preferred email tone: {preferred_tone}
- Requested framework: {preferred_framework}

Write exactly 3 cold email variants targeting this prospect. Each email must:
- NEVER start with "Hope this finds you well" or any generic opener
- Reference SPECIFIC content from their actual website (not generic phrases)
- Have EXACTLY ONE call to action (CTA)
- Be written from the perspective of a {sender_industry} owner offering their services
- Match the preferred tone: {preferred_tone}

VARIANT A — "The Direct" (PAS framework):
- Problem → Agitation → Solution structure
- Body MUST be under 60 words
- Get straight to the pain point

VARIANT B — "The Value-First":
- Lead with a concrete outcome or result they could achieve
- Body MUST be under 80 words
- Focus on what's in it for them

VARIANT C — "The Curious":
- Open with a genuine, specific icebreaker about something on their website
- Then bridge to your offer
- Body MUST be under 75 words

SCORING — score each email 1–10 based on:
- Personalization depth (30%): Does it reference specific details from their site?
- Length (20%): Does it respect the word limit for its variant?
- Single CTA (15%): Is there exactly one clear call to action?
- Problem-first framing (15%): Does it lead with their challenge, not your credentials?
- Subject line quality (10%): Is the subject line under 6 words and curiosity-inducing?
- No spam phrases (10%): Does it avoid generic opener clichés?

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
  "variants": [
    {{
      "variant": "A",
      "name": "The Direct",
      "subject_line": "...",
      "body": "...",
      "score": 8,
      "score_reasoning": "..."
    }},
    {{
      "variant": "B",
      "name": "The Value-First",
      "subject_line": "...",
      "body": "...",
      "score": 7,
      "score_reasoning": "..."
    }},
    {{
      "variant": "C",
      "name": "The Curious",
      "subject_line": "...",
      "body": "...",
      "score": 9,
      "score_reasoning": "..."
    }}
  ]
}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=(
            "You must respond with ONLY valid JSON. "
            "No markdown, no explanation, no code blocks. "
            "Just raw JSON starting with { and ending with }"
        ),
        messages=[{"role": "user", "content": prompt}],
    )

    text_content = response.content[0].text

    # Debug: print raw response so you can see exactly what Claude returned
    print("=== RAW CLAUDE RESPONSE ===")
    print(repr(text_content))
    print("===========================")

    # Strip markdown code fences (```json ... ``` or ``` ... ```)
    text_content = text_content.strip()
    text_content = re.sub(r"^```(?:json)?\s*\n?", "", text_content)
    text_content = re.sub(r"\n?```\s*$", "", text_content)
    text_content = text_content.strip()

    # Parse JSON with clear error reporting
    try:
        data = json.loads(text_content)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Claude returned invalid JSON — cannot parse response.\n"
            f"JSON error: {e}\n"
            f"Raw response was:\n{text_content}"
        ) from e

    if "variants" not in data:
        raise ValueError(
            f"Claude JSON is missing the 'variants' key.\n"
            f"Keys found: {list(data.keys())}\n"
            f"Raw response was:\n{text_content}"
        )

    return data["variants"]
