import streamlit as st
import requests

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Scrapitch",
    page_icon="✉️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    .main { background-color: #0f0f0f; }

    .brand-header {
        text-align: center;
        padding: 2.5rem 0 1rem;
    }
    .brand-title {
        font-size: 3rem;
        font-weight: 700;
        background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -1px;
    }
    .brand-subtitle {
        color: #9ca3af;
        font-size: 1.1rem;
        margin-top: 0.4rem;
    }

    .email-card {
        background: #1a1a2e;
        border: 1px solid #2d2d44;
        border-radius: 16px;
        padding: 1.6rem;
        margin-bottom: 1.2rem;
        transition: border-color 0.2s;
    }
    .email-card:hover { border-color: #6366f1; }

    .variant-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
        margin-bottom: 0.6rem;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: #fff;
    }

    .score-pill {
        display: inline-block;
        padding: 4px 14px;
        border-radius: 999px;
        font-size: 0.9rem;
        font-weight: 700;
    }
    .score-green  { background:#166534; color:#bbf7d0; }
    .score-yellow { background:#854d0e; color:#fef08a; }
    .score-red    { background:#7f1d1d; color:#fecaca; }

    .subject-line {
        font-size: 1rem;
        font-weight: 600;
        color: #e2e8f0;
        border-left: 3px solid #6366f1;
        padding-left: 0.75rem;
        margin: 0.75rem 0;
    }
    .email-body {
        color: #cbd5e1;
        line-height: 1.7;
        font-size: 0.95rem;
        white-space: pre-wrap;
    }
    .score-reasoning {
        color: #6b7280;
        font-size: 0.83rem;
        margin-top: 0.75rem;
        font-style: italic;
    }

    div[data-testid="stTextInput"] input {
        background: #1a1a2e !important;
        border: 1px solid #4f46e5 !important;
        color: #e2e8f0 !important;
        border-radius: 10px !important;
        font-size: 1rem !important;
        padding: 0.75rem 1rem !important;
    }

    div[data-testid="stButton"] > button {
        background: linear-gradient(135deg, #6366f1, #a855f7) !important;
        color: white !important;
        font-weight: 600 !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 0.6rem 2rem !important;
        font-size: 1rem !important;
        width: 100% !important;
        transition: opacity 0.2s !important;
    }
    div[data-testid="stButton"] > button:hover { opacity: 0.88 !important; }
    </style>
    """,
    unsafe_allow_html=True,
)

API_BASE = "http://localhost:8000"


def score_color(score: int) -> str:
    if score >= 8:
        return "score-green"
    elif score >= 5:
        return "score-yellow"
    return "score-red"


def render_email_card(variant: dict):
    css_class = score_color(variant["score"])
    st.markdown(
        f"""
        <div class="email-card">
            <div>
                <span class="variant-badge">Variant {variant['variant']} — {variant['name']}</span>
                &nbsp;
                <span class="score-pill {css_class}">Score: {variant['score']}/10</span>
            </div>
            <div class="subject-line">📧 Subject: {variant['subject_line']}</div>
            <div class="email-body">{variant['body']}</div>
            <div class="score-reasoning">💡 {variant['score_reasoning']}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    # Copy button using Streamlit's native expander trick
    with st.expander("Copy email body"):
        st.code(variant["body"], language=None)


# ── Header ────────────────────────────────────────────────────────────────────
st.markdown(
    """
    <div class="brand-header">
        <div class="brand-title">✉️ Scrapitch</div>
        <div class="brand-subtitle">
            Paste a prospect's URL → Get 3 AI-crafted cold emails, scored & ready to send.
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown("---")

# ── Input ─────────────────────────────────────────────────────────────────────
col1, col2, col3 = st.columns([1, 3, 1])
with col2:
    url_input = st.text_input(
        label="Prospect website URL",
        placeholder="https://yourprospect.com",
        label_visibility="collapsed",
    )
    generate_clicked = st.button("⚡  Generate Cold Emails", use_container_width=True)

# ── Generate ──────────────────────────────────────────────────────────────────
if generate_clicked:
    if not url_input.strip():
        st.error("Please enter a URL first.")
    else:
        with st.spinner("🔍 Scraping website and generating emails…"):
            try:
                resp = requests.post(
                    f"{API_BASE}/generate",
                    json={"url": url_input.strip()},
                    timeout=90,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    st.success(
                        f"✅ Generated 3 email variants for **{data['company_name']}**"
                    )

                    st.markdown("### 📬 Your Cold Email Variants")

                    cols = st.columns(3)
                    for i, variant in enumerate(data["variants"]):
                        with cols[i]:
                            render_email_card(variant)

                    # Score legend
                    st.markdown(
                        """
                        <div style="color:#6b7280;font-size:0.8rem;text-align:center;margin-top:1rem;">
                            🟢 8–10 &nbsp;|&nbsp; 🟡 5–7 &nbsp;|&nbsp; 🔴 1–4
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )
                else:
                    detail = resp.json().get("detail", resp.text)
                    st.error(f"Error {resp.status_code}: {detail}")
            except requests.exceptions.ConnectionError:
                st.error(
                    "Could not connect to the API. Make sure the FastAPI server is running:\n"
                    "```\nuvicorn main:app --reload\n```"
                )
            except requests.exceptions.Timeout:
                st.error("Request timed out. The website may be slow to scrape.")
            except Exception as e:
                st.error(f"Unexpected error: {e}")

# ── Footer ────────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    "<div style='text-align:center;color:#374151;font-size:0.8rem;'>"
    "Scrapitch — Built for B2B agency owners who write cold emails that actually get replies."
    "</div>",
    unsafe_allow_html=True,
)
