import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use Cases — Scrapitch",
  description:
    "How agency owners, SDRs, freelancers, and consultants use Scrapitch to book more meetings with personalized cold email.",
};

const useCases = [
  {
    icon: "🏢",
    audience: "Agency Owners",
    headline: "Fill your pipeline without hiring more SDRs",
    pain: "You're good at delivery. You're not good at consistent outbound. Your pipeline runs dry between referrals, you hate writing cold email, and every template sounds the same.",
    solution: "Scrapitch does the research for you. Paste your prospect's URL, get 3 emails that reference exactly what they do and who they serve — personalized without the manual work.",
    outcomes: [
      "20+ personalized outreach emails per hour",
      "Emails that reference their actual value prop, not a generic pitch",
      "3 frameworks to A/B test without writing 3 emails from scratch",
    ],
    quote: "I sent 40 personalized cold emails in 2 hours. Booked 4 calls that week. My old rate was 1 call per 100 emails.",
    quoteName: "Alex R., Growth Agency Owner",
  },
  {
    icon: "📞",
    audience: "SDRs & Sales Reps",
    headline: "Hit quota without 4 hours of daily research",
    pain: "You're spending more time researching prospects than actually selling. The CRM says you need 80 touches a week. Quality research takes 30 minutes per account. The math doesn't work.",
    solution: "Scrapitch compresses prospect research from 30 minutes to 10 seconds. You get personalized email copy that sounds like you researched all day — because the AI did.",
    outcomes: [
      "Research 50 accounts in the time it used to take for 5",
      "Emails that pass the 'did they actually read my website?' test",
      "Scoring system shows which emails to prioritize",
    ],
    quote: "My manager thought I was doing deep research on every account. I was using Scrapitch. Reply rate went from 4% to 11%.",
    quoteName: "Priya K., SDR at Series B SaaS",
  },
  {
    icon: "💼",
    audience: "Freelancers",
    headline: "Get clients without a sales team or big budget",
    pain: "You're great at your craft. You're not great at selling. Cold email feels cringe, your outreach sounds generic, and you don't have time to research every prospect.",
    solution: "Scrapitch levels the playing field. You get the same personalized outreach that big agencies use — without an SDR team, a researcher, or a copywriter on retainer.",
    outcomes: [
      "Sound like you actually know your prospect's business",
      "$9.99/mo vs $5k/month for a fractional SDR",
      "3 email frameworks means you're not sending the same angle to everyone",
    ],
    quote: "As a solo designer, I can now do outbound that doesn't feel embarrassing. I closed a $12k project from a cold email Scrapitch helped me write.",
    quoteName: "Tom V., Freelance Brand Designer",
  },
  {
    icon: "🎯",
    audience: "Consultants",
    headline: "Engage decision-makers with emails that get read",
    pain: "C-suite buyers delete 95% of cold emails before the second sentence. Generic intros about 'helping companies like yours' get filtered by trained buyers who read 100 pitches a week.",
    solution: "Scrapitch generates emails that reference the specific language, priorities, and positioning of your prospect's company — so it reads like a warm intro, not a spray-and-pray blast.",
    outcomes: [
      "Emails that pass the 'is this person actually relevant to us?' test",
      "Curiosity Gap variant is purpose-built for senior buyer outreach",
      "Score reasoning helps you understand what to tweak before sending",
    ],
    quote: "I sold a $50k consulting engagement off a cold email that Scrapitch generated. The client literally said 'it felt like you'd already done homework on us'.",
    quoteName: "Sarah M., Strategy Consultant",
  },
];

const integrations = [
  { name: "Instantly", desc: "Paste subject + body into campaign sequences" },
  { name: "Lemlist", desc: "Use in personalization variables or direct copy" },
  { name: "Apollo", desc: "Drop into manual tasks or sequence steps" },
  { name: "Clay", desc: "Pair with Clay enrichment for full personalization" },
  { name: "Smartlead", desc: "Use across multiple sending accounts" },
  { name: "Any tool", desc: "Plain text output works anywhere" },
];

export default function UseCasesPage() {
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
              Who it&apos;s for
            </p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-50 mb-6">
              Built for people who
              <br />
              <span className="text-purple-400">hate writing cold email</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re running an agency, carrying a quota, going
              solo, or selling a consulting retainer — Scrapitch handles the
              personalization so you can focus on the conversation.
            </p>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            {useCases.map((uc, i) => (
              <div
                key={uc.audience}
                className={`rounded-3xl border border-zinc-800 overflow-hidden grid lg:grid-cols-2 ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
              >
                {/* Content */}
                <div className={`p-10 lg:p-12 ${i % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{uc.icon}</span>
                    <span className="text-sm font-semibold uppercase tracking-widest text-purple-400">
                      {uc.audience}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-50 mb-4">
                    {uc.headline}
                  </h2>
                  <p className="text-zinc-500 leading-relaxed mb-5 text-sm">
                    <strong className="text-zinc-400">The problem:</strong>{" "}
                    {uc.pain}
                  </p>
                  <p className="text-zinc-400 leading-relaxed mb-6 text-sm">
                    <strong className="text-zinc-300">How Scrapitch helps:</strong>{" "}
                    {uc.solution}
                  </p>
                  <ul className="space-y-2 mb-8">
                    {uc.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="text-purple-400 mt-0.5 shrink-0">✓</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/generator"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-[#0a0a0a] hover:opacity-90 transition-opacity"
                  >
                    Try it now →
                  </Link>
                </div>

                {/* Quote panel */}
                <div className={`bg-zinc-900/60 border-l border-zinc-800 p-10 lg:p-12 flex flex-col justify-center ${i % 2 === 1 ? "lg:col-start-1 lg:row-start-1 border-l-0 border-r border-zinc-800" : ""}`}>
                  <div className="text-4xl text-purple-400/30 font-serif mb-4 leading-none">&ldquo;</div>
                  <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                    {uc.quote}
                  </p>
                  <p className="text-sm font-semibold text-zinc-500">
                    — {uc.quoteName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integrations */}
        <section className="border-t border-zinc-800/60 py-24 bg-zinc-900/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">
                Works with your stack
              </p>
              <h2 className="text-4xl font-black tracking-tight text-zinc-50">
                Paste into any sending tool
              </h2>
              <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
                Scrapitch generates plain text. Copy the subject + body and paste
                it anywhere.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((int) => (
                <div
                  key={int.name}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-start gap-4"
                >
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-300">
                    {int.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm mb-0.5">
                      {int.name}
                    </p>
                    <p className="text-xs text-zinc-500">{int.desc}</p>
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
              Which one are you?
            </h2>
            <p className="text-zinc-400 mb-8">
              Doesn&apos;t matter. Scrapitch works for all of them. $9.99/mo,
              cancel anytime.
            </p>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3.5 text-base font-bold text-[#0a0a0a] hover:opacity-90 transition-opacity"
            >
              Start free →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
