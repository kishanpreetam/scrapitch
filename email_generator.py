import json
import re
import os
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Prospect industry -> email angle and framework guidance (injected into Agent 2 user message)
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


def _call_claude(
    client: anthropic.Anthropic,
    system: str,
    user_content: str,
    max_tokens: int,
    model: str,
) -> str:
    """Make a single Claude API call and return the stripped text content."""
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_content}],
    )
    return response.content[0].text.strip()


def _parse_json(text: str) -> dict:
    """Strip markdown code fences and parse JSON."""
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return json.loads(text.strip())


# ── Agent system prompts ──────────────────────────────────────────────────────

_AGENT1_SYSTEM = (
    "You are a B2B research analyst. Your job is to analyze scraped website content "
    "and extract structured intelligence for a cold email writer. Be specific. Pull exact "
    "details, not vague summaries. If the site mentions '3x revenue growth for a DTC brand', "
    "extract that exact detail. If they serve 'mid-market SaaS companies', note that exactly. "
    "The email writer will use your output to write personalized cold emails, so the more "
    "specific and concrete your extractions are, the better the emails will be.\n\n"
    "Return your analysis as JSON with these fields: company_name, what_they_do, who_they_serve, "
    "industry, key_differentiators (array), specific_references (array), detected_tone, "
    "pain_points (array).\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)

_AGENT2_SYSTEM = (
    "You are an elite B2B cold email copywriter. You write short, specific, human-sounding "
    "cold emails that get replies. You receive structured research about a prospect company "
    "and write personalized cold emails.\n\n"
    "ABSOLUTE RULES (NEVER VIOLATE):\n"
    "- NEVER use em dashes (\u2014), double dashes (--), or arrows (\u2192). Use periods or commas instead.\n"
    "- NEVER start with 'I hope this finds you well', 'I wanted to reach out', 'I came across your company'\n"
    "- NEVER use 'synergies', 'leverage', 'circle back', 'touch base', 'game-changer', 'revolutionary', "
    "'scalable solutions', 'cutting-edge', or any corporate jargon\n"
    "- No exclamation marks. No ALL CAPS. No emojis.\n"
    "- Every email must reference at least ONE specific detail from the research (a case study, "
    "a service name, a metric, a client type)\n"
    "- Exactly one CTA per email. Low-friction only.\n"
    "- Write like a smart colleague firing off a quick note, not like a marketing textbook\n\n"
    "WORD LIMITS (strictly enforced):\n"
    "- Variant A (The Direct / PAS): MAXIMUM 60 words. Count them.\n"
    "- Variant B (Value-First): MAXIMUM 80 words. Count them.\n"
    "- Variant C (The Curious): MAXIMUM 75 words. Count them.\n"
    "- Day 3 follow-up: MAXIMUM 40 words\n"
    "- Day 7 follow-up: MAXIMUM 50 words\n"
    "- Day 14 follow-up: MAXIMUM 40 words\n\n"
    "INDUSTRY TONE GUIDE (apply based on detected industry):\n"
    "- B2B SaaS: Direct, metrics-driven. Reference growth, churn, pipeline. CTA: 'Worth a quick conversation?'\n"
    "- Marketing & Creative Agency: Conversational, sharp. Speak peer-to-peer. CTA: 'Open to comparing notes?'\n"
    "- Sales & Revenue Consulting: Results-first, confident. Reference pipeline, quota. CTA: 'Worth exploring?'\n"
    "- IT Services & MSP: Technical but human. Reference uptime, security. CTA: 'Worth a quick chat?'\n"
    "- Recruiting & Staffing: Warm, relationship-focused. CTA: 'Open to a conversation?'\n"
    "- Legal Services: Formal but approachable. No slang. CTA: 'Would it make sense to connect?'\n"
    "- Financial Services & Fintech: Trust-first, conservative. CTA: 'Worth a brief conversation?'\n"
    "- Real Estate: Friendly, deal-oriented. CTA: 'Open to a quick call?'\n"
    "- Healthcare & MedTech: Cautious, compliance-aware. CTA: 'Would it be worth connecting?'\n"
    "- Manufacturing & Industrial: Practical, no-nonsense. CTA: 'Worth a look?'\n"
    "- Ecommerce & DTC: Fast-paced, growth-focused. Reference AOV, conversion. CTA: 'Worth exploring?'\n"
    "- Freelancer / Solo Consultant: Casual, peer-level. CTA: 'Open to comparing notes?'\n\n"
    "VARIANT A (The Direct / PAS):\n"
    "- Line 1: Specific problem from research\n"
    "- Line 2: Real consequence if not fixed\n"
    "- Line 3: You as the fix, one sentence\n"
    "- Line 4: Single low-friction CTA\n\n"
    "VARIANT B (Value-First):\n"
    "- Line 1: Concrete outcome they could achieve\n"
    "- Line 2: How, tied to their specific context\n"
    "- Line 3: Proof or specificity\n"
    "- Line 4: Low-friction CTA\n\n"
    "VARIANT C (The Curious):\n"
    "- Line 1: Reference something specific from their site\n"
    "- Line 2: Bridge to your relevance\n"
    "- Line 3: Open loop\n"
    "- Line 4: Permission-based CTA\n\n"
    "FOLLOW-UPS:\n"
    "- Day 3: Light bump with new angle. NOT 'just following up.'\n"
    "- Day 7: Completely different angle. A stat, insight, or reframe.\n"
    "- Day 14: Breakup. Low pressure, leave door open.\n\n"
    "SUBJECT LINES:\n"
    "- 3 per variant\n"
    "- Under 6 words each\n"
    "- Reference something specific to the prospect\n"
    "- No dashes, no arrows, no exclamation marks\n\n"
    "EXAMPLES OF GOOD EMAILS:\n"
    "'Saw you work with mid-market SaaS on retention. Most teams at that stage lose 15-20% of trialists "
    "before onboarding completes. We help fix that specific gap. Worth a quick conversation?'\n\n"
    "'Your case study on the DTC brand showed 3x revenue growth. Curious if your outbound outreach is "
    "producing similar results, or if that is still a work in progress. Happy to share what similar "
    "agencies are doing.'\n\n"
    "EXAMPLES OF BAD EMAILS:\n"
    "'I hope this email finds you well. I wanted to reach out because I believe our services could "
    "benefit your agency. We help companies like yours improve their outreach and grow their business. "
    "Would you be open to a call?'\n\n"
    "'That gap between interest and action is where revenue disappears. We help close it without "
    "rebuilding your funnel from scratch \u2014 our methodology leverages proven frameworks.'\n\n"
    "Return as JSON with this structure:\n"
    "{\"variants\": [{\"variant\": \"A\", \"name\": \"The Direct\", \"subject_lines\": [\"...\", \"...\", \"...\"], \"body\": \"...\"}, "
    "{\"variant\": \"B\", \"name\": \"Value-First\", \"subject_lines\": [\"...\", \"...\", \"...\"], \"body\": \"...\"}, "
    "{\"variant\": \"C\", \"name\": \"The Curious\", \"subject_lines\": [\"...\", \"...\", \"...\"], \"body\": \"...\"}], "
    "\"follow_up_sequence\": [{\"day\": 3, \"subject\": \"...\", \"body\": \"...\"}, "
    "{\"day\": 7, \"subject\": \"...\", \"body\": \"...\"}, "
    "{\"day\": 14, \"subject\": \"...\", \"body\": \"...\"}]}\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)

_AGENT3_SYSTEM = (
    "You are a cold email quality judge. You score cold emails on a 1-10 scale across 6 factors. "
    "You are strict and honest. A score of 9-10 means genuinely elite. Most emails should score 6-8.\n\n"
    "Score each email variant against these factors:\n"
    "1. Personalization depth (30%): Does it reference SPECIFIC details from the prospect research? "
    "Not generic praise, but actual company details like service names, case study results, or client types. Score 1-10.\n"
    "2. Length compliance (20%): Is Variant A under 60 words? Variant B under 80? Variant C under 75? "
    "Full marks only if within limit. Score 1-10.\n"
    "3. Single CTA (15%): Exactly one clear, low-friction call to action? No multi-asks? Score 1-10.\n"
    "4. Problem-first framing (15%): Does it lead with their context and challenges, not the sender's product? Score 1-10.\n"
    "5. Subject line quality (10%): Under 6 words? Specific to the prospect? No generic phrases? Score 1-10.\n"
    "6. No spam phrases (10%): Free of 'hope this finds you well', corporate jargon, em dashes, arrows? Score 1-10.\n\n"
    "Calculate weighted score: (personalization * 0.3) + (length * 0.2) + (cta * 0.15) + "
    "(problem_first * 0.15) + (subject * 0.1) + (no_spam * 0.1)\n\n"
    "Round to 1 decimal place.\n\n"
    "Provide a 1-2 sentence reasoning for each variant explaining the score.\n\n"
    "Return as JSON with this structure:\n"
    "{\"scores\": [{\"variant\": \"A\", \"score\": 7.5, \"score_reasoning\": \"...\"}, "
    "{\"variant\": \"B\", \"score\": 7.5, \"score_reasoning\": \"...\"}, "
    "{\"variant\": \"C\", \"score\": 7.5, \"score_reasoning\": \"...\"}]}\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)


def generate_emails(scraped_data: dict) -> dict:
    """
    Generate 3 cold email variants + 3-email follow-up sequence using a 3-agent pipeline.
    Agent 1 researches, Agent 2 writes, Agent 3 scores.
    Returns a dict with 'variants' and 'follow_up_sequence'.
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    model = "claude-sonnet-4-20250514"

    preferred_framework = scraped_data.get("preferred_framework", "All 3 Variants")
    sender_industry = scraped_data.get("sender_industry", "Auto-detect")

    # ── AGENT 1: Research Analyst ─────────────────────────────────────────
    agent1_user = json.dumps({
        "url": scraped_data.get("url", ""),
        "company_name": scraped_data.get("company_name", ""),
        "what_they_do": scraped_data.get("what_they_do", ""),
        "who_they_serve": scraped_data.get("who_they_serve", ""),
        "value_proposition": scraped_data.get("value_proposition", ""),
        "raw_text_snippet": scraped_data.get("raw_text_snippet", "")[:1500],
    })

    research = None
    for attempt in range(2):
        try:
            text = _call_claude(client, _AGENT1_SYSTEM, agent1_user, 800, model)
            research = _parse_json(text)
            break
        except (json.JSONDecodeError, ValueError) as e:
            if attempt == 1:
                raise ValueError(f"Research agent returned invalid JSON: {e}")

    # ── Resolve effective industry for framework guidance ─────────────────
    if sender_industry != "Auto-detect":
        industry_id = _SENDER_INDUSTRY_MAP.get(sender_industry, "")
        effective_industry = sender_industry
    else:
        # Try to map Agent 1's free-text industry to a canonical ID
        detected_from_agent = research.get("industry", "")
        industry_id = _SENDER_INDUSTRY_MAP.get(detected_from_agent, "")
        if not industry_id:
            industry_id = _detect_industry(scraped_data)
        effective_industry = detected_from_agent or industry_id.replace("_", " ").title()

    framework_guidance = _INDUSTRY_FRAMEWORK.get(industry_id, _DEFAULT_FRAMEWORK)

    # ── AGENT 2: Email Writer ─────────────────────────────────────────────
    agent2_user = json.dumps({
        "research": research,
        "sender_industry": effective_industry,
        "framework": preferred_framework,
        "industry_guidance": framework_guidance,
    })

    emails = None
    for attempt in range(2):
        try:
            text = _call_claude(client, _AGENT2_SYSTEM, agent2_user, 2000, model)
            emails = _parse_json(text)
            break
        except (json.JSONDecodeError, ValueError) as e:
            if attempt == 1:
                raise ValueError(f"Email writer agent returned invalid JSON: {e}")

    if "variants" not in emails:
        raise ValueError(
            f"Email writer agent response missing 'variants' key. "
            f"Keys found: {list(emails.keys())}"
        )

    # Post-process: clean formatting, then enforce word limits
    _WORD_LIMITS = {"A": 65, "B": 85, "C": 80}
    for variant in emails.get("variants", []):
        body = cleanup_text(variant.get("body", ""))
        limit = _WORD_LIMITS.get(variant.get("variant", ""), 85)
        variant["body"] = enforce_word_limit(body, limit)
        variant["subject_lines"] = [cleanup_text(s) for s in variant.get("subject_lines", [])]

    for follow_up in emails.get("follow_up_sequence", []):
        follow_up["subject"] = cleanup_text(follow_up.get("subject", ""))
        follow_up["body"] = cleanup_text(follow_up.get("body", ""))

    # ── AGENT 3: Scoring Judge ────────────────────────────────────────────
    agent3_user = json.dumps({
        "research": research,
        "variants": emails.get("variants", []),
    })

    scoring = {"scores": []}
    for attempt in range(2):
        try:
            text = _call_claude(client, _AGENT3_SYSTEM, agent3_user, 500, model)
            scoring = _parse_json(text)
            break
        except (json.JSONDecodeError, ValueError):
            if attempt == 1:
                # Scoring failure is non-fatal; defaults will be applied below
                pass

    # Merge scores into variants
    score_map = {s["variant"]: s for s in scoring.get("scores", [])}
    for variant in emails.get("variants", []):
        v_id = variant.get("variant", "")
        if v_id in score_map:
            raw_score = score_map[v_id].get("score", 7)
            variant["score"] = round(float(raw_score))
            variant["score_reasoning"] = cleanup_text(score_map[v_id].get("score_reasoning", ""))
        else:
            variant.setdefault("score", 7)
            variant.setdefault("score_reasoning", "")

    return emails
