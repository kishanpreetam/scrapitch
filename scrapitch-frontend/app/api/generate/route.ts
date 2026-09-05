import { NextRequest, NextResponse } from "next/server";

// This route only supports POST, and POST handlers are never cached by
// Next.js regardless of this setting. It's kept explicit so the intent
// (always hit the live backend, never serve a cached response) is clear.
export const dynamic = "force-dynamic";

// Same-origin proxy for the Railway backend's /generate endpoint. The
// browser calls this route instead of the backend directly so the partner
// API key stays server-side and is never exposed to client JS.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const apiOrigin = process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiOrigin) {
    console.error(
      "[Scrapitch] API_ORIGIN / NEXT_PUBLIC_API_URL is not set on the server.",
    );
    return NextResponse.json(
      { error: "Server is not configured to reach the backend." },
      { status: 500 },
    );
  }

  try {
    const upstream = await fetch(`${apiOrigin}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SCRAPITCH_API_KEY ?? "",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json().catch(() => ({
      error: "Backend returned a non-JSON response.",
    }));

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("[Scrapitch] /api/generate proxy error:", err);
    return NextResponse.json(
      { error: "Could not reach the backend service. Please try again." },
      { status: 502 },
    );
  }
}
