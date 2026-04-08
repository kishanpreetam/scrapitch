import json
import re
import os
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Tone → writing style instructions
_TONE_STYLE = {
    "formal": (
        "Use professional, structured sentences with formal vocabulary. "
        "Avoid contractions. Lead with credentials and structured logic."
    ),
    "casual": (
        "Use conversational language, shorter sentences, and contractions. "
        "Sound like a peer reaching out, not a salesperson."
    ),
    "technical": (
        "Use precise industry terminology and specific technical language. "
        "Reference exact tools, methodologies, or metrics where possible."
    ),
    "inspirational": (
        "Use energetic, outcome-focused language. Lead with transformation "
        "and bold results. Short punchy sentences."
    ),
}

# Prospect industry → email framework + tone guidance
# Keys must match the canonical industry IDs used in _INDUSTRY_KEYWORDS and sender_industry mapping.
_INDUSTRY_FRAMEWORK = {
    "b2b_saas": (
        "Focus on workflow efficiency, integration pain points, and churn/retention metrics. "
        "Reference specific tools or workflows the prospect likely uses. Lead with time saved "
        "or revenue protected, not feature lists."
    ),
    "marketing_agency": (
        "Focus on client ROI, campaign performance, and retainer growth. "
        "Agencies care about results they can show clients and winning more accounts — "
        "frame every offer around those outcomes."
    ),
    "sales_consulting": (
        "Focus on pipeline metrics, meeting rates, and quota attainment. "
        "Use revenue-specific language: deal velocity, conversion rates, ARR. "
        "Sales leaders respond to hard numbers and fast time-to-value."
    ),
    "it_msp": (
        "Focus on downtime reduction, security risk exposure, and cost per ticket. "
        "IT buyers are risk-averse — lead with the cost of inaction before the benefit of action."
    ),
    "recruiting_staffing": (
        "Focus on time-to-hire, candidate quality, and placement rates. "
        "Staffing firms care about fill rates and client retention — frame around those KPIs."
    ),
    "legal": (
        "Use a formal, credibility-first tone. Focus on client outcomes, billable efficiency, "
        "and risk reduction. Avoid hyperbole — lawyers respond to precise, conservative language."
    ),
    "financial_services": (
        "Use compliance-aware framing. Focus on risk reduction, regulatory confidence, and growth. "
        "Never make performance guarantees. Lead with downside protection before upside."
    ),
    "real_estate": (
        "Focus on deal volume, lead conversion rates, and time on market. "
        "Real estate professionals respond to speed and pipeline — make the ROI concrete and fast."
    ),
    "healthcare_medtech": (
        "Use a credibility-first, conservative tone. Focus on patient outcomes, operational "
        "efficiency, and compliance. Avoid hype — reference evidence, process, and safety."
    ),
    "manufacturing": (
        "Use a direct, blunt tone. Focus on cost reduction, uptime, and throughput. "
        "No fluff — state the problem, state the fix, state what it costs them to wait."
    ),
    "ecommerce_dtc": (
        "Focus on revenue per visitor, conversion rate optimization, and AOV. "
        "Use specific metrics and dollar figures. DTC brands respond to growth levers "
        "they can tie directly to their P&L."
    ),
    "freelancer_consultant": (
        "Focus on client acquisition, positioning, and time savings. "
        "Solo operators care about landing better clients and reclaiming their calendar — "
        "frame every offer around those two pain points."
    ),
}

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

_DEFAULT_FRAMEWORK = "Use a generic B2B framework focused on business outcomes and clear ROI."


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

    company_name      = scraped_data.get("company_name", "the company")
    what_they_do      = scraped_data.get("what_they_do", "")
    who_they_serve    = scraped_data.get("who_they_serve", "")
    value_proposition = scraped_data.get("value_proposition", "")
    tone              = scraped_data.get("tone", "professional")
    raw_snippet       = scraped_data.get("raw_text_snippet", "")
    url               = scraped_data.get("url", "")
    preferred_framework = scraped_data.get("preferred_framework", "All 3 Variants")
    preferred_tone      = scraped_data.get("preferred_tone", "Professional")
    sender_industry     = scraped_data.get("sender_industry", "Auto-detect")

    tone_instruction  = _TONE_STYLE.get(tone.lower(), "Match the prospect's communication style.")
    detected_industry = _detect_industry(scraped_data)

    # If the user chose "Auto-detect" (or left it blank), use scraped detection;
    # otherwise map their explicit UI selection to our canonical industry ID.
    sender_industry_id = _SENDER_INDUSTRY_MAP.get(sender_industry, detected_industry)
    industry_instruction = _INDUSTRY_FRAMEWORK.get(sender_industry_id, _DEFAULT_FRAMEWORK)

    # Use the canonical label for the prompt (fall back to the raw string if not mapped)
    industry_label = sender_industry if sender_industry != "Auto-detect" else detected_industry.replace("_", " ").title()

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
- Industry: {industry_label}
- Preferred email tone: {preferred_tone}
- Requested framework: {preferred_framework}

WRITING STYLE (based on prospect's detected website tone — {tone}):
{tone_instruction}

INDUSTRY FRAMEWORK (industry — {industry_label}):
{industry_instruction}

Write exactly 3 cold email variants targeting this prospect. Each email must:
- NEVER start with "Hope this finds you well" or any generic opener
- Reference SPECIFIC content from their actual website (not generic phrases)
- Have EXACTLY ONE call to action (CTA)
- Be written from the perspective of a {industry_label} owner offering their services
- Match the preferred tone: {preferred_tone}
- Apply the writing style instruction above

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

For each variant, generate 3 subject line options. Each must be under 6 words and curiosity-inducing. Return them as an array "subject_lines": ["...", "...", "..."].

SCORING — score each email 1–10 based on:
- Personalization depth (30%): Does it reference specific details from their site?
- Length (20%): Does it respect the word limit for its variant?
- Single CTA (15%): Is there exactly one clear call to action?
- Problem-first framing (15%): Does it lead with their challenge, not your credentials?
- Subject line quality (10%): Are subject lines under 6 words and curiosity-inducing?
- No spam phrases (10%): Does it avoid generic opener clichés?

After the 3 main variants, generate a 3-email follow-up sequence. Each follow-up must be under 50 words with a single CTA:
- Follow-up 1 (day 3): Light bump referencing the original email
- Follow-up 2 (day 7): Add a new value point or insight not mentioned before
- Follow-up 3 (day 14): Breakup email — low pressure, leave the door open

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

    return data
