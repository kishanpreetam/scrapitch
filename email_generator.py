import json
import re
import os
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Industry-specific tone guide.
# Tone is determined by the PROSPECT's industry, NOT by matching their website's writing style.
_INDUSTRY_TONE = {
    "b2b_saas": (
        "Direct, metrics-driven, concise. Reference growth, churn, conversion, pipeline. "
        "Use numbers when possible. Preferred CTA: \"Worth a quick conversation?\""
    ),
    "marketing_agency": (
        "Conversational but sharp. Reference their clients, case studies, results. "
        "Speak peer-to-peer, not vendor-to-buyer. Preferred CTA: \"Open to comparing notes?\""
    ),
    "sales_consulting": (
        "Results-first, confident. Reference pipeline, deal velocity, quota attainment. "
        "Preferred CTA: \"Worth exploring?\""
    ),
    "it_msp": (
        "Technical but human. Reference uptime, security, migration, scalability. "
        "Avoid buzzwords. Preferred CTA: \"Worth a quick chat?\""
    ),
    "recruiting_staffing": (
        "Warm, relationship-focused. Reference their placements, specializations, candidate quality. "
        "Preferred CTA: \"Open to a conversation?\""
    ),
    "legal": (
        "Formal but approachable. Reference practice areas, client types, compliance needs. "
        "No slang. Preferred CTA: \"Would it make sense to connect?\""
    ),
    "financial_services": (
        "Trust-first, compliance-aware. Reference regulation, risk, growth, client assets. "
        "Conservative tone. Preferred CTA: \"Worth a brief conversation?\""
    ),
    "real_estate": (
        "Friendly, deal-oriented. Reference listings, market area, transaction volume. "
        "Preferred CTA: \"Open to a quick call?\""
    ),
    "healthcare_medtech": (
        "Cautious, empathetic, compliance-aware. Reference patient outcomes, operational efficiency, regulatory needs. "
        "Preferred CTA: \"Would it be worth connecting?\""
    ),
    "manufacturing": (
        "Practical, no-nonsense. Reference production, supply chain, efficiency, cost reduction. "
        "Preferred CTA: \"Worth a look?\""
    ),
    "ecommerce_dtc": (
        "Fast-paced, growth-focused. Reference AOV, conversion rates, retention, ad spend. "
        "Preferred CTA: \"Worth exploring?\""
    ),
    "freelancer_consultant": (
        "Casual, peer-level. Reference their niche, positioning, client type. "
        "Preferred CTA: \"Open to comparing notes?\""
    ),
}

_DEFAULT_INDUSTRY_TONE = (
    "Professional and direct. Lead with their problem, not your product. "
    "Preferred CTA: \"Worth a quick conversation?\""
)

# Prospect industry -> email angle and framework guidance
_INDUSTRY_FRAMEWORK = {
    "b2b_saas": (
        "Focus on workflow efficiency, integration pain points, and churn/retention metrics. "
        "Reference specific tools or workflows the prospect likely uses. Lead with time saved "
        "or revenue protected, not feature lists."
    ),
    "marketing_agency": (
        "Focus on client ROI, campaign performance, and retainer growth. "
        "Agencies care about results they can show clients and winning more accounts. "
        "Frame every offer around those outcomes."
    ),
    "sales_consulting": (
        "Focus on pipeline metrics, meeting rates, and quota attainment. "
        "Use revenue-specific language: deal velocity, conversion rates, ARR. "
        "Sales leaders respond to hard numbers and fast time-to-value."
    ),
    "it_msp": (
        "Focus on downtime reduction, security risk exposure, and cost per ticket. "
        "IT buyers are risk-averse. Lead with the cost of inaction before the benefit of action."
    ),
    "recruiting_staffing": (
        "Focus on time-to-hire, candidate quality, and placement rates. "
        "Staffing firms care about fill rates and client retention. Frame around those KPIs."
    ),
    "legal": (
        "Use a formal, credibility-first tone. Focus on client outcomes, billable efficiency, "
        "and risk reduction. Avoid hyperbole. Lawyers respond to precise, conservative language."
    ),
    "financial_services": (
        "Use compliance-aware framing. Focus on risk reduction, regulatory confidence, and growth. "
        "Never make performance guarantees. Lead with downside protection before upside."
    ),
    "real_estate": (
        "Focus on deal volume, lead conversion rates, and time on market. "
        "Real estate professionals respond to speed and pipeline. Make the ROI concrete and fast."
    ),
    "healthcare_medtech": (
        "Use a credibility-first, conservative tone. Focus on patient outcomes, operational "
        "efficiency, and compliance. Avoid hype. Reference evidence, process, and safety."
    ),
    "manufacturing": (
        "Use a direct, blunt tone. Focus on cost reduction, uptime, and throughput. "
        "No fluff. State the problem, state the fix, state what it costs them to wait."
    ),
    "ecommerce_dtc": (
        "Focus on revenue per visitor, conversion rate optimization, and AOV. "
        "Use specific metrics and dollar figures. DTC brands respond to growth levers "
        "they can tie directly to their P&L."
    ),
    "freelancer_consultant": (
        "Focus on client acquisition, positioning, and time savings. "
        "Solo operators care about landing better clients and reclaiming their calendar. "
        "Frame every offer around those two pain points."
    ),
}

_DEFAULT_FRAMEWORK = "Use a generic B2B framework focused on business outcomes and clear ROI."

# Keyword lists for auto-detecting prospect industry from scraped content.
# Order matters: more specific patterns should appear before generic ones.
_INDUSTRY_KEYWORDS: list[tuple[str, list[str]]] = [
    ("healthcare_medtech", ["healthcare", "medical", "medtech", "clinical", "patient", "ehr", "hipaa", "health system", "hospital", "physician"]),
    ("legal",              ["law firm", "attorney", "legal", "litigation", "counsel", "barrister", "solicitor", "paralegal"]),
    ("financial_services", ["fintech", "financial services", "wealth management", "investment", "banking", "insurance", "compliance", "fiduciary", "asset management"]),
    ("manufacturing",      ["manufacturing", "industrial", "factory", "cnc", "supply chain", "machining", "production line", "warehouse", "logistics"]),
    ("real_estate",        ["real estate", "property", "brokerage", "realty", "mls", "listings", "leasing", "mortgage", "commercial property"]),
    ("recruiting_staffing", ["recruiting", "staffing", "talent acquisition", "headhunting", "placement", "executive search", "hr consulting"]),
    ("it_msp",             ["managed service", "msp", "it services", "cybersecurity", "network", "helpdesk", "cloud migration", "soc", "infrastructure"]),
    ("sales_consulting",   ["sales consulting", "revenue consulting", "sales training", "sdrs", "bdr", "pipeline", "quota", "sales enablement"]),
    ("marketing_agency",   ["marketing agency", "creative agency", "digital agency", "advertising", "branding", "media buying", "content agency", "seo agency", "paid media"]),
    ("ecommerce_dtc",      ["ecommerce", "e-commerce", "shopify", "woocommerce", "dtc", "direct-to-consumer", "online store", "retail brand", "consumer brand"]),
    ("b2b_saas",           ["saas", "software", "platform", "api", "dashboard", "subscription software", "cloud software", "b2b software"]),
    ("freelancer_consultant", ["freelance", "solo consultant", "independent consultant", "solopreneur", "coaching", "business coach"]),
]

# Map the sender_industry string from the UI to our canonical industry IDs
_SENDER_INDUSTRY_MAP = {
    "B2B SaaS":                          "b2b_saas",
    "Marketing & Creative Agency":       "marketing_agency",
    "Sales & Revenue Consulting":        "sales_consulting",
    "IT Services & MSP":                 "it_msp",
    "Recruiting & Staffing":             "recruiting_staffing",
    "Legal Services":                    "legal",
    "Financial Services & Fintech":      "financial_services",
    "Real Estate":                       "real_estate",
    "Healthcare & MedTech":              "healthcare_medtech",
    "Manufacturing & Industrial":        "manufacturing",
    "Ecommerce & DTC":                   "ecommerce_dtc",
    "Freelancer / Solo Consultant":      "freelancer_consultant",
}


def cleanup_text(text: str) -> str:
    """Remove em dashes, double dashes, and arrows from generated text."""
    text = text.replace(" \u2014 ", ". ")
    text = text.replace("\u2014 ", ". ")
    text = text.replace(" \u2014", ".")
    text = text.replace("\u2014", ". ")
    text = text.replace(" -- ", ". ")
    text = text.replace("--", ". ")
    text = text.replace("\u2192", "")
    return text


def enforce_word_limit(text: str, max_words: int) -> str:
    """Truncate text to the last complete sentence within max_words."""
    words = text.split()
    if len(words) <= max_words:
        return text
    truncated = " ".join(words[:max_words])
    last_period = truncated.rfind(".")
    last_question = truncated.rfind("?")
    last_sentence_end = max(last_period, last_question)
    if last_sentence_end > 0:
        return truncated[:last_sentence_end + 1]
    return truncated + "."


def _detect_industry(scraped_data: dict) -> str:
    combined = " ".join([
        scraped_data.get("what_they_do", ""),
        scraped_data.get("who_they_serve", ""),
        scraped_data.get("value_proposition", ""),
        scraped_data.get("raw_text_snippet", "")[:400],
    ]).lower()
    for industry_id, keywords in _INDUSTRY_KEYWORDS:
        if any(kw in combined for kw in keywords):
            return industry_id
    return "default"


def generate_emails(scraped_data: dict) -> dict:
    """
    Generate 3 cold email variants + 3-email follow-up sequence using Claude Sonnet 4.6.
    Returns a dict with 'variants' and 'follow_up_sequence'.
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    company_name        = scraped_data.get("company_name", "the company")
    what_they_do        = scraped_data.get("what_they_do", "")
    who_they_serve      = scraped_data.get("who_they_serve", "")
    value_proposition   = scraped_data.get("value_proposition", "")
    raw_snippet         = scraped_data.get("raw_text_snippet", "")
    url                 = scraped_data.get("url", "")
    preferred_framework = scraped_data.get("preferred_framework", "All 3 Variants")
    sender_industry     = scraped_data.get("sender_industry", "Auto-detect")

    detected_industry = _detect_industry(scraped_data)

    # If the user chose "Auto-detect", use scraped detection;
    # otherwise map their explicit UI selection to our canonical industry ID.
    sender_industry_id   = _SENDER_INDUSTRY_MAP.get(sender_industry, detected_industry)
    industry_instruction = _INDUSTRY_FRAMEWORK.get(sender_industry_id, _DEFAULT_FRAMEWORK)
    industry_tone        = _INDUSTRY_TONE.get(sender_industry_id, _DEFAULT_INDUSTRY_TONE)

    # Use the canonical label for the prompt
    industry_label = sender_industry if sender_industry != "Auto-detect" else detected_industry.replace("_", " ").title()

    prompt = f"""You are an expert B2B cold email copywriter. You personally read the prospect's website before writing. Every email you write sounds like a human wrote it after actually reading their site.

PROSPECT CONTEXT (scraped from their website):
- URL: {url}
- Company: {company_name}
- What they do: {what_they_do}
- Who they serve: {who_they_serve}
- Value proposition: {value_proposition}
- Raw site text: {raw_snippet[:800]}

SENDER CONTEXT:
- Industry: {industry_label}
- Requested framework: {preferred_framework}

INDUSTRY TONE GUIDE for {industry_label}:
{industry_tone}

INDUSTRY FRAMEWORK for {industry_label}:
{industry_instruction}

==============================
ABSOLUTE RULES. NO EXCEPTIONS.
==============================

1. NEVER use em dashes, double dashes (--), or arrows anywhere in any email, subject line, or follow-up. Use periods or commas instead.
2. NEVER open with: "I hope this finds you well", "I wanted to reach out", "I came across your company", "Hope you're doing well", "Just wanted to", "My name is", or any generic opener.
3. NEVER use: "synergies", "leverage", "circle back", "touch base", "game-changer", "revolutionary", "scalable solutions", "cutting-edge", or any corporate jargon.
4. NEVER use exclamation marks. NEVER use ALL CAPS words. NEVER use emojis.
5. The FIRST sentence must reference something SPECIFIC from the scraped website above. An actual detail: a specific service they offer, a client type they mention, a result they claim, or a headline from their site. Not a generic statement.
6. EXACTLY ONE call to action per email. Make it low-friction. Use the preferred CTA from the industry tone guide above.
7. Lead with THEIR context or problem. Never open with what you or your company does.
8. Write short, punchy sentences. No compound sentences joined by em dashes. Period-separated.

WORD LIMITS (HARD):
- Variant A body: under 60 words
- Variant B body: under 80 words
- Variant C body: under 75 words
- Follow-up Day 3: under 40 words
- Follow-up Day 7: under 50 words
- Follow-up Day 14: under 40 words

GOOD email (write like this):
"Your case study on [specific result from their site] caught my eye. Most [their client type] hit a wall at [specific bottleneck]. We help get past it without [common painful workaround]. Worth a quick conversation?"

BAD email (never write like this):
"Hi, I hope this finds you well! I came across {company_name} and wanted to reach out about potential synergies. We offer scalable solutions that leverage cutting-edge technology to help businesses like yours. I'd love to schedule a 30-minute demo call at your earliest convenience!"

==============================
VARIANT STRUCTURES
==============================

VARIANT A — "The Direct" (PAS framework):
- Line 1: Name a SPECIFIC problem they likely have, inferred from their website and industry
- Line 2: The consequence if they don't fix it. Real, not fear-mongering.
- Line 3: Position yourself as the fix in one sentence
- CTA: One low-friction ask
- Hard limit: under 60 words. Short sentences. No dashes, no arrows.

VARIANT B — "Value-First":
- Line 1: Lead with a concrete outcome or result they could achieve. What they GET, not what you DO.
- Line 2: How you deliver it, tied to their specific context from the scraped data
- Line 3: Relevant proof or specificity
- CTA: Low-friction ask
- Hard limit: under 80 words. No dashes, no arrows.

VARIANT C — "The Curious":
- Line 1: Reference something genuinely specific from their website. A result, a service name, a client type, a headline.
- Line 2: Bridge naturally from that to your relevance
- Line 3: Create an open loop they want to close
- CTA: Permission-based ask. "Mind if I share?" or "Worth exploring?"
- Hard limit: under 75 words. No dashes, no arrows.

SUBJECT LINE RULES (generate 3 per variant):
- Under 6 words always
- Reference something specific to them: their company name, a service they offer, something from their site
- No ALL CAPS, no exclamation marks, no dashes, no arrows
- Formulas that work: "[Specific thing] on your site" / "Quick thought on [their service]" / "Your [specific offering]" / "[Their claimed result] caught my eye"

==============================
FOLLOW-UP SEQUENCE RULES
==============================

Day 3 (under 40 words): Light bump. New angle, not "just following up." Reference the original email briefly and add one new piece of value.
Day 7 (under 50 words): Different angle entirely. Share an insight, a relevant stat, or a different way to frame the problem.
Day 14 (under 40 words): Breakup email. Low pressure, acknowledge they're busy, leave the door open. These often get the highest reply rate.

NEVER write in follow-ups: "Just checking in", "Following up on my last email", "Did you get a chance to read my email", "Bumping this up", or any variation.
No dashes, no arrows in any follow-up.

==============================
SCORING RUBRIC (score each variant 1-10)
==============================

- Personalization depth (30%): Does line 1 reference specific scraped content? Not "love what you do" but actual details from their site.
- Length compliance (20%): Under the hard word limit for this variant?
- Single CTA (15%): Exactly one ask? Is it low-friction?
- Problem-first framing (15%): Opens with their context, not your product?
- Subject line quality (10%): Under 6 words, specific to them?
- No spam phrases (10%): Free of generic openers, corporate jargon, dashes, arrows?

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
  "variants": [
    {{
      "variant": "A",
      "name": "The Direct",
      "subject_lines": ["...", "...", "..."],
      "body": "...",
      "score": 8,
      "score_reasoning": "..."
    }},
    {{
      "variant": "B",
      "name": "The Value-First",
      "subject_lines": ["...", "...", "..."],
      "body": "...",
      "score": 7,
      "score_reasoning": "..."
    }},
    {{
      "variant": "C",
      "name": "The Curious",
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
        model="claude-sonnet-4-6",
        max_tokens=3000,
        system=(
            "ABSOLUTE FORMATTING RULES (NEVER VIOLATE):\n"
            "- NEVER use em dashes (\u2014) anywhere. Not in emails, not in subject lines, not in follow-ups, not in score reasoning.\n"
            "- NEVER use double dashes (--).\n"
            "- NEVER use arrows (\u2192).\n"
            "- Use periods or commas to separate thoughts. Write short sentences instead of long dashed sentences.\n"
            "- BAD: \"Your trade-in offer is compelling \u2014 but most prospects drop off before converting.\"\n"
            "- GOOD: \"Your trade-in offer is compelling. But most prospects drop off before converting.\"\n"
            "- BAD: \"credit toward iPhone 17, iPhone Air, and iPhone 17 Pro \u2014 is repeated prominently\"\n"
            "- GOOD: \"credit toward iPhone 17, iPhone Air, and iPhone 17 Pro. It's repeated prominently.\"\n\n"
            "TONE AND LENGTH:\n"
            "- Write like you're a smart salesperson who just spent 2 minutes reading their website and is firing off a quick, thoughtful email. Not like a copywriting textbook. Not like AI.\n"
            "- BAD (too formal, too structured): \"That gap between interest and action is where revenue disappears. We help close it without rebuilding your funnel.\"\n"
            "- GOOD (sounds human): \"Most visitors on that page are interested but never convert. We've helped similar brands fix that without changing the offer itself.\"\n"
            "- BAD (too long, too corporate): \"Businesses promoting the iPhone trade-in program often see strong top-of-funnel interest but weak follow-through at checkout. We help convert more of those visitors into completed trade-ins, without changing the offer itself.\"\n"
            "- GOOD (short, direct): \"Strong traffic to your trade-in page but completions look low. We help brands like yours close that gap. Worth a quick conversation?\"\n"
            "- Every email should feel like it took 30 seconds to write, even though it didn't. Short sentences. No filler. Get to the point.\n\n"
            "ENTERPRISE CONTEXT:\n"
            "- If the target website is a major enterprise (Apple, Google, Microsoft, Amazon, etc.), adjust the emails to be relevant. Do not pitch services to a trillion-dollar company as if they need your help with basic marketing. Instead, frame emails appropriately for the context.\n\n"
            "WORD LIMITS:\n"
            "- Variant A body MUST be under 60 words. Count them. Cut if over.\n"
            "- Variant B body MUST be under 80 words. Count them. Cut if over.\n"
            "- Variant C body MUST be under 75 words. Count them. Cut if over.\n"
            "- Shorter is always better.\n\n"
            "You must respond with ONLY valid JSON. "
            "No markdown, no explanation, no code blocks. "
            "Just raw JSON starting with { and ending with }"
        ),
        messages=[{"role": "user", "content": prompt}],
    )

    text_content = response.content[0].text

    # Strip markdown code fences if Claude adds them despite instructions
    text_content = text_content.strip()
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

    # Per-variant word limits (with a small buffer above the stated target)
    _WORD_LIMITS = {"A": 65, "B": 85, "C": 80}

    # Post-process: clean formatting, then enforce word limits
    for variant in data.get("variants", []):
        body = cleanup_text(variant.get("body", ""))
        limit = _WORD_LIMITS.get(variant.get("variant", ""), 85)
        variant["body"] = enforce_word_limit(body, limit)
        variant["subject_lines"] = [cleanup_text(s) for s in variant.get("subject_lines", [])]
        variant["score_reasoning"] = cleanup_text(variant.get("score_reasoning", ""))

    for follow_up in data.get("follow_up_sequence", []):
        follow_up["subject"] = cleanup_text(follow_up.get("subject", ""))
        follow_up["body"] = cleanup_text(follow_up.get("body", ""))

    return data
