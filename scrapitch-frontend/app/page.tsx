import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stepIcons = [
  // Link / URL
  <svg key="url" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>,
  // CPU / AI
  <svg key="ai" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2m0 0h2m-2 0v6m0 0h2m-2 0v2a2 2 0 01-2 2h-2m0 0H9m6 0v2M9 21H7a2 2 0 01-2-2v-2m0 0H3m2 0V9M3 9H1m2 0V7a2 2 0 012-2h2" />
  </svg>,
  // Mail / envelope
  <svg key="mail" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
];

const steps = [
  {
    num: "01",
    title: "Paste any URL",
    body: "Drop in your prospect's website. No research, no templates, no wasted time.",
  },
  {
    num: "02",
    title: "AI reads their site",
    body: "Scrapitch scrapes their homepage, extracts value props, tone, audience, and pain points.",
  },
  {
    num: "03",
    title: "Get 3 scored emails",
    body: "Receive PAS, Value-First, and Curiosity Gap variants — each scored 1–10 with reasoning.",
  },
];

const featureIcons = [
  // Globe / website scan
  <svg key="globe" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  // Layers / frameworks
  <svg key="layers" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
  // Bar chart / scoring
  <svg key="chart" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  // Bolt / speed
  <svg key="bolt" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  // Cursor / CTA
  <svg key="cursor" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>,
  // Shield / compliance
  <svg key="shield" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
];

const features = [
  {
    title: "Deep website intelligence",
    body: "Not just the homepage. Scrapitch reads hero copy, about pages, and case studies to build a complete picture of your prospect.",
  },
  {
    title: "3 proven frameworks",
    body: "PAS (Direct), Value-First, and Curiosity Gap — the highest-converting cold email structures, auto-generated for every prospect.",
  },
  {
    title: "Reply-rate scoring",
    body: "Every email scored across 6 factors: personalization, length, CTA clarity, problem framing, subject line, and spam avoidance.",
  },
  {
    title: "10-second turnaround",
    body: "Scraping + generation happens in under 10 seconds. Send 50 personalized cold emails in the time it used to take to write one.",
  },
  {
    title: "One CTA enforced",
    body: "Every generated email has exactly one call to action. No rambling, no multi-ask. Just clean, conversion-focused copy.",
  },
  {
    title: "CAN-SPAM compliant",
    body: "Generated emails follow best-practice outreach guidelines with clear sender identity and no deceptive subject lines.",
  },
];

const variants = [
  {
    label: "A — The Direct",
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "bg-blue-500/20 text-blue-300",
    subject: "Your pipeline bottleneck",
    body: "Most agencies at your stage are leaving 40% of inbound leads unconverted because follow-up sequences aren't personalized. We fix that with AI-written sequences that reference what your prospects actually care about. Worth a 15-min call?",
    score: 9,
  },
  {
    label: "B — Value-First",
    color: "border-emerald-500/30 bg-emerald-500/5",
    badge: "bg-emerald-500/20 text-emerald-300",
    subject: "2x reply rate, 0 extra effort",
    body: "Agencies using personalized cold outreach see 2x reply rates vs templated emails. Scrapitch writes them in 10 seconds per prospect. I'd love to show you a live demo on your actual prospect list.",
    score: 8,
  },
  {
    label: "C — The Curious",
    color: "border-purple-500/30 bg-purple-600/5",
    badge: "bg-pink-500/20 text-purple-300",
    subject: "Noticed your case study page",
    body: "Just read through your agency's case study on the SaaS client — impressive 3x growth result. Curious whether you're personalizing cold emails yourself or have something automated. Happy to share what's working for similar agencies.",
    score: 9,
  },
];


export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* Background glows */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-purple-600/15 blur-[120px]" />
            <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-pink-500/10 blur-[100px]" />
            <div className="absolute top-60 left-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/8 blur-[90px]" />
            <div className="absolute top-60 right-1/4 h-[300px] w-[300px] rounded-full bg-pink-500/8 blur-[90px]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              AI-powered cold outreach · $9.99/mo
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              <span className="text-zinc-50">Scrape any website.</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Write any cold email.</span>
            </h1>

            {/* Subtext */}
            <p className="mx-auto mt-7 max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed">
              Paste a URL → our AI reads their website, understands their
              business, and writes 3 cold emails using proven frameworks —
              PAS, Value-First, and Curiosity Gap. Each one scored for reply
              rate. No templates. No fluff.{" "}
              <span className="text-zinc-200 font-medium">Just emails that land.</span>
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3.5 text-base font-bold text-white hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(168,85,247,0.25)]"
              >
                Create Free Account →
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Create an account to get 3 free email generations — no credit card required
            </p>

            {/* AI process flow */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
              {[
                { num: "01", label: "Paste URL" },
                { num: "02", label: "AI Scrapes Site" },
                { num: "03", label: "3 Emails Written" },
                { num: "04", label: "Reply Rate Scored" },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className="flex items-center gap-3 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-6 py-3">
                    <span className="text-sm font-black text-purple-400 font-mono tracking-widest">
                      {step.num}
                    </span>
                    <span className="text-base font-semibold text-zinc-200 whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-purple-400/70 font-bold text-xl select-none">→</span>
                  )}
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { stat: "10–18%", label: "Reply Rate" },
                { stat: "3",      label: "Email Variants" },
                { stat: "10s",    label: "Per Prospect" },
                { stat: "6×",     label: "More Replies" },
              ].map(({ stat, label }) => (
                <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 text-center">
                  <p className="text-3xl font-black text-purple-400 tracking-tight">{stat}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-t border-zinc-800/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                How it works
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-50">
                Three steps. Ten seconds.
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
                No research. No templates. No wasted hours.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 hover:border-purple-500/50 transition-colors group"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                    {stepIcons[i]}
                  </div>
                  <span className="text-xs font-mono text-purple-400/70 font-bold tracking-widest">
                    {step.num}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-zinc-50">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-zinc-400 leading-relaxed text-sm">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/how-it-works"
                className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Full breakdown →
              </Link>
            </div>
          </div>
        </section>

        {/* ── WHY NOT CHATGPT ── */}
        <section className="border-t border-zinc-800/60 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                vs generic AI
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-50">
                Why not just use ChatGPT?
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
                ChatGPT writes emails. Scrapitch writes emails about <em className="not-italic text-zinc-200">your specific prospect</em>.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-zinc-900/80 border-b border-zinc-800">
                <div className="px-6 py-4 text-sm font-semibold text-zinc-500">Feature</div>
                <div className="px-6 py-4 text-sm font-bold text-purple-400 text-center border-l border-zinc-800">Scrapitch</div>
                <div className="px-6 py-4 text-sm font-semibold text-zinc-500 text-center border-l border-zinc-800">Generic AI</div>
              </div>

              {[
                "Website scraping built-in",
                "Proven cold email frameworks",
                "Reply rate scoring",
                "Cold email optimized",
                "10-second generation",
              ].map((feature, i) => (
                <div
                  key={feature}
                  className={`grid grid-cols-3 border-b border-zinc-800 last:border-0 ${i % 2 === 0 ? "bg-zinc-900/20" : "bg-transparent"}`}
                >
                  <div className="px-6 py-4 text-sm font-medium text-zinc-300">{feature}</div>
                  <div className="px-6 py-4 text-center border-l border-zinc-800">
                    <span className="text-lg font-black text-purple-400">✓</span>
                  </div>
                  <div className="px-6 py-4 text-center border-l border-zinc-800">
                    <span className="text-lg font-bold text-zinc-600">✗</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EMAIL VARIANTS PREVIEW ── */}
        <section className="border-t border-zinc-800/60 py-24 bg-zinc-900/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                3 variants, every time
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-50">
                Real emails. Real scores.
              </h2>
              <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
                This is what Scrapitch generates from a single URL.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {variants.map((v) => (
                <div
                  key={v.label}
                  className={`rounded-2xl border p-6 ${v.color}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${v.badge}`}>
                      {v.label}
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      {v.score}/10
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Subject
                  </p>
                  <p className="font-semibold text-zinc-100 mb-4 text-sm">
                    {v.subject}
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              >
                Create Free Account →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="border-t border-zinc-800/60 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                Features
              </p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-50">
                Everything you need to{" "}
                <span className="text-purple-400">close more deals</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7 hover:border-purple-500/50 transition-all group"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                    {featureIcons[i]}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-50 mb-2 group-hover:text-purple-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed flex-1">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
              Your next reply is<br />one URL away.
            </h2>
            <p className="text-lg font-medium text-white/70 mb-10">
              $9.99/mo · 3 free emails to start · Cancel anytime.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0a0a0a] px-10 py-4 text-base font-bold text-white hover:bg-zinc-900 transition-colors shadow-xl shadow-black/30"
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
