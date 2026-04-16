"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://web-production-f17a7.up.railway.app";

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

const BADGE = {
  A: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  B: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  C: "bg-pink-500/20 text-purple-300 border border-purple-500/30",
} as Record<string, string>;

const CARD_BORDER = {
  A: "border-blue-500/20 hover:border-blue-500/40",
  B: "border-emerald-500/20 hover:border-emerald-500/40",
  C: "border-purple-500/20 hover:border-purple-500/40",
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
      className={`rounded-2xl border bg-zinc-900/60 p-7 flex flex-col gap-4 transition-colors ${CARD_BORDER[variant.variant] || "border-zinc-700"}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${BADGE[variant.variant] || "bg-zinc-700 text-zinc-300"}`}
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
          <span className={`transition-transform ${reasonOpen ? "rotate-90" : ""}`}>
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
        {copied ? "✓ Copied to clipboard" : "📋 Copy email"}
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
          <span className={`text-zinc-500 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
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

export default function GeneratorPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/signup");
    });
  }, [router]);

  const [url, setUrl] = useState("");
  const [framework, setFramework] = useState("All 3 Variants");
  const [tone, setTone] = useState("Professional");
  const [industry, setIndustry] = useState("Auto-detect");

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
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
    setLoadingStage("Analyzing website...");

    const normalised =
      url.startsWith("http://") || url.startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;

    const stageTimer = setTimeout(() => setLoadingStage("Generating emails…"), 4000);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalised,
          framework,
          tone,
          industry,
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

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        {/* Header */}
        <section className="border-b border-zinc-800/60 py-16 sm:py-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-50 mb-4">
            Generate Cold Emails
          </h1>
          <p className="text-zinc-400 text-xl max-w-xl mx-auto">
            Paste a prospect&apos;s URL and get 3 personalized emails with
            reply-rate scores in seconds.
          </p>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Input card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
            {/* URL input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Prospect website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="https://yourprospect.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all text-base"
              />
              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/6 px-2.5 py-1 text-[11px] font-semibold text-blue-400/80 uppercase tracking-wide">
                  Coming soon
                </span>
                <span className="text-xs text-zinc-600">
                  🔗 LinkedIn &amp; Twitter context. For now, Scrapitch scrapes the company website for full personalization.
                </span>
              </div>
            </div>

            {/* Dropdowns */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Framework
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
                >
                  <option>All 3 Variants</option>
                  <option>The Direct (PAS)</option>
                  <option>Value-First</option>
                  <option>The Curious</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Bold</option>
                  <option>Friendly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Your Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
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

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-xl bg-[#3b82f6] py-3.5 text-base font-bold text-white hover:bg-[#2563eb] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="animate-pulse">{loadingStage || "Generating..."}</span>
                </span>
              ) : (
                "⚡ Generate Cold Emails"
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

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-50">
                    Results for{" "}
                    <span className="text-blue-400">{result.company_name}</span>
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {result.url}
                  </p>
                </div>
                <div className="text-xs text-zinc-600 text-right hidden sm:block">
                  🟢 9–10 Elite &nbsp;·&nbsp; 🟡 7–8 Strong &nbsp;·&nbsp; 🟠 5–6 Average &nbsp;·&nbsp; 🔴 1–4 Needs work
                </div>
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
            <div className="rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
              <p className="text-5xl mb-4">📬</p>
              <p className="text-zinc-400 font-medium mb-2">
                Your emails will appear here
              </p>
              <p className="text-sm text-zinc-600">
                Paste any prospect URL above and hit Generate
              </p>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
