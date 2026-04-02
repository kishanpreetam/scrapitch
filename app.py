import streamlit as st
import requests

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Scrapitch — AI Cold Email Generator",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed",
)

API_BASE = "http://localhost:8000"

# ── Global CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── Hard reset of ALL Streamlit padding/chrome ── */
#MainMenu, footer, header { visibility: hidden; }
section[data-testid="stSidebar"] { display: none; }

.stApp {
    font-family: 'Inter', sans-serif !important;
    background-color: #FAFAFA !important;
    color: #111827 !important;
}

/* Remove ALL default block padding — sections handle their own */
.block-container {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    max-width: 100% !important;
}

/* Remove Streamlit top gap */
div[data-testid="stAppViewContainer"] > section > div:first-child {
    padding-top: 0 !important;
}

/* ── Centered content wrapper used inside sections ── */
.content-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 3rem;
}

/* ── Divider ── */
hr { border: none; border-top: 1px solid #E5E7EB; margin: 0; }

/* ── Streamlit buttons — purple by default ── */
div[data-testid="stButton"] > button {
    background: #7C3AED !important;
    color: #fff !important;
    font-weight: 600 !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 0.65rem 1.75rem !important;
    font-size: 1rem !important;
    transition: background 0.2s !important;
    cursor: pointer !important;
    box-shadow: 0 2px 8px rgba(124,58,237,0.25) !important;
}
div[data-testid="stButton"] > button:hover {
    background: #6D28D9 !important;
}

/* ── Inputs ── */
div[data-testid="stTextInput"] input {
    border: 1.5px solid #E5E7EB !important;
    border-radius: 8px !important;
    background: #fff !important;
    color: #111827 !important;
    font-size: 1rem !important;
    padding: 0.7rem 1rem !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
    font-family: 'Inter', sans-serif !important;
}
div[data-testid="stTextInput"] input:focus {
    border-color: #7C3AED !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
    outline: none !important;
}

/* ── Selectboxes ── */
div[data-testid="stSelectbox"] > div > div {
    border: 1.5px solid #E5E7EB !important;
    border-radius: 8px !important;
    background: #fff !important;
    font-size: 0.9rem !important;
    font-family: 'Inter', sans-serif !important;
}

/* ── Expanders ── */
details > summary {
    font-weight: 500 !important;
    color: #374151 !important;
    font-family: 'Inter', sans-serif !important;
}

/* ── NAVBAR ── */
.navbar {
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 1000;
}
.navbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
}
/* Nuclear underline removal — every state, every tag inside navbar */
.navbar a,
.navbar a:link,
.navbar a:visited,
.navbar a:hover,
.navbar a:active,
.navbar a:focus {
    text-decoration: none !important;
}
/* Logo */
.navbar-logo {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    text-decoration: none !important;
    flex-shrink: 0;
}
.navbar-logo-icon {
    width: 28px;
    height: 28px;
    background: #7C3AED;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 800;
    flex-shrink: 0;
}
.navbar-logo-text {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    letter-spacing: -0.01em;
}
/* Center links */
.navbar-links {
    display: flex;
    align-items: center;
    gap: 0.1rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}
.navbar-links a {
    color: #374151;
    text-decoration: none !important;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 4px;
    transition: color 0.15s;
    white-space: nowrap;
}
.navbar-links a:hover {
    color: #111827;
    text-decoration: none !important;
    background: transparent;
}
.navbar-links a.active {
    color: #7C3AED;
    font-weight: 500;
    background: transparent;
    text-decoration: none !important;
}
/* Dropdown wrapper */
.navbar-dropdown {
    position: relative;
    display: inline-block;
}
.navbar-dropdown-menu {
    display: none;
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    min-width: 180px;
    padding: 6px 0;
    z-index: 2000;
}
.navbar-dropdown:hover .navbar-dropdown-menu { display: block; }
.navbar-dropdown-menu a {
    display: block;
    padding: 8px 16px;
    font-size: 0.88rem;
    color: #374151;
    text-decoration: none !important;
    transition: background 0.1s;
}
.navbar-dropdown-menu a:hover {
    background: #F9FAFB;
    color: #111827;
    text-decoration: none !important;
}
/* Right side */
.navbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}
.navbar-login {
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    text-decoration: none !important;
    padding: 5px 8px;
    transition: color 0.15s;
}
.navbar-login:hover {
    color: #111827;
    text-decoration: none !important;
}
.navbar-cta {
    background: #7C3AED;
    color: #fff !important;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none !important;
    transition: background 0.15s;
    white-space: nowrap;
}
.navbar-cta:hover {
    background: #6D28D9;
    color: #fff !important;
    text-decoration: none !important;
}

/* ── HERO ── */
.hero {
    width: 100%;
    background: linear-gradient(160deg, #F5F3FF 0%, #EDE9FE 35%, #FAF5FF 65%, #FAFAFA 100%);
    padding: 7rem 3rem 6rem;
    text-align: center;
}
.hero-inner { max-width: 860px; margin: 0 auto; }
.hero h1 {
    font-size: 3.75rem;
    font-weight: 800;
    line-height: 1.12;
    color: #111827;
    letter-spacing: -0.03em;
    margin: 0 0 1.25rem;
}
.hero h1 span { color: #7C3AED; }
.hero p {
    font-size: 1.2rem;
    color: #6B7280;
    max-width: 600px;
    margin: 0 auto 0.75rem;
    line-height: 1.75;
}
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 999px;
    padding: 0.3rem 1rem;
    font-size: 0.82rem;
    color: #6B7280;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.hero-cta {
    display: inline-block;
    background: #7C3AED;
    color: #fff;
    padding: 1rem 2.5rem;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
    box-shadow: 0 4px 16px rgba(124,58,237,0.35);
    letter-spacing: -0.01em;
}
.hero-cta:hover {
    background: #6D28D9;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(124,58,237,0.4);
}
.trust-line {
    margin-top: 1.25rem;
    font-size: 0.83rem;
    color: #9CA3AF;
}

/* ── Section wrapper ── */
.section {
    padding: 5rem 3rem;
    width: 100%;
}
.section-inner { max-width: 1200px; margin: 0 auto; }
.section-title {
    font-size: 2rem;
    font-weight: 800;
    color: #111827;
    text-align: center;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
}
.section-sub {
    text-align: center;
    color: #6B7280;
    margin-bottom: 3rem;
    font-size: 1.05rem;
    line-height: 1.6;
}

/* ── Step cards ── */
.steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}
.step-card {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 14px;
    padding: 2rem 1.75rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
    text-align: center;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.step-card:hover {
    border-color: #C4B5FD;
    box-shadow: 0 4px 16px rgba(124,58,237,0.1);
}
.step-icon { font-size: 2.25rem; margin-bottom: 1rem; }
.step-num {
    display: inline-block;
    background: #F5F3FF;
    color: #7C3AED;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 999px;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.step-card h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: #111827;
    margin: 0.4rem 0 0.6rem;
}
.step-card p { font-size: 0.88rem; color: #6B7280; line-height: 1.65; margin: 0; }

/* ── Feature cards ── */
.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}
.feature-card {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 14px;
    padding: 2rem 1.75rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
    transition: border-color 0.2s, box-shadow 0.2s;
}
.feature-card:hover {
    border-color: #A78BFA;
    box-shadow: 0 4px 20px rgba(124,58,237,0.1);
}
.feature-card .feat-icon { font-size: 2rem; margin-bottom: 1rem; }
.feature-card h3 { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 0.6rem; }
.feature-card p { font-size: 0.88rem; color: #6B7280; line-height: 1.65; margin: 0; }

/* ── Alt section bg ── */
.section-alt { background: #F9FAFB; }

/* ── Pricing card ── */
.pricing-card {
    background: #fff;
    border: 2px solid #7C3AED;
    border-radius: 18px;
    padding: 3rem;
    max-width: 460px;
    margin: 0 auto;
    box-shadow: 0 8px 32px rgba(124,58,237,0.14);
    text-align: center;
}
.pricing-card .plan-name {
    font-size: 0.8rem;
    font-weight: 700;
    color: #7C3AED;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
}
.pricing-card .price {
    font-size: 3.5rem;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.03em;
    line-height: 1;
}
.pricing-card .price span { font-size: 1.1rem; font-weight: 500; color: #6B7280; }
.pricing-card .feature-list {
    list-style: none;
    padding: 0;
    margin: 1.75rem 0;
    text-align: left;
}
.pricing-card .feature-list li {
    padding: 0.6rem 0;
    font-size: 0.95rem;
    color: #374151;
    border-bottom: 1px solid #F3F4F6;
    line-height: 1.5;
}
.pricing-card .feature-list li:last-child { border-bottom: none; }

/* ── App page ── */
.app-header {
    padding: 3rem 0 2rem;
    text-align: center;
}
.app-header h2 {
    font-size: 2.25rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
}
.app-header p { font-size: 1.05rem; color: #6B7280; }

.input-card {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    padding: 2.25rem 2.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    margin-bottom: 2rem;
}

/* ── Email result cards ── */
.email-card {
    background: #fff;
    border: 1.5px solid #E5E7EB;
    border-radius: 14px;
    padding: 1.75rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
    transition: border-color 0.2s, box-shadow 0.2s;
}
.email-card:hover {
    border-color: #C4B5FD;
    box-shadow: 0 4px 20px rgba(124,58,237,0.1);
}
.badge-a { background: #EEF2FF; color: #4F46E5; }
.badge-b { background: #F0FDF4; color: #16A34A; }
.badge-c { background: #FFF7ED; color: #EA580C; }
.variant-badge {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.score-pill {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
}
.score-green  { background: #DCFCE7; color: #15803D; }
.score-yellow { background: #FEF9C3; color: #A16207; }
.score-red    { background: #FEE2E2; color: #DC2626; }
.subject-line {
    font-size: 1rem;
    font-weight: 700;
    color: #111827;
    border-left: 3px solid #7C3AED;
    padding-left: 0.75rem;
    margin: 1rem 0 0.75rem;
    line-height: 1.4;
}
.email-body {
    color: #374151;
    font-size: 0.9rem;
    line-height: 1.8;
    white-space: pre-wrap;
    background: #F9FAFB;
    border-radius: 8px;
    padding: 1rem 1.25rem;
}

/* ── Footer ── */
.footer {
    background: #111827;
    color: #9CA3AF;
    text-align: center;
    padding: 2.5rem 3rem;
    font-size: 0.85rem;
    margin-top: 0;
    width: 100%;
}
.footer a { color: #9CA3AF; text-decoration: none; margin: 0 0.75rem; }
.footer a:hover { color: #fff; }
</style>
""", unsafe_allow_html=True)


# ── Routing via session state + query params ───────────────────────────────────
if "page" not in st.session_state:
    st.session_state.page = "landing"

params = st.query_params
if "page" in params:
    st.session_state.page = params["page"]


def nav_to(page: str):
    st.session_state.page = page
    st.query_params["page"] = page
    st.rerun()


# ── Shared components ─────────────────────────────────────────────────────────

def render_navbar(active: str):
    """
    Notion-style navbar. Pure HTML with href="?page=X" links so Streamlit's
    query param routing handles navigation. No Streamlit buttons.
    """
    def _cls(page: str) -> str:
        return "active" if page == active else ""

    product_cls = _cls("landing")

    pricing_cls = _cls("pricing")
    faq_cls = _cls("faq")
    app_cls = _cls("app")

    navbar_html = f"""
<div class="navbar">
  <div class="navbar-inner">
    <a href="?page=landing" class="navbar-logo">
      <span class="navbar-logo-icon">S</span>
      <span class="navbar-logo-text">Scrapitch</span>
    </a>
    <div class="navbar-links">
      <div class="navbar-dropdown">
        <a href="?page=landing" class="{product_cls}">Product &#9660;</a>
        <div class="navbar-dropdown-menu">
          <a href="?page=landing">Features</a>
          <a href="?page=landing">How it works</a>
          <a href="?page=landing">Response Scoring</a>
        </div>
      </div>
      <a href="?page=pricing" class="{pricing_cls}">Pricing</a>
      <a href="?page=faq" class="{faq_cls}">FAQ</a>
      <a href="?page=app" class="{app_cls}">Generator</a>
    </div>
    <div class="navbar-right">
      <a href="?page=landing" class="navbar-login">Log in</a>
      <a href="?page=app" class="navbar-cta">Get Scrapitch free</a>
    </div>
  </div>
</div>
"""
    st.markdown(navbar_html, unsafe_allow_html=True)


def render_footer():
    st.markdown("""
    <div class="footer">
        © 2026 Scrapitch &nbsp;·&nbsp;
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact</a>
    </div>
    """, unsafe_allow_html=True)


def render_pricing_card(cta_key: str = "pricing_cta"):
    st.markdown("""
    <div class="pricing-card">
        <div class="plan-name">Scrapitch Pro</div>
        <div class="price">$49<span>/month</span></div>
        <p style="color:#6B7280;font-size:0.92rem;margin:0.75rem 0 0;line-height:1.6;">
            Everything you need to dominate cold outreach
        </p>
        <ul class="feature-list">
            <li>✅ &nbsp;Unlimited email generations</li>
            <li>✅ &nbsp;3 proven variants per prospect</li>
            <li>✅ &nbsp;Response rate scoring (1–10)</li>
            <li>✅ &nbsp;Copy to clipboard in one click</li>
            <li>✅ &nbsp;Framework &amp; tone controls</li>
            <li>✅ &nbsp;Cancel anytime, no lock-in</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    _, mid, _ = st.columns([1, 2, 1])
    with mid:
        if st.button("Start Generating Emails →", key=cta_key, use_container_width=True):
            nav_to("app")


def render_faq():
    faqs = [
        (
            "How does Scrapitch scrape websites?",
            "Scrapitch uses a headless HTTP client to fetch your prospect's homepage and /about page, "
            "then extracts the company name, what they do, who they serve, their value proposition, "
            "and writing tone. All of this is passed to Claude to write hyper-personalized emails.",
        ),
        (
            "Is this legal to use for cold email?",
            "Yes. Scrapitch reads only publicly available information — the same content anyone can "
            "view in a browser. Cold email is legal in most jurisdictions when you include an "
            "unsubscribe option and your business address (CAN-SPAM / GDPR compliant sending).",
        ),
        (
            "What makes this different from ChatGPT?",
            "ChatGPT knows nothing about your specific prospect. Scrapitch actually visits their "
            "website, extracts real signals (hero headline, value prop, tone), and uses those to "
            "write emails that reference specific things they care about. The result is emails that "
            "feel handwritten, not templated.",
        ),
        (
            "Which industries does this work best for?",
            "Scrapitch performs best for B2B agency owners, SaaS consultants, freelancers, and "
            "anyone selling a service to other businesses. It works for any industry as long as "
            "your prospect has a website.",
        ),
        (
            "Can I use this with Instantly or Lemlist?",
            "Absolutely. Copy the generated email body and subject line directly into Instantly, "
            "Lemlist, Apollo, or any sending tool. Scrapitch is a generation layer — it works "
            "alongside your existing outreach stack.",
        ),
        (
            "What if the website scraping fails?",
            "If the site blocks scraping (Cloudflare, JS-only rendering), Scrapitch falls back to "
            "domain-level data and still generates usable emails. You can also manually add context "
            "via the Industry and Tone dropdowns.",
        ),
    ]
    for q, a in faqs:
        with st.expander(q):
            st.markdown(
                f"<p style='color:#374151;line-height:1.75;font-size:0.95rem;'>{a}</p>",
                unsafe_allow_html=True,
            )


# ── Score helpers ─────────────────────────────────────────────────────────────

def score_class(score: int) -> str:
    if score >= 8:
        return "score-green"
    elif score >= 5:
        return "score-yellow"
    return "score-red"


def score_label(score: int) -> str:
    if score >= 8:
        return "🟢 Elite"
    elif score >= 5:
        return "🟡 Strong"
    return "🔴 Needs Work"


BADGE_CLASS = {"A": "badge-a", "B": "badge-b", "C": "badge-c"}


def render_email_card(variant: dict):
    v = variant["variant"]
    badge_cls = BADGE_CLASS.get(v, "badge-a")
    sc = score_class(variant["score"])

    st.markdown(f"""
    <div class="email-card">
        <div style="margin-bottom:0.5rem;">
            <span class="variant-badge {badge_cls}">Variant {v} — {variant['name']}</span>
            &nbsp;
            <span class="score-pill {sc}">{variant['score']}/10 &nbsp;{score_label(variant['score'])}</span>
        </div>
        <div class="subject-line">Subject: {variant['subject_line']}</div>
        <div class="email-body">{variant['body']}</div>
    </div>
    """, unsafe_allow_html=True)

    with st.expander("💡 Score reasoning"):
        st.markdown(
            f"<p style='color:#6B7280;font-size:0.88rem;line-height:1.65;'>{variant['score_reasoning']}</p>",
            unsafe_allow_html=True,
        )
    with st.expander("📋 Copy email"):
        st.code(f"Subject: {variant['subject_line']}\n\n{variant['body']}", language=None)


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — LANDING
# ═══════════════════════════════════════════════════════════════════════════════

def page_landing():
    render_navbar("landing")

    # Hero
    st.markdown("""
    <div class="hero">
        <div class="hero-inner">
            <div class="hero-badge">⚡ Powered by Claude AI &nbsp;•&nbsp; No credit card required</div>
            <h1>Turn Any Website Into a<br><span>Personalized Cold Email</span><br>— In 10 Seconds</h1>
            <p>Scrapitch scrapes your prospect's website and writes 3 AI-powered cold emails
            with response rate scores. No templates. No guessing.</p>
            <a href="?page=app" class="hero-cta">Generate Your First Email Free →</a>
            <p class="trust-line">⚡ Used by 500+ B2B agency owners &nbsp;•&nbsp; No credit card required</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # How it works
    st.markdown("""
    <div class="section">
      <div class="section-inner">
        <div class="section-title">How It Works</div>
        <div class="section-sub">Three steps. Ten seconds. Emails that actually get replies.</div>
        <div class="steps-grid">
            <div class="step-card">
                <div class="step-icon">🔗</div>
                <div class="step-num">Step 1</div>
                <h3>Paste any URL</h3>
                <p>Drop in your prospect's website URL. That's it — no manual research needed before you start.</p>
            </div>
            <div class="step-card">
                <div class="step-icon">🤖</div>
                <div class="step-num">Step 2</div>
                <h3>AI analyzes their site</h3>
                <p>Scrapitch reads their homepage, extracts their value prop, tone, audience signals, and more.</p>
            </div>
            <div class="step-card">
                <div class="step-icon">📬</div>
                <div class="step-num">Step 3</div>
                <h3>Get 3 scored emails</h3>
                <p>Receive three frameworks — PAS, Value-First, Curiosity Gap — each scored 1–10 with reasoning.</p>
            </div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<hr>', unsafe_allow_html=True)

    # Features
    st.markdown("""
    <div class="section section-alt">
      <div class="section-inner">
        <div class="section-title">Everything You Need to Close More Deals</div>
        <div class="section-sub">Built specifically for B2B agency owners, consultants, and freelancers.</div>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feat-icon">🧠</div>
                <h3>Website Intelligence</h3>
                <p>We scrape the homepage and /about page, extract their headline, audience, value prop,
                and brand tone — so every email feels like it was written by someone who did their homework.</p>
            </div>
            <div class="feature-card">
                <div class="feat-icon">✉️</div>
                <h3>3 Proven Frameworks</h3>
                <p>PAS (Problem-Agitation-Solution), Value-First, and Curiosity Gap — the three
                highest-converting cold email structures — generated automatically for every prospect.</p>
            </div>
            <div class="feature-card">
                <div class="feat-icon">📊</div>
                <h3>Response Rate Scoring</h3>
                <p>Every email is scored 1–10 across six factors: personalization, length, CTA clarity,
                problem-first framing, subject line quality, and spam phrase avoidance.</p>
            </div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<hr>', unsafe_allow_html=True)

    # Pricing
    st.markdown("""
    <div class="section">
      <div class="section-inner">
        <div class="section-title">Simple, Transparent Pricing</div>
        <div class="section-sub">One plan. Unlimited emails. Cancel anytime.</div>
      </div>
    </div>
    """, unsafe_allow_html=True)
    render_pricing_card(cta_key="landing_pricing_cta")

    st.markdown('<hr style="margin-top:3rem;">', unsafe_allow_html=True)

    # FAQ
    st.markdown("""
    <div class="section section-alt">
      <div class="section-inner">
        <div class="section-title">Frequently Asked Questions</div>
        <div class="section-sub">Everything you need to know before you start.</div>
      </div>
    </div>
    """, unsafe_allow_html=True)
    _, faq_col, _ = st.columns([1, 4, 1])
    with faq_col:
        render_faq()

    st.markdown("<br><br>", unsafe_allow_html=True)
    render_footer()


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — APP (Generator)
# ═══════════════════════════════════════════════════════════════════════════════

def page_app():
    render_navbar("app")

    # Center the app content with max-width
    _, center, _ = st.columns([1, 6, 1])

    with center:
        st.markdown("""
        <div class="app-header">
            <h2>Generate Cold Emails</h2>
            <p>Paste a prospect's URL and get 3 personalized emails in seconds</p>
        </div>
        """, unsafe_allow_html=True)

        # Input card
        st.markdown('<div class="input-card">', unsafe_allow_html=True)

        url_input = st.text_input(
            label="Prospect URL",
            placeholder="https://yourprospect.com",
            label_visibility="collapsed",
        )

        c1, c2, c3 = st.columns(3)
        with c1:
            framework = st.selectbox(
                "Framework",
                ["All 3 Variants", "The Direct (PAS)", "Value-First", "The Curious"],
            )
        with c2:
            tone = st.selectbox(
                "Tone",
                ["Professional", "Casual", "Bold", "Friendly"],
            )
        with c3:
            industry = st.selectbox(
                "Your Industry",
                ["B2B Agency", "SaaS", "Consulting", "Freelance", "Other"],
            )

        st.markdown("<br>", unsafe_allow_html=True)
        generate_clicked = st.button(
            "⚡  Generate Cold Emails", key="gen_btn", use_container_width=True
        )
        st.markdown('</div>', unsafe_allow_html=True)

    # Results span full width
    if generate_clicked:
        if not url_input.strip():
            _, center2, _ = st.columns([1, 6, 1])
            with center2:
                st.error("Please enter a prospect URL first.")
            return

        _, center3, _ = st.columns([1, 6, 1])
        with center3:
            status = st.empty()
            status.info("🔍 Scraping website…")

        try:
            resp = requests.post(
                f"{API_BASE}/generate",
                json={
                    "url": url_input.strip(),
                    "framework": framework,
                    "tone": tone,
                    "industry": industry,
                },
                timeout=90,
            )
        except requests.exceptions.ConnectionError:
            with center3:
                status.error(
                    "Cannot connect to the API. Start the FastAPI server:\n"
                    "```\nuvicorn main:app --reload\n```"
                )
            return
        except requests.exceptions.Timeout:
            with center3:
                status.error("Request timed out. The prospect's site may be slow to load.")
            return

        _, center4, _ = st.columns([1, 6, 1])
        with center4:
            status.info("✍️ Generating emails…")

        if resp.status_code == 200:
            data = resp.json()
            _, center5, _ = st.columns([1, 6, 1])
            with center5:
                status.success(f"✅ Generated 3 email variants for **{data['company_name']}**")
                st.markdown(
                    "<h3 style='font-size:1.4rem;font-weight:800;color:#111827;"
                    "letter-spacing:-0.01em;margin:1.5rem 0 1.25rem;'>Your Cold Email Variants</h3>",
                    unsafe_allow_html=True,
                )

            _, res_col, _ = st.columns([0.5, 7, 0.5])
            with res_col:
                cols = st.columns(3)
                for i, variant in enumerate(data["variants"]):
                    with cols[i]:
                        render_email_card(variant)

                st.markdown("""
                <div style="text-align:center;color:#9CA3AF;font-size:0.82rem;margin-top:1.5rem;padding-bottom:1rem;">
                    🟢 8–10 Elite &nbsp;|&nbsp; 🟡 5–7 Strong &nbsp;|&nbsp; 🔴 1–4 Needs Work
                </div>
                """, unsafe_allow_html=True)
        else:
            try:
                detail = resp.json().get("detail", resp.text)
            except Exception:
                detail = resp.text
            _, center6, _ = st.columns([1, 6, 1])
            with center6:
                status.error(f"Error {resp.status_code}: {detail}")

    render_footer()


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — PRICING
# ═══════════════════════════════════════════════════════════════════════════════

def page_pricing():
    render_navbar("pricing")

    st.markdown("""
    <div style="text-align:center;padding:4rem 3rem 2rem;background:#F5F3FF;">
        <div style="font-size:2rem;font-weight:800;color:#111827;letter-spacing:-0.02em;">
            Simple, Transparent Pricing
        </div>
        <p style="color:#6B7280;font-size:1.05rem;margin-top:0.6rem;line-height:1.6;">
            One plan. Unlimited emails. Cancel anytime.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    render_pricing_card(cta_key="page_pricing_cta")

    st.markdown("<br><br>", unsafe_allow_html=True)
    st.markdown('<hr>', unsafe_allow_html=True)

    st.markdown("""
    <div style="text-align:center;padding:3rem 0 1.5rem;">
        <div style="font-size:1.5rem;font-weight:800;color:#111827;letter-spacing:-0.01em;">
            Pricing FAQs
        </div>
    </div>
    """, unsafe_allow_html=True)

    _, faq_col, _ = st.columns([1, 4, 1])
    with faq_col:
        with st.expander("Is there a free trial?"):
            st.markdown("You get your first email generation free — no credit card required. After that, $49/month unlocks unlimited generations.")
        with st.expander("Can I cancel anytime?"):
            st.markdown("Yes, cancel from your account dashboard at any time. No lock-in, no cancellation fees.")
        with st.expander("Do you offer annual billing?"):
            st.markdown("Annual billing at $39/month (billed $468/year) is coming soon. Join the waitlist inside the app.")
        with st.expander("What payment methods do you accept?"):
            st.markdown("All major credit and debit cards via Stripe. Apple Pay and Google Pay coming soon.")

    st.markdown("<br><br>", unsafe_allow_html=True)
    render_footer()


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — FAQ
# ═══════════════════════════════════════════════════════════════════════════════

def page_faq():
    render_navbar("faq")

    st.markdown("""
    <div style="text-align:center;padding:4rem 3rem 2rem;background:#F5F3FF;">
        <div style="font-size:2rem;font-weight:800;color:#111827;letter-spacing:-0.02em;">
            Frequently Asked Questions
        </div>
        <p style="color:#6B7280;font-size:1.05rem;margin-top:0.6rem;line-height:1.6;">
            Everything you need to know about Scrapitch.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    _, faq_col, _ = st.columns([1, 4, 1])
    with faq_col:
        render_faq()

    st.markdown("<br>", unsafe_allow_html=True)

    st.markdown("""
    <div style="background:#F5F3FF;border-radius:16px;padding:3rem;text-align:center;
                max-width:600px;margin:0 auto 4rem;">
        <div style="font-size:1.4rem;font-weight:800;color:#111827;margin-bottom:0.6rem;
                    letter-spacing:-0.01em;">
            Ready to write better cold emails?
        </div>
        <p style="color:#6B7280;font-size:0.95rem;margin-bottom:0;line-height:1.65;">
            Join 500+ B2B agency owners using Scrapitch to book more meetings.
        </p>
    </div>
    """, unsafe_allow_html=True)

    _, mid, _ = st.columns([2, 2, 2])
    with mid:
        if st.button("Try Scrapitch Free →", key="faq_cta", use_container_width=True):
            nav_to("app")

    st.markdown("<br>", unsafe_allow_html=True)
    render_footer()


# ═══════════════════════════════════════════════════════════════════════════════
# Router
# ═══════════════════════════════════════════════════════════════════════════════

PAGES = {
    "landing": page_landing,
    "app":     page_app,
    "pricing": page_pricing,
    "faq":     page_faq,
}

current = st.session_state.get("page", "landing")
PAGES.get(current, page_landing)()
