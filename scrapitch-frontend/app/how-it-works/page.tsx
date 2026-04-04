import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Scrapitch",
  description:
    "See exactly how Scrapitch scrapes prospect websites and generates personalized cold emails in under 10 seconds.",
};

const steps = [
  {
    num: "01",
    icon: "🔗",
    title: "Paste the prospect's URL",
    body: "Copy any company website URL and paste it into Scrapitch. No browser extension needed, no manual data entry, no setup. Just a URL.",
    detail:
      "Works with any publicly accessible website — company homepages, SaaS landing pages, agency sites, consultant portfolios, e-commerce stores, and more.",
  },
  {
    num: "02",
    icon: "🔍",
    title: "Scrapitch scrapes their site",
    body: "Our scraper fetches the homepage and /about page, strips noise, and extracts the signals that matter for cold email.",
    detail:
      "We extract: company name, what they do, who they serve, their value proposition, tone of voice, key differentiators, and any audience signals in their copy.",
  },
  {
    num: "03",
    icon: "🧠",
    title: "AI analyzes the intelligence",
    body: "Claude processes the scraped data and builds a contextual profile of the prospect — their industry, pain points, audience, and brand voice.",
    detail:
      "The AI identifies the specific language, tone, and priorities of the company. This is what enables genuine personalization rather than just name-merging.",
  },
  {
    num: "04",
    icon: "✉️",
    title: "3 email variants are generated",
    body: "You receive three cold email variants — each using a different proven framework — tailored specifically to this prospect.",
    detail:
      "Variant A uses PAS (Problem-Agitation-Solution). Variant B leads with a concrete outcome. Variant C opens with a genuine icebreaker from their site.",
  },
  {
    num: "05",
    icon: "📊",
    title: "Each email is scored 1–10",
    body: "Every email gets a reply-rate score based on 6 factors: personalization depth, length, single CTA, problem-first framing, subject line quality, and spam avoidance.",
    detail:
      "The score comes with a plain-English explanation — so you understand exactly why an email ranks 7 vs 9 and what you could tweak.",
  },
  {
    num: "06",
    icon: "📋",
    title: "Copy and send",
    body: "Hit the copy button to grab subject + body. Paste straight into Instantly, Lemlist, Apollo, or your sending tool of choice.",
    detail:
      "Or use it as a starting point and edit before sending. The emails are intentionally written to sound like you — concise, specific, and human.",
  },
];

const frameworks = [
  {
    name: "The Direct (PAS)",
    label: "Variant A",
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "text-blue-300 bg-blue-500/20",
    description:
      "Problem → Agitation → Solution. Opens with a specific pain point, escalates it, then positions you as the fix. Under 60 words. Gets right to the point.",
    wordCount: "Under 60 words",
    best: "Prospects with obvious operational pain",
  },
  {
    name: "Value-First",
    label: "Variant B",
    color: "border-emerald-500/30 bg-emerald-500/5",
    badge: "text-emerald-300 bg-emerald-500/20",
    description:
      "Lead with a concrete outcome they could achieve, then explain how you deliver it. No fluff, just a compelling result and a clear path to it. Under 80 words.",
    wordCount: "Under 80 words",
    best: "Growth-focused or ROI-driven buyers",
  },
  {
    name: "The Curious",
    label: "Variant C",
    color: "border-purple-500/30 bg-purple-600/5",
    badge: "text-purple-300 bg-pink-500/20",
    description:
      "Open with a specific, genuine icebreaker about something real on their website. Bridge naturally to your offer. Feels handwritten. Under 75 words.",
    wordCount: "Under 75 words",
    best: "Warm-feeling outreach to inbound-first buyers",
  },
];

const scoringFactors = [
  { factor: "Personalization depth", weight: "30%", desc: "Does it reference specific details from their actual site?" },
  { factor: "Length", weight: "20%", desc: "Does it respect the word limit for the framework?" },
  { factor: "Single CTA", weight: "15%", desc: "Is there exactly one clear call to action?" },
  { factor: "Problem-first framing", weight: "15%", desc: "Does it lead with their pain, not your credentials?" },
  { factor: "Subject line quality", weight: "10%", desc: "Is it under 6 words and curiosity-inducing?" },
  { factor: "No spam phrases", weight: "10%", desc: "Does it avoid generic clichés and opener tropes?" },
];

export default function HowItWorksPage() {
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
              Under the hood
            </p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-50 mb-6">
              How Scrapitch works
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              From URL to personalized cold email in under 10 seconds. Here&apos;s
              every step of what happens.
            </p>
          </div>
        </section>

        {/* Step-by-step */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="relative grid sm:grid-cols-[auto_1fr] gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8"
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-[2.25rem] sm:left-[3.5rem] top-full w-0.5 h-8 bg-zinc-800 -translate-x-1/2" />
                  )}

                  <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                      {step.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400/60 tracking-widest sm:ml-1">
                      {step.num}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-zinc-50 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-zinc-300 leading-relaxed mb-3">{step.body}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed border-l-2 border-zinc-700 pl-4">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Email frameworks */}
        <section className="border-t border-zinc-800/60 py-24 bg-zinc-900/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                The 3 frameworks
              </p>
              <h2 className="text-4xl font-black tracking-tight text-zinc-50">
                Why three variants?
              </h2>
              <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
                Different buyers respond to different openers. Scrapitch gives
                you all three so you can test or choose.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {frameworks.map((f) => (
                <div
                  key={f.name}
                  className={`rounded-2xl border p-7 ${f.color}`}
                >
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.badge} mb-4 inline-block`}>
                    {f.label}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-50 mt-2 mb-3">
                    {f.name}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                    {f.description}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="text-zinc-600">📏</span> {f.wordCount}
                    </div>
                    <div className="flex items-start gap-2 text-zinc-500">
                      <span className="text-zinc-600 shrink-0">🎯</span>
                      <span>Best for: {f.best}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scoring breakdown */}
        <section className="border-t border-zinc-800/60 py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                Reply-rate scoring
              </p>
              <h2 className="text-4xl font-black tracking-tight text-zinc-50">
                How emails are scored
              </h2>
              <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
                Every email is scored 1–10 across these six weighted factors.
                You see the breakdown so you know exactly what to fix.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 overflow-hidden">
              {scoringFactors.map((s, i) => (
                <div
                  key={s.factor}
                  className={`flex items-start gap-6 p-6 ${i < scoringFactors.length - 1 ? "border-b border-zinc-800" : ""}`}
                >
                  <div className="shrink-0 rounded-lg bg-purple-500/10 px-3 py-1.5">
                    <span className="text-sm font-black text-purple-400">
                      {s.weight}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100 mb-1">
                      {s.factor}
                    </p>
                    <p className="text-sm text-zinc-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-zinc-800/60 py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-black tracking-tight text-zinc-50 mb-4">
              Ready to try it?
            </h2>
            <p className="text-zinc-400 mb-8">
              Paste your first URL. See emails in 10 seconds.
            </p>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3.5 text-base font-bold text-[#0a0a0a] hover:opacity-90 transition-opacity"
            >
              Open the generator →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
