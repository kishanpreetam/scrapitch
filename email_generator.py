import json
import re
import os
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


_WORD_LIMITS_BY_USE_CASE: dict[str, dict[str, int]] = {
    "b2b_sales":          {"A": 80,  "B": 110, "C": 100},
    "masters_outreach":   {"A": 120, "B": 140, "C": 160},
    "job_hunt":           {"A": 100, "B": 100, "C": 100},
    "executive_outreach": {"A": 70,  "B": 70,  "C": 70},
    "networking":         {"A": 90,  "B": 90,  "C": 90},
}

_SCORE_WEIGHTS_BY_USE_CASE: dict[str, dict[str, int]] = {
    "b2b_sales":          {"personalization": 30, "length": 20, "single_cta": 15, "problem_first": 15, "subject_line": 10, "no_spam": 10},
    "masters_outreach":   {"personalization": 35, "length": 15, "single_cta": 15, "problem_first": 20, "subject_line": 5,  "no_spam": 10},
    "job_hunt":           {"personalization": 25, "length": 20, "single_cta": 15, "problem_first": 15, "subject_line": 10, "no_spam": 15},
    "executive_outreach": {"personalization": 30, "length": 25, "single_cta": 15, "problem_first": 15, "subject_line": 5,  "no_spam": 10},
    "networking":         {"personalization": 25, "length": 20, "single_cta": 15, "problem_first": 15, "subject_line": 10, "no_spam": 15},
}

for _uc, _weights in _SCORE_WEIGHTS_BY_USE_CASE.items():
    assert sum(_weights.values()) == 100, (
        f"Score weights for {_uc} sum to {sum(_weights.values())}, not 100"
    )


def cleanup_text(text: str) -> str:
    """Remove em dashes, double dashes, and arrows from generated text."""
    text = text.replace(" — ", ". ")
    text = text.replace("— ", ". ")
    text = text.replace(" —", ".")
    text = text.replace("—", ". ")
    text = text.replace(" -- ", ". ")
    text = text.replace("--", ". ")
    text = text.replace("→", "")
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


# ── Agent 1 system prompts ────────────────────────────────────────────────────

_AGENT1_B2B_SALES = (
    "You are a B2B research analyst. Your job is to analyze scraped website content "
    "and extract structured intelligence for a cold email writer targeting this company "
    "with a sales pitch. Be specific. Pull exact details, not vague summaries.\n\n"
    "Prioritize these signals in your extraction:\n"
    "- Company differentiators (what makes them unique vs competitors)\n"
    "- Customer pain points they solve, in their words from the site\n"
    "- Recent product launches, features, or releases (any specific dates or version mentions)\n"
    "- Named clients, case studies, or logos mentioned\n"
    "- Specific metrics they cite (revenue growth, retention rates, etc.)\n\n"
    "Map these into the JSON fields: 'specific_references' should be concrete (client names, "
    "case study numbers, product names), and 'pain_points' should be the problems their "
    "customers face that this company solves.\n\n"
    "Return your analysis as JSON with these fields: company_name, what_they_do, who_they_serve, "
    "industry, key_differentiators (array), specific_references (array), detected_tone, "
    "pain_points (array).\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)

_AGENT1_MASTERS_OUTREACH = (
    "You are an academic research analyst. Your job is to analyze a faculty member's or lab's "
    "scraped page content and extract structured intelligence for a prospective master's or "
    "PhD student writing an outreach email. Be specific. Pull exact research details.\n\n"
    "Prioritize these signals in your extraction:\n"
    "- Specific research areas, sub-fields, or methodologies\n"
    "- Named papers, projects, datasets, or tools\n"
    "- Lab focus, ongoing grants, or recent publications (with years if available)\n"
    "- Faculty members, postdocs, or grad students mentioned by name\n"
    "- Affiliations (department, university, institute)\n\n"
    "Map these into the JSON fields: 'company_name' should be the lab or program name; "
    "'what_they_do' should be the research focus; 'who_they_serve' should be the "
    "student/postdoc/collaborator audience; 'industry' should always be \"academia\"; "
    "'specific_references' should be paper titles, project names, or methodology terms; "
    "'pain_points' should be open research questions the lab is actively working on.\n\n"
    "Return your analysis as JSON with these fields: company_name, what_they_do, who_they_serve, "
    "industry, key_differentiators (array), specific_references (array), detected_tone, "
    "pain_points (array).\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)

_AGENT1_JOB_HUNT = (
    "You are a job market research analyst. Your job is to analyze a company's scraped page "
    "content and extract structured intelligence for a candidate writing a cold outreach email "
    "asking about open roles. Be specific.\n\n"
    "Prioritize these signals in your extraction:\n"
    "- Open roles or 'we're hiring' signals, with specific titles if visible\n"
    "- Team page references, named hiring managers, or department leads\n"
    "- Recent funding rounds, expansion announcements, or growth signals\n"
    "- Specific tech stack, tools, or methodologies the team uses\n"
    "- Office locations or remote-friendly signals\n\n"
    "Map these into the JSON fields: 'specific_references' should be role titles, named people, "
    "or recent announcements; 'pain_points' should be growth pressure or hiring needs visible "
    "on the site; 'key_differentiators' should be what makes this a desirable place to work.\n\n"
    "Return your analysis as JSON with these fields: company_name, what_they_do, who_they_serve, "
    "industry, key_differentiators (array), specific_references (array), detected_tone, "
    "pain_points (array).\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)

_AGENT1_EXECUTIVE_OUTREACH = (
    "You are an executive intelligence analyst. Your job is to analyze a company's scraped page "
    "content and extract structured intelligence for an outreach email written peer-to-peer to "
    "a senior executive. Be specific and concise. Executives respond to insight, not flattery.\n\n"
    "Prioritize these signals in your extraction:\n"
    "- Recent announcements, press releases, or strategic moves\n"
    "- Public company metrics (revenue, headcount, growth rates, customer counts)\n"
    "- Direct quotes from executives about strategy, market, or priorities\n"
    "- M&A activity, partnerships, market expansion, or pivots\n"
    "- Stated strategic priorities for the year\n\n"
    "Map these into the JSON fields: 'specific_references' should be quote fragments, specific "
    "metrics, or recent moves; 'pain_points' should be strategic challenges visible from the "
    "company's own positioning; 'key_differentiators' should be market position or moat.\n\n"
    "Return your analysis as JSON with these fields: company_name, what_they_do, who_they_serve, "
    "industry, key_differentiators (array), specific_references (array), detected_tone, "
    "pain_points (array).\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)

_AGENT1_NETWORKING = (
    "You are a personal-context research analyst. Your job is to analyze a person's scraped page "
    "content (personal site, blog, portfolio, or company bio) and extract structured intelligence "
    "for a warm networking outreach email. Be specific and human.\n\n"
    "Prioritize these signals in your extraction:\n"
    "- Personal projects, side projects, or experiments\n"
    "- Stated interests, hobbies, or things they're 'into right now'\n"
    "- Recent talks, podcast appearances, essays, or writing\n"
    "- Public personality cues (humor, formality, what they care about)\n"
    "- Communities, groups, or affiliations they're part of\n\n"
    "Map these into the JSON fields: 'company_name' should be their name or org; 'who_they_serve' "
    "should be their audience or community; 'specific_references' should be project names, talk "
    "titles, essay topics, or interest areas; 'pain_points' should be challenges or open "
    "questions they've publicly mentioned working on; 'key_differentiators' should be what makes "
    "their work distinctive.\n\n"
    "Return your analysis as JSON with these fields: company_name, what_they_do, who_they_serve, "
    "industry, key_differentiators (array), specific_references (array), detected_tone, "
    "pain_points (array).\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)


_AGENT1_SYSTEMS = {
    "b2b_sales":          _AGENT1_B2B_SALES,
    "masters_outreach":   _AGENT1_MASTERS_OUTREACH,
    "job_hunt":           _AGENT1_JOB_HUNT,
    "executive_outreach": _AGENT1_EXECUTIVE_OUTREACH,
    "networking":         _AGENT1_NETWORKING,
}


def build_agent1_system(use_case: str) -> str:
    if use_case not in _AGENT1_SYSTEMS:
        raise ValueError(f"Unsupported use_case: {use_case!r}")
    return _AGENT1_SYSTEMS[use_case]


# ── Agent 2 shared building blocks ────────────────────────────────────────────

_AGENT2_ABSOLUTE_RULES = (
    "ABSOLUTE RULES (NEVER VIOLATE):\n"
    "- NEVER use em dashes (—), double dashes (--), or arrows (→). Use periods or commas instead.\n"
    "- NEVER start with 'Hope this finds you well', 'I wanted to reach out', 'I came across your', "
    "or 'Just following up'.\n"
    "- NEVER use 'synergies', 'leverage', 'circle back', 'touch base', 'game-changer', "
    "'revolutionary', 'scalable solutions', 'cutting-edge', or any corporate jargon.\n"
    "- No exclamation marks. No ALL CAPS. No emojis.\n"
    "- Every email must reference at least ONE specific detail from the research in line 1 or "
    "line 2 (not buried later).\n"
    "- Exactly ONE CTA per email. Low-friction only.\n"
    "- Subject line under 7 words. No dashes, no arrows, no exclamation marks.\n"
    "- Write like a smart colleague firing off a quick note, not like a marketing textbook.\n"
)

_AGENT2_FOLLOW_UPS = (
    "FOLLOW-UPS (always 3, in this order):\n"
    "- Day 3: Light bump with a NEW angle. NEVER 'just following up'. Max 50 words.\n"
    "- Day 7: Completely different angle. A stat, insight, or reframe. Max 60 words.\n"
    "- Day 14: Breakup. Low pressure, leave door open. Max 50 words.\n"
)

_AGENT2_OUTPUT_SHAPE = (
    "Return as JSON with this structure:\n"
    "{\"variants\": [{\"variant\": \"A\", \"name\": \"...\", \"subject_lines\": [\"...\", \"...\", \"...\"], \"body\": \"...\"}, "
    "{\"variant\": \"B\", \"name\": \"...\", \"subject_lines\": [\"...\", \"...\", \"...\"], \"body\": \"...\"}, "
    "{\"variant\": \"C\", \"name\": \"...\", \"subject_lines\": [\"...\", \"...\", \"...\"], \"body\": \"...\"}], "
    "\"follow_up_sequence\": [{\"day\": 3, \"subject\": \"...\", \"body\": \"...\"}, "
    "{\"day\": 7, \"subject\": \"...\", \"body\": \"...\"}, "
    "{\"day\": 14, \"subject\": \"...\", \"body\": \"...\"}]}\n\n"
    "Return ONLY valid JSON. No markdown, no backticks, no explanation."
)

_TONE_LINES = {
    "auto":   "",
    "formal": "TONE OVERRIDE: Use a formal, polished register. Full sentences. No contractions. No slang.",
    "warm":   "TONE OVERRIDE: Use a warm, human register. Contractions OK. Sound like a friendly peer.",
    "direct": "TONE OVERRIDE: Use a direct, no-fluff register. Short sentences. Get to the point in line 1.",
}


def _agent2_b2b_sales(tone_preference: str) -> str:
    tone_override = _TONE_LINES.get(tone_preference, "")
    return (
        "You are an elite B2B cold email copywriter. You write short, specific, human-sounding "
        "cold emails that get replies. You receive structured research about a prospect company "
        "and write personalized cold sales emails.\n\n"
        + _AGENT2_ABSOLUTE_RULES + "\n"
        "WORD LIMITS (strictly enforced):\n"
        "- Variant A: MAXIMUM 80 words. Count them.\n"
        "- Variant B: MAXIMUM 110 words. Count them.\n"
        "- Variant C: MAXIMUM 100 words. Count them.\n\n"
        "VARIANT A (PAS — Problem / Agitate / Solution):\n"
        "- Line 1: Specific problem from research\n"
        "- Line 2: Real consequence if not fixed\n"
        "- Line 3: You as the fix, one sentence\n"
        "- Line 4: Single low-friction CTA\n\n"
        "VARIANT B (Value-First):\n"
        "- Line 1: Concrete outcome they could achieve\n"
        "- Line 2: How, tied to their specific context\n"
        "- Line 3: Proof or specificity\n"
        "- Line 4: Low-friction CTA\n\n"
        "VARIANT C (Hyper-Personalized Icebreaker):\n"
        "- Line 1: A specific observation from their website, not generic praise\n"
        "- Line 2: Bridge to your relevance\n"
        "- Line 3: Open loop\n"
        "- Line 4: Permission-based CTA\n\n"
        "CTA PATTERN: 'Worth a quick look?' or 'Open to a 10 min call next week?'\n\n"
        "TONE: Warm but business-like by default.\n"
        + (tone_override + "\n\n" if tone_override else "\n")
        + "FORBIDDEN ADDITIONS: 'Hope this finds you well', 'I wanted to reach out'.\n\n"
        + _AGENT2_FOLLOW_UPS + "\n"
        + _AGENT2_OUTPUT_SHAPE
    )


def _agent2_masters_outreach(tone_preference: str) -> str:
    tone_override = _TONE_LINES.get(tone_preference, "")
    return (
        "You are an academic outreach copywriter. You help prospective master's and PhD "
        "applicants write cold emails to faculty about research opportunities. Be specific, "
        "respectful, and substantive.\n\n"
        + _AGENT2_ABSOLUTE_RULES + "\n"
        "WORD LIMITS (strictly enforced):\n"
        "- Variant A: MAXIMUM 120 words. Count them.\n"
        "- Variant B: MAXIMUM 140 words. Count them.\n"
        "- Variant C: MAXIMUM 160 words. Count them.\n\n"
        "VARIANT A (Research Alignment):\n"
        "- Line 1: Reference a specific paper, project, or research area from the lab\n"
        "- Line 2: Why that work resonates with your background\n"
        "- Line 3: One concrete thing you bring (skill, prior work, methodology)\n"
        "- Line 4: Specific ask\n\n"
        "VARIANT B (Your Relevant Work):\n"
        "- Line 1: Brief framing of your background and current focus\n"
        "- Line 2: A specific project or paper of yours that connects to their lab\n"
        "- Line 3: Reference one specific element of their research\n"
        "- Line 4: Specific ask\n\n"
        "VARIANT C (Specific Ask):\n"
        "- Line 1: A specific, focused question about the lab's work\n"
        "- Line 2: Your relevant context\n"
        "- Line 3: A concrete bridge\n"
        "- Line 4: Clear, narrow ask\n\n"
        "CTA PATTERN: 'Would you be open to a brief Zoom about openings in your lab?' or "
        "'Could I send a 1-page research summary?'\n\n"
        "TONE: Formal, respectful, specific. Address the faculty member directly.\n"
        + (tone_override + "\n\n" if tone_override else "\n")
        + "MUST: Reference at least ONE specific paper, project, or research area from the "
        "extracted research. Generic 'your work is amazing' is forbidden.\n\n"
        "FORBIDDEN ADDITIONS: 'Your work is amazing', generic name-dropping, 'I am very "
        "interested in your research'.\n\n"
        + _AGENT2_FOLLOW_UPS + "\n"
        + _AGENT2_OUTPUT_SHAPE
    )


def _agent2_job_hunt(tone_preference: str) -> str:
    tone_override = _TONE_LINES.get(tone_preference, "")
    return (
        "You are a career outreach copywriter. You help candidates write cold emails to "
        "hiring managers, recruiters, or team leads about open roles. Confident, specific, "
        "never desperate.\n\n"
        + _AGENT2_ABSOLUTE_RULES + "\n"
        "WORD LIMITS (strictly enforced):\n"
        "- Variant A: MAXIMUM 100 words. Count them.\n"
        "- Variant B: MAXIMUM 100 words. Count them.\n"
        "- Variant C: MAXIMUM 100 words. Count them.\n\n"
        "VARIANT A (Specific Role Context):\n"
        "- Line 1: Reference a specific role, team, or hiring signal from research\n"
        "- Line 2: One concrete proof point that maps to that role\n"
        "- Line 3: A specific reason this company over others\n"
        "- Line 4: Soft ask\n\n"
        "VARIANT B (Relevant Proof):\n"
        "- Line 1: Concrete outcome you've delivered, with specifics\n"
        "- Line 2: How that maps to their stated needs from research\n"
        "- Line 3: One specific reference to their company\n"
        "- Line 4: Soft ask\n\n"
        "VARIANT C (Soft Ask):\n"
        "- Line 1: Specific opener about their team or company\n"
        "- Line 2: A short relevant proof point\n"
        "- Line 3: Bridge to your interest\n"
        "- Line 4: Low-friction ask\n\n"
        "CTA PATTERN: 'Would it make sense to share my CV?' or 'Could you point me to the "
        "right person?'\n\n"
        "TONE: Confident, not desperate, not over-eager. Treat the reader as a peer.\n"
        + (tone_override + "\n\n" if tone_override else "\n")
        + "FORBIDDEN ADDITIONS: 'I am passionate about', 'I would love the opportunity', "
        "'It would be a dream to work at', 'I am writing to express my interest'.\n\n"
        + _AGENT2_FOLLOW_UPS + "\n"
        + _AGENT2_OUTPUT_SHAPE
    )


def _agent2_executive_outreach(tone_preference: str) -> str:
    tone_override = _TONE_LINES.get(tone_preference, "")
    return (
        "You are an executive-tier cold email copywriter. You write peer-to-peer emails from "
        "senior operators to senior operators. Tight, specific, insight-driven.\n\n"
        + _AGENT2_ABSOLUTE_RULES + "\n"
        "WORD LIMITS (strictly enforced, execs do not read long emails):\n"
        "- Variant A: MAXIMUM 70 words. Count them.\n"
        "- Variant B: MAXIMUM 70 words. Count them.\n"
        "- Variant C: MAXIMUM 70 words. Count them.\n\n"
        "VARIANT A (One Insight):\n"
        "- Line 1: One sharp insight or observation tied to their recent move or metric\n"
        "- Line 2: Why it matters\n"
        "- Line 3: Low-friction ask\n\n"
        "VARIANT B (Why You):\n"
        "- Line 1: The specific reason you are reaching out to THEM, not anyone\n"
        "- Line 2: A short proof of relevance\n"
        "- Line 3: Low-friction ask\n\n"
        "VARIANT C (Low-Friction Ask):\n"
        "- Line 1: Specific reference to a public move or quote\n"
        "- Line 2: A pointed question or open loop\n"
        "- Line 3: Ask that costs them 5 minutes or less\n\n"
        "CTA PATTERN: 'Worth 15 mins next week?' or 'Mind if I send a 1-pager?'\n\n"
        "TONE: Peer-to-peer, not deferential. Confident, specific, never starstruck.\n"
        + (tone_override + "\n\n" if tone_override else "\n")
        + "FORBIDDEN ADDITIONS: 'I have been following your work', 'I admire what you do', "
        "'I am a huge fan', 'It would be an honor'.\n\n"
        + _AGENT2_FOLLOW_UPS + "\n"
        + _AGENT2_OUTPUT_SHAPE
    )


def _agent2_networking(tone_preference: str) -> str:
    tone_override = _TONE_LINES.get(tone_preference, "")
    return (
        "You are a warm-networking copywriter. You write low-pressure, human emails from one "
        "person to another for coffee chats, intros, and specific questions. Casual, specific, "
        "never transactional.\n\n"
        + _AGENT2_ABSOLUTE_RULES + "\n"
        "WORD LIMITS (strictly enforced):\n"
        "- Variant A: MAXIMUM 90 words. Count them.\n"
        "- Variant B: MAXIMUM 90 words. Count them.\n"
        "- Variant C: MAXIMUM 90 words. Count them.\n\n"
        "VARIANT A (Specific Reason):\n"
        "- Line 1: The specific reason you are reaching out to THEM, not generic\n"
        "- Line 2: A short context about you\n"
        "- Line 3: Low-pressure ask\n\n"
        "VARIANT B (Quick Context):\n"
        "- Line 1: Reference a specific project, talk, or essay of theirs\n"
        "- Line 2: A genuine point of connection or curiosity\n"
        "- Line 3: Low-pressure ask\n\n"
        "VARIANT C (Small Ask):\n"
        "- Line 1: Specific opener with shared context or interest\n"
        "- Line 2: A narrow, well-defined question\n"
        "- Line 3: Permission-based ask\n\n"
        "CTA PATTERN: 'Open to a 20 min coffee chat (virtual)?' or 'Could I ask one specific "
        "question by email?'\n\n"
        "TONE: Warm, human, low-pressure. Sound like a real person, not a networker.\n"
        + (tone_override + "\n\n" if tone_override else "\n")
        + "FORBIDDEN ADDITIONS: 'Pick your brain', 'Quick question', 'Can I get on your "
        "calendar', 'I would love to connect'.\n\n"
        + _AGENT2_FOLLOW_UPS + "\n"
        + _AGENT2_OUTPUT_SHAPE
    )


_AGENT2_BUILDERS = {
    "b2b_sales":          _agent2_b2b_sales,
    "masters_outreach":   _agent2_masters_outreach,
    "job_hunt":           _agent2_job_hunt,
    "executive_outreach": _agent2_executive_outreach,
    "networking":         _agent2_networking,
}


def build_agent2_system(use_case: str, tone_preference: str) -> str:
    if use_case not in _AGENT2_BUILDERS:
        raise ValueError(f"Unsupported use_case: {use_case!r}")
    return _AGENT2_BUILDERS[use_case](tone_preference)


# ── Agent 3 system prompt builder ─────────────────────────────────────────────

def build_agent3_system(use_case: str) -> str:
    if use_case not in _SCORE_WEIGHTS_BY_USE_CASE:
        raise ValueError(f"Unsupported use_case: {use_case!r}")
    w = _SCORE_WEIGHTS_BY_USE_CASE[use_case]
    limits = _WORD_LIMITS_BY_USE_CASE[use_case]
    formula = (
        f"(personalization * {w['personalization']/100:.2f}) + "
        f"(length * {w['length']/100:.2f}) + "
        f"(cta * {w['single_cta']/100:.2f}) + "
        f"(problem_first * {w['problem_first']/100:.2f}) + "
        f"(subject * {w['subject_line']/100:.2f}) + "
        f"(no_spam * {w['no_spam']/100:.2f})"
    )
    return (
        "You are a cold email quality judge. You score cold emails on a 1-10 scale across "
        "6 factors. You are honest but fair. Use the full scoring range appropriately.\n\n"
        "Scoring guide:\n"
        "- 9-10 (Elite): Exceptional. References multiple specific details, perfect length, "
        "sounds genuinely handwritten. Rare.\n"
        "- 7-8 (Strong): Good personalization, appropriate length, clear CTA, reads naturally. "
        "Most well-written emails should land here.\n"
        "- 5-6 (Average): Some personalization but could be more specific. Decent structure "
        "but feels templated.\n"
        "- 3-4 (Needs work): Generic, wrong length, weak CTA, could be sent to anyone.\n"
        "- 1-2 (Poor): Spam-level. No personalization, multiple CTAs, corporate jargon.\n\n"
        "Most emails from this system should score 7-8 because they use scraped research. "
        "Only score below 7 if the email genuinely fails on a core criterion. Do not be "
        "harsh for the sake of it.\n\n"
        "Score each variant against these factors (weights vary by use case):\n"
        f"1. Personalization depth ({w['personalization']}%): Specific details from the "
        "research, not generic praise. Score 1-10.\n"
        f"2. Length compliance ({w['length']}%): A under {limits['A']} words? "
        f"B under {limits['B']}? C under {limits['C']}? Full marks only if within limit. "
        "Score 1-10.\n"
        f"3. Single CTA ({w['single_cta']}%): Exactly one clear, low-friction call to "
        "action. No multi-asks. Score 1-10.\n"
        f"4. Problem-first / context-first framing ({w['problem_first']}%): Leads with "
        "their context, not the sender's product. Score 1-10.\n"
        f"5. Subject line quality ({w['subject_line']}%): Under 7 words, specific to the "
        "prospect, no generic phrases. Score 1-10.\n"
        f"6. No spam phrases ({w['no_spam']}%): Free of 'hope this finds you well', "
        "corporate jargon, em dashes, arrows. Score 1-10.\n\n"
        f"Calculate weighted score: {formula}\n\n"
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

    use_case = scraped_data.get("use_case", "")
    if use_case not in _WORD_LIMITS_BY_USE_CASE:
        raise ValueError(
            f"Unsupported or missing use_case: {use_case!r}. "
            f"Must be one of {sorted(_WORD_LIMITS_BY_USE_CASE.keys())}"
        )
    about_user = scraped_data.get("about_user", "")
    user_ask = scraped_data.get("user_ask", "")
    highlights = scraped_data.get("highlights", "")
    tone_preference = scraped_data.get("tone_preference", "auto")

    # ── AGENT 1: Research Analyst ─────────────────────────────────────────
    agent1_user = json.dumps({
        "url": scraped_data.get("url", ""),
        "company_name": scraped_data.get("company_name", ""),
        "what_they_do": scraped_data.get("what_they_do", ""),
        "who_they_serve": scraped_data.get("who_they_serve", ""),
        "value_proposition": scraped_data.get("value_proposition", ""),
        "raw_text_snippet": scraped_data.get("raw_text_snippet", "")[:1500],
        "specific_details": scraped_data.get("specific_details", []),
        "use_case": use_case,
    })

    agent1_system = build_agent1_system(use_case)
    research = None
    for attempt in range(2):
        try:
            text = _call_claude(client, agent1_system, agent1_user, 800, model)
            research = _parse_json(text)
            break
        except (json.JSONDecodeError, ValueError) as e:
            if attempt == 1:
                raise ValueError(f"Research agent returned invalid JSON: {e}")

    # ── AGENT 2: Email Writer ─────────────────────────────────────────────
    agent2_user = json.dumps({
        "research": research,
        "about_user": about_user,
        "user_ask": user_ask,
        "highlights": highlights,
        "tone_preference": tone_preference,
        "specific_details": scraped_data.get("specific_details", []),
    })

    agent2_system = build_agent2_system(use_case, tone_preference)
    emails = None
    for attempt in range(2):
        try:
            text = _call_claude(client, agent2_system, agent2_user, 2000, model)
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
    limits = _WORD_LIMITS_BY_USE_CASE[use_case]
    for variant in emails.get("variants", []):
        body = cleanup_text(variant.get("body", ""))
        limit = limits.get(variant.get("variant", ""), 100)
        variant["body"] = enforce_word_limit(body, limit)
        variant["subject_lines"] = [cleanup_text(s) for s in variant.get("subject_lines", [])]

    for follow_up in emails.get("follow_up_sequence", []):
        follow_up["subject"] = cleanup_text(follow_up.get("subject", ""))
        follow_up["body"] = cleanup_text(follow_up.get("body", ""))

    # ── AGENT 3: Scoring Judge ────────────────────────────────────────────
    agent3_user = json.dumps({
        "research": research,
        "variants": emails.get("variants", []),
        "use_case": use_case,
    })

    agent3_system = build_agent3_system(use_case)
    scoring = {"scores": []}
    for attempt in range(2):
        try:
            text = _call_claude(client, agent3_system, agent3_user, 500, model)
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
