import logging
import os

from scrapegraph_py import ScrapeGraphAI

log = logging.getLogger(__name__)

_REQUIRED_KEYS = {
    "company_name",
    "what_they_do",
    "who_they_serve",
    "value_proposition",
    "tone",
    "raw_text_snippet",
    "specific_details",
}

_OUTPUT_SCHEMA: dict[str, object] = {
    "type": "object",
    "properties": {
        "company_name": {"type": "string"},
        "what_they_do": {"type": "string"},
        "who_they_serve": {"type": "string"},
        "value_proposition": {"type": "string"},
        "tone": {"type": "string"},
        "raw_text_snippet": {"type": "string"},
        "specific_details": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 3,
            "maxItems": 5,
        },
    },
    "required": [
        "company_name",
        "what_they_do",
        "who_they_serve",
        "value_proposition",
        "tone",
        "raw_text_snippet",
        "specific_details",
    ],
}

_USER_PROMPT = """Analyze this company's website and extract the following structured data.

Fields:
- company_name: official company/brand name (string)
- what_they_do: one sentence describing their core product or service (string, ≤200 chars)
- who_they_serve: their target customer segment (string, ≤150 chars)
- value_proposition: the specific outcome or benefit they promise customers (string, ≤300 chars)
- tone: the voice of their copy — one of: professional, casual, technical, bold, formal (string)
- specific_details: 3 to 5 concrete, distinctive facts from the site that could be referenced in a personalized email — e.g. recent product launches, named customers, founding story, awards, specific integrations, unique methodology. Avoid generic marketing claims. (array of strings)
- raw_text_snippet: the first ~1500 characters of meaningful page copy, cleaned (string)
"""


_client: ScrapeGraphAI | None = None


def _get_client() -> ScrapeGraphAI:
    global _client
    if _client is None:
        api_key = os.getenv("SCRAPEGRAPH_API_KEY")
        if not api_key:
            raise RuntimeError("SCRAPEGRAPH_API_KEY env var is not set")
        _client = ScrapeGraphAI(api_key=api_key)
    return _client


def scrape_website(url: str) -> dict:
    """Scrape a prospect's website via ScrapeGraphAI. Raises RuntimeError on failure."""
    client = _get_client()
    log.info("scrapegraph: requesting %s", url)

    try:
        api_result = client.extract(
            prompt=_USER_PROMPT,
            url=url,
            schema=_OUTPUT_SCHEMA,
        )
    except Exception as exc:
        log.error("scrapegraph: API call failed for %s — %s: %s", url, type(exc).__name__, exc)
        raise RuntimeError(f"ScrapeGraphAI API call failed for {url}: {exc}") from exc

    if api_result.status != "success":
        raise RuntimeError(
            f"ScrapeGraphAI returned status={api_result.status!r}, error={api_result.error!r}"
        )

    extract_response = api_result.data
    if extract_response is None:
        raise RuntimeError("ScrapeGraphAI success response had no data payload")

    result_data = extract_response.json_data
    if result_data is None:
        raise RuntimeError("ScrapeGraphAI extract response missing json_data")
    if not isinstance(result_data, dict):
        raise RuntimeError(
            f"ScrapeGraphAI json_data is not a dict: {type(result_data).__name__}"
        )

    missing = _REQUIRED_KEYS - result_data.keys()
    if missing:
        raise RuntimeError(
            f"ScrapeGraphAI result missing required keys: {sorted(missing)}"
        )

    specific_details = result_data["specific_details"]
    if isinstance(specific_details, tuple):
        specific_details = list(specific_details)
    if not isinstance(specific_details, list):
        raise RuntimeError(
            f"specific_details must be a list, got {type(specific_details).__name__}"
        )

    specific_details = [str(d).strip() for d in specific_details if d and str(d).strip()]

    # No hard floor. A thin or blocked page can legitimately return 0, 1, or 2
    # entries; the orchestration layer branches on this count (0 is unreadable,
    # 1 to 2 is limited personalization, 3 or more is normal) instead of raising.
    specific_details = specific_details[:5]

    log.info("scrapegraph: success elapsed_ms=%s", api_result.elapsed_ms)

    return {
        "url": url,
        "company_name": result_data["company_name"],
        "what_they_do": result_data["what_they_do"],
        "who_they_serve": result_data["who_they_serve"],
        "value_proposition": result_data["value_proposition"],
        "tone": result_data["tone"],
        "raw_text_snippet": str(result_data["raw_text_snippet"])[:1500],
        "specific_details": specific_details,
    }
