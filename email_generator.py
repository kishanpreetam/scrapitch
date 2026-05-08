# ---------------------------------------------------------------------------
# v2 design note
# ---------------------------------------------------------------------------
# Agent 1 (Context Analyst) was folded into the structured context passed to
# Agent 2 to reduce per-generation API calls. The 3-agent framing in product
# docs still holds conceptually — Research / Write / Score — but only 2
# Anthropic API calls happen per generate. Revisit if email quality degrades.
# ---------------------------------------------------------------------------

import json
import re
import os
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# ---------------------------------------------------------------------------
# Scoring weights per use case (each column must sum to 100)
# ---------------------------------------------------------------------------
_SCORE_WEIGHTS: dict[str, dict[str, int]] = {
    "b2b_sales": {
        "personalization_depth":    30,
        "length_compliance":        20,
        "single_cta":               15,
        "problem_first_framing":    15,
        "subject_line_quality":     10,
        "no_spam_phrases":          10,
    },
    "masters_outreach": {
        "personalization_depth":    35,
        "length_compliance":        15,
        "single_cta":               15,
        "problem_first_framing":    20,
        "subject_line_quality":      5,
        "no_spam_phrases":          10,
    },
    "job_hunt": {
        "personalization_depth":    25,
        "length_compliance":        20,
        "single_cta":               15,
        "problem_first_framing":    15,
        "subject_line_quality":     10,
        "no_spam_phrases":          15,
    },
    "executive_outreach": {
        "personalization_depth":    30,
        "length_compliance":        25,
        "single_cta":               15,
        "problem_first_framing":    15,
        "subject_line_quality":      5,
        "no_spam_phrases":          10,
    },
    "networking": {
        "personalization_depth":    25,
        "length_compliance":        20,
        "single_cta":               15,
        "problem_first_framing":    15,
        "subject_line_quality":     10,
        "no_spam_phrases":          15,
    },
}

# Verify all columns sum to 100 at import time
for _uc, _w in _SCORE_WEIGHTS.items():
    assert sum(_w.values()) == 100, (
        f"Score weights for '{_uc}' sum to {sum(_w.values())}, expected 100"
    )

# ---------------------------------------------------------------------------
# Word limits per use case per variant
# ---------------------------------------------------------------------------
_WORD_LIMITS: dict[str, dict[str, int]] = {
    "b2b_sales":          {"A": 80,  "B": 110, "C": 100},
    "masters_outreach":   {"A": 120, "B": 140, "C": 160},
    "job_hunt":           {"A": 100, "B": 100, "C": 100},
    "executive_outreach": {"A": 70,  "B": 70,  "C": 70},
    "networking":         {"A": 90,  "B": 90,  "C": 90},
}

# ---------------------------------------------------------------------------
# Agent 2 system prompt templates — one per use case
# ---------------------------------------------------------------------------
_SHARED_RULES = """
SHARED RULES (apply to every email, no exceptions):
- Real specifics from the scraped page MUST appear in line 1 or 2 of every email.
- Single CTA per email — no more than one call to action.
- No em dashes (use a comma or period instead), no en dashes, no double dashes (--),
  no arrows (use plain words instead), and no emojis anywhere in the output.
- Forbidden phrases that must NOT appear anywhere in the output:
    "Hope this finds you well"
    "I wanted to reach out"
    "Just following up"
    "I am passionate about"
    "Pick your brain"
- Subject line: under 7 words, references the target specifically.
- about_user provides credibility — use at most ONE sentence of it in the body.
- user_ask is the CTA. Paraphrase and soften it — do NOT paste it verbatim.
"""

_USE_CASE_SYSTEM_PROMPTS: dict[str, str] = {

    "b2b_sales": _SHARED_RULES + """
USE CASE: B2B Sales outreach

PER-USE-CASE OVERRIDES:
- Variant A uses the PAS framework (Problem, Agitation, Solution).
- Variant B uses a Value-First framework (lead with a concrete outcome or result).
- Variant C uses a Hyper-Personalized Icebreaker framework (open with something
  genuinely specific from the prospect's page, then bridge to your offer).
- Word limits: Variant A max 80 words body, Variant B max 110 words body,
  Variant C max 100 words body.
- CTA pattern (choose one): "Worth a quick look?" or "Open to a 10 min call next week?"
- Tone default: warm but business-like.
""",

    "masters_outreach": _SHARED_RULES + """
USE CASE: Masters / PhD / Research lab outreach

PER-USE-CASE OVERRIDES:
- Every variant must follow this structure: research alignment first,
  your relevant work second, specific ask third.
- Word limits: Variant A max 120 words body, Variant B max 140 words body,
  Variant C max 160 words body.
- CTA pattern (choose one): "Would you be open to a brief Zoom about openings
  in your lab?" or "Could I send a 1-page research summary?"
- Tone default: formal, respectful, and specific.
- MANDATORY: Every variant MUST reference at least one specific paper, project,
  or research area that was found on the scraped page. Do not use generic
  academic framing.
""",

    "job_hunt": _SHARED_RULES + """
USE CASE: Job hunt / cold application outreach

PER-USE-CASE OVERRIDES:
- Every variant must follow this structure: specific role context first,
  relevant proof second, soft ask third.
- Word limits: all variants under 100 words body.
- CTA pattern (choose one): "Would it make sense to share my CV?" or
  "Could you point me to the right person?"
- Tone default: confident but not desperate, not over-eager.
""",

    "executive_outreach": _SHARED_RULES + """
USE CASE: Executive / C-suite outreach

PER-USE-CASE OVERRIDES:
- Every variant must follow this structure: one specific insight or value first,
  why you second, low-friction ask third.
- Word limits: all variants under 70 words body. This is tighter than B2B.
  Be ruthless with editing.
- CTA pattern (choose one): "Worth 15 mins next week?" or
  "Mind if I send a 1-pager?"
- Tone default: peer-to-peer. Never deferential. Write as an equal.
""",

    "networking": _SHARED_RULES + """
USE CASE: Networking / relationship-building outreach

PER-USE-CASE OVERRIDES:
- Every variant must follow this structure: specific reason for reaching out first,
  quick context on you second, small ask third.
- Word limits: all variants under 90 words body.
- CTA pattern (choose one): "Open to a 20 min coffee chat (virtual)?" or
  "Could I ask one specific question by email?"
- Tone default: warm, human, and low-pressure.
""",
}


# ---------------------------------------------------------------------------
# Post-processing helpers
# ---------------------------------------------------------------------------

def _count_words(text: str) -> int:
    return len(text.split())


def _truncate_to_word_limit(text: str, limit: int) -> str:
    """Hard-truncate body text to `limit` words, ending on a complete sentence
    where possible. Falls back to a raw word slice if no sentence boundary fits."""
    words = text.split()
    if len(words) <= limit:
        return text
    truncated = " ".join(words[:limit])
    # Try to end on the last sentence boundary within the truncated block
    last_period = max(truncated.rfind("."), truncated.rfind("?"), truncated.rfind("!"))
    if last_period > len(truncated) // 2:
        return truncated[: last_period + 1].strip()
    return truncated.strip()


def _strip_forbidden(text: str) -> str:
    """Remove forbidden punctuation and characters from a string."""
    # Em dash, en dash, double dash
    text = text.replace("—", ",")   # em dash
    text = text.replace("–", ",")   # en dash
    text = re.sub(r"--+", ",", text)    # double (or more) dashes
    # Arrows (common Unicode and ASCII)
    text = text.replace("→", "")   # ->
    text = text.replace("←", "")   # <-
    text = text.replace("⇒", "")   # =>
    text = re.sub(r"-{1,2}>", "", text) # -> or -->
    text = re.sub(r"<-{1,2}", "", text) # <- or <--
    # Remove emoji (broad Unicode ranges)
    text = re.sub(
        r"[\U0001F000-\U0001FFFF"
        r"\U00002600-\U000027FF"
        r"\U0000FE00-\U0000FE0F"
        r"\U0001F900-\U0001F9FF]+",
        "",
        text,
    )
    return text


def _post_process_variants(variants: list[dict], use_case: str) -> list[dict]:
    """Enforce word limits and strip forbidden characters from all variant bodies."""
    limits = _WORD_LIMITS.get(use_case, {"A": 100, "B": 110, "C": 100})
    for v in variants:
        letter = v.get("variant", "A")
        limit = limits.get(letter, 100)
        body = _strip_forbidden(v.get("body", ""))
        body = _truncate_to_word_limit(body, limit)
        v["body"] = body
        # Also clean subject lines
        v["subject_lines"] = [
            _strip_forbidden(s) for s in v.get("subject_lines", [])
        ]
    return variants


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def generate_emails(scraped_data: dict) -> dict:
    """
    Generate 3 cold email variants + follow-up sequence using a 3-agent pipeline.

    Expected keys in scraped_data (v2 scraper output):
        company_name, description, services, target_audience, value_proposition,
        tone_of_voice, specific_details (list), url

    Additional keys injected by main.py:
        use_case, about_user, user_ask, highlights (optional),
        tone_preference (optional, default "auto")

    Returns a dict with stable pipeline output keys:
        variants, follow_up_sequence
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    # --- Scraped fields ---
    company_name      = scraped_data.get("company_name", "the company")
    description       = scraped_data.get("description", "")
    services          = scraped_data.get("services", "")
    target_audience   = scraped_data.get("target_audience", "")
    value_proposition = scraped_data.get("value_proposition", "")
    tone_of_voice     = scraped_data.get("tone_of_voice", "professional")
    specific_details  = scraped_data.get("specific_details", [])
    url               = scraped_data.get("url", "")

    # --- User-supplied context ---
    use_case         = scraped_data.get("use_case", "b2b_sales")
    about_user       = scraped_data.get("about_user", "")
    user_ask         = scraped_data.get("user_ask", "")
    highlights       = scraped_data.get("highlights", "") or ""
    tone_preference  = scraped_data.get("tone_preference", "auto") or "auto"

    specific_details_str = "\n".join(
        f"  - {d}" for d in (specific_details if isinstance(specific_details, list) else [])
    )

    weights = _SCORE_WEIGHTS.get(use_case, _SCORE_WEIGHTS["b2b_sales"])
    limits  = _WORD_LIMITS.get(use_case, {"A": 100, "B": 110, "C": 100})

    # -----------------------------------------------------------------------
    # AGENT 1 — Context Analyst (system prompt selects use-case rules)
    # We skip a separate API call for the analyst and fold its role into
    # the structured context block fed to Agent 2.
    # -----------------------------------------------------------------------

    # -----------------------------------------------------------------------
    # AGENT 2 — Email Writer
    # -----------------------------------------------------------------------
    system_prompt = _USE_CASE_SYSTEM_PROMPTS.get(use_case, _USE_CASE_SYSTEM_PROMPTS["b2b_sales"])

    writer_prompt = f"""You are an expert cold email copywriter. Write 3 cold email variants
for the use case described in your system prompt.

PROSPECT INTELLIGENCE (from scraped page):
- URL: {url}
- Company name: {company_name}
- Description: {description}
- Services: {services}
- Target audience: {target_audience}
- Value proposition: {value_proposition}
- Tone of voice: {tone_of_voice}
- Specific details from the page:
{specific_details_str}

SENDER CONTEXT:
- About the sender: {about_user}
- What the sender is asking for (CTA intent): {user_ask}
- Additional highlights: {highlights if highlights else "None provided"}
- Tone preference: {tone_preference}

WORD LIMITS FOR THIS USE CASE ({use_case}):
- Variant A body: max {limits["A"]} words
- Variant B body: max {limits["B"]} words
- Variant C body: max {limits["C"]} words

SCORING WEIGHTS FOR THIS USE CASE (out of 100 total):
- Personalization depth: {weights["personalization_depth"]}
- Length compliance: {weights["length_compliance"]}
- Single CTA: {weights["single_cta"]}
- Problem-first / value-first framing: {weights["problem_first_framing"]}
- Subject line quality: {weights["subject_line_quality"]}
- No spam phrases: {weights["no_spam_phrases"]}

Score each variant 1-10 using the weights above as your rubric. Include
a brief score_reasoning explaining your score.

After the 3 main variants, generate a 3-email follow-up sequence.
Each follow-up must be under 50 words with a single CTA:
- Follow-up 1 (day 3): Light bump referencing the original email
- Follow-up 2 (day 7): Add a new value point or insight not mentioned before
- Follow-up 3 (day 14): Breakup email — low pressure, leave the door open

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
  "variants": [
    {{
      "variant": "A",
      "name": "...",
      "subject_lines": ["...", "...", "..."],
      "body": "...",
      "score": 8,
      "score_reasoning": "..."
    }},
    {{
      "variant": "B",
      "name": "...",
      "subject_lines": ["...", "...", "..."],
      "body": "...",
      "score": 7,
      "score_reasoning": "..."
    }},
    {{
      "variant": "C",
      "name": "...",
      "subject_lines": ["...", "...", "..."],
      "body": "...",
      "score": 9,
      "score_reasoning": "..."
    }}
  ],
  "follow_up_sequence": [
    {{
      "day": 3,
      "subject": "...",
      "body": "..."
    }},
    {{
      "day": 7,
      "subject": "...",
      "body": "..."
    }},
    {{
      "day": 14,
      "subject": "...",
      "body": "..."
    }}
  ]
}}"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        system=(
            system_prompt
            + "\n\nYou must respond with ONLY valid JSON. "
            "No markdown, no explanation, no code blocks. "
            "Just raw JSON starting with { and ending with }"
        ),
        messages=[{"role": "user", "content": writer_prompt}],
    )

    text_content = response.content[0].text.strip()
    text_content = re.sub(r"^```(?:json)?\s*\n?", "", text_content)
    text_content = re.sub(r"\n?```\s*$", "", text_content)
    text_content = text_content.strip()

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

    # -----------------------------------------------------------------------
    # AGENT 3 — Post-processing / Scoring Judge
    # Apply word limits, strip forbidden chars. Scoring is already embedded
    # in the writer output; the judge's weighting logic is enforced via the
    # prompt weights injected above.
    # -----------------------------------------------------------------------
    data["variants"] = _post_process_variants(data["variants"], use_case)

    return data
