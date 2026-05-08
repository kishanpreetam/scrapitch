from dotenv import load_dotenv
import os as _os
load_dotenv(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), ".env"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional
import os

from scraper import scrape_website
from email_generator import generate_emails

app = FastAPI(
    title="Scrapitch API",
    description="AI-powered cold email generator — v2",
    version="2.0.0",
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

UseCaseLiteral = Literal[
    "b2b_sales",
    "masters_outreach",
    "job_hunt",
    "executive_outreach",
    "networking",
]

TonePreferenceLiteral = Literal["auto", "formal", "warm", "direct"]


class GenerateRequest(BaseModel):
    # Existing field — unchanged
    url: str

    # New required fields
    use_case: UseCaseLiteral
    about_user: str = Field(..., min_length=50, max_length=1000)
    user_ask: str = Field(..., min_length=10, max_length=300)

    # New optional fields
    highlights: Optional[str] = Field(default=None, max_length=500)
    tone_preference: TonePreferenceLiteral = "auto"


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

    # Ensure URL has a scheme
    url = request.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # Step 1: Scrape
    try:
        scraped = scrape_website(url)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not scrape website: {str(e)}",
        )

    # Attach user context to scraped data for the generator
    scraped["use_case"]        = request.use_case
    scraped["about_user"]      = request.about_user
    scraped["user_ask"]        = request.user_ask
    scraped["highlights"]      = request.highlights
    scraped["tone_preference"] = request.tone_preference

    # Step 2: Generate emails
    try:
        result = generate_emails(scraped)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email generation failed: {str(e)}",
        )

    return GenerateResponse(
        url=url,
        company_name=scraped["company_name"],
        variants=result["variants"],
        follow_up_sequence=result.get("follow_up_sequence", []),
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
