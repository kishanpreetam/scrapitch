import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Scrapitch",
  description:
    "From URL to personalized cold email in under 10 seconds. Here's every step.",
};

/* ─── SVG icons ─────────────────────────────────────────────────────────── */

function IconLink({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconCpu({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </svg>
  );
}

function IconLayers({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconMail({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}

function IconRuler({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z" />
      <path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2" />
    </svg>
  );
}

function IconTarget({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/* ─── Step data ─────────────────────────────────────────────────────────── */

type Step = {
  num: string;
  Icon: React.FC<{ className?: string }>;
  title: string;
  body: string;
  calloutLabel?: string;
  calloutItems?: string[];
  calloutText?: string;
  iconColor: string;
  badgeColor: string;
};

const steps: Step[] = [
  {
    num: "01",
    Icon: IconLink,
    title: "Paste the prospect's URL",
    iconColor: "text-blue-400",
    badgeColor: "bg-blue-500/10 ring-blue-500/20",
    body: "Copy any company website URL and paste it into Scrapitch. Works with any publicly accessible site: SaaS, agencies, consultants, law firms, e-commerce, and more.",
    calloutText:
      "No browser extension, no account setup, no manual research. Just the URL.",
  },
  {
    num: "02",
    Icon: IconCpu,
    title: "AI scrapes and analyzes their site",
    iconColor: "text-purple-400",
    badgeColor: "bg-purple-500/10 ring-purple-500/20",
    body: "Scrapitch fetches the homepage and /about page, strips noise, and extracts the signals that matter for cold outreach.",
    calloutLabel: "What Scrapitch extracts:",
    calloutItems: [
      "Company name",
      "What they do (service / product description)",
      "Who they serve (target audience)",
      "Value proposition",
      "Tone of voice (formal / casual / technical / inspirational)",
      "Key differentiators and pain points",
    ],
  },
  {
    num: "03",
    Icon: IconLayers,
    title: "Industry framework + tone applied",
    iconColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/10 ring-emerald-500/20",
    body: "The AI maps the prospect to one of 12 industry frameworks and applies your preferred sending tone. This shapes the angle, vocabulary, and structure of every email.",
    calloutLabel: "What the AI considers:",
    calloutItems: [
      "Detected industry (or your manual selection): determines email angle",
      "Sender tone preference: Professional, Casual, Bold, or Friendly",
      "Website tone: formal / casual / technical / inspirational writing style",
      "Framework selection: All 3, The Direct (PAS), Value-First, or The Curious",
      "Subject line formula: under 6 words, curiosity-inducing",
    ],
  },
  {
    num: "04",
    Icon: IconMail,
    title: "3 emails + follow-up sequence delivered",
    iconColor: "text-purple-300",
    badgeColor: "bg-purple-500/10 ring-purple-500/20",
    body: "You receive 3 cold email variants, each scored 1–10 with reasoning, plus a full 3-email follow-up sequence ready to paste into your sending tool.",
    calloutLabel: "What you receive:",
    calloutItems: [
      "Variant A · The Direct (PAS): under 60 words, pain-first",
      "Variant B · Value-First: under 80 words, outcome-first",
      "Variant C · The Curious: under 75 words, specific icebreaker",
      "3 subject line options per variant",
      "Follow-up Day 3, 7, and 14 (each under 50 words)",
    ],
  },
];

/* ─── Framework cards ────────────────────────────────────────────────────── */

const frameworks = [
  {
    label: "Variant A",
    name: "The Direct (PAS)",
    tagline: "Problem → Agitation → Solution",
    description:
      "Opens with a specific pain point, escalates it, then positions you as the fix. Gets right to the point without filler.",
    wordCount: "Under 60 words",
    best: "Prospects with a clear operational pain point.",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    badgeText: "text-blue-300",
    badgeBg: "bg-blue-500/20",
    accentText: "text-blue-400",
  },
  {
    label: "Variant B",
    name: "Value-First",
    tagline: "Lead with outcome, then explain how",
    description:
      "Lead with a concrete outcome the prospect could achieve, then explain how you deliver it. No fluff, just a compelling result and a clear path to it.",
    wordCount: "Under 80 words",
    best: "ROI-focused or growth-stage buyers.",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    badgeText: "text-emerald-300",
    badgeBg: "bg-emerald-500/20",
    accentText: "text-emerald-400",
  },
  {
    label: "Variant C",
    name: "The Curious",
    tagline: "Specific icebreaker → bridge to offer",
    description:
      "Opens with a specific, genuine icebreaker drawn from something real on their website. Bridges naturally to your offer. Feels handwritten, not templated.",
    wordCount: "Under 75 words",
    best: "Senior buyers and inbound-led companies.",
    border: "border-purple-500/30",
    bg: "bg-purple-600/5",
    badgeText: "text-purple-300",
    badgeBg: "bg-purple-500/20",
    accentText: "text-purple-400",
  },
];

/* ─── Scoring rows ───────────────────────────────────────────────────────── */

const scoringFactors = [
  {
    factor: "Personalization depth",
    weight: "30%",
    desc: "References specific scraped content, not generic phrases",
  },
  {
    factor: "Length compliance",
    weight: "20%",
    desc: "Respects the word limit for the variant's framework",
  },
  {
    factor: "Single CTA",
    weight: "15%",
    desc: "Exactly one clear call to action",
  },
  {
    factor: "Problem-first framing",
    weight: "15%",
    desc: "Leads with their challenge, not your credentials",
  },
  {
    factor: "Subject line quality",
    weight: "10%",
    desc: "Under 6 words, curiosity-inducing",
  },
  {
    factor: "No spam phrases",
    weight: "10%",
    desc: 'Avoids "I hope this finds you well" and similar clichés',
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="border-b border-white/6 bg-section-alt">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b6b6b] mb-5">
                Under the hood
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05]">
                URL in. <span className="bg-linear-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">Cold emails out.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg sm:text-xl text-[#a8a8a8] max-w-2xl mx-auto leading-relaxed">
                Four steps. Ten seconds. Here&apos;s exactly what happens
                between paste and send.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Four Steps — vertical timeline ────────────────────────────────── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Vertical connector — desktop only */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute left-[1.875rem] top-10 bottom-10 w-px bg-linear-to-r from-white/15 to-transparent"
              />

              <div className="space-y-6">
                {steps.map((step, i) => (
                  <Reveal key={step.num} delay={i * 80}>
                    <div className="relative grid sm:grid-cols-[4rem_1fr] gap-0 sm:gap-6">
                      {/* Number badge + icon column */}
                      <div className="hidden sm:flex flex-col items-center pt-1 gap-2 z-10">
                        <div
                          className={`flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-2xl ring-1 ${step.badgeColor} ${step.iconColor}`}
                        >
                          <step.Icon className="h-6 w-6" />
                        </div>
                        <span style={{ borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }}>
                          {step.num}
                        </span>
                      </div>

                      {/* Card */}
                      <div className="rounded-2xl border border-white/8 bg-[#141414] p-6 sm:p-7" style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
                        {/* Mobile: icon + number inline */}
                        <div className="flex items-center gap-3 sm:hidden mb-4">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${step.badgeColor} ${step.iconColor}`}
                          >
                            <step.Icon className="h-5 w-5" />
                          </div>
                          <span style={{ borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }}>
                            STEP {step.num}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3">
                          {step.title}
                        </h3>
                        <p className="text-[#d4d4d4] leading-relaxed mb-4">
                          {step.body}
                        </p>

                        {/* Detail callout */}
                        {step.calloutLabel && step.calloutItems ? (
                          <div className="border-l-2 border-white/15 pl-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] mb-2">
                              {step.calloutLabel}
                            </p>
                            <ul className="space-y-1.5">
                              {step.calloutItems.map((item) => (
                                <li
                                  key={item}
                                  className="flex items-start gap-2 text-sm text-[#a8a8a8]"
                                >
                                  <svg
                                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${step.iconColor}`}
                                    viewBox="0 0 12 12"
                                    fill="currentColor"
                                  >
                                    <circle cx="6" cy="6" r="2.5" />
                                  </svg>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : step.calloutText ? (
                          <p className="border-l-2 border-white/15 pl-4 text-sm text-[#a8a8a8] leading-relaxed">
                            {step.calloutText}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Email frameworks ──────────────────────────────────────────────── */}
        <section className="border-t border-white/6 py-24 sm:py-32 bg-section-alt">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b6b6b] mb-4">
                  Three frameworks
                </p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
                  Why three variants?
                </h2>
                <p className="text-[#a8a8a8] max-w-xl mx-auto text-lg leading-relaxed">
                  Different buyers respond to different openers. Scrapitch gives
                  you all three so you can test — or just pick the one that fits.
                </p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {frameworks.map((f, i) => (
                <Reveal key={f.name} delay={i * 80}>
                  <div
                    className={`h-full flex flex-col rounded-2xl border ${f.border} ${f.bg} p-7`}
                    style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div className="mb-4">
                      <span style={
                        i === 0
                          ? { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.25)", background: "transparent" }
                          : i === 1
                            ? { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#b45309", border: "1px solid rgba(180,83,9,0.25)", background: "transparent" }
                            : { borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#0369a1", border: "1px solid rgba(3,105,161,0.25)", background: "transparent" }
                      }>
                        {f.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {f.name}
                    </h3>
                    <p className={`text-sm font-medium mb-4 ${f.accentText}`}>
                      {f.tagline}
                    </p>
                    <p className="text-sm text-[#a8a8a8] leading-relaxed flex-1 mb-6">
                      {f.description}
                    </p>
                    <div className="space-y-2.5 mt-auto pt-5 border-t border-white/8">
                      <div className="flex items-center gap-2.5 text-xs text-[#a8a8a8]">
                        <IconRuler className={`h-3.5 w-3.5 shrink-0 ${f.accentText}`} />
                        {f.wordCount}
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[#a8a8a8]">
                        <IconTarget className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${f.accentText}`} />
                        <span>
                          <span className="text-[#6b6b6b]">Best for: </span>
                          {f.best}
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Scoring breakdown ─────────────────────────────────────────────── */}
        <section className="border-t border-white/6 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b6b6b] mb-4">
                  Reply-rate scoring
                </p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
                  How reply-rate scores work
                </h2>
                <p className="text-[#a8a8a8] max-w-xl mx-auto text-lg leading-relaxed">
                  Every email is scored 1–10 across 6 weighted factors.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-2xl border border-white/8 overflow-hidden">
                {scoringFactors.map((s, i) => (
                  <div
                    key={s.factor}
                    className={`flex items-start gap-5 sm:gap-6 px-6 py-5 ${
                      i % 2 !== 0 ? "bg-white/3" : ""
                    } ${i < scoringFactors.length - 1 ? "border-b border-white/6" : ""}`}
                  >
                    {/* Weight badge */}
                    <div className="shrink-0 min-w-[3.5rem] text-center rounded-lg bg-white/8 border border-white/10 px-2.5 py-1.5">
                      <span className="text-sm font-black text-[#4ade80] tabular-nums">
                        {s.weight}
                      </span>
                    </div>
                    {/* Text */}
                    <div>
                      <p className="font-semibold text-[#f0f0f0] leading-snug mb-0.5">
                        {s.factor}
                      </p>
                      <p className="text-sm text-[#a8a8a8]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────────── */}
        <section className="border-t border-white/6 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
                Ready to try it?
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-[#a8a8a8] text-lg mb-10">
                Your first 3 generations are free.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <Link
                href="/generator"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#7c3aed] px-9 py-4 text-base font-bold text-white hover:bg-[#6d28d9] transition-colors"
              >
                Open the generator
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
