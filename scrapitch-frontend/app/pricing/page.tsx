import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Scrapitch",
  description:
    "One plan. Unlimited cold email generation. $9.99/month. Cancel anytime.",
};

const features = [
  "3 free generations when you sign up",
  "Unlimited URL scrapes",
  "3 email variants per prospect",
  "Reply-rate scoring (1–10) with reasoning",
  "PAS, Value-First, and Curiosity Gap frameworks",
  "Framework, tone & industry controls",
  "Copy to clipboard in one click",
  "Cloudflare-resistant scraping with fallbacks",
  "CAN-SPAM compliant email structure",
  "Cancel anytime — no lock-in",
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes. Create a free account and you get 3 email generations included — no credit card required. After that, $9.99/month unlocks unlimited generations.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, cancel from your account at any time. No contracts, no lock-in, no cancellation fee. Your access continues until the end of the billing period.",
  },
  {
    q: "What happens if a website can't be scraped?",
    a: "Scrapitch automatically tries the /about page as a fallback. If both are blocked (Cloudflare, JS-only rendering), it falls back to domain-level data and still generates usable emails. You can also supplement with the Tone and Industry dropdowns.",
  },
  {
    q: "Is there a limit on how many emails I can generate?",
    a: "No hard limit. The $9.99/month plan covers unlimited generations. We built it for people running high-volume outreach.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual billing at a discounted rate is on the roadmap. Sign up now and we'll notify you when it's available.",
  },
  {
    q: "What does '$9.99/mo' actually get me vs doing this manually?",
    a: "A good SDR costs $4,000–$8,000/month. A copywriter costs $100–$300 per hour. Scrapitch replaces the research + writing part for $9.99. The ROI of one booked meeting covers months of subscription.",
  },
];

const comparisons = [
  {
    method: "Manual research + writing",
    time: "30–60 min/prospect",
    quality: "High (if you're good)",
    cost: "Your time",
    scale: "Low",
  },
  {
    method: "Generic templates",
    time: "5 min/prospect",
    quality: "Low",
    cost: "Free",
    scale: "High",
  },
  {
    method: "Hiring a copywriter",
    time: "1–2 days turnaround",
    quality: "High",
    cost: "$100–300/email",
    scale: "Low",
  },
  {
    method: "Scrapitch",
    time: "10 seconds",
    quality: "High",
    cost: "$9.99/mo",
    scale: "Unlimited",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-800/60">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-purple-500/5 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">
              Pricing
            </p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-50 mb-6">
              One price. Everything included.
            </h1>
            <p className="text-xl text-zinc-400 max-w-xl mx-auto">
              No seats, no tiers, no usage caps. Just $9.99/month for unlimited
              cold email generation.
            </p>
          </div>
        </section>

        {/* Pricing card */}
        <section className="py-24">
          <div className="mx-auto max-w-lg px-4 sm:px-6">
            <div className="relative rounded-3xl border border-purple-400/30 bg-zinc-900/60 p-10 shadow-[0_0_60px_rgba(251,146,60,0.08)]">
              {/* Popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Most popular
                </span>
              </div>

              <div className="text-center mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                  Scrapitch Pro
                </p>
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-6xl font-black text-zinc-50 tracking-tight">
                    $9.99
                  </span>
                  <span className="text-zinc-500 mb-2 text-lg">/month</span>
                </div>
                <p className="text-sm text-zinc-500">
                  Billed monthly · Cancel anytime
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="text-purple-400 mt-0.5 shrink-0 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3.5 text-base font-bold text-white hover:opacity-90 transition-opacity"
              >
                Create Free Account →
              </Link>
              <p className="mt-3 text-center text-xs text-zinc-600">
                3 free generations included when you sign up
              </p>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-t border-zinc-800/60 py-24 bg-zinc-900/20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                The alternative
              </p>
              <h2 className="text-4xl font-black tracking-tight text-zinc-50">
                $9.99 vs everything else
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="grid grid-cols-5 bg-zinc-900/60 border-b border-zinc-800">
                {["Method", "Time/prospect", "Quality", "Cost", "Scale"].map((h) => (
                  <div
                    key={h}
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    {h}
                  </div>
                ))}
              </div>
              {comparisons.map((row) => (
                <div
                  key={row.method}
                  className={`grid grid-cols-5 border-b border-zinc-800 last:border-0 ${
                    row.highlight
                      ? "bg-purple-500/5 border-purple-400/20"
                      : "bg-zinc-900/20"
                  }`}
                >
                  <div className={`px-4 py-4 text-sm font-semibold ${row.highlight ? "text-purple-300" : "text-zinc-300"}`}>
                    {row.method}
                    {row.highlight && (
                      <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold">
                        ← you
                      </span>
                    )}
                  </div>
                  <div className={`px-4 py-4 text-sm ${row.highlight ? "text-purple-400 font-bold" : "text-zinc-400"}`}>
                    {row.time}
                  </div>
                  <div className={`px-4 py-4 text-sm ${row.highlight ? "text-purple-400 font-bold" : "text-zinc-400"}`}>
                    {row.quality}
                  </div>
                  <div className={`px-4 py-4 text-sm ${row.highlight ? "text-purple-400 font-bold" : "text-zinc-400"}`}>
                    {row.cost}
                  </div>
                  <div className={`px-4 py-4 text-sm ${row.highlight ? "text-purple-400 font-bold" : "text-zinc-400"}`}>
                    {row.scale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-zinc-800/60 py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black tracking-tight text-zinc-50">
                Pricing questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/40"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-5 font-semibold text-zinc-100 hover:text-purple-300 transition-colors list-none">
                    {faq.q}
                    <span className="text-zinc-600 group-open:rotate-180 transition-transform text-lg leading-none ml-4 shrink-0">
                      ↓
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-zinc-800/60 py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-black tracking-tight text-zinc-50 mb-4">
              One meeting pays for a year.
            </h2>
            <p className="text-zinc-400 mb-8">
              Sign up free — 3 generations included. Then $9.99/month, cancel anytime.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3.5 text-base font-bold text-white hover:opacity-90 transition-opacity"
            >
              Create Free Account →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
