import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeLiveDemo from "@/components/HomeLiveDemo";
import HomeComparison from "@/components/HomeComparison";
import HomeHowItWorks from "@/components/HomeHowItWorks";
import HomeTabbedShowcase from "@/components/HomeTabbedShowcase";
import HomeFaqSection from "@/components/HomeFaqSection";

// ── Data ──────────────────────────────────────────────────────────

const comparisonRows = [
  { feature: "Live website scraping", scrapitch: true, generic: false },
  { feature: "No LinkedIn / CSV required", scrapitch: true, generic: false },
  { feature: "Industry auto-detection", scrapitch: true, generic: false },
  { feature: "Tone matching from site", scrapitch: true, generic: false },
  { feature: "3 structured email frameworks", scrapitch: true, generic: null },
  { feature: "3 subject lines per email", scrapitch: true, generic: false },
  { feature: "Full follow-up sequence (Day 3/7/14)", scrapitch: true, generic: false },
  { feature: "Reply rate scoring with reasoning", scrapitch: true, generic: null },
  { feature: "One CTA enforced", scrapitch: true, generic: false },
  { feature: "Research takes < 10 seconds", scrapitch: true, generic: false },
];

const whoCards = [
  {
    role: "SDR at a B2B SaaS company",
    desc: "Spending 20 min researching every prospect and still writing semi-generic copy? Paste the URL. Get 3 emails and follow-ups in 10 seconds.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    role: "Agency owner doing outbound",
    desc: "Generic merge-tag templates get ignored. Scrapitch reads the prospect's site and writes emails that reference their actual business.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    role: "Freelance consultant",
    desc: "No time to write personalized emails for every lead. URL in, personalized email out. Spend time closing, not writing.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role: "Founder doing their own outreach",
    desc: "Don't know which framework to use or whether the email is any good? Scrapitch handles the research, the writing, and the scoring.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14 overflow-x-hidden">

        {/* ── 1. HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "#0a0a0a" }}>
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
              animation: "hero-ambient 8s ease-in-out infinite",
              background:
                "radial-gradient(ellipse 65% 55% at 50% -5%, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0.08) 45%, transparent 68%), " +
                "radial-gradient(ellipse 45% 35% at 80% 20%, rgba(96,165,250,0.10) 0%, transparent 55%), " +
                "radial-gradient(ellipse 40% 30% at 15% 70%, rgba(37,99,235,0.08) 0%, transparent 55%)",
            }}
          />
          {/* Grid texture */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
              opacity: 0.025,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm40 0h-1v40h1zM0 0v1h40V0zm0 40v-1h40v1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-32 pb-28 text-center" style={{ zIndex: 1 }}>
            {/* Pill badge */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              padding: "6px 16px", borderRadius: "999px",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.3)",
              marginBottom: 28, cursor: "default",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block", marginRight: 8 }} />
              <span style={{ fontSize: 13, color: "#93c5fd", fontWeight: 500, letterSpacing: "0.01em" }}>
                AI-powered cold email in seconds
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] mb-6">
              <span className="text-white block">Scrape any website.</span>
              <span className="block">
                <span className="text-white">Write cold emails </span>
                <span style={{ color: "#3b82f6" }}>that convert.</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-xl text-xl text-[#94a3b8] leading-relaxed mb-10">
              Paste a prospect&apos;s URL. Get 3 personalized cold emails with reply-rate scores in under 10 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
              <Link
                href="/signup"
                className="rounded-xl bg-[#3b82f6] px-8 py-3.5 text-base font-bold text-white hover:bg-[#2563eb] transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-xl border border-white/15 px-8 py-3.5 text-base font-semibold text-[#94a3b8] hover:border-white/25 hover:text-white transition-colors"
              >
                See how it works
              </Link>
            </div>
            <p className="text-sm text-[#64748b]">No setup required · completely free</p>
          </div>
        </section>

        {/* ── 2. LIVE DEMO ─────────────────────────────────────── */}
        <HomeLiveDemo />

        {/* ── 3. COMPARISON ───────────────────────────────────── */}
        <HomeComparison />

        {/* ── 4. HOW IT WORKS ─────────────────────────────────── */}
        <HomeHowItWorks />

        {/* ── 5. TABBED SHOWCASE ──────────────────────────────── */}
        <HomeTabbedShowcase />

        {/* ── 6. WHO IT'S FOR ─────────────────────────────────── */}
        <section className="border-t border-slate-200 py-24 md:py-32" style={{ background: "#f8fafc" }}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">USE CASES</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#0f172a" }}>
                Built for anyone doing B2B outreach
              </h2>
              <p className="mt-4 text-lg" style={{ color: "#475569" }}>
                If you write cold emails to people who have a website, Scrapitch speeds up your research and makes your copy better.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {whoCards.map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-7 transition-all duration-200 group"
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex items-center justify-center rounded-xl shrink-0 transition-all duration-200"
                      style={{
                        width: 44, height: 44,
                        background: "rgba(59,130,246,0.08)",
                        color: "#3b82f6",
                        border: "1px solid rgba(59,130,246,0.15)",
                      }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-base font-bold mb-2" style={{ color: "#0f172a" }}>{card.role}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{card.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. VS GENERIC AI ────────────────────────────────── */}
        <section className="border-t border-white/8 py-24 md:py-32" style={{ background: "#111111" }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">WHY SCRAPITCH</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                Why not just use generic AI?
              </h2>
              <p className="mt-4 text-lg text-[#94a3b8] max-w-xl mx-auto">
                Generic AI writes emails. Scrapitch writes emails about{" "}
                <em className="not-italic text-white font-semibold">your specific prospect</em>. It reads their website, detects their industry, and matches their tone.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Header */}
              <div className="grid grid-cols-3" style={{ background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="px-5 py-4 text-sm font-semibold text-[#64748b]">Feature</div>
                <div className="px-5 py-4 text-sm font-bold text-[#3b82f6] text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>Scrapitch</div>
                <div className="px-5 py-4 text-sm font-semibold text-[#64748b] text-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>Generic AI</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3"
                  style={{
                    borderBottom: i < comparisonRows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    background: i % 2 === 0 ? "#111111" : "rgba(255,255,255,0.01)",
                  }}
                >
                  <div className="px-5 py-3.5 text-sm text-[#94a3b8]">{row.feature}</div>
                  <div className="px-5 py-3.5 text-center flex items-center justify-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-xl font-black" style={{ color: "#3b82f6" }}>✓</span>
                  </div>
                  <div className="px-5 py-3.5 text-center flex items-center justify-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                    {row.generic === null ? (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                        color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                      }}>Manual only</span>
                    ) : (
                      <span className="text-xl font-bold" style={{ color: "#4a5568" }}>✗</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-8 py-3.5 text-base font-bold text-white hover:bg-[#2563eb] transition-colors"
              >
                Try it now and see the difference
              </Link>
            </div>
          </div>
        </section>

        {/* ── 8. FAQ ──────────────────────────────────────────── */}
        <HomeFaqSection />

        {/* ── 10. FINAL CTA ───────────────────────────────────── */}
        <section className="border-t border-white/8 py-28 md:py-36" style={{
          background: "#0a0a0a",
          backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
              Your next reply is<br />one URL away.
            </h2>
            <p className="text-xl text-[#94a3b8] mb-10 max-w-xl mx-auto leading-relaxed">
              Paste a URL. Get 3 personalized cold emails, 3 subject line options each, reply-rate scoring, and a full follow-up sequence. All in under 10 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                href="/signup"
                className="rounded-xl bg-[#3b82f6] px-10 py-4 text-lg font-bold text-white hover:bg-[#2563eb] transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-xl border border-white/15 px-10 py-4 text-lg font-semibold text-[#94a3b8] hover:border-white/25 hover:text-white transition-colors"
              >
                See It In Action
              </Link>
            </div>
            <p className="text-sm text-[#64748b]">No setup required · completely free</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
