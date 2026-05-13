"use client";

import { useState, useEffect } from "react";
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
          <span className={`text-zinc-500 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Follow up sequence</p>
            <p className="text-xs text-zinc-600 mt-0.5">{sequence.length} follow up emails ready to send</p>
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
                  Follow up {i + 1} · Day {fu.day}
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
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalised,
          use_case: useCase,
          about_user: aboutUser,
          user_ask: userAsk,
          highlights: highlights,
          tone_preference: tonePreference,
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
            Paste a prospect&apos;s URL. Three AI agents will research their site, write 3 personalized variants, and score each one.
          </p>
          <p className="text-zinc-600 text-sm mt-3">
            Agent 1: Research Analyst &nbsp;&middot;&nbsp; Agent 2: Email Writer &nbsp;&middot;&nbsp; Agent 3: Scoring Judge
          </p>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Input card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
            <div className="space-y-6">
              {/* Field 1: Prospect URL */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Prospect URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all text-base"
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  The website of the company, lab, person, or program you&apos;re reaching out to
                </p>
              </div>

              {/* Field 2: Outreach type */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Outreach type
                </label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value as UseCase)}
                  className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
                >
                  <option value="b2b_sales">B2B Sales - pitch a product or service</option>
                  <option value="masters_outreach">Master&apos;s / PhD outreach - reach out to a lab or program</option>
                  <option value="job_hunt">Job hunt - reach out about a role</option>
                  <option value="executive_outreach">Executive outreach - peer-to-peer to a C-suite contact</option>
                  <option value="networking">Networking - start a real connection</option>
                </select>
                <p className="mt-1.5 text-xs text-zinc-500">
                  We tailor the email style, length, and tone to the type of outreach
                </p>
              </div>

              {/* Field 3: About you */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  About you
                </label>
                <textarea
                  value={aboutUser}
                  onChange={(e) => setAboutUser(e.target.value)}
                  placeholder="Founder of a B2B SaaS that helps logistics teams reduce delivery delays. Previously led ops at Coupang."
                  rows={3}
                  maxLength={2000}
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all text-base resize-y"
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  One or two sentences. Who you are, what you do, what&apos;s relevant to this outreach.
                </p>
              </div>

              {/* Field 4: Your ask */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  What are you asking for?
                </label>
                <textarea
                  value={userAsk}
                  onChange={(e) => setUserAsk(e.target.value)}
                  placeholder="A 15-minute call next week to share how we cut delivery SLA breaches by 40 percent for similar mid-market shippers."
                  rows={2}
                  maxLength={1000}
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all text-base resize-y"
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  Be specific. The clearer the ask, the better the email.
                </p>
              </div>

              {/* Field 5: Highlights (optional) */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Highlights (optional)
                </label>
                <textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Recent 12 million Series A. Customers include FastShip and DeliverNow. Built by ex-Coupang ops team."
                  rows={2}
                  maxLength={2000}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all text-base resize-y"
                />
                <p className="mt-1.5 text-xs text-zinc-500">
                  Numbers, customer names, recent wins. The model weaves these in naturally.
                </p>
              </div>

              {/* Field 6: Tone */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Tone
                </label>
                <select
                  value={tonePreference}
                  onChange={(e) => setTonePreference(e.target.value as TonePreference)}
                  className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
                >
                  <option value="auto">Auto - match the outreach type</option>
                  <option value="formal">Formal - polished, no contractions</option>
                  <option value="warm">Warm - friendly, peer-to-peer</option>
                  <option value="direct">Direct - short sentences, no fluff</option>
                </select>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Override the default tone for this outreach type
                </p>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-[#3b82f6] py-3.5 text-base font-bold text-white hover:bg-[#2563eb] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="animate-pulse">{loadingStage || "Generating..."}</span>
                </span>
              ) : (
                "Generate emails"
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
                  9-10 Elite &nbsp;·&nbsp; 7-8 Strong &nbsp;·&nbsp; 5-6 Average &nbsp;·&nbsp; 1-4 Needs work
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
              <p className="text-5xl mb-4"></p>
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
