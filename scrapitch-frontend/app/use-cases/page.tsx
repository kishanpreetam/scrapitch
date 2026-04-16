import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { UseCaseCard, SendingToolGrid } from "@/components/UseCasesInteractive";

export const metadata: Metadata = {
  title: "Use Cases — Scrapitch",
  description:
    "How SDRs, agency owners, freelancers, recruiters, and founders use Scrapitch to book more meetings.",
};

const useCases = [
  {
    id: "sdr",
    audience: "SDR at a SaaS company",
    headline: "Hit your meeting quota without burning 4 hours on research",
    problem:
      "You're supposed to be selling. Instead you're reading LinkedIn profiles, Googling company news, and copying homepage copy into AI tools. The math of 80 touches a week doesn't work at 30 minutes of research per account.",
    solution:
      "Scrapitch's Research Agent compresses prospect research from 30 minutes to 10 seconds. The Writing Agent generates personalized copy. The Scoring Agent tells you which variant to send first.",
    outcomes: [
      "Research 50 accounts in the time it used to take to prep 5",
      "Emails that reference the prospect's actual language, not a template",
      "An independent Scoring Agent tells you which variant to send first",
    ],
    snippet: {
      subject: "Your onboarding flow question",
      body: "Noticed [Company] recently expanded into enterprise accounts based on your updated pricing page. Most teams at that stage hit friction around onboarding time to value. We cut that by 40% for similar SaaS teams. Worth a quick call?",
    },
    cta: "Try it for SDRs",
    accentColor: "blue",
  },
  {
    id: "agency",
    audience: "Marketing & Creative Agency Owner",
    headline: "Fill your pipeline without hiring an SDR team",
    problem:
      "You're great at delivery. You're not great at consistent outbound. The pipeline runs dry between referrals, templates feel generic, and you don't have time to personally research every prospect.",
    solution:
      "Three agents do the research. Paste your prospect's URL. Agent 1 reads their site. Agent 2 writes 3 emails that reference exactly what they do and who they serve. Agent 3 scores each one.",
    outcomes: [
      "20+ personalized emails per hour without a researcher",
      "Emails reference the prospect's real value prop and tone",
      "Test 3 frameworks without writing 3 emails from scratch",
    ],
    snippet: {
      subject: "Your ecommerce client results",
      body: "Just read through your case study on the DTC brand. Impressive 3x revenue result. Curious whether you're personalizing your own outreach or using templates. Happy to show what's working for similar agencies.",
    },
    cta: "Try it for Agency Owners",
    accentColor: "emerald",
  },
  {
    id: "freelance",
    audience: "Freelance Consultant",
    headline: "Get clients without a sales team or big budget",
    problem:
      "You're skilled at your craft but not at selling. Cold email feels cringe, every template sounds the same, and you don't have time to research each prospect from scratch.",
    solution:
      "Scrapitch levels the playing field. You get the same quality personalized outreach that big agencies use, without hiring an SDR or spending hours on manual research.",
    outcomes: [
      "Outreach that sounds like you've studied the prospect's business",
      "Takes less time than writing one email manually",
      "The Curious variant is built for solo practitioners. Feels human.",
    ],
    snippet: {
      subject: "Noticed your positioning shift",
      body: "Saw you recently repositioned from 'brand strategy' to 'revenue led brand building'. That's a sharp move for the current market. I help consultants with exactly that kind of messaging clarity. Open to a 15 minute conversation?",
    },
    cta: "Try it for Freelancers",
    accentColor: "purple",
  },
  {
    id: "recruiter",
    audience: "Recruiter reaching out to companies",
    headline: "Reach hiring managers with emails they actually read",
    problem:
      '"We specialize in placing [role] candidates" lands in the trash. Hiring managers delete 90% of recruiter emails before the second sentence. You need to sound like you\'ve done homework, not like a mass blast.',
    solution:
      "Scrapitch's Research Agent reads the company's website to understand their tech stack, culture language, team positioning, and growth signals. The Writing Agent crafts outreach that references what they actually care about.",
    outcomes: [
      'Emails that pass the "did they actually research us?" test',
      "Reference the company's real hiring context and positioning",
      "Industry specific angle: detect tech, SaaS, manufacturing, or legal automatically",
    ],
    snippet: {
      subject: "Your eng team growth signal",
      body: "Saw [Company] launched two new product lines and your engineering job board jumped from 3 to 11 open roles last month. We place senior engineers in exactly that growth stage. Worth a 10 minute call this week?",
    },
    cta: "Try it for Recruiters",
    accentColor: "purple",
  },
  {
    id: "founder",
    audience: "Founder doing their own outreach",
    headline: "Outbound that doesn't take your whole morning",
    problem:
      "You're doing everything: product, hiring, customer success, and now outbound. You know cold email works but you can't spend 45 minutes crafting a personalized pitch to one prospect.",
    solution:
      "Scrapitch gives you a founder grade cold email in 10 seconds. Paste the URL, copy the best variant, and send. The whole sequence, initial email plus 3 follow ups, is ready before your next meeting.",
    outcomes: [
      "Full outreach sequence (email plus follow ups) ready in under 2 minutes",
      "Sounds like you wrote it after reading their site carefully",
      "Handles research so you can spend your time on strategy, not writing",
    ],
    snippet: {
      subject: "Your API pricing page",
      body: "Read through your developer docs and noticed you switched to usage based pricing last quarter. Smart move for PLG. We help early stage SaaS teams with exactly that kind of growth infrastructure. Have 15 minutes this week?",
    },
    cta: "Try it for Founders",
    accentColor: "amber",
  },
];

type AccentKey = "blue" | "emerald" | "purple" | "pink" | "amber";

const accentMap: Record<
  AccentKey,
  { border: string; bg: string; badge: string; check: string; snippetBorder: string }
> = {
  blue: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    badge: "text-blue-300 bg-blue-500/20",
    check: "text-blue-400",
    snippetBorder: "border-blue-500/20",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    badge: "text-emerald-300 bg-emerald-500/20",
    check: "text-emerald-400",
    snippetBorder: "border-emerald-500/20",
  },
  purple: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    badge: "text-blue-300 bg-blue-500/20",
    check: "text-blue-400",
    snippetBorder: "border-blue-500/20",
  },
  pink: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    badge: "text-blue-300 bg-blue-500/20",
    check: "text-blue-400",
    snippetBorder: "border-blue-500/20",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    badge: "text-amber-300 bg-amber-500/20",
    check: "text-amber-400",
    snippetBorder: "border-amber-500/20",
  },
};

export default function UseCasesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── HERO ── */}
        <section className="border-b border-white/6 bg-section-alt">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-28 text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b] mb-4">
                Who it&apos;s for
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6">
                Built for everyone who <span style={{ color: "#3b82f6" }}>does outbound.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-xl text-[#a8a8a8] max-w-2xl mx-auto leading-relaxed">
                Whether you carry a quota, run an agency, or do your own outreach. Scrapitch handles the research and writing.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {useCases.map((uc) => (
                  <a
                    key={uc.id}
                    href={`#${uc.id}`}
                    className="rounded-full border border-white/12 bg-[#1c1c1c] px-4 py-1.5 text-sm font-medium text-[#d4d4d4] hover:border-white/25 hover:text-white transition-colors"
                  >
                    {uc.audience}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── USE CASE CARDS ── */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {useCases.map((uc, i) => {
                const accent = accentMap[uc.accentColor as AccentKey];
                const isEven = i % 2 === 0;
                return (
                  <div key={uc.id} id={uc.id} className="scroll-mt-24">
                    <Reveal>
                      <UseCaseCard uc={uc} accent={accent} isEven={isEven} />
                    </Reveal>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── INTEGRATIONS ── */}
        <section className="border-t border-white/6 py-24 md:py-32 bg-section-alt">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-sm font-semibold uppercase tracking-widest text-[#6b6b6b] mb-3">
                  Works everywhere
                </p>
                <h2 className="text-4xl font-black tracking-tight text-white mb-4">
                  Works with every sending tool
                </h2>
                <p className="text-[#a8a8a8] max-w-xl mx-auto">
                  Scrapitch generates plain text. Copy subject + body and paste anywhere.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <SendingToolGrid />
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 rounded-xl border border-white/8 bg-[#141414] p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-lg bg-white/8 p-2.5">
                    <svg className="w-5 h-5 text-[#a8a8a8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#f0f0f0] mb-1">No native integration needed</p>
                    <p className="text-sm text-[#a8a8a8] leading-relaxed">
                      Scrapitch generates ready to send copy. Hit copy, paste into your tool of choice. Works with Instantly, Lemlist, Apollo, Clay, Smartlead, HubSpot, Outreach, or any CSV based workflow. No Zapier, no API setup.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="border-t border-white/8 py-24 md:py-32 bg-[#111111]">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-5">
                Which one are you?
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-lg text-[#a8a8a8] mb-10 leading-relaxed">
                Doesn&apos;t matter. Scrapitch works for all of them. Completely free, no setup required.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-10 py-4 text-base font-bold text-white hover:bg-[#2563eb] transition-colors"
              >
                Get Started
              </Link>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
