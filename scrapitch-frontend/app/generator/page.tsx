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

type FollowUp = {
  day: number;
  subject: string;
  body: string;
};

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
  follow_up_sequence: FollowUp[];
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
    label: "what you deliver",
    placeholder: "The result you deliver, e.g. 'cut onboarding time 40%'. Not your title.",
  },
  masters_outreach: {
    label: "your relevant background",
    placeholder:
      "Your degree plus the specific skills or one project that line up with this lab. e.g. 'MS in computer vision, built a 3D reconstruction pipeline.'",
  },
  job_hunt: {
    label: "your relevant experience",
    placeholder:
      "Your relevant experience for this role or team. One recognizable employer or one metric helps.",
  },
  executive_outreach: {
    label: "your credibility",
    placeholder: "One named customer, one metric, or a shared connection. One is enough.",
  },
  networking: {
    label: "about you",
    placeholder:
      "One line on who you are, plus why this person specifically: a shared school, a talk you saw, something they made.",
  },
};

const ASK_PLACEHOLDER: Record<UseCase, string> = {
  b2b_sales: "A specific low-friction ask. e.g. 'Worth a quick call next week?'",
  masters_outreach:
    "Be specific and small: a 15-minute call, or whether they are taking students for Fall 2026.",
  job_hunt: "Ask for a short conversation, not a job. e.g. 'Open to a 15-minute call about the X role?'",
  executive_outreach: "Offer value, not a meeting. e.g. 'Open to a benchmark of how peers handled X?'",
  networking:
    "Keep it small and advice-shaped. e.g. '15 minutes to hear how you moved into X?' Not a job ask.",
};

// Networking is intentionally absent: achievements read as bragging in a
// networking ask, so the highlights field is hidden for it.
const HIGHLIGHTS: Partial<Record<UseCase, { label: string; placeholder: string }>> = {
  b2b_sales: { label: "proof", placeholder: "Numbers, named customers, recent wins." },
  executive_outreach: { label: "proof", placeholder: "Numbers, named customers, recent wins." },
  job_hunt: { label: "proof", placeholder: "Numbers, named customers, recent wins." },
  masters_outreach: {
    label: "relevant result (optional)",
    placeholder: "One result or project that aligns with their work.",
  },
};

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 11,
        background: "rgba(59,130,246,0.12)",
        color: "#60a5fa",
        padding: "3px 10px",
        borderRadius: 99,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {score}/10
    </span>
  );
}

function EmailCard({ variant }: { variant: Variant }) {
  const [copied, setCopied] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);

  const handleCopy = () => {
    const subject = variant.subject_lines[0] ?? "";
    const text = `Subject: ${subject}\n\n${variant.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
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
          <span style={{ color: "#c9b896" }}>variant {variant.variant.toLowerCase()}</span>
          <span style={{ color: "#6e6e6e" }}> · {variant.name.toLowerCase()}</span>
        </span>
        <ScoreBadge score={variant.score} />
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
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {variant.subject_lines.map((s, i) => (
            <li key={i} style={{ display: "flex", gap: 8 }}>
              <span
                className="font-mono"
                style={{ fontSize: 11, color: "#6e6e6e", marginTop: 3, flexShrink: 0 }}
              >
                {i + 1}.
              </span>
              <span style={{ fontSize: 15, fontWeight: 500, color: "#f5f5f0", lineHeight: 1.4 }}>
                {s}
              </span>
            </li>
          ))}
        </ol>
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

      {/* Score reasoning accordion */}
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
          score reasoning
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

      {/* Copy button */}
      <button
        onClick={handleCopy}
        style={{
          width: "100%",
          background: "transparent",
          border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(59,130,246,0.4)"}`,
          borderRadius: 8,
          padding: "10px 16px",
          color: copied ? "#4ade80" : "#60a5fa",
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
        {copied ? (
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
            copy email
          </>
        )}
      </button>
    </div>
  );
}

function FollowUpSection({ sequence }: { sequence: FollowUp[] }) {
  if (!sequence || sequence.length === 0) return null;

  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p
        className="font-mono"
        style={{ fontSize: 11, color: "#6e6e6e", letterSpacing: "0.04em", marginBottom: 20 }}
      >
        follow up sequence
      </p>
      <div>
        {sequence.map((fu, i) => (
          <div key={i}>
            {i > 0 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
            )}
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ flexShrink: 0, width: 52 }}>
                <span
                  className="font-mono"
                  style={{ fontSize: 11, color: "#60a5fa", letterSpacing: "0.04em" }}
                >
                  day {fu.day}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#c9c9c4", marginBottom: 6 }}>
                  {fu.subject}
                </p>
                <p style={{ fontSize: 14, color: "#8a8a85", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {fu.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
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
  const [useCase, setUseCase] = useState<UseCase>("b2b_sales");
  const [aboutUser, setAboutUser] = useState("");
  const [userAsk, setUserAsk] = useState("");
  const [highlights, setHighlights] = useState("");
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

  const handleResumeFile = async (file: File) => {
    setResumeError(null);
    setResumeParsing(true);
    setResumeFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/parse-resume`, { method: "POST", body: formData });
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
    if (!trimmedUrl) {
      setError("Please enter a URL.");
      return;
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
    setLoadingStage("Analyzing website...");

    const normalised =
      trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    const stageTimer = setTimeout(() => setLoadingStage("Generating emails..."), 4000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    const endpoint = `${API_BASE}/generate`;

    try {
      const body: Record<string, unknown> = {
        url: normalised,
        use_case: useCase,
        about_user: aboutUser,
        user_ask: userAsk,
        highlights: highlightsField ? highlights : "",
      };

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
                  prospect url
                </p>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className={fieldClass}
                />
                <p style={helperStyle}>
                  Their company, lab, or personal site. Social profiles often can&apos;t be read.
                </p>
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
                  Your side only. We read the recipient&apos;s details from the page you submitted.
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

        {/* Results — own container, lifted outside the form wrapper */}
        {result && (
          <div className="mx-auto px-6" style={{ maxWidth: 720, paddingBottom: 80 }}>
            {/* Hairline divider separating form from results */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 32 }} />

            {/* Section heading */}
            <div style={{ marginBottom: 24 }}>
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
                style={{ fontSize: 11, color: "#6e6e6e", letterSpacing: "0.04em" }}
              >
                {result.url}
              </p>
            </div>

            {/* Compliance notice */}
            <p
              className="font-mono"
              style={{
                fontSize: 11,
                color: "#6e6657",
                letterSpacing: "0.04em",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              AI-generated. Review and edit before sending. You are the sender and responsible for compliance.
            </p>

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

            {/* Single-column email cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {result.variants.map((v) => (
                <EmailCard key={v.variant} variant={v} />
              ))}
            </div>

            {/* Follow-up timeline */}
            {result.follow_up_sequence && result.follow_up_sequence.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <FollowUpSection sequence={result.follow_up_sequence} />
              </div>
            )}

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
        )}
      </main>
      <Footer />
    </>
  );
}
