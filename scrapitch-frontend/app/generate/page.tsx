"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://web-production-f17a7.up.railway.app";

// ── Types ─────────────────────────────────────────────────────────

type UseCase = "b2b_sales" | "masters_outreach" | "job_hunt" | "executive_outreach" | "networking";
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

// ── Card styles ──────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 9
      ? "bg-emerald-500/20 text-emerald-400"
      : score >= 7
        ? "bg-yellow-500/20 text-yellow-400"
        : score >= 5
          ? "bg-orange-500/20 text-orange-400"
          : "bg-red-500/20 text-red-400";
  const label =
    score >= 9 ? "Elite" : score >= 7 ? "Strong" : score >= 5 ? "Average" : "Needs work";
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
      className={`rounded-2xl border bg-zinc-900/60 p-7 flex flex-col gap-4 transition-colors ${
        CARD_BORDER[variant.variant] || "border-zinc-700"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
            BADGE[variant.variant] || "bg-zinc-700 text-zinc-300"
          }`}
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
              <span className="font-semibold text-zinc-100 leading-snug text-sm">{s}</span>
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
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
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
          <span
            className={`transition-transform inline-block ${reasonOpen ? "rotate-90" : ""}`}
          >
            ▶
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
        className={`w-full rounded-lg border py-2.5 text-sm font-semibold transition-all ${
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-zinc-700 text-zinc-300 hover:border-blue-400/50 hover:text-blue-300"
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
          <span
            className={`text-zinc-500 transition-transform inline-block ${open ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Follow-up sequence</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              {sequence.length} follow-up emails ready to send
            </p>
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

// ── Helpers ───────────────────────────────────────────────────────

const VALID_USE_CASES: UseCase[] = [
  "b2b_sales",
  "masters_outreach",
  "job_hunt",
  "executive_outreach",
  "networking",
];

function isValidUseCase(v: string): v is UseCase {
  return (VALID_USE_CASES as string[]).includes(v);
}

function isValidUrl(v: string): boolean {
  return v.startsWith("http://") || v.startsWith("https://");
}

// ── Auto-growing textarea hook ────────────────────────────────────

function useAutoGrow(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);
  return ref;
}

// ── Form (needs useSearchParams so must be isolated) ──────────────

function GenerateForm() {
  const searchParams = useSearchParams();

  // Field state
  const rawGoal = searchParams.get("goal") ?? "";
  const [url, setUrl] = useState("");
  const [useCase, setUseCase] = useState<UseCase | "">(
    isValidUseCase(rawGoal) ? rawGoal : ""
  );
  const [aboutUser, setAboutUser] = useState("");
  const [userAsk, setUserAsk] = useState("");
  const [highlights, setHighlights] = useState("");
  const [tone, setTone] = useState<TonePreference>("auto");

  // Validation state
  const [urlTouched, setUrlTouched] = useState(false);
  const [aboutTouched, setAboutTouched] = useState(false);
  const [askTouched, setAskTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Request state
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-grow refs
  const aboutRef = useAutoGrow(aboutUser);
  const askRef = useAutoGrow(userAsk);
  const highlightsRef = useAutoGrow(highlights);

  // Derived validation
  const urlError = !isValidUrl(url.trim())
    ? "Please enter a valid URL starting with http:// or https://"
    : null;
  const useCaseError = !useCase ? "Please select a goal." : null;
  const aboutError =
    aboutUser.trim().length < 50 ? "Please write at least 50 characters about yourself." : null;
  const askError =
    userAsk.trim().length < 10 ? "Please describe what you are asking for." : null;

  const formValid = !urlError && !useCaseError && !aboutError && !askError;

  const showUrlError = (urlTouched || submitted) && !!urlError;
  const showAboutError = (aboutTouched || submitted) && !!aboutError;
  const showAskError = (askTouched || submitted) && !!askError;
  const showUseCaseError = submitted && !!useCaseError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!formValid) return;

    setError(null);
    setResult(null);
    setLoading(true);
    setLoadingStage("Analyzing website...");

    const stageTimer = setTimeout(() => setLoadingStage("Generating emails..."), 4000);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          use_case: useCase,
          about_user: aboutUser.trim(),
          user_ask: userAsk.trim(),
          highlights: highlights.trim(),
          tone_preference: tone,
        }),
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

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 transition-all text-base";
  const inputNormal =
    "border-[#d1d5db] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20";
  const inputError =
    "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20";
  const selectBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-[#111827] focus:outline-none focus:ring-2 transition-all text-base appearance-none";
  const textareaBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 transition-all text-base resize-none overflow-hidden";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      {/* Inline error box above form */}
      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/40 bg-[#fef2f2] p-4">
          <p className="text-sm font-semibold text-[#ef4444] mb-0.5">Something went wrong</p>
          <p className="text-sm text-[#ef4444]/80">{error}</p>
        </div>
      )}

      <form id="generate-form" onSubmit={handleSubmit} noValidate>
        <div className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm px-6 py-8 sm:px-10 sm:py-10 space-y-7">

          {/* FIELD 1 — URL */}
          <div>
            <label
              htmlFor="target-url"
              className="block text-sm font-medium text-[#111827] mb-2"
            >
              Target URL <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="target-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setUrlTouched(true)}
              placeholder="Their website, lab page, About page, or company URL"
              className={`${inputBase} ${showUrlError ? inputError : inputNormal}`}
            />
            {showUrlError && (
              <p className="mt-1.5 text-sm text-[#ef4444]">{urlError}</p>
            )}
            <p className="mt-1.5 text-sm text-[#6b7280]">
              Works best with company websites, lab pages, personal sites, and About pages.
            </p>
          </div>

          {/* FIELD 2 — Goal */}
          <div>
            <label
              htmlFor="use-case"
              className="block text-sm font-medium text-[#111827] mb-2"
            >
              What is your goal? <span className="text-[#ef4444]">*</span>
            </label>
            <div className="relative">
              <select
                id="use-case"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value as UseCase | "")}
                className={`${selectBase} ${
                  showUseCaseError
                    ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20"
                    : "border-[#d1d5db] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20"
                }`}
              >
                <option value="" disabled>
                  Select a goal...
                </option>
                <option value="b2b_sales">Sell a product or service (B2B sales)</option>
                <option value="masters_outreach">Apply to a masters or PhD program</option>
                <option value="job_hunt">Reach out for a job or interview</option>
                <option value="executive_outreach">Pitch an executive or CEO</option>
                <option value="networking">Ask for advice or a coffee chat</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
            {showUseCaseError && (
              <p className="mt-1.5 text-sm text-[#ef4444]">Please select a goal.</p>
            )}
          </div>

          {/* FIELD 3 — About you */}
          <div>
            <label
              htmlFor="about-user"
              className="block text-sm font-medium text-[#111827] mb-2"
            >
              About you <span className="text-[#ef4444]">*</span>
            </label>
            <textarea
              id="about-user"
              ref={aboutRef}
              value={aboutUser}
              onChange={(e) => setAboutUser(e.target.value)}
              onBlur={() => setAboutTouched(true)}
              placeholder="Quick paragraph about you. Name, role, what you do, anything that gives you credibility for this email. Be specific."
              rows={4}
              maxLength={1000}
              style={{ minHeight: "80px" }}
              className={`${textareaBase} ${
                showAboutError
                  ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20"
                  : "border-[#d1d5db] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20"
              }`}
            />
            <div className="mt-1.5 flex items-start justify-between gap-2">
              <span className="text-sm text-[#6b7280]">
                {showAboutError && <span className="text-[#ef4444]">{aboutError}</span>}
              </span>
              <span className="text-sm text-[#6b7280] shrink-0">
                {aboutUser.length} / 1000
              </span>
            </div>
          </div>

          {/* FIELD 4 — What do you want? */}
          <div>
            <label
              htmlFor="user-ask"
              className="block text-sm font-medium text-[#111827] mb-2"
            >
              What do you want from them? <span className="text-[#ef4444]">*</span>
            </label>
            <textarea
              id="user-ask"
              ref={askRef}
              value={userAsk}
              onChange={(e) => setUserAsk(e.target.value)}
              onBlur={() => setAskTouched(true)}
              placeholder="Be specific. e.g. 'A 15 minute Zoom to learn about your lab' or 'A referral to your hiring team'"
              rows={2}
              maxLength={300}
              style={{ minHeight: "80px" }}
              className={`${textareaBase} ${
                showAskError
                  ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/20"
                  : "border-[#d1d5db] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20"
              }`}
            />
            <div className="mt-1.5 flex items-start justify-between gap-2">
              <span className="text-sm text-[#6b7280]">
                {showAskError && <span className="text-[#ef4444]">{askError}</span>}
              </span>
              <span className="text-sm text-[#6b7280] shrink-0">
                {userAsk.length} / 300
              </span>
            </div>
          </div>

          {/* FIELD 5 — Highlights (optional) */}
          <div>
            <label
              htmlFor="highlights"
              className="block text-sm font-medium text-[#111827] mb-2"
            >
              Anything to highlight?{" "}
              <span className="font-normal text-[#6b7280]">(optional)</span>
            </label>
            <textarea
              id="highlights"
              ref={highlightsRef}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Optional. e.g. 'Mention my GitHub repo' or 'Reference their 2024 paper on graph attention'"
              rows={2}
              maxLength={500}
              style={{ minHeight: "80px" }}
              className={`${textareaBase} border-[#d1d5db] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20`}
            />
            <div className="mt-1.5 flex items-start justify-between gap-2">
              <p className="text-sm text-[#6b7280]">
                Optional but useful, anything you want the email to mention specifically.
              </p>
              <span className="text-sm text-[#6b7280] shrink-0">
                {highlights.length} / 500
              </span>
            </div>
          </div>

          {/* FIELD 6 — Tone (optional) */}
          <div>
            <label
              htmlFor="tone"
              className="block text-sm font-medium text-[#111827] mb-2"
            >
              Tone{" "}
              <span className="font-normal text-[#6b7280]">(optional)</span>
            </label>
            <div className="relative">
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as TonePreference)}
                className={`${selectBase} border-[#d1d5db] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20`}
              >
                <option value="auto">Auto (recommended)</option>
                <option value="formal">Formal and professional</option>
                <option value="warm">Warm and conversational</option>
                <option value="direct">Direct and concise</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Submit button — inline on desktop */}
          <div className="hidden sm:block">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-3.5 text-base font-semibold text-white transition-colors ${
                loading || !formValid
                  ? "bg-[#93c5fd] cursor-not-allowed"
                  : "bg-[#3b82f6] hover:bg-[#2563eb]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{loadingStage || "Generating..."}</span>
                </span>
              ) : (
                "Generate emails"
              )}
            </button>
          </div>

        </div>
      </form>

      {/* Mobile sticky button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e5e7eb] px-4 py-3">
        <button
          form="generate-form"
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full rounded-xl py-3.5 text-base font-semibold text-white transition-colors ${
            loading || !formValid
              ? "bg-[#93c5fd] cursor-not-allowed"
              : "bg-[#3b82f6] hover:bg-[#2563eb]"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>{loadingStage || "Generating..."}</span>
            </span>
          ) : (
            "Generate emails"
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-10 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-zinc-50">
                Results for{" "}
                <span className="text-[#3b82f6]">{result.company_name}</span>
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">{result.url}</p>
            </div>
            <div className="text-xs text-zinc-600 text-right hidden sm:block">
              9-10 Elite · 7-8 Strong · 5-6 Average · 1-4 Needs work
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {result.variants.map((v) => (
              <EmailCard key={v.variant} variant={v} />
            ))}
          </div>

          <FollowUpSection sequence={result.follow_up_sequence} />

          <p className="text-xs text-zinc-600 text-center">
            Tip: Edit before sending. The AI gives you a strong start, but your voice makes it land.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="mt-8 rounded-2xl border border-dashed border-[#e5e7eb] py-16 text-center">
          <p className="text-[#6b7280] font-medium mb-1">Your emails will appear here</p>
          <p className="text-sm text-[#9ca3af]">
            Fill in the form above and click Generate emails
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page shell (wraps form in Suspense for useSearchParams) ───────

export default function GeneratePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen pb-24 sm:pb-0" style={{ background: "#faf8f5" }}>
        {/* Header */}
        <section
          className="border-b border-[#e5e7eb] py-14 sm:py-20 text-center"
          style={{ background: "#faf8f5" }}
        >
          <div className="mx-auto max-w-2xl px-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111827] mb-4">
              Generate your email
            </h1>
            <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
              Tell us who you are emailing, why, and what you want. We read their site and write 3 emails that sound like you actually did your homework.
            </p>
          </div>
        </section>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <span className="h-6 w-6 rounded-full border-2 border-[#3b82f6]/30 border-t-[#3b82f6] animate-spin" />
            </div>
          }
        >
          <GenerateForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
