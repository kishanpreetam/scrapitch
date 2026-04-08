from dotenv import load_dotenv
import os as _os
load_dotenv(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), ".env"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from scraper import scrape_website
from email_generator import generate_emails

app = FastAPI(
    title="Scrapitch API",
    description="AI-powered cold email generator for B2B agency owners",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://scrapitch.vercel.app",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    url: str
    framework: str = "All 3 Variants"
    tone: str = "Professional"
    industry: str = "Auto-detect"


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
    scraped = scrape_website(url)
    if scraped.get("company_name") in (None, "", "Unknown") and scraped.get("error"):
        raise HTTPException(
            status_code=422,
            detail=f"Could not scrape website: {scraped['error']}",
        )

    # Attach UI context to scraped data for the generator
    scraped["preferred_framework"] = request.framework
    scraped["preferred_tone"] = request.tone
    scraped["sender_industry"] = request.industry

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
