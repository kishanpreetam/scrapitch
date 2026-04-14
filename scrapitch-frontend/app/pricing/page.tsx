import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Scrapitch",
  description:
    "Free to start. Upgrade when you're ready. 3 free email generations included.",
};

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

const growthFeatures = [
  { text: "Everything in Pro", soon: false },
  { text: "Google News triggers", soon: true },
  { text: "Icebreaker mode", soon: true },
  { text: "Spam score checker", soon: true },
  { text: "Bulk URL processing", soon: true },
];

const comparisonRows: {
  feature: string;
  free: string;
  pro: string;
  growth: string;
}[] = [
  { feature: "Email generations", free: "3", pro: "Unlimited", growth: "Unlimited" },
  { feature: "Email variants (3)", free: "✓", pro: "✓", growth: "✓" },
  { feature: "Subject line options (3)", free: "✓", pro: "✓", growth: "✓" },
  { feature: "Follow-up sequence", free: "✓", pro: "✓", growth: "✓" },
  { feature: "Reply rate scoring", free: "✓", pro: "✓", growth: "✓" },
  { feature: "Industry frameworks (12)", free: "✓", pro: "✓", growth: "✓" },
  { feature: "Priority processing", free: "✗", pro: "✓", growth: "✓" },
  { feature: "Google News triggers", free: "✗", pro: "✗", growth: "Soon" },
  { feature: "Icebreaker mode", free: "✗", pro: "✗", growth: "Soon" },
  { feature: "Bulk processing", free: "✗", pro: "✗", growth: "Soon" },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings. No cancellation fees. Access continues until the end of the billing period.",
  },
  {
    q: "What happens when I hit my 3 free generations?",
    a: "You'll see an upgrade prompt. Your existing results are preserved. Upgrade to Pro for unlimited access.",
  },
  {
    q: "Can I switch between plans?",
    a: "Yes. Upgrade or downgrade anytime. Changes take effect at the next billing cycle.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a refund within 7 days of your first paid charge if you're not satisfied. Contact us at hello@scrapitch.com.",
  },
  {
    q: "Is annual billing available?",
    a: "Annual billing at a discounted rate is on the roadmap. Sign up for the monthly plan now, and we'll notify you when it's available.",
  },
];

function CheckIcon() {
  return (
    <span className="text-[#4ade80] font-bold shrink-0 mt-0.5">✓</span>
  );
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] pt-20">

        {/* ── HERO ── */}
        <section className="border-b border-white/6 bg-section-alt">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b] mb-4">
                Pricing
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6">
                Simple pricing. <span className="bg-linear-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">No surprises.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-xl text-[#a8a8a8] max-w-xl mx-auto">
                Start free. Upgrade when you&apos;re ready. Every plan includes all core features.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

              {/* FREE */}
              <Reveal delay={0}>
                <div className="rounded-2xl border border-white/8 bg-[#141414] p-8 flex flex-col h-full" style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
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
              </Reveal>

              {/* PRO (highlighted) */}
              <Reveal delay={80}>
                <div className="relative rounded-2xl border border-white/8 bg-[#141414] overflow-hidden flex flex-col h-full" style={{ borderTop: "2px solid #7c3aed", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
                  {/* Most Popular badge */}
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
              </Reveal>

              {/* GROWTH */}
              <Reveal delay={160}>
                <div className="rounded-2xl border border-white/8 bg-[#141414] p-8 flex flex-col h-full" style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
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
              </Reveal>

            </div>
          </div>
        </section>

        {/* ── FEATURE COMPARISON TABLE ── */}
        <section className="border-t border-white/6 py-24 md:py-32 bg-section-alt">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b] mb-3">
                  Compare Plans
                </p>
                <h2 className="text-4xl font-black tracking-tight text-white">
                  Everything side by side
                </h2>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-2xl border border-white/8 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-130 text-sm">
                  <thead>
                    <tr className="border-b border-white/6 bg-[#1c1c1c]">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] w-1/2">
                        Feature
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#a8a8a8]">
                        Free
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-white">
                        Pro
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#a8a8a8]">
                        Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr
                        key={row.feature}
                        className={`border-b border-white/6 last:border-0 ${
                          i % 2 === 0 ? "bg-[#141414]" : "bg-[#1a1a1a]"
                        }`}
                      >
                        <td className="px-5 py-4 text-[#d4d4d4] font-medium">
                          {row.feature}
                        </td>
                        <td className={`px-5 py-4 text-center font-bold ${
                          row.free === "✓" ? "text-[#4ade80]" : row.free === "✗" ? "text-[#6b6b6b]" : "text-[#d4d4d4]"
                        }`}>
                          {row.free}
                        </td>
                        <td className={`px-5 py-4 text-center font-bold ${
                          row.pro === "✓" ? "text-[#4ade80]" : row.pro === "✗" ? "text-[#6b6b6b]" : "text-[#d4d4d4]"
                        }`}>
                          {row.pro}
                        </td>
                        <td className="px-5 py-4 text-center font-bold">
                          {row.growth === "✓" ? (
                            <span className="text-[#16a34a]">✓</span>
                          ) : row.growth === "✗" ? (
                            <span className="text-[#6b6b6b]">✗</span>
                          ) : row.growth === "Soon" ? (
                            <span style={{ borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#a16207", border: "1px solid rgba(161,98,7,0.25)", background: "transparent" }}>
                              Soon
                            </span>
                          ) : (
                            <span className="text-[#d4d4d4]">{row.growth}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── BILLING FAQ ── */}
        <section className="border-t border-white/6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b] mb-3">
                  FAQ
                </p>
                <h2 className="text-4xl font-black tracking-tight text-white">
                  Billing questions
                </h2>
              </div>
            </Reveal>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 60}>
                  <details className="group rounded-xl border border-white/8 bg-[#141414]" style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.16)"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.borderColor = ""; }}>
                    <summary className="flex cursor-pointer items-center justify-between px-6 py-5 font-semibold text-[#f5f5f0] hover:text-white transition-colors list-none">
                      {faq.q}
                      <span className="ml-4 shrink-0 text-[#6b6b6b] text-lg leading-none transition-transform duration-300 group-open:rotate-180">
                        ↓
                      </span>
                    </summary>
                    <div className="border-t border-white/8 px-6 pb-5 pt-4 text-sm text-[#a8a8a8] leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="border-t border-white/8 py-24 md:py-32 bg-[#111111]">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#fef9f0] mb-4">
                One meeting covers a year of Pro.
              </h2>
              <p className="text-[#a8a8a8] text-lg mb-10">
                Sign up free. No card needed.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-10 py-4 text-base font-bold text-white hover:bg-[#6d28d9] transition-colors"
              >
                Create Free Account →
              </Link>
              <p className="mt-4 text-xs text-[#6b6b6b]">
                3 generations included · No credit card required
              </p>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
