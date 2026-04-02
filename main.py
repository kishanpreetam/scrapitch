from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from dotenv import load_dotenv
import os

load_dotenv()

from scraper import scrape_website
from email_generator import generate_emails

app = FastAPI(
    title="Scrapitch API",
    description="AI-powered cold email generator for B2B agency owners",
    version="1.0.0",
)


class GenerateRequest(BaseModel):
    url: str
    framework: str = "All 3 Variants"
    tone: str = "Professional"
    industry: str = "B2B Agency"


class EmailVariant(BaseModel):
    variant: str
    name: str
    subject_line: str
    body: str
    score: int
    score_reasoning: str


class GenerateResponse(BaseModel):
    url: str
    company_name: str
    variants: list[EmailVariant]


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    # Ensure URL has a scheme
    url = request.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # Step 1: Scrape
    # error is set on domain-fallback results too, but company_name will still
    # be populated — only block if we have no company name at all.
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
        variants = generate_emails(scraped)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email generation failed: {str(e)}",
        )

    return GenerateResponse(
        url=url,
        company_name=scraped["company_name"],
        variants=variants,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
