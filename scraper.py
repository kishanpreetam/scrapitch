import logging
import os
from urllib.parse import urlparse

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

_USER_PROMPT = """Analyze this website or text and extract the following structured data.

Fields:
- company_name: official company/brand/person name (string)
- what_they_do: one sentence describing their core product, service, or work (string, max 200 chars)
- who_they_serve: their target customer, student, or audience segment (string, max 150 chars)
- value_proposition: the specific outcome or benefit they deliver (string, max 300 chars)
- tone: the voice of their copy, one of: professional, casual, technical, bold, formal (string)
- specific_details: 3 to 5 concrete, distinctive facts from the content that could be referenced in a personalized email. Examples: recent product launches, named customers, founding story, awards, specific integrations, unique methodology, named research projects, recent hires. Avoid generic marketing claims. (array of strings)
- raw_text_snippet: the first ~1500 characters of meaningful content, cleaned (string)
"""

_SEARCH_PERSON_PROMPT = """Based on these search results, extract structured information about this person.
Use only open-web sources: personal sites, company bios, academic pages, talk recordings, news articles, or scholar pages.
If the search results cover more than one person with this name, focus on the one most consistent with any disambiguating context provided.
If you cannot confidently identify a single specific real person from these results, return empty strings for what_they_do, who_they_serve, and value_proposition, and return an empty array for specific_details.

Fields:
- company_name: the person's full name as they publicly use it (string)
- what_they_do: one sentence on their current role or main work (string, max 200 chars)
- who_they_serve: their audience, customers, students, or collaborators (string, max 150 chars)
- value_proposition: the impact or distinctive expertise they are known for (string, max 300 chars)
- tone: the voice of their public writing, one of: professional, casual, technical, bold, formal (string)
- specific_details: two to five concrete, verifiable facts found in the search results useful in a networking email, such as a specific talk, a published project, a named employer, a quoted idea, or a community they lead. Only include facts directly present in the search results. (array of strings)
- raw_text_snippet: the first 1000 characters of the most relevant result content (string)
"""

# When a URL has no path, try these subpaths first for each use case before
# falling back to the root. Lets users paste bare domains like "media.mit.edu".
_BARE_DOMAIN_HINTS: dict[str, str] = {
    "b2b_sales": "/about",
    "masters_outreach": "/research",
    "job_hunt": "/careers",
    "executive_outreach": "/about",
    "networking": "/about",
}

_UNRESOLVABLE_MESSAGE = (
    "We couldn't find enough open-web information to identify this person. "
    "Try adding a link to their site, or paste their bio or a recent post directly."
)


_client: ScrapeGraphAI | None = None


def _get_client() -> ScrapeGraphAI:
    global _client
    if _client is None:
        api_key = os.getenv("SCRAPEGRAPH_API_KEY")
        if not api_key:
            raise RuntimeError("SCRAPEGRAPH_API_KEY env var is not set")
        _client = ScrapeGraphAI(api_key=api_key)
    return _client


def _is_bare_domain(url: str) -> bool:
    """Return True when the URL has no path beyond the root slash."""
    parsed = urlparse(url)
    return not parsed.path or parsed.path in ("", "/")


def _run_extract(
    client: ScrapeGraphAI,
    *,
    url: str | None = None,
    markdown: str | None = None,
) -> dict:
    """Call the ScrapeGraphAI Extract endpoint and return a validated dict.

    Exactly one of url or markdown must be provided.
    Raises RuntimeError on any failure.
    """
    source = url or "<pasted text>"
    try:
        kwargs: dict = {"prompt": _USER_PROMPT, "schema": _OUTPUT_SCHEMA}
        if url:
            kwargs["url"] = url
        if markdown:
            kwargs["markdown"] = markdown
        api_result = client.extract(**kwargs)
    except Exception as exc:
        log.error("scrapegraph: extract call failed for %s — %s: %s", source, type(exc).__name__, exc)
        raise RuntimeError(f"ScrapeGraphAI API call failed for {source}: {exc}") from exc

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
    specific_details = specific_details[:5]

    log.info("scrapegraph: extract success elapsed_ms=%s", api_result.elapsed_ms)

    return {
        "url": url or "",
        "company_name": result_data["company_name"],
        "what_they_do": result_data["what_they_do"],
        "who_they_serve": result_data["who_they_serve"],
        "value_proposition": result_data["value_proposition"],
        "tone": result_data["tone"],
        "raw_text_snippet": str(result_data["raw_text_snippet"])[:1500],
        "specific_details": specific_details,
    }


def scrape_website(url: str, use_case: str = "") -> dict:
    """Scrape a prospect's website via ScrapeGraphAI. Raises RuntimeError on failure.

    When a bare domain is detected (e.g. media.mit.edu with no path), tries a
    use-case-appropriate subpath first before falling back to the root.
    """
    client = _get_client()

    if use_case and _is_bare_domain(url):
        hint = _BARE_DOMAIN_HINTS.get(use_case, "")
        if hint:
            resolved = url.rstrip("/") + hint
            log.info("bare domain detected, trying resolved URL: %s -> %s", url, resolved)
            try:
                return _run_extract(client, url=resolved)
            except RuntimeError as exc:
                log.warning("resolved URL failed (%s); falling back to root: %s", exc, url)

    log.info("scrapegraph: requesting %s", url)
    return _run_extract(client, url=url)


def extract_from_text(text: str) -> dict:
    """Extract structured data from pasted text, bypassing URL scraping.

    Sends the text to ScrapeGraphAI's Extract endpoint via the markdown param.
    No external URL is fetched. Raises RuntimeError on failure.
    """
    client = _get_client()
    log.info("extract_from_text: processing %d chars", len(text))
    return _run_extract(client, markdown=text)


def search_person(name: str, disambiguator: str) -> dict:
    """Search the open web for a person and extract structured data.

    Excludes LinkedIn, Twitter, and X from search targets. Returns a dict with
    status='unresolvable' when the person cannot be confidently identified from
    open-web sources. Raises RuntimeError on API failure.
    """
    client = _get_client()

    query_parts = [name]
    if disambiguator:
        query_parts.append(disambiguator)
    # Exclude gated social platforms. The user supplies any LinkedIn/X content
    # manually via the paste-text field; we do not connect to those services.
    query = " ".join(query_parts) + " -site:linkedin.com -site:twitter.com -site:x.com"
    log.info("search_person: query=%r", query)

    try:
        api_result = client.search(
            query=query,
            num_results=5,
            prompt=_SEARCH_PERSON_PROMPT,
            schema=_OUTPUT_SCHEMA,
        )
    except Exception as exc:
        log.error("scrapegraph: search failed for %r — %s: %s", name, type(exc).__name__, exc)
        raise RuntimeError(f"ScrapeGraphAI search failed for {name!r}: {exc}") from exc

    if api_result.status != "success":
        raise RuntimeError(
            f"ScrapeGraphAI search returned status={api_result.status!r}, error={api_result.error!r}"
        )

    search_response = api_result.data
    if search_response is None:
        raise RuntimeError("ScrapeGraphAI search success response had no data")

    result_data = search_response.json_data
    if not result_data or not isinstance(result_data, dict):
        log.info("search_person: no structured data returned for %r", name)
        return {"status": "unresolvable", "message": _UNRESOLVABLE_MESSAGE}

    missing = _REQUIRED_KEYS - result_data.keys()
    if missing:
        log.info("search_person: missing keys %s for %r", sorted(missing), name)
        return {"status": "unresolvable", "message": _UNRESOLVABLE_MESSAGE}

    # Identity confidence gate: require at minimum a resolved name and a role.
    company_name = str(result_data.get("company_name", "")).strip()
    what_they_do = str(result_data.get("what_they_do", "")).strip()
    if not company_name or not what_they_do:
        log.info("search_person: identity not resolved for %r (empty name or role)", name)
        return {"status": "unresolvable", "message": _UNRESOLVABLE_MESSAGE}

    specific_details = result_data.get("specific_details", [])
    if isinstance(specific_details, tuple):
        specific_details = list(specific_details)
    if not isinstance(specific_details, list):
        specific_details = []
    specific_details = [str(d).strip() for d in specific_details if d and str(d).strip()]
    specific_details = specific_details[:5]

    # Use the first non-gated source URL for attribution.
    source_url = ""
    for result in search_response.results:
        ru = getattr(result, "url", "") or ""
        if ru and "linkedin.com" not in ru and "twitter.com" not in ru and "x.com" not in ru:
            source_url = ru
            break

    log.info("search_person: success elapsed_ms=%s", api_result.elapsed_ms)

    return {
        "url": source_url,
        "company_name": company_name,
        "what_they_do": what_they_do,
        "who_they_serve": str(result_data.get("who_they_serve", "")).strip(),
        "value_proposition": str(result_data.get("value_proposition", "")).strip(),
        "tone": result_data.get("tone", "professional"),
        "raw_text_snippet": str(result_data.get("raw_text_snippet", ""))[:1500],
        "specific_details": specific_details,
    }
