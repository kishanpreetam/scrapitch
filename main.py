from dotenv import load_dotenv
import os as _os
load_dotenv(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), ".env"))

import logging
import os
from typing import Literal, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, HttpUrl, model_validator

from scraper import scrape_website, extract_from_text, search_person
from email_generator import generate_emails
from resume_parser import parse_resume, ALLOWED_PDF, ALLOWED_DOCX

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

log = logging.getLogger(__name__)

app = FastAPI(
    title="Scrapitch API",
    description="AI-powered cold email generator for B2B agency owners",
    version="1.0.0",
)

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
async def generate(request: GenerateRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        log.error("ANTHROPIC_API_KEY is not configured")
        raise HTTPException(
            status_code=500,
            detail="The service is temporarily unavailable. Please try again later.",
        )

    url = str(request.url) if request.url else ""
    pasted_text = (request.pasted_text or "").strip()
    person_name = (request.person_name or "").strip()
    person_disambiguator = (request.person_disambiguator or "").strip()

    try:
        if pasted_text:
            scraped = extract_from_text(pasted_text)
            source_url = "from pasted text"
        elif request.use_case == "networking" and person_name and not url:
            scraped = search_person(person_name, person_disambiguator)
            if scraped.get("status") == "unresolvable":
                return JSONResponse(
                    status_code=200,
                    content={"status": "unreadable", "message": scraped.get("message", UNREADABLE_MESSAGE)},
                )
            source_url = scraped.get("url") or f"web search: {person_name}"
        else:
            scraped = scrape_website(url, use_case=request.use_case)
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
        "use_case": request.use_case,
        "about_user": request.about_user,
        "user_ask": request.user_ask,
        "highlights": request.highlights,
        "tone_preference": request.tone_preference,
        "resume_data": request.resume_data,
        "target_role": request.target_role,
        "portfolio_link": request.portfolio_link,
        "accomplishment": request.accomplishment,
        "current_school_year": request.current_school_year,
        "paper_or_topic": request.paper_or_topic,
        "program_term": request.program_term,
        "company_stage": request.company_stage,
        "traction_metric": request.traction_metric,
        "person_name": request.person_name,
        "person_disambiguator": request.person_disambiguator,
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
async def parse_resume_endpoint(file: UploadFile = File(...)):
    if file.content_type not in (ALLOWED_PDF, ALLOWED_DOCX):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type: {file.content_type!r}. "
                "Upload a PDF or DOCX file."
            ),
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    try:
        result = parse_resume(contents, file.content_type)
    except (ValueError, RuntimeError) as exc:
        log.error("resume parse failure for %s: %s", file.filename, exc)
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return result


@app.get("/health")
async def health():
    return {"status": "ok"}
