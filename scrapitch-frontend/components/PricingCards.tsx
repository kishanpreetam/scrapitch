"use client";

import Link from "next/link";

function CheckIcon() {
  return <span className="text-[#4ade80] font-bold shrink-0 mt-0.5">✓</span>;
}

const freeFeatures = [
  "3 email generations",
  "All 3 email variants",
  "Follow-up sequence",
  "Subject line A/B variants",
  "Reply rate scoring",
  "No credit card required",
];

const proFeatures = [
  "Unlimited generations",
  "All 3 email variants",
  "Follow-up sequences",
  "12 industry frameworks",
  "Subject line A/B variants",
  "Reply rate scoring",
  "Priority processing",
  "All future Phase 1 features",
];

const growthFeatures: { text: string; soon?: boolean }[] = [
  { text: "Everything in Pro", soon: false },
  { text: "Google News triggers", soon: true },
  { text: "Icebreaker mode", soon: true },
  { text: "Spam score checker", soon: true },
  { text: "Bulk URL processing", soon: true },
];

export function PricingCardFree() {
  return (
    <div
      className="rounded-2xl border border-white/8 bg-[#141414] p-8 flex flex-col h-full"
      style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
    >
      <div className="mb-6">
        <span className="inline-block mb-4" style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }}>
          FREE
        </span>
        <div className="flex items-end gap-1 mb-1">
          <span className="text-5xl font-black text-white tracking-tight">$0</span>
        </div>
        <p className="text-sm text-[#6b6b6b]">To get started</p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {freeFeatures.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-[#d4d4d4]">
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className="block w-full text-center rounded-xl border border-white/15 bg-transparent px-6 py-3.5 text-sm font-bold text-[#d4d4d4] hover:border-white/25 hover:text-white transition-colors"
      >
        Start Free →
      </Link>
    </div>
  );
}

export function PricingCardPro() {
  return (
    <div
      className="relative rounded-2xl border border-white/8 bg-[#141414] overflow-hidden flex flex-col h-full"
      style={{ borderTop: "2px solid #7c3aed", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <span className="text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ borderRadius: "6px", padding: "3px 10px", background: "#7c3aed" }}>
          Most Popular
        </span>
      </div>
      <div className="p-8 flex flex-col h-full pt-10">
        <div className="mb-6">
          <span className="inline-block mb-4" style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.25)", background: "transparent" }}>
            PRO
          </span>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-5xl font-black text-white tracking-tight">$9.99</span>
            <span className="text-[#a8a8a8] mb-1.5 text-base">/mo</span>
          </div>
          <p className="text-sm text-[#6b6b6b]">Billed monthly, cancel anytime</p>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {proFeatures.map((f, i) => (
            <li key={f} className={`flex items-start gap-3 text-sm ${i === 0 ? "text-[#f5f5f5] font-medium" : "text-[#d4d4d4]"}`}>
              <CheckIcon />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/signup"
          className="block w-full text-center rounded-xl bg-[#7c3aed] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#6d28d9] transition-colors"
        >
          Start Pro →
        </Link>
      </div>
    </div>
  );
}

export function PricingCardGrowth() {
  return (
    <div
      className="rounded-2xl border border-white/8 bg-[#141414] p-8 flex flex-col h-full"
      style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
    >
      <div className="mb-6">
        <span className="inline-block mb-4" style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", background: "transparent" }}>
          GROWTH
        </span>
        <div className="flex items-end gap-1 mb-1">
          <span className="text-5xl font-black text-white tracking-tight">$15.99</span>
          <span className="text-[#a8a8a8] mb-1.5 text-base">/mo</span>
        </div>
        <p className="text-sm text-[#6b6b6b]">Billed monthly, cancel anytime</p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {growthFeatures.map(({ text, soon }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-[#d4d4d4]">
            <CheckIcon />
            <span className="flex items-center gap-2 flex-wrap">
              {text}
              {soon && (
                <span style={{ borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#a16207", border: "1px solid rgba(161,98,7,0.25)", background: "transparent" }}>
                  Coming Soon
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className="block w-full text-center rounded-xl border border-white/15 bg-transparent px-6 py-3.5 text-sm font-bold text-[#d4d4d4] hover:border-white/25 hover:text-white transition-colors"
      >
        Start Growth →
      </Link>
    </div>
  );
}
