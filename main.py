from dotenv import load_dotenv
import os as _os
load_dotenv(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), ".env"))

import logging
import os
from typing import Literal, Optional

from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, HttpUrl, model_validator
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from scraper import scrape_website, extract_from_text, search_person
from email_generator import generate_emails
from resume_parser import parse_resume, ALLOWED_PDF, ALLOWED_DOCX

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Partner API-key auth + per-key rate limiting
#
# /generate and /parse-resume burn Anthropic/ScrapeGraph credits per call, so
# they're gated behind a partner API key. Registry comes from the
# PARTNER_API_KEYS env var: comma-separated "key:name" pairs, e.g.
#   PARTNER_API_KEYS=sk_propel_abc:propel,sk_scrapitch_xyz:scrapitch_web
#
# Fails closed: if PARTNER_API_KEYS is unset/empty, /generate and
# /parse-resume refuse every request (503) instead of serving anyone who
# finds the URL. For local development without keys, set ALLOW_OPEN_API=1
# to get the old permissive behavior.
#
# The web app's key also carries a per-user header (X-Scrapitch-User), so
# each signed-in user gets their own bucket and one account can't use up
# the shared web limit.
# ---------------------------------------------------------------------------

API_KEY_HEADER = "X-API-Key"
USER_HEADER = "X-Scrapitch-User"
WEB_PARTNER = "scrapitch_web"
ALLOW_OPEN_API = os.getenv("ALLOW_OPEN_API") == "1"


def _load_partner_keys() -> dict[str, str]:
    """Parse PARTNER_API_KEYS ("key:name,key2:name2") into {key: partner_name}."""
    raw = os.getenv("PARTNER_API_KEYS", "").strip()
    parsed: dict[str, str] = {}
    if not raw:
        return parsed
    for pair in raw.split(","):
        pair = pair.strip()
        if not pair or ":" not in pair:
            continue
        key, _, name = pair.partition(":")
        key = key.strip()
        name = name.strip()
        if key and name:
            parsed[key] = name
    return parsed


PARTNER_KEYS: dict[str, str] = _load_partner_keys()

if not PARTNER_KEYS and ALLOW_OPEN_API:
    log.warning(
        "PARTNER_API_KEYS not set and ALLOW_OPEN_API=1 -- API is UNPROTECTED. "
        "Anyone with the base URL can call /generate and /parse-resume."
    )
elif not PARTNER_KEYS:
    log.error("PARTNER_API_KEYS not set -- /generate and /parse-resume will refuse all requests.")


async def require_partner(
    x_api_key: Optional[str] = Header(default=None, alias=API_KEY_HEADER),
) -> str:
    """Gate /generate and /parse-resume behind a partner API key.

    Fails closed: with no PARTNER_API_KEYS configured, every request gets a
    503 unless ALLOW_OPEN_API=1 (local development only). A missing or
    unrecognized key is rejected with 401.
    """
    if not PARTNER_KEYS:
        if ALLOW_OPEN_API:
            return "unconfigured"
        raise HTTPException(status_code=503, detail="The service is temporarily unavailable. Please try again later.")
    if x_api_key is None or x_api_key not in PARTNER_KEYS:
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")
    return PARTNER_KEYS[x_api_key]


def _rate_limit_key(request: Request) -> str:
    """Rate-limit bucket: the caller's API key if present, else their IP.

    IP is only ever the effective bucket when no key is sent, which in
    practice means PARTNER_API_KEYS is unconfigured (fail-open) or the
    caller omitted the header -- the latter is already rejected with 401
    by require_partner before this bucket matters for /generate and
    /parse-resume.
    """
    api_key = request.headers.get(API_KEY_HEADER)
    if api_key:
        return api_key
    return get_remote_address(request)


# In-memory storage (slowapi's default) is fine here: Railway runs a single
# instance of this service, so there's no need for a shared Redis backend.
limiter = Limiter(key_func=_rate_limit_key)

_PARTNER_LIMITS = {
    "propel": "10/minute;200/day",
    "scrapitch_web": "60/minute;2000/day",
}
_DEFAULT_PARTNER_LIMIT = "10/minute;200/day"  # any other valid, registered key
_UNCONFIGURED_LIMIT = "20/minute;100/day"  # PARTNER_API_KEYS unset with ALLOW_OPEN_API=1
_PER_USER_LIMIT = "10/minute;100/day"  # each signed-in web user, inside the web app's shared limit


def _partner_rate_limit(key: str) -> str:
    """Callable rate-limit string: differs per partner, resolved per request.

    `key` is whatever _rate_limit_key returned (the X-API-Key header value,
    or the caller's IP if no header/registry). If PARTNER_API_KEYS isn't
    configured, or the key isn't a registered partner key (defensive only --
    require_partner already 401s unknown keys before this is evaluated),
    fall back to the conservative unconfigured/IP bucket.
    """
    if not PARTNER_KEYS:
        return _UNCONFIGURED_LIMIT
    partner = PARTNER_KEYS.get(key)
    if partner is None:
        return _UNCONFIGURED_LIMIT
    return _PARTNER_LIMITS.get(partner, _DEFAULT_PARTNER_LIMIT)


def _user_rate_limit_key(request: Request) -> str:
    """Second bucket: one per signed-in web user.

    The user header is trusted only alongside the web app's own key, which
    never leaves the web app's server, so outside callers can't spoof it.
    Every other caller lands in a bucket that mirrors its partner limit.
    """
    api_key = request.headers.get(API_KEY_HEADER)
    user = request.headers.get(USER_HEADER)
    if api_key and user and PARTNER_KEYS.get(api_key) == WEB_PARTNER:
        return f"user:{user}"
    return f"caller:{_rate_limit_key(request)}"


def _user_rate_limit(key: str) -> str:
    if key.startswith("user:"):
        return _PER_USER_LIMIT
    return _partner_rate_limit(key.removeprefix("caller:"))


async def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    log.warning("rate limit exceeded for %s on %s", _rate_limit_key(request), request.url.path)
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again shortly."},
    )


app = FastAPI(
    title="Scrapitch API",
    description="AI-powered cold email generator for B2B agency owners",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://scrapitch.com",
        "https://www.scrapitch.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    url: Optional[HttpUrl] = None
    pasted_text: Optional[str] = Field(default=None, max_length=10000)
    person_name: Optional[str] = Field(default=None, max_length=200)
    person_disambiguator: Optional[str] = Field(default=None, max_length=200)
    use_case: Literal["b2b_sales", "masters_outreach", "job_hunt", "executive_outreach", "networking"]
    about_user: str = Field(..., min_length=1, max_length=2000)
    user_ask: str = Field(..., min_length=1, max_length=1000)
    highlights: str = Field(default="", max_length=2000)
    tone_preference: Literal["auto", "formal", "warm", "direct"] = "auto"
    # Resume and enrichment fields (all optional)
    resume_data: Optional[dict] = None
    target_role: Optional[str] = Field(default=None, max_length=200)
    portfolio_link: Optional[str] = Field(default=None, max_length=500)
    accomplishment: Optional[str] = Field(default=None, max_length=1000)
    current_school_year: Optional[str] = Field(default=None, max_length=200)
    paper_or_topic: Optional[str] = Field(default=None, max_length=500)
    program_term: Optional[str] = Field(default=None, max_length=100)
    company_stage: Optional[str] = Field(default=None, max_length=300)
    traction_metric: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_source(self) -> "GenerateRequest":
        has_url = self.url is not None
        has_pasted = bool(self.pasted_text and self.pasted_text.strip())
        has_name = bool(self.person_name and self.person_name.strip())
        is_networking = self.use_case == "networking"
        if not has_url and not has_pasted and not (is_networking and has_name):
            raise ValueError(
                "url is required unless pasted_text is provided, "
                "or use_case is networking with person_name"
            )
        return self


class EmailVariant(BaseModel):
    variant: str
    name: str
    subject_lines: list[str]
    body: str
    score: int
    score_reasoning: str


class GenerateResponse(BaseModel):
    url: str
    company_name: str
    variants: list[EmailVariant]
    limited_personalization: bool = False


# Shown verbatim to the user when a page yields no usable detail (blocked,
# auth-walled, or empty). No internal field names appear in any user-facing text.
UNREADABLE_MESSAGE = (
    "We couldn't read enough from that page to personalize. Some sites, including "
    "social profiles, block automated access. Try the company, lab, or person's own "
    "website instead."
)


@app.post("/generate", response_model=GenerateResponse)
@limiter.limit(_partner_rate_limit)
@limiter.limit(_user_rate_limit, key_func=_user_rate_limit_key)
async def generate(
    request: Request,
    body: GenerateRequest,
    partner: str = Depends(require_partner),
):
    if not os.getenv("ANTHROPIC_API_KEY"):
        log.error("ANTHROPIC_API_KEY is not configured")
        raise HTTPException(
            status_code=500,
            detail="The service is temporarily unavailable. Please try again later.",
        )

    url = str(body.url) if body.url else ""
    pasted_text = (body.pasted_text or "").strip()
    person_name = (body.person_name or "").strip()
    person_disambiguator = (body.person_disambiguator or "").strip()

    try:
        if pasted_text:
            scraped = extract_from_text(pasted_text)
            source_url = "from pasted text"
        elif body.use_case == "networking" and person_name and not url:
            scraped = search_person(person_name, person_disambiguator)
            if scraped.get("status") == "unresolvable":
                return JSONResponse(
                    status_code=200,
                    content={"status": "unreadable", "message": scraped.get("message", UNREADABLE_MESSAGE)},
                )
            source_url = scraped.get("url") or f"web search: {person_name}"
        else:
            scraped = scrape_website(url, use_case=body.use_case)
            source_url = url
    except RuntimeError as exc:
        log.error("scrape/search failure: %s", exc)
        raise HTTPException(
            status_code=422,
            detail="We couldn't reach that page. Check the URL and try again.",
        ) from exc

    # Branch on how much the scrape returned, instead of throwing a hard floor.
    non_empty_details = [d for d in scraped.get("specific_details", []) if d and str(d).strip()]
    if len(non_empty_details) == 0:
        # Effectively unreadable. Skip Agent 2 and Agent 3; return clean guidance.
        log.info("unreadable page (no usable detail) for %s", url)
        return JSONResponse(
            status_code=200,
            content={"status": "unreadable", "message": UNREADABLE_MESSAGE},
        )
    limited_personalization = len(non_empty_details) < 3

    payload = {
        **scraped,
        "use_case": body.use_case,
        "about_user": body.about_user,
        "user_ask": body.user_ask,
        "highlights": body.highlights,
        "tone_preference": body.tone_preference,
        "resume_data": body.resume_data,
        "target_role": body.target_role,
        "portfolio_link": body.portfolio_link,
        "accomplishment": body.accomplishment,
        "current_school_year": body.current_school_year,
        "paper_or_topic": body.paper_or_topic,
        "program_term": body.program_term,
        "company_stage": body.company_stage,
        "traction_metric": body.traction_metric,
        "person_name": body.person_name,
        "person_disambiguator": body.person_disambiguator,
        "limited_personalization": limited_personalization,
    }

    try:
        result = generate_emails(payload)
    except ValueError as exc:
        log.error("email generation failure for %s: %s", url, exc)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong generating your drafts. Please try again.",
        ) from exc

    return GenerateResponse(
        url=source_url,
        company_name=scraped["company_name"],
        variants=result["variants"],
        limited_personalization=limited_personalization,
    )


@app.post("/parse-resume")
@limiter.limit(_partner_rate_limit)
@limiter.limit(_user_rate_limit, key_func=_user_rate_limit_key)
async def parse_resume_endpoint(
    request: Request,
    file: UploadFile = File(...),
    partner: str = Depends(require_partner),
):
    if file.content_type not in (ALLOWED_PDF, ALLOWED_DOCX):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type: {file.content_type!r}. "
                "Upload a PDF or DOCX file."
            ),
        )

    # Read at most one byte past the limit, so an oversized upload is never held in memory whole.
    contents = await file.read(MAX_FILE_SIZE + 1)
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    try:
        result = parse_resume(contents, file.content_type)
    except ValueError as exc:  # problems with the file itself; the message is written for users
        log.error("resume parse failure for %s: %s", file.filename, exc)
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:  # service-side failures; keep internals out of the response
        log.error("resume parse service failure for %s: %s", file.filename, exc)
        raise HTTPException(
            status_code=503,
            detail="We couldn't read your resume right now. Please try again shortly.",
        ) from exc

    return result


@app.get("/health")
async def health():
    return {"status": "ok"}
