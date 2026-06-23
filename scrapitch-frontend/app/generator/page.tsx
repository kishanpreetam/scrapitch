"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://web-production-f17a7.up.railway.app";

type UseCase =
  | "b2b_sales"
  | "masters_outreach"
  | "job_hunt"
  | "executive_outreach"
  | "networking";

type TonePreference = "auto" | "formal" | "warm" | "direct";

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

const BADGE = {
  A: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  B: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  C: "bg-pink-500/20 text-pink-300 border border-pink-500/30",
} as Record<string, string>;

const CARD_BORDER = {
  A: "border-blue-500/20 hover:border-blue-500/40",
  B: "border-emerald-500/20 hover:border-emerald-500/40",
  C: "border-pink-500/20 hover:border-pink-500/40",
} as Record<string, string>;

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 9
      ? "bg-emerald-500/20 text-emerald-400"
      : score >= 7
        ? "bg-yellow-500/20 text-yellow-400"
        : score >= 5
          ? "bg-orange-500/20 text-orange-400"
          : "bg-red-500/20 text-red-400";
  const label = score >= 9 ? "Elite" : score >= 7 ? "Strong" : score >= 5 ? "Average" : "Needs work";
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>
      {score}/10 · {label}
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
      className={`rounded-2xl border bg-zinc-900/60 p-5 md:p-7 flex flex-col gap-4 transition-colors ${CARD_BORDER[variant.variant] || "border-zinc-700"}`}
    >
      {/* Header row: stacks on mobile so score sits below label */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between md:flex-wrap gap-2">
        <span
          className={`self-start text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${BADGE[variant.variant] || "bg-zinc-700 text-zinc-300"}`}
        >
          Variant {variant.variant}: {variant.name}
        </span>
        <ScoreBadge score={variant.score} />
      </div>

      {/* Subject lines */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-2">
          Subject line options
        </p>
        <ol className="space-y-1.5">
          {variant.subject_lines.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-xs font-bold text-zinc-600 mt-0.5 shrink-0">{i + 1}.</span>
              <span className="font-semibold text-zinc-100 leading-snug text-base md:text-sm">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Body */}
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-1">
          Email body
        </p>
        <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-4">
          <p className="text-[15px] md:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {variant.body}
          </p>
        </div>
      </div>

      {/* Score reasoning accordion */}
      <div>
        <button
          onClick={() => setReasonOpen(!reasonOpen)}
          className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span className={`inline-flex transition-transform ${reasonOpen ? "rotate-90" : ""}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
          Score reasoning
        </button>
        {reasonOpen && (
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed border-l-2 border-zinc-700 pl-3">
            {variant.score_reasoning}
          </p>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`w-full rounded-lg border py-3 md:py-2.5 text-base md:text-sm font-semibold transition-all ${
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-[#c9b896] text-zinc-300 hover:text-[#f5f5f0] hover:border-[#f5f5f0]"
        }`}
      >
        {copied ? "Copied to clipboard" : "Copy email"}
      </button>
    </div>
  );
}

function FollowUpSection({ sequence }: { sequence: FollowUp[] }) {
  const [open, setOpen] = useState(false);

  if (!sequence || sequence.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex text-zinc-500 transition-transform ${open ? "rotate-90" : ""}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Follow-up sequence</p>
            <p className="text-xs text-zinc-600 mt-0.5">{sequence.length} follow-up emails ready to send</p>
          </div>
        </div>
        <span className="text-xs font-medium text-zinc-500 shrink-0 ml-4">
          {open ? "Collapse" : "Expand"}
        </span>
      </button>

      {open && (
        <div className="mt-5 space-y-4">
          {sequence.map((fu, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                  Follow-up {i + 1} · Day {fu.day}
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-400 mb-2">
                Subject: <span className="text-zinc-200">{fu.subject}</span>
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {fu.body}
              </p>
            </div>
          ))}
        </div>
      )}
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
  const [tonePreference, setTonePreference] = useState<TonePreference>("auto");

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setResult(null);
    setLoading(true);
    setLoadingStage("Analyzing website...");

    const normalised =
      trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
        ? trimmedUrl
        : `https://${trimmedUrl}`;

    const stageTimer = setTimeout(() => setLoadingStage("Generating emails..."), 4000);

    try {
      const body: Record<string, unknown> = {
        url: normalised,
        use_case: useCase,
        about_user: aboutUser,
        user_ask: userAsk,
        // Highlights is hidden for networking, so never send stale text for it.
        highlights: highlightsField ? highlights : "",
        tone_preference: tonePreference,
      };

      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(data.detail || `Error ${res.status}`);
      }

      const data: GenerateResponse = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Failed to connect. Please try again.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      clearTimeout(stageTimer);
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
                  The website of the company, lab, person, or program you&apos;re reaching out to.
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

              {/* Tone */}
              <div>
                <p className="font-mono" style={labelStyle}>
                  tone
                </p>
                <select
                  value={tonePreference}
                  onChange={(e) => setTonePreference(e.target.value as TonePreference)}
                  className="w-full bg-[#0a0a0a] border border-[#2c241c] rounded-[4px] px-4 py-3.5 text-base text-[#f5f5f0] focus:border-[#c9b896] focus:outline-none transition-colors"
                >
                  <option value="auto">Auto · match the outreach type</option>
                  <option value="formal">Formal · polished, no contractions</option>
                  <option value="warm">Warm · friendly, peer-to-peer</option>
                  <option value="direct">Direct · short sentences, no fluff</option>
                </select>
                <p style={helperStyle}>Override the default tone for your selected outreach type.</p>
              </div>
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

          {/* Results */}
          {result && (
            <div className="space-y-6" style={{ marginTop: 48 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-50">
                    Results for{" "}
                    <span className="text-blue-400">{result.company_name}</span>
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">{result.url}</p>
                </div>
                <div className="text-xs text-zinc-600 text-right hidden sm:block">
                  9-10 Elite &nbsp;·&nbsp; 7-8 Strong &nbsp;·&nbsp; 5-6 Average &nbsp;·&nbsp; 1-4 Needs work
                </div>
              </div>

              {/* Persistent point-of-use compliance notice */}
              <div style={{ borderTop: "1px solid #2c241c", paddingTop: 14 }}>
                <p
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "#6e6657",
                    letterSpacing: "0.04em",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  AI-generated. Review and edit before sending. You are the sender and responsible for compliance.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {result.variants.map((v) => (
                  <EmailCard key={v.variant} variant={v} />
                ))}
              </div>

              <FollowUpSection sequence={result.follow_up_sequence} />

              <p className="text-xs text-zinc-600 text-center">
                Tip: Edit before sending. The AI gives you a strong start. Your voice makes it land.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
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
      </main>
      <Footer />
    </>
  );
}
