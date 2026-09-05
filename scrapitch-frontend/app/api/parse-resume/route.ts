import { NextRequest, NextResponse } from "next/server";

// This route only supports POST, and POST handlers are never cached by
// Next.js regardless of this setting. It's kept explicit so the intent
// (always hit the live backend, never serve a cached response) is clear.
export const dynamic = "force-dynamic";

// Same-origin proxy for the Railway backend's /parse-resume endpoint. The
// browser calls this route instead of the backend directly so the partner
// API key stays server-side and is never exposed to client JS.
export async function POST(request: NextRequest) {
  let incomingForm: FormData;
  try {
    incomingForm = await request.formData();
  } catch {
    return NextResponse.json(
      { detail: "Request must be multipart form data." },
      { status: 400 },
    );
  }

  const file = incomingForm.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { detail: "Missing 'file' field." },
      { status: 400 },
    );
  }

  const apiOrigin = process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiOrigin) {
    console.error(
      "[Scrapitch] API_ORIGIN / NEXT_PUBLIC_API_URL is not set on the server.",
    );
    return NextResponse.json(
      { detail: "Server is not configured to reach the backend." },
      { status: 500 },
    );
  }

  // Rebuild the FormData rather than forwarding the original request body,
  // and do not set a Content-Type header ourselves. fetch computes the
  // correct multipart boundary from the FormData instance.
  const outgoingForm = new FormData();
  outgoingForm.append("file", file, file instanceof File ? file.name : "resume");

  try {
    const upstream = await fetch(`${apiOrigin}/parse-resume`, {
      method: "POST",
      headers: {
        "X-API-Key": process.env.SCRAPITCH_API_KEY ?? "",
      },
      body: outgoingForm,
    });

    const data = await upstream.json().catch(() => ({
      detail: "Backend returned a non-JSON response.",
    }));

    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("[Scrapitch] /api/parse-resume proxy error:", err);
    return NextResponse.json(
      { detail: "Could not reach the backend service. Please try again." },
      { status: 502 },
    );
  }
}
