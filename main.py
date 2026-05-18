from dotenv import load_dotenv
import os as _os
load_dotenv(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), ".env"))

import logging
import os
from typing import Literal, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl

from scraper import scrape_website
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
    url: HttpUrl
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


class EmailVariant(BaseModel):
    variant: str
    name: str
    subject_lines: list[str]
    body: str
    score: int
    score_reasoning: str


class FollowUp(BaseModel):
    day: int
    subject: str
    body: str


class GenerateResponse(BaseModel):
    url: str
    company_name: str
    variants: list[EmailVariant]
    follow_up_sequence: list[FollowUp]


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    url = str(request.url)

    try:
        scraped = scrape_website(url)
    except RuntimeError as exc:
        log.error("scrape failure for %s: %s", url, exc)
        raise HTTPException(
            status_code=422,
            detail=f"Could not scrape website: {exc}",
        ) from exc

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
    }

    try:
        result = generate_emails(payload)
    except ValueError as exc:
        log.error("email generation failure for %s: %s", url, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Email generation failed: {exc}",
        ) from exc

    return GenerateResponse(
        url=url,
        company_name=scraped["company_name"],
        variants=result["variants"],
        follow_up_sequence=result.get("follow_up_sequence", []),
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
