import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { PricingCardFree, PricingCardPro, PricingCardGrowth } from "@/components/PricingCards";
import PricingFaqItem from "@/components/PricingFaqItem";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Scrapitch",
  description:
    "Free to start. Upgrade when you're ready. 3 free email generations included.",
};

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
              <Reveal delay={0}><PricingCardFree /></Reveal>
              <Reveal delay={80}><PricingCardPro /></Reveal>
              <Reveal delay={160}><PricingCardGrowth /></Reveal>
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
                        <td className="px-5 py-4 text-[#d4d4d4] font-medium">{row.feature}</td>
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
                  <PricingFaqItem q={faq.q} a={faq.a} />
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
