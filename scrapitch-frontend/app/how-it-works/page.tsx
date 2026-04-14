import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { HowItWorksStepList, HowItWorksFrameworkList } from "@/components/HowItWorksCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Scrapitch",
  description:
    "From URL to personalized cold email in under 10 seconds. Here's every step.",
};

const scoringFactors = [
  { factor: "Personalization depth", weight: "30%", desc: "References specific scraped content, not generic phrases" },
  { factor: "Length compliance", weight: "20%", desc: "Respects the word limit for the variant's framework" },
  { factor: "Single CTA", weight: "15%", desc: "Exactly one clear call to action" },
  { factor: "Problem-first framing", weight: "15%", desc: "Leads with their challenge, not your credentials" },
  { factor: "Subject line quality", weight: "10%", desc: "Under 6 words, curiosity-inducing" },
  { factor: "No spam phrases", weight: "10%", desc: 'Avoids "I hope this finds you well" and similar clichés' },
];

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

        {/* ── Four Steps ────────────────────────────────────────────────────── */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <HowItWorksStepList />
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
            <HowItWorksFrameworkList />
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
                    <div className="shrink-0 min-w-14 text-center rounded-lg bg-white/8 border border-white/10 px-2.5 py-1.5">
                      <span className="text-sm font-black text-[#4ade80] tabular-nums">{s.weight}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#f0f0f0] leading-snug mb-0.5">{s.factor}</p>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
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
