# Security policy

## Reporting a vulnerability

Please report security issues privately. Don't open a public issue. You can either:

- use GitHub's private reporting: **Security tab → Report a vulnerability**, or
- email **kishanpreetamkommana@gmail.com**.

You'll get an acknowledgement within 3 business days, and a fix or mitigation plan within 14 days for confirmed issues.

Reports we especially want:

- calling `/generate` or `/parse-resume` without a valid partner key or signed-in session;
- getting around rate limits;
- reading another user's data;
- leaked credentials;
- injection into the scraping or generation pipeline that changes behavior for other users.

## How the service is protected

- **Signed-in users only.** The web app's API routes check the Supabase session on the server.
- **Partner keys.** The backend accepts only registered partner keys, refuses all requests if none are configured, and rate-limits each partner and each signed-in user.
- **Keys stay server-side.** Keys live only in server environment variables, never in browser code or this repository. GitHub secret scanning and push protection are enabled.
- **Input limits.**
  - Request fields have length caps.
  - Resume uploads must be PDF or DOCX, up to 10 MB.
  - Error responses don't include internal details.
- **Privacy.** See the [Privacy Policy](https://scrapitch.com/privacy) and [Terms](https://scrapitch.com/terms).
