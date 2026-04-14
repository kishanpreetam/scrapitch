"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Variant = {
  variant: string;
  name: string;
  subject_lines: string[];
  body: string;
  score: number;
  score_reasoning: string;
};

type FollowUp = {
  day: number;
  subject: string;
  body: string;
};

type GenerateResponse = {
  url: string;
  company_name: string;
  variants: Variant[];
  follow_up_sequence: FollowUp[];
};

// Badge inline styles per variant — A=purple, B=orange, C=blue
const BADGE_STYLE: Record<string, React.CSSProperties> = {
  A: { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.25)", background: "transparent" },
  B: { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#b45309", border: "1px solid rgba(180,83,9,0.25)", background: "transparent" },
  C: { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#0369a1", border: "1px solid rgba(3,105,161,0.25)", background: "transparent" },
};

const CARD_BORDER = {
  A: "border-blue-500/20 hover:border-blue-500/40",
  B: "border-emerald-500/20 hover:border-emerald-500/40",
  C: "border-purple-500/20 hover:border-purple-500/40",
} as Record<string, string>;

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function IconCopy({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const style: React.CSSProperties =
    score >= 8
      ? { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" }
      : score >= 5
        ? { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#a16207", background: "#fefce8", border: "1px solid #fde68a" }
        : { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca" };
  const label = score >= 8 ? "Elite" : score >= 5 ? "Strong" : "Needs work";
  return (
    <span style={style}>
      {score}/10 · {label}
    </span>
  );
}

function ScoreLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-white0">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        8–10 Elite
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
        5–7 Strong
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
        1–4 Needs work
      </span>
    </div>
  );
}

function EmailCard({ variant }: { variant: Variant }) {
  const [copied, setCopied] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);

  const handleCopy = () => {
    const text = `Subject: ${variant.subject_lines[0]}\n\n${variant.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`rounded-2xl border bg-[#141414] p-7 flex flex-col gap-4 ${CARD_BORDER[variant.variant] || "border-white/8"}`} style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span style={BADGE_STYLE[variant.variant] || { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#d4d4d4", border: "1px solid rgba(255,255,255,0.12)", background: "transparent" }}>
          Variant {variant.variant} · {variant.name}
        </span>
        <ScoreBadge score={variant.score} />
      </div>

      {/* Subject lines */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6b6b] mb-2">
          Subject lines (pick one)
        </p>
        <div className="space-y-1.5">
          {variant.subject_lines.map((sl, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6b6b6b] w-4 shrink-0">{i + 1}</span>
              <p className="font-semibold text-[#f0f0f0] leading-snug text-sm">{sl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6b6b] mb-1">
          Email body
        </p>
        <div className="rounded-lg bg-[#1c1c1c] border border-white/8 p-4">
          <p className="text-sm text-[#d4d4d4] leading-relaxed whitespace-pre-wrap">
            {variant.body}
          </p>
        </div>
      </div>

      {/* Score reasoning accordion */}
      <div>
        <button
          onClick={() => setReasonOpen(!reasonOpen)}
          className="flex items-center gap-2 text-xs font-medium text-white0 hover:text-[#d4d4d4] transition-colors"
        >
          <span className={`transition-transform inline-block ${reasonOpen ? "rotate-90" : ""}`}>▶</span>
          Score reasoning
        </button>
        {reasonOpen && (
          <p className="mt-2 text-xs text-[#a8a8a8] leading-relaxed border-l-2 border-white/15 pl-3">
            {variant.score_reasoning}
          </p>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-purple-500/30 bg-purple-500/5 text-[#d4d4d4] hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/50"
        }`}
      >
        {copied ? <IconCheck /> : <IconCopy />}
        {copied ? "Copied!" : "Copy email"}
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#141414] p-7 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-36 bg-white/8 rounded-full" />
        <div className="h-6 w-20 bg-white/8 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-28 bg-white/8 rounded mb-3" />
        <div className="h-4 w-full bg-white/6 rounded" />
        <div className="h-4 w-4/5 bg-white/6 rounded" />
        <div className="h-4 w-3/4 bg-white/6 rounded" />
      </div>
      <div>
        <div className="h-3 w-20 bg-white/8 rounded mb-2" />
        <div className="rounded-lg bg-[#1c1c1c] border border-white/8 p-4 space-y-2">
          <div className="h-3 w-full bg-white/6 rounded" />
          <div className="h-3 w-11/12 bg-white/6 rounded" />
          <div className="h-3 w-4/5 bg-white/6 rounded" />
          <div className="h-3 w-3/4 bg-white/6 rounded" />
          <div className="h-3 w-2/3 bg-white/6 rounded" />
        </div>
      </div>
      <div className="h-10 w-full bg-white/6 rounded-lg mt-auto" />
    </div>
  );
}

function FollowUpCard({ fu, index, total }: { fu: FollowUp; index: number; total: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Subject: ${fu.subject}\n\n${fu.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-white/8 bg-[#141414] p-5 flex gap-5" style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
      <div className="shrink-0 flex flex-col items-center gap-1">
        <span style={
          fu.day === 3
            ? { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#0369a1", border: "1px solid rgba(3,105,161,0.25)", background: "transparent" }
            : fu.day === 7
              ? { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#a16207", border: "1px solid rgba(161,98,7,0.25)", background: "transparent" }
              : { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }
        }>
          Day {fu.day}
        </span>
        {index < total - 1 && <div className="w-px flex-1 bg-white/8 mt-2" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white0 uppercase tracking-widest mb-1">Subject</p>
            <p className="font-semibold text-[#f0f0f0] text-sm leading-snug">{fu.subject}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              copied
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-purple-500/30 bg-purple-500/5 text-[#a8a8a8] hover:text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50"
            }`}
          >
            {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="rounded-lg bg-[#1c1c1c] border border-white/8 p-3">
          <p className="text-sm text-[#d4d4d4] leading-relaxed whitespace-pre-wrap">{fu.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signup");
    }
  }, [user, authLoading, router]);

  const [url, setUrl] = useState("");
  const [framework, setFramework] = useState("All 3 Variants");
  const [tone, setTone] = useState("Professional");
  const [industry, setIndustry] = useState("Auto-detect");

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [usedIndustry, setUsedIndustry] = useState("");
  const [wasAutoDetect, setWasAutoDetect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  const handleGenerate = async () => {
    if (!url.trim()) {
      setHasAttempted(true);
      setError("Please enter a URL first.");
      return;
    }
    setHasAttempted(true);
    setError(null);
    setResult(null);
    setLoading(true);
    setLoadingStage("Scraping website…");

    // Clear any leftover stage timers
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [
      setTimeout(() => setLoadingStage("Analyzing content…"), 4000),
      setTimeout(() => setLoadingStage("Writing emails…"), 9000),
    ];

    const normalised =
      url.startsWith("http://") || url.startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalised, framework, tone, industry }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(data.detail || `Error ${res.status}`);
      }

      const data: GenerateResponse = await res.json();
      setResult(data);
      setUsedIndustry(industry === "Auto-detect" ? "" : industry);
      setWasAutoDetect(industry === "Auto-detect");
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Cannot connect to the API. Make sure the FastAPI server is running:\n\nuvicorn main:app --reload"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      stageTimers.current.forEach(clearTimeout);
      setLoading(false);
      setLoadingStage("");
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {/* Header */}
        <section className="border-b border-white/6 py-16 sm:py-20 text-center bg-section-alt">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-4">
            Generate Cold Emails
          </h1>
          <p className="text-[#a8a8a8] text-xl max-w-xl mx-auto">
            Paste a prospect&apos;s URL and get 3 personalized emails with
            reply-rate scores in seconds.
          </p>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Input card */}
          <div className="rounded-2xl border border-white/8 bg-[#141414] p-8" style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#d4d4d4] mb-2">
                Prospect website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="https://yourprospect.com"
                className="w-full rounded-xl border border-white/12 bg-[#1c1c1c] px-4 py-3 text-[#f0f0f0] placeholder-[#6b6b6b] focus:border-[#a855f7]/50 focus:outline-none focus:ring-2 focus:ring-[#a855f7]/15 transition-all text-base"
              />
              <div className="mt-2.5 flex items-center gap-2">
                <span style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#a16207", border: "1px solid rgba(161,98,7,0.25)", background: "transparent" }}>
                  Coming soon
                </span>
                <span className="text-xs text-[#6b6b6b]">
                  LinkedIn &amp; Twitter context: for now, Scrapitch scrapes the company website for full personalization.
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-2">
                  Framework
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full h-11 rounded-lg border border-white/12 bg-[#1c1c1c] px-3 text-sm text-white focus:border-[#a855f7]/50 focus:outline-none focus:ring-1 focus:ring-[#a855f7]/15 transition-all"
                >
                  <option>All 3 Variants</option>
                  <option>The Direct (PAS)</option>
                  <option>Value-First</option>
                  <option>The Curious</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-2">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full h-11 rounded-lg border border-white/12 bg-[#1c1c1c] px-3 text-sm text-white focus:border-[#a855f7]/50 focus:outline-none focus:ring-1 focus:ring-[#a855f7]/15 transition-all"
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Bold</option>
                  <option>Friendly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-2">
                  Your Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-11 rounded-lg border border-white/12 bg-[#1c1c1c] px-3 text-sm text-white focus:border-[#a855f7]/50 focus:outline-none focus:ring-1 focus:ring-[#a855f7]/15 transition-all"
                >
                  <option>Auto-detect</option>
                  <option>B2B SaaS</option>
                  <option>Marketing &amp; Creative Agency</option>
                  <option>Sales &amp; Revenue Consulting</option>
                  <option>IT Services &amp; MSP</option>
                  <option>Recruiting &amp; Staffing</option>
                  <option>Legal Services</option>
                  <option>Financial Services &amp; Fintech</option>
                  <option>Real Estate</option>
                  <option>Healthcare &amp; MedTech</option>
                  <option>Manufacturing &amp; Industrial</option>
                  <option>Ecommerce &amp; DTC</option>
                  <option>Freelancer / Solo Consultant</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-[#7c3aed] to-[#a855f7] py-3.5 text-base font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{loadingStage || "Generating..."}</span>
                </span>
              ) : (
                "Generate Cold Emails"
              )}
            </button>
          </div>

          {/* Error state */}
          {hasAttempted && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <p className="text-sm font-semibold text-red-400 mb-1">Error</p>
              <p className="text-sm text-red-300 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-6">
              <div className="text-center py-2">
                <p className="text-[#d4d4d4] font-medium mb-3">
                  {loadingStage || "Scraping website and writing emails..."}
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full bg-purple-500/50 animate-pulse"
                      style={{
                        width: i === 2 ? "2rem" : "0.5rem",
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Results header */}
              <div>
                <h2 className="text-xl font-bold text-white">
                  3 emails for{" "}
                  <span className="text-purple-400">{result.company_name}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-sm text-white0">
                  <span>{extractDomain(result.url)}</span>
                  {(usedIndustry || wasAutoDetect) && (
                    <>
                      <span className="text-[#6b6b6b]">·</span>
                      <span className="text-[#a8a8a8] font-medium">
                        {usedIndustry || "Auto-detected industry"}
                      </span>
                      {wasAutoDetect && (
                        <>
                          <span className="text-[#6b6b6b]">·</span>
                          <span className="text-xs text-[#6b6b6b] italic">Auto-detected</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Inline score legend */}
              <ScoreLegend />

              <div className="grid md:grid-cols-3 gap-5">
                {result.variants.map((v) => (
                  <EmailCard key={v.variant} variant={v} />
                ))}
              </div>

              <p className="text-xs text-[#6b6b6b] text-center">
                Tip: Edit before sending. The AI gives you a strong start — your voice makes it land.
              </p>

              {/* Follow-up sequence */}
              {result.follow_up_sequence && result.follow_up_sequence.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-[#f0f0f0] mb-4">
                    Follow-up Sequence
                    <span className="ml-2 text-xs font-normal text-white0">Send these if no reply</span>
                  </h3>
                  <div className="space-y-3">
                    {result.follow_up_sequence.map((fu, i) => (
                      <FollowUpCard
                        key={i}
                        fu={fu}
                        index={i}
                        total={result.follow_up_sequence.length}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="rounded-2xl border border-dashed border-white/8 py-20 text-center bg-[#141414]">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#f5f5f0] font-semibold mb-2">
                Your emails will appear here
              </p>
              <p className="text-sm text-[#fffff0]/35">
                Paste any prospect URL above and hit Generate
              </p>
            </div>
          )}
        </div>

        {/* Bottom upgrade banner */}
        <div className="border-t border-white/6 py-8 bg-section-alt">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-white/8 bg-[#141414] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
              <div>
                <p className="text-sm font-semibold text-[#d4d4d4]">On the free tier?</p>
                <p className="text-xs text-[#6b6b6b] mt-0.5">You get 3 generations free. Upgrade for unlimited access.</p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#6d28d9] transition-colors whitespace-nowrap"
              >
                Upgrade for $9.99/mo →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
