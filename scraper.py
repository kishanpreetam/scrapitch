import os
import logging
from scrapegraph_py import Client

logger = logging.getLogger(__name__)

client = Client(api_key=os.getenv("SCRAPEGRAPH_API_KEY"))

_USER_PROMPT = """
Extract the following information from this webpage and return ONLY valid JSON
with exactly these 7 keys (no extra keys, no markdown):

{
  "company_name": "string — the company or organisation name",
  "description": "string — one or two sentence summary of what the company does",
  "services": "string — the main products or services offered",
  "target_audience": "string — who the company serves or sells to",
  "value_proposition": "string — the core value proposition or competitive advantage",
  "tone_of_voice": "string — one word or short phrase describing the website tone (e.g. formal, casual, technical, bold)",
  "specific_details": [
    "string — a concrete, specific detail from the page an outreach email could reference",
    "string — another concrete, specific detail",
    "string — another concrete, specific detail"
  ]
}

Rules:
- specific_details must be a list of 3 to 5 strings. Each string must be a real, concrete fact
  found on the page (e.g. a named product, a stat, a named customer, a specific feature,
  a recent announcement). Do NOT include generic marketing fluff.
- All values must be drawn from actual page content. Do not hallucinate or guess.
- Return only the JSON object. No explanation, no markdown fences.
"""


def scrape_website(url: str) -> dict:
    """
    Scrape a prospect's website using the ScrapeGraphAI cloud API and return
    structured business intelligence.

    Function signature is stable — do not change.

    Returns a dict with keys:
        company_name, description, services, target_audience,
        value_proposition, tone_of_voice, specific_details, url

    Raises an exception (with a useful message) on any failure.
    ScrapeGraphAI handles JS rendering, anti-bot, and proxies server-side.
    """
    logger.info("scrape_website: calling ScrapeGraphAI smartscraper for %s", url)

    try:
        response = client.smartscraper(
            website_url=url,
            user_prompt=_USER_PROMPT,
        )
    except Exception as exc:
        logger.error(
            "scrape_website: ScrapeGraphAI API call failed for %s — %s: %s",
            url,
            type(exc).__name__,
            exc,
        )
        raise RuntimeError(
            f"ScrapeGraphAI failed to scrape {url}. "
            f"Reason: {type(exc).__name__}: {exc}"
        ) from exc

    # The SDK returns the parsed result directly as a dict (or similar mapping).
    # Assumption: client.smartscraper() returns the JSON-parsed result dict.
    # If the SDK wraps it in a top-level key (e.g. {"result": {...}}), unwrap here.
    result = response
    if isinstance(result, dict) and "result" in result and isinstance(result["result"], dict):
        result = result["result"]

    # Validate that we got the 7 required keys
    required_keys = {
        "company_name", "description", "services", "target_audience",
        "value_proposition", "tone_of_voice", "specific_details",
    }
    missing = required_keys - set(result.keys())
    if missing:
        logger.error(
            "scrape_website: ScrapeGraphAI response missing keys %s for %s",
            missing,
            url,
        )
        raise RuntimeError(
            f"ScrapeGraphAI returned incomplete data for {url}. "
            f"Missing keys: {missing}. Got: {list(result.keys())}"
        )

    # Ensure specific_details is a list of strings
    details = result.get("specific_details", [])
    if not isinstance(details, list):
        details = [str(details)]
    details = [str(d) for d in details]
    if len(details) < 3:
        logger.error(
            "scrape_website: specific_details has fewer than 3 items for %s",
            url,
        )
        raise RuntimeError(
            f"ScrapeGraphAI returned fewer than 3 specific_details for {url}. Got: {details}"
        )

    result["specific_details"] = details[:5]  # cap at 5
    result["url"] = url

    logger.info(
        "scrape_website: success for %s — company=%s",
        url,
        result.get("company_name"),
    )
    return result
