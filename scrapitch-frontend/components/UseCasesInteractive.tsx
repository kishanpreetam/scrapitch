"use client";

import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Accent = {
  border: string;
  bg: string;
  badge: string;
  check: string;
  snippetBorder: string;
};

type UseCase = {
  id: string;
  audience: string;
  headline: string;
  problem: string;
  solution: string;
  outcomes: string[];
  snippet: { subject: string; body: string };
  cta: string;
  accentColor: string;
};

/* ─── Use case card ──────────────────────────────────────────────────────── */

export function UseCaseCard({ uc, accent, isEven }: { uc: UseCase; accent: Accent; isEven: boolean }) {
  return (
    <div
      className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-start rounded-2xl border ${accent.border} ${accent.bg} p-8 sm:p-10 lg:p-12`}
      style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Content column — alternates left/right on desktop */}
      <div className={isEven ? "lg:order-1" : "lg:order-2"}>
        <span className="inline-block mb-5" style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }}>
          {uc.audience}
        </span>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-6">
          {uc.headline}
        </h2>

        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#dc2626] mb-2">The problem</p>
          <p className="text-[#a8a8a8] leading-relaxed">{uc.problem}</p>
        </div>

        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-[#16a34a] mb-2">How Scrapitch helps</p>
          <p className="text-[#d4d4d4] leading-relaxed">{uc.solution}</p>
        </div>

        <ul className="space-y-3 mb-8">
          {uc.outcomes.map((outcome) => (
            <li key={outcome} className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 text-base font-black ${accent.check}`}>✓</span>
              <span className="text-sm text-[#d4d4d4] leading-relaxed">{outcome}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-6 py-3 text-sm font-bold text-white hover:bg-[#6d28d9] transition-colors"
        >
          {uc.cta}
        </Link>
      </div>

      {/* Email snippet column */}
      <div className={isEven ? "lg:order-2" : "lg:order-1"}>
        <div className="sticky top-28">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b] mb-4">Example output</p>

          <div className={`rounded-xl border ${accent.snippetBorder} bg-[#1c1c1c] overflow-hidden`}>
            {/* Email chrome bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8 bg-[#0a0a0a]/60">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
              <span className="ml-3 text-xs text-[#6b6b6b] font-mono">cold-email.txt</span>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1">Subject</p>
                <p className="text-sm font-semibold text-[#f0f0f0]">{uc.snippet.subject}</p>
              </div>

              <div className="border-t border-white/8 mb-4" />

              <div>
                <p className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-2">Body</p>
                <p className="text-sm text-[#d4d4d4] leading-relaxed">{uc.snippet.body}</p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6b6b6b]">Reply-rate score</span>
                  <span style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    8/10
                  </span>
                </div>
                <span className="text-xs text-[#6b6b6b] font-mono">AI-generated</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#6b6b6b]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Generated in under 10 seconds from a URL
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sending tool grid ──────────────────────────────────────────────────── */

const sendingTools = [
  { name: "Instantly", icon: "⚡" },
  { name: "Lemlist", icon: "🍋" },
  { name: "Apollo", icon: "🚀" },
  { name: "Clay", icon: "🏺" },
  { name: "Smartlead", icon: "📡" },
  { name: "HubSpot", icon: "🔶" },
  { name: "Outreach", icon: "📬" },
  { name: "Any tool", icon: "✓" },
];

export function SendingToolGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {sendingTools.map((tool) => (
        <div
          key={tool.name}
          className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-[#141414] p-6"
          style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
        >
          <span className="text-2xl">{tool.icon}</span>
          <span className="text-sm font-semibold text-[#d4d4d4]">{tool.name}</span>
        </div>
      ))}
    </div>
  );
}
