from dotenv import load_dotenv
import os as _os
load_dotenv(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), ".env"))

import logging
import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl

from scraper import scrape_website
from email_generator import generate_emails

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


@app.get("/health")
async def health():
    return {"status": "ok"}
