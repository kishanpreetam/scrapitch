import httpx
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
}

TIMEOUT = 30.0


def scrape_website(url: str) -> dict:
    """
    Scrape a prospect's website and extract key business intelligence.
    Tries the main URL first, then /about as a fallback.
    If both fail, returns domain-based data so email generation can still proceed.
    """
    # Try main URL, then /about fallback
    urls_to_try = [url]
    base = url.rstrip("/")
    if not any(seg in base for seg in ["/about", "/about-us"]):
        urls_to_try.append(base + "/about")

    last_error = None
    for attempt_url in urls_to_try:
        result, error = _try_fetch(attempt_url)
        if result is not None:
            return result
        last_error = error
        print(f"[scraper] Failed {attempt_url}: {error}")

    # Both URLs failed — build a graceful fallback from the domain
    print(f"[scraper] All attempts failed. Using domain fallback for {url}")
    return _domain_fallback(url, last_error)


def _try_fetch(url: str) -> tuple[dict | None, str | None]:
    """
    Attempt to fetch and parse a single URL.
    Returns (result_dict, None) on success or (None, error_str) on failure.
    """
    try:
        with httpx.Client(timeout=TIMEOUT, follow_redirects=True) as client:
            response = client.get(url, headers=HEADERS)
            response.raise_for_status()
    except httpx.TimeoutException:
        return None, f"Timed out after {int(TIMEOUT)}s"
    except httpx.HTTPStatusError as e:
        code = e.response.status_code
        # CloudFlare / bot protection typically returns 403 or 503
        if code in (403, 503):
            return None, f"Bot protection blocked request (HTTP {code})"
        return None, f"HTTP {code} error"
    except httpx.RequestError as e:
        return None, f"Connection error: {str(e)}"

    # Detect CloudFlare challenge pages (they return 200 but with a challenge body)
    if _is_bot_protection(response.text):
        return None, "CloudFlare/bot protection challenge page detected"

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "head", "noscript", "svg", "img"]):
        tag.decompose()

    company_name = _extract_company_name(soup, url)
    raw_text = _extract_clean_text(soup)
    what_they_do = _extract_what_they_do(soup, raw_text)
    who_they_serve = _extract_who_they_serve(raw_text)
    value_proposition = _extract_value_proposition(soup, raw_text)
    tone = _detect_tone(raw_text)

    return {
        "url": url,
        "company_name": company_name,
        "what_they_do": what_they_do,
        "who_they_serve": who_they_serve,
        "value_proposition": value_proposition,
        "tone": tone,
        "raw_text_snippet": raw_text[:1500],
        "error": None,
    }, None


def _is_bot_protection(html: str) -> bool:
    """Detect CloudFlare and similar bot-protection challenge pages."""
    signals = [
        "cf-browser-verification",
        "challenges.cloudflare.com",
        "Ray ID",
        "Checking your browser",
        "DDoS protection by",
        "Please enable cookies",
        "cf_chl_opt",
    ]
    html_lower = html.lower()
    return sum(1 for s in signals if s.lower() in html_lower) >= 2


def _domain_fallback(url: str, error: str | None) -> dict:
    """
    Build a minimal result from the domain name alone so the
    email generator can still produce something useful.
    """
    match = re.search(r"(?:https?://)?(?:www\.)?([^/]+)", url)
    domain_full = match.group(1) if match else url
    company_name = domain_full.split(".")[0].capitalize()

    return {
        "url": url,
        "company_name": company_name,
        "what_they_do": f"a company at {domain_full}",
        "who_they_serve": "businesses and teams",
        "value_proposition": f"Visit {domain_full} to learn more about their offering",
        "tone": "professional",
        "raw_text_snippet": "",
        "error": error,  # kept for logging but won't block email generation
    }


def _extract_company_name(soup: BeautifulSoup, url: str) -> str:
    # Try og:site_name first
    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content"):
        return og_site["content"].strip()

    # Try title tag
    title = soup.find("title")
    if title and title.text:
        name = title.text.strip()
        # Clean common suffixes
        for sep in [" | ", " - ", " – ", " — ", " :: "]:
            if sep in name:
                name = name.split(sep)[0].strip()
        if name:
            return name

    # Fall back to domain name
    match = re.search(r"(?:https?://)?(?:www\.)?([^/]+)", url)
    if match:
        domain = match.group(1).split(".")[0]
        return domain.capitalize()

    return "Unknown Company"


def _extract_clean_text(soup: BeautifulSoup) -> str:
    texts = []
    for tag in soup.find_all(["h1", "h2", "h3", "h4", "p", "li", "span", "div"]):
        text = tag.get_text(separator=" ", strip=True)
        if len(text) > 20:
            texts.append(text)
    combined = " ".join(texts)
    # Collapse whitespace
    combined = re.sub(r"\s+", " ", combined).strip()
    return combined


def _extract_what_they_do(soup: BeautifulSoup, text: str) -> str:
    # Hero h1 is usually the clearest signal
    h1 = soup.find("h1")
    if h1:
        h1_text = h1.get_text(strip=True)
        if len(h1_text) > 10:
            return h1_text[:300]

    # Fall back to meta description
    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc and meta_desc.get("content"):
        return meta_desc["content"].strip()[:300]

    # Fall back to first substantial paragraph
    for p in soup.find_all("p"):
        p_text = p.get_text(strip=True)
        if len(p_text) > 50:
            return p_text[:300]

    return text[:300] if text else "Could not extract business description"


def _extract_who_they_serve(text: str) -> str:
    patterns = [
        r"(?:for|serving|built for|designed for|trusted by|used by|helping)\s+([\w\s,&]+?)(?:\.|,|\n|to )",
        r"(?:our clients|our customers|we help|we serve)\s+([\w\s,&]+?)(?:\.|,|\n)",
        r"((?:small businesses?|enterprises?|startups?|agencies?|b2b|saas|e-commerce|healthcare|finance|marketing teams?|sales teams?)[^.]*)",
    ]
    text_lower = text.lower()
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            result = match.group(1).strip()
            if len(result) > 5:
                return result[:200].capitalize()

    return "B2B companies and businesses"


def _extract_value_proposition(soup: BeautifulSoup, text: str) -> str:
    # Look for og:description or meta description
    og_desc = soup.find("meta", property="og:description")
    if og_desc and og_desc.get("content"):
        return og_desc["content"].strip()[:400]

    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc and meta_desc.get("content"):
        return meta_desc["content"].strip()[:400]

    # Look for hero subheading (h2 near top)
    h2 = soup.find("h2")
    if h2:
        h2_text = h2.get_text(strip=True)
        if len(h2_text) > 15:
            return h2_text[:400]

    return text[300:700] if len(text) > 300 else text[:400]


def _detect_tone(text: str) -> str:
    text_lower = text.lower()

    formal_words = ["enterprise", "solutions", "compliance", "governance", "infrastructure", "procurement"]
    casual_words = ["awesome", "cool", "hey", "love", "fun", "amazing", "super", "wow"]
    technical_words = ["api", "sdk", "integration", "developer", "stack", "deploy", "pipeline", "algorithm"]
    bold_words = ["disrupting", "revolutionary", "game-changer", "fastest", "#1", "best-in-class", "dominate"]

    scores = {
        "formal": sum(1 for w in formal_words if w in text_lower),
        "casual": sum(1 for w in casual_words if w in text_lower),
        "technical": sum(1 for w in technical_words if w in text_lower),
        "bold": sum(1 for w in bold_words if w in text_lower),
    }

    dominant = max(scores, key=scores.get)
    if scores[dominant] == 0:
        dominant = "professional"

    return dominant


