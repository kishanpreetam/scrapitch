"use client";

import Reveal from "@/components/Reveal";

/* ─── SVG icons ──────────────────────────────────────────────────────────── */

function IconLink({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconCpu({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </svg>
  );
}

function IconLayers({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconMail({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  );
}

function IconRuler({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z" />
      <path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2" />
    </svg>
  );
}

function IconTarget({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/* ─── Step data ──────────────────────────────────────────────────────────── */

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
    calloutText: "No browser extension, no account setup, no manual research. Just the URL.",
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

/* ─── Framework data ─────────────────────────────────────────────────────── */

const frameworks = [
  {
    label: "Variant A",
    name: "The Direct (PAS)",
    tagline: "Problem → Agitation → Solution",
    description: "Opens with a specific pain point, escalates it, then positions you as the fix. Gets right to the point without filler.",
    wordCount: "Under 60 words",
    best: "Prospects with a clear operational pain point.",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    accentText: "text-blue-400",
  },
  {
    label: "Variant B",
    name: "Value-First",
    tagline: "Lead with outcome, then explain how",
    description: "Lead with a concrete outcome the prospect could achieve, then explain how you deliver it. No fluff, just a compelling result and a clear path to it.",
    wordCount: "Under 80 words",
    best: "ROI-focused or growth-stage buyers.",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    accentText: "text-emerald-400",
  },
  {
    label: "Variant C",
    name: "The Curious",
    tagline: "Specific icebreaker → bridge to offer",
    description: "Opens with a specific, genuine icebreaker drawn from something real on their website. Bridges naturally to your offer. Feels handwritten, not templated.",
    wordCount: "Under 75 words",
    best: "Senior buyers and inbound-led companies.",
    border: "border-purple-500/30",
    bg: "bg-purple-600/5",
    accentText: "text-purple-400",
  },
];

const frameworkBadgeStyles = [
  { color: "#7c3aed", border: "rgba(124,58,237,0.25)" },
  { color: "#b45309", border: "rgba(180,83,9,0.25)" },
  { color: "#0369a1", border: "rgba(3,105,161,0.25)" },
];

/* ─── Exported components ────────────────────────────────────────────────── */

export function HowItWorksStepList() {
  return (
    <div className="relative">
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
                <div className={`flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-2xl ring-1 ${step.badgeColor} ${step.iconColor}`}>
                  <step.Icon className="h-6 w-6" />
                </div>
                <span style={{ borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }}>
                  {step.num}
                </span>
              </div>

              {/* Card */}
              <div
                className="rounded-2xl border border-white/8 bg-[#141414] p-6 sm:p-7"
                style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
              >
                {/* Mobile: icon + number inline */}
                <div className="flex items-center gap-3 sm:hidden mb-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${step.badgeColor} ${step.iconColor}`}>
                    <step.Icon className="h-5 w-5" />
                  </div>
                  <span style={{ borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }}>
                    STEP {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[#d4d4d4] leading-relaxed mb-4">{step.body}</p>

                {step.calloutLabel && step.calloutItems ? (
                  <div className="border-l-2 border-white/15 pl-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] mb-2">
                      {step.calloutLabel}
                    </p>
                    <ul className="space-y-1.5">
                      {step.calloutItems.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-[#a8a8a8]">
                          <svg className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${step.iconColor}`} viewBox="0 0 12 12" fill="currentColor">
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
  );
}

export function HowItWorksFrameworkList() {
  return (
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
              <span style={{
                borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500,
                letterSpacing: "0.02em", background: "transparent",
                color: frameworkBadgeStyles[i].color,
                border: `1px solid ${frameworkBadgeStyles[i].border}`,
              }}>
                {f.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{f.name}</h3>
            <p className={`text-sm font-medium mb-4 ${f.accentText}`}>{f.tagline}</p>
            <p className="text-sm text-[#a8a8a8] leading-relaxed flex-1 mb-6">{f.description}</p>
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
  );
}
