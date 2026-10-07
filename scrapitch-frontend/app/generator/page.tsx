"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error(
    "[Scrapitch] NEXT_PUBLIC_API_URL is not set. All API calls will fail. " +
      "Add this variable to .env.local or your Vercel project settings."
  );
}
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type UseCase =
  | "b2b_sales"
  | "masters_outreach"
  | "job_hunt"
  | "executive_outreach"
  | "networking";

type Variant = {
  variant: string;
  name: string;
  subject_lines: string[];
  body: string;
  score: number;
  score_reasoning: string;
};

type GenerateResponse = {
  url: string;
  company_name: string;
  variants: Variant[];
  limited_personalization?: boolean;
};

// Only the one-line summary is used, to autofill the sender-side about-you field.
type ParsedResume = {
  summary_one_line?: string;
};

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

// The form asks only for the sender's side. The recipient's details come from
// the scrape, so labels and placeholders adapt to the selected outreach type
// without ever asking the user to describe the prospect.
const ABOUT_YOU: Record<UseCase, { label: string; placeholder: string }> = {
  b2b_sales: {
    label: "what you're great at",
    placeholder: "The result you get people, in plain terms — like 'we cut onboarding time by 40%'. Skip the job title.",
  },
  masters_outreach: {
    label: "your background",
    placeholder:
      "Your degree plus the one skill or project that lines up with their work. e.g. 'MS in computer vision — I built a 3D reconstruction pipeline.'",
  },
  job_hunt: {
    label: "your relevant experience",
    placeholder:
      "The experience that actually fits this role. One recognizable employer or one real number goes a long way.",
  },
  executive_outreach: {
    label: "why they should listen",
    placeholder: "One named customer, one number, or a shared connection. One is plenty.",
  },
  networking: {
    label: "a little about you",
    placeholder:
      "One line on who you are — and why them specifically: a shared school, a talk you caught, something they made.",
  },
};

const ASK_PLACEHOLDER: Record<UseCase, string> = {
  b2b_sales: "One small, easy ask. e.g. 'Worth a quick call next week?'",
  masters_outreach:
    "Keep it small and specific — a 15-minute call, or whether they're taking students for the term below.",
  job_hunt: "Ask for a short chat, not a job. e.g. 'Open to 15 minutes about the role?'",
  executive_outreach: "Offer something, don't just ask for time. e.g. 'Want a quick benchmark of how peers handled X?'",
  networking:
    "Keep it small and advice-shaped. e.g. '15 minutes to hear how you got into X?' — not a job ask.",
};

const URL_LABEL: Record<UseCase, string> = {
  b2b_sales: "their website",
  masters_outreach: "their lab or a paper",
  job_hunt: "the job or company link",
  executive_outreach: "their firm or a recent post",
  networking: "their site (optional)",
};

const URL_HELPER: Record<UseCase, string> = {
  b2b_sales: "Their homepage, product page, or about page — wherever they describe what they do best.",
  masters_outreach: "Link the professor's lab or group page, or a recent paper. A university homepage is usually too thin to work from.",
  job_hunt: "Drop the job posting itself, or the company's site if there isn't a posting yet.",
  executive_outreach: "Their firm's thesis or portfolio page, or a partner's recent post. A generic homepage won't give us much.",
  networking: "Optional — their personal site, a company bio page, or a talk they gave.",
};

const PASTE_HELPER: Record<UseCase, string> = {
  b2b_sales: "Or paste their about page, a product blurb, or a recent announcement.",
  masters_outreach: "Or paste their lab overview, a research summary, or a paper abstract.",
  job_hunt: "Or paste the job description, their bio, or a recent post.",
  executive_outreach: "Or paste their bio, a recent post, or something they've said publicly.",
  networking: "Or paste their bio, an about section, or a recent post.",
};

// Networking is intentionally absent: achievements read as bragging in a
// networking ask, so the highlights field is hidden for it.
const HIGHLIGHTS: Partial<Record<UseCase, { label: string; placeholder: string }>> = {
  b2b_sales: { label: "proof (optional)", placeholder: "A number, a named customer, or a recent win. Anything concrete helps." },
  executive_outreach: { label: "proof (optional)", placeholder: "A number, a named customer, or a recent win." },
  job_hunt: { label: "proof (optional)", placeholder: "A number, a shipped project, or a recognizable name." },
  masters_outreach: {
    label: "a relevant result (optional)",
    placeholder: "One result or project that connects to their work.",
  },
};

// Use-case-specific inputs the backend already accepts and feeds to the Email
// Writer (see email_generator.py). Surfacing them lets the pipeline personalize
// with structured detail instead of guessing from the generic fields above.
// Only added where it sharpens the draft without piling on friction.
type ExtraField = {
  key: "target_role" | "portfolio_link" | "paper_or_topic" | "program_term";
  label: string;
  placeholder: string;
  helper?: string;
  type?: "text" | "url";
};

const EXTRA_FIELDS: Record<UseCase, ExtraField[]> = {
  b2b_sales: [],
  executive_outreach: [],
  networking: [],
  job_hunt: [
    {
      key: "target_role",
      label: "the role you're after",
      placeholder: "e.g. Data Analyst — or the exact title from the posting.",
      helper: "So the draft names the role instead of a vague 'any opportunity'.",
    },
    {
      key: "portfolio_link",
      label: "portfolio or github (optional)",
      placeholder: "https://…",
      type: "url",
      helper: "We'll work it into the sign-off if it fits.",
    },
  ],
  masters_outreach: [
    {
      key: "paper_or_topic",
      label: "a paper or topic of theirs (optional)",
      placeholder: "The title, or the specific line of work you actually read.",
      helper: "Only what you've genuinely read — we never invent a paper you didn't mention.",
    },
    {
      key: "program_term",
      label: "when you'd start (optional)",
      placeholder: "e.g. Fall 2026",
      helper: "Grounds the ask in a concrete term.",
    },
  ],
};

function StrongestTag() {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 10,
        background: "rgba(59,130,246,0.12)",
        color: "#60a5fa",
        padding: "2px 8px",
        borderRadius: 99,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      Strongest
    </span>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EmailCard({
  variant,
  rank,
  isStrongest,
}: {
  variant: Variant;
  rank: number;
  isStrongest: boolean;
}) {
  const [copiedSubject, setCopiedSubject] = useState<number | null>(null);
  const [copiedBody, setCopiedBody] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);

  const handleCopySubject = (subject: string, index: number) => {
    navigator.clipboard.writeText(subject).then(() => {
      setCopiedSubject(index);
      setTimeout(() => setCopiedSubject(null), 2000);
    });
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(variant.body).then(() => {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    });
  };

  return (
    <div
      id={`draft-${rank}`}
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: "0.04em" }}>
          <span style={{ color: "#c9b896" }}>{rank}</span>
          <span style={{ color: "#6e6e6e" }}> · {variant.name.toLowerCase()}</span>
        </span>
        {isStrongest && <StrongestTag />}
      </div>

      {/* Hairline */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Subject */}
      <div>
        <p
          className="font-mono"
          style={{ fontSize: 11, color: "#6e6e6e", letterSpacing: "0.04em", marginBottom: 8 }}
        >
          subject
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {variant.subject_lines.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span
                className="font-mono"
                style={{ fontSize: 11, color: "#6e6e6e", marginTop: 3, flexShrink: 0 }}
              >
                {i + 1}.
              </span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#f5f5f0", lineHeight: 1.4 }}>
                {s}
              </span>
              <button
                onClick={() => handleCopySubject(s, i)}
                title="Copy subject"
                style={{
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: copiedSubject === i ? "#4ade80" : "#6e6e6e",
                  padding: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  marginTop: 2,
                  transition: "color 0.15s",
                }}
              >
                {copiedSubject === i ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1 }}>
        <p
          className="font-mono"
          style={{ fontSize: 11, color: "#6e6e6e", letterSpacing: "0.04em", marginBottom: 8 }}
        >
          body
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#e8e8e8", whiteSpace: "pre-wrap" }}>
          {variant.body}
        </p>
      </div>

      {/* Why this works accordion */}
      {variant.score_reasoning && (
        <div>
          <button
            onClick={() => setReasonOpen(!reasonOpen)}
            className="font-mono"
            style={{
              fontSize: 11,
              color: "#6e6e6e",
              letterSpacing: "0.04em",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                transition: "transform 0.15s",
                transform: reasonOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            why this works
          </button>
          {reasonOpen && (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#6e6e6e",
                lineHeight: 1.6,
                borderLeft: "2px solid rgba(255,255,255,0.1)",
                paddingLeft: 12,
              }}
            >
              {variant.score_reasoning}
            </p>
          )}
        </div>
      )}

      {/* Copy body button */}
      <button
        onClick={handleCopyBody}
        style={{
          width: "100%",
          background: "transparent",
          border: `1px solid ${copiedBody ? "rgba(34,197,94,0.4)" : "rgba(59,130,246,0.4)"}`,
          borderRadius: 8,
          padding: "10px 16px",
          color: copiedBody ? "#4ade80" : "#60a5fa",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        {copiedBody ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            copied
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            copy body
          </>
        )}
      </button>
    </div>
  );
}

const labelStyle = {
  fontSize: 11,
  color: "#c9b896",
  letterSpacing: "0.04em",
  marginBottom: 10,
} as const;

const helperStyle = { fontSize: 13, color: "#6e6657", lineHeight: 1.5, marginTop: 8 } as const;

const fieldClass =
  "w-full bg-[#0a0a0a] border border-[#2c241c] rounded-[4px] px-4 py-3.5 text-base text-[#f5f5f0] placeholder:text-[#4a4a48] focus:border-[#c9b896] focus:outline-none transition-colors";

export default function GeneratorPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/signup");
    });
  }, [router]);

  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [personName, setPersonName] = useState("");
  const [personDisambiguator, setPersonDisambiguator] = useState("");
  const [useCase, setUseCase] = useState<UseCase>("b2b_sales");
  const [aboutUser, setAboutUser] = useState("");
  const [userAsk, setUserAsk] = useState("");
  const [highlights, setHighlights] = useState("");
  // Values for the use-case-specific fields (target_role, program_term, …),
  // keyed by backend field name. Only the current use case's keys are sent.
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadable, setUnreadable] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  // Resume upload (job hunt and masters only). Fills the about-you field.
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aboutYou = ABOUT_YOU[useCase];
  const highlightsField = HIGHLIGHTS[useCase];
  const showResume = useCase === "job_hunt" || useCase === "masters_outreach";
  const isNetworking = useCase === "networking";

  const handleResumeFile = async (file: File) => {
    setResumeError(null);
    setResumeParsing(true);
    setResumeFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(data.detail || `Error ${res.status}`);
      }
      const parsed: ParsedResume = await res.json();
      if (parsed.summary_one_line) setAboutUser(parsed.summary_one_line);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setResumeError(
        `Couldn't read this resume. ${message}. Try a cleaner PDF or fill the field below manually.`,
      );
      setResumeFileName("");
    } finally {
      setResumeParsing(false);
    }
  };

  const handleResumeRemove = () => {
    setResumeFileName("");
    setResumeError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleResumeFile(file);
  };

  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleResumeFile(file);
  };

  const handleGenerate = async () => {
    setHasAttempted(true);

    const trimmedUrl = url.trim();
    if (isNetworking) {
      if (!personName.trim() && !trimmedUrl && !pastedText.trim()) {
        setError("Enter their name, paste their site URL, or paste some text to work from.");
        return;
      }
    } else {
      if (!trimmedUrl && !pastedText.trim()) {
        setError("Please enter a URL or paste some text about the recipient.");
        return;
      }
    }
    if (!aboutUser.trim()) {
      setError("Please tell us a bit about you.");
      return;
    }
    if (!userAsk.trim()) {
      setError("Please describe what you're asking for.");
      return;
    }

    setError(null);
    setUnreadable(null);
    setResult(null);
    setLoading(true);
    setLoadingStage(pastedText.trim() ? "Analyzing text..." : "Analyzing website...");

    const stageTimer = setTimeout(() => setLoadingStage("Generating emails..."), 4000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    const endpoint = "/api/generate";

    try {
      const body: Record<string, unknown> = {
        use_case: useCase,
        about_user: aboutUser,
        user_ask: userAsk,
        highlights: highlightsField ? highlights : "",
      };
      if (trimmedUrl) {
        const normalised =
          trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
            ? trimmedUrl
            : `https://${trimmedUrl}`;
        body.url = normalised;
      }
      if (pastedText.trim()) body.pasted_text = pastedText.trim();
      if (isNetworking && personName.trim()) {
        body.person_name = personName.trim();
        body.person_disambiguator = personDisambiguator.trim();
      }
      // Only send the fields relevant to the current use case, so a value
      // typed under a previous use case never leaks into this request.
      for (const f of EXTRA_FIELDS[useCase]) {
        const val = extras[f.key]?.trim();
        if (val) body[f.key] = val;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      }).catch((fetchErr: unknown) => {
        if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
          console.error("[Scrapitch] Request timed out:", endpoint);
          setError("The request timed out. The server may be under load. Please try again.");
        } else {
          console.error("[Scrapitch] Network error calling:", endpoint, fetchErr);
          setError("Could not reach the server. Please check your connection and try again.");
        }
        return null;
      });

      if (!res) return;

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (res.status === 429) {
        setError("You've hit the generation limit for now. Please try again in a few minutes.");
        return;
      }

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        console.error("[Scrapitch] API error", res.status, endpoint, bodyText);
        setError(`Generation failed (status ${res.status}). Please try again.`);
        return;
      }

      const data = await res.json().catch(() => null);

      if (data && data.status === "unreadable") {
        setUnreadable(
          typeof data.message === "string"
            ? data.message
            : "We couldn't read enough from that page to personalize. Some sites, including social profiles, block automated access. Try the company, lab, or person's own website instead.",
        );
        return;
      }
      if (!data || !Array.isArray(data.variants)) {
        console.error("[Scrapitch] Unexpected response shape from:", endpoint, data);
        setError("Something went wrong generating your drafts. Please try again.");
        return;
      }
      setResult(data as GenerateResponse);
    } catch (unexpectedErr) {
      console.error("[Scrapitch] Unexpected error calling:", endpoint, unexpectedErr);
      setError("Something went wrong. Please try again.");
    } finally {
      clearTimeout(stageTimer);
      clearTimeout(timeoutId);
      setLoading(false);
      setLoadingStage("");
    }
  };

  const sortedVariants = result
    ? [...result.variants].sort((a, b) => b.score - a.score)
    : [];

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {/* Header */}
        <section className="text-center" style={{ paddingTop: 80, paddingBottom: 24 }}>
          <div className="mx-auto px-6" style={{ maxWidth: 720 }}>
            <p
              className="font-mono"
              style={{ fontSize: 11, color: "#6e6e6e", letterSpacing: "0.04em", marginBottom: 16 }}
            >
              the generator
            </p>
            <div style={{ height: 1, background: "#2c241c", width: 64, margin: "0 auto 32px" }} />
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 500,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                color: "#f5f5f0",
                marginBottom: 20,
              }}
            >
              Paste a URL. Get{" "}
              <em
                style={{
                  fontFamily: SERIF_STACK,
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#c9b896",
                }}
              >
                three
              </em>{" "}
              drafts.
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.5,
                color: "#8a8a85",
                maxWidth: 480,
                margin: "0 auto 24px",
              }}
            >
              Three specialist agents will research the site, write personalized variants, and score each one.
            </p>
            <div
              className="font-mono flex flex-wrap items-center justify-center"
              style={{
                fontSize: 11,
                color: "#6e6e6e",
                letterSpacing: "0.04em",
                columnGap: 32,
                rowGap: 8,
              }}
            >
              <span>01 · research analyst</span>
              <span>02 · email writer</span>
              <span>03 · scoring judge</span>
            </div>
            <div style={{ height: 1, background: "#2c241c", width: 64, margin: "32px auto 64px" }} />
          </div>
        </section>

        {/* Form wrapper */}
        <div className="mx-auto px-6" style={{ maxWidth: 720, paddingBottom: 80 }}>
          {/* Input card */}
          <div
            style={{
              background: "#0d0d0d",
              border: "1px solid #1a1a1a",
              borderRadius: 4,
              padding: 48,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Prospect URL */}
              <div>
                <p className="font-mono" style={labelStyle}>
                  {URL_LABEL[useCase]}
                </p>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required={!isNetworking}
                  className={fieldClass}
                />
                <p style={helperStyle}>{URL_HELPER[useCase]}</p>
              </div>

              {/* Outreach type */}
              <div>
                <p className="font-mono" style={labelStyle}>
                  outreach type
                </p>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value as UseCase)}
                  className="w-full bg-[#0a0a0a] border border-[#2c241c] rounded-[4px] px-4 py-3.5 text-base text-[#f5f5f0] focus:border-[#c9b896] focus:outline-none transition-colors"
                >
                  <option value="b2b_sales">B2B sales · pitch a product or service</option>
                  <option value="masters_outreach">Master&apos;s / PhD outreach · reach out to a lab or program</option>
                  <option value="job_hunt">Job hunt · reach out about a role</option>
                  <option value="executive_outreach">Executive outreach · peer-to-peer to a C-suite contact</option>
                  <option value="networking">Networking · start a real connection</option>
                </select>
                <p style={helperStyle}>We tailor email length, framing, and ask to your use case.</p>
              </div>

              {/* Networking: name + context fields */}
              {isNetworking && (
                <div>
                  <p className="font-mono" style={labelStyle}>
                    their name
                  </p>
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g. Sarah Chen"
                    className={fieldClass}
                    style={{ marginBottom: 8 }}
                  />
                  <input
                    type="text"
                    value={personDisambiguator}
                    onChange={(e) => setPersonDisambiguator(e.target.value)}
                    placeholder="company, role, city, or topic to narrow it down"
                    className={fieldClass}
                  />
                  <p style={helperStyle}>A name plus one detail is usually enough to find them. Or skip the name and paste text or a URL below.</p>
                </div>
              )}

              {/* Paste text fallback (also the LinkedIn / X path for any use case) */}
              <div>
                <p className="font-mono" style={labelStyle}>
                  paste text (optional)
                </p>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={PASTE_HELPER[useCase]}
                  rows={4}
                  className={fieldClass}
                  style={{ resize: "vertical", minHeight: 96 }}
                />
                {isNetworking ? (
                  <p style={helperStyle}>Or paste their public bio, about section, or a recent post. One is enough: name, URL, or pasted text.</p>
                ) : (
                  <p style={helperStyle}>{PASTE_HELPER[useCase]} No URL needed when text is pasted.</p>
                )}
              </div>

              {/* Resume upload (job hunt and masters only); fills the about-you field below */}
              {showResume && (
                <div>
                  <p className="font-mono" style={labelStyle}>
                    resume (optional)
                  </p>

                  {!resumeFileName && !resumeParsing && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleResumeDrop}
                      role="button"
                      tabIndex={0}
                      className="hover:border-[#c9b896] transition-colors group cursor-pointer"
                      style={{
                        background: isDragging ? "#0d0c0a" : "#0a0a0a",
                        border: `1px ${isDragging ? "solid" : "dashed"} ${isDragging ? "#c9b896" : "#2c241c"}`,
                        borderRadius: 4,
                        padding: "20px 16px",
                        minHeight: 72,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <p
                        className="group-hover:text-[#f5f5f0] transition-colors"
                        style={{ fontSize: 14, color: "#8a8a85", marginBottom: 4 }}
                      >
                        <span className="md:hidden">Tap to upload your resume</span>
                        <span className="hidden md:inline">Drop your resume here, or click to upload</span>
                      </p>
                      <p
                        className="font-mono"
                        style={{ fontSize: 11, color: "#6e6657", letterSpacing: "0.04em" }}
                      >
                        PDF or DOCX, up to 10MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeInput}
                    style={{ display: "none" }}
                  />

                  {resumeParsing && (
                    <div
                      style={{
                        background: "#0a0a0a",
                        border: "1px solid #2c241c",
                        borderRadius: 4,
                        padding: "20px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        className="rounded-full animate-spin"
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid rgba(201,184,150,0.25)",
                          borderTopColor: "#c9b896",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: SERIF_STACK,
                          fontStyle: "italic",
                          fontSize: 14,
                          color: "#8a7d63",
                        }}
                      >
                        reading your resume...
                      </span>
                    </div>
                  )}

                  {resumeFileName && !resumeParsing && (
                    <div
                      className="flex items-center justify-between"
                      style={{
                        background: "#0d0c0a",
                        border: "1px solid #2c241c",
                        borderRadius: 4,
                        padding: "12px 16px",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "#f5f5f0", wordBreak: "break-all" }}>
                        {resumeFileName}
                      </span>
                      <button
                        onClick={handleResumeRemove}
                        className="hover:text-[#f5f5f0] transition-colors shrink-0"
                        style={{
                          fontSize: 12,
                          color: "#c9b896",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        remove
                      </button>
                    </div>
                  )}

                  {resumeError && (
                    <p style={{ fontSize: 13, color: "#d4a4a4", lineHeight: 1.5, marginTop: 8 }}>
                      {resumeError}
                    </p>
                  )}

                  <p style={helperStyle}>
                    Optional. We read it once to fill your background below, then it isn&apos;t saved.
                  </p>
                </div>
              )}

              {/* About you (label and placeholder adapt to the use case) */}
              <div>
                <p className="font-mono" style={labelStyle}>
                  {aboutYou.label}
                </p>
                <textarea
                  value={aboutUser}
                  onChange={(e) => setAboutUser(e.target.value)}
                  placeholder={aboutYou.placeholder}
                  rows={3}
                  maxLength={2000}
                  required
                  className={`${fieldClass} resize-y`}
                />
                <p style={helperStyle}>
                  Just your side — we pull the recipient&apos;s details from the link or text above.
                </p>
              </div>

              {/* The ask (placeholder adapts to the use case) */}
              <div>
                <p className="font-mono" style={labelStyle}>
                  what are you asking for
                </p>
                <textarea
                  value={userAsk}
                  onChange={(e) => setUserAsk(e.target.value)}
                  placeholder={ASK_PLACEHOLDER[useCase]}
                  rows={2}
                  maxLength={1000}
                  required
                  className={`${fieldClass} resize-y`}
                />
                <p style={helperStyle}>One clear, specific ask.</p>
              </div>

              {/* Use-case-specific fields (job hunt, master's). Each maps to a
                  backend field the Email Writer already knows how to use. */}
              {EXTRA_FIELDS[useCase].map((f) => (
                <div key={f.key}>
                  <p className="font-mono" style={labelStyle}>
                    {f.label}
                  </p>
                  <input
                    type={f.type ?? "text"}
                    value={extras[f.key] ?? ""}
                    onChange={(e) =>
                      setExtras((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className={fieldClass}
                  />
                  {f.helper && <p style={helperStyle}>{f.helper}</p>}
                </div>
              ))}

              {/* Highlights (use-case-aware; hidden for networking) */}
              {highlightsField && (
                <div>
                  <p className="font-mono" style={labelStyle}>
                    {highlightsField.label}
                  </p>
                  <textarea
                    value={highlights}
                    onChange={(e) => setHighlights(e.target.value)}
                    placeholder={highlightsField.placeholder}
                    rows={2}
                    maxLength={2000}
                    className={`${fieldClass} resize-y`}
                  />
                </div>
              )}

            </div>

            {/* Generate button */}
            <div className="text-center" style={{ marginTop: 40 }}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full md:w-auto hover:border-[#f5f5f0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "transparent",
                  border: "1px solid #c9b896",
                  color: "#f5f5f0",
                  padding: "14px 48px",
                  borderRadius: 4,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center" style={{ gap: 12 }}>
                    <span
                      className="rounded-full animate-spin"
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(201,184,150,0.25)",
                        borderTopColor: "#c9b896",
                      }}
                    />
                    <span>{loadingStage || "Generating..."}</span>
                  </span>
                ) : (
                  "Generate three drafts"
                )}
              </button>
              <p
                style={{
                  fontFamily: SERIF_STACK,
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 14,
                  color: "#8a7d63",
                  letterSpacing: "0.01em",
                  marginTop: 16,
                }}
              >
                ten seconds, on average
              </p>
            </div>
          </div>

          {/* Error state */}
          {hasAttempted && error && (
            <div
              style={{
                marginTop: 32,
                borderRadius: 4,
                border: "1px solid #5a2c2c",
                background: "rgba(120,40,40,0.08)",
                padding: 20,
              }}
            >
              <p
                className="font-mono"
                style={{ fontSize: 11, color: "#d4a4a4", letterSpacing: "0.04em", marginBottom: 6 }}
              >
                error
              </p>
              <p style={{ fontSize: 14, color: "#d4a4a4", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {error}
              </p>
            </div>
          )}

          {/* Unreadable page: calm guidance, not an error. The URL above stays editable. */}
          {unreadable && !loading && (
            <div
              style={{
                marginTop: 32,
                borderRadius: 4,
                border: "1px solid #2c241c",
                background: "#0d0d0d",
                padding: 24,
              }}
            >
              <p
                className="font-mono"
                style={{ fontSize: 11, color: "#c9b896", letterSpacing: "0.04em", marginBottom: 10 }}
              >
                heads up
              </p>
              <p style={{ fontSize: 15, color: "#c9c9c4", lineHeight: 1.6 }}>{unreadable}</p>
              <p style={{ fontSize: 13, color: "#6e6657", lineHeight: 1.5, marginTop: 12 }}>
                Edit the URL above and try a different page.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && !unreadable && (
            <div
              className="text-center"
              style={{
                marginTop: 32,
                border: "1px solid #1a1a1a",
                borderRadius: 4,
                padding: "80px 32px",
              }}
            >
              <p
                className="font-mono"
                style={{ fontSize: 11, color: "#6e6e6e", letterSpacing: "0.04em", marginBottom: 16 }}
              >
                output
              </p>
              <div style={{ height: 1, background: "#2c241c", width: 32, margin: "0 auto 24px" }} />
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#f5f5f0",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
              >
                Your{" "}
                <em
                  style={{
                    fontFamily: SERIF_STACK,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#c9b896",
                  }}
                >
                  drafts
                </em>{" "}
                will appear here.
              </p>
              <p style={{ fontSize: 14, color: "#6e6e6e" }}>Paste a URL above and generate.</p>
            </div>
          )}
        </div>

        {/* Results — two-pane layout at >= 1024px, single column below */}
        {result && (
          <div className="mx-auto px-6" style={{ maxWidth: 1080, paddingBottom: 80 }}>
            {/* Hairline divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 32 }} />

            {/* Mobile-only header (hidden on desktop — lives in the rail instead) */}
            <div className="lg:hidden" style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#f5f5f0",
                  lineHeight: 1.3,
                  marginBottom: 6,
                }}
              >
                Results for{" "}
                <em
                  style={{
                    fontFamily: SERIF_STACK,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#c9b896",
                  }}
                >
                  {result.company_name}
                </em>
              </h2>
              <p
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: "#6f6f6f",
                  wordBreak: "break-all",
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}
              >
                {result.url}
              </p>
              <p
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: "#8f8f8f",
                  letterSpacing: "0.04em",
                  lineHeight: 1.6,
                }}
              >
                AI-generated. Review before sending. You are the sender.
              </p>
            </div>

            {/* Two-pane flex */}
            <div style={{ display: "flex", alignItems: "flex-start" }}>

              {/* Left rail — desktop only */}
              <div
                className="hidden lg:flex"
                style={{
                  width: 260,
                  flexShrink: 0,
                  position: "sticky",
                  top: 80,
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  padding: "0 18px 40px 0",
                  flexDirection: "column",
                }}
              >
                <p
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "#8f8f8f",
                    letterSpacing: "0.04em",
                    marginBottom: 8,
                  }}
                >
                  results
                </p>
                <p
                  style={{
                    fontFamily: SERIF_STACK,
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: 16,
                    color: "#c9b896",
                    marginBottom: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {result.company_name}
                </p>
                <p
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "#6f6f6f",
                    wordBreak: "break-all",
                    marginBottom: 16,
                    lineHeight: 1.5,
                  }}
                >
                  {result.url}
                </p>
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />
                <p
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "#8f8f8f",
                    letterSpacing: "0.04em",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  AI-generated. Review before sending. You are the sender.
                </p>
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />
                <p
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "#8f8f8f",
                    letterSpacing: "0.04em",
                    marginBottom: 10,
                  }}
                >
                  drafts
                </p>
                {sortedVariants.map((v, i) => (
                  <a
                    key={v.variant}
                    href={`#draft-${i + 1}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "7px 0 7px 12px",
                      borderLeft: i === 0 ? "2px solid #3b82f6" : "2px solid transparent",
                      textDecoration: "none",
                      marginBottom: 2,
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        color: "#6e6e6e",
                        letterSpacing: "0.04em",
                        lineHeight: 1.4,
                      }}
                    >
                      {i + 1} · {v.name.toLowerCase()}
                    </span>
                    {i === 0 && <StrongestTag />}
                  </a>
                ))}
              </div>

              {/* Main column */}
              <div className="lg:pl-8" style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
                {result.limited_personalization && (
                  <div
                    style={{
                      borderRadius: 4,
                      border: "1px solid #3a3328",
                      background: "rgba(201,184,150,0.06)",
                      padding: "12px 16px",
                      marginBottom: 24,
                    }}
                  >
                    <p style={{ fontSize: 13, color: "#c9b896", lineHeight: 1.55 }}>
                      We could only read limited detail from that page, so these drafts are less personalized than usual. A company or lab site usually produces stronger drafts.
                    </p>
                  </div>
                )}

                {/* Email cards — sorted by score, strongest first */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {sortedVariants.map((v, i) => (
                    <EmailCard key={v.variant} variant={v} rank={i + 1} isStrongest={i === 0} />
                  ))}
                </div>

                <p
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "#6e6e6e",
                    letterSpacing: "0.04em",
                    textAlign: "center",
                    marginTop: 24,
                  }}
                >
                  Edit before sending. The AI gives you a strong start. Your voice makes it land.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
