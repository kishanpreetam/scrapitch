import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DualCta from "@/components/DualCta";

export const metadata: Metadata = {
  title: "Use cases — Scrapitch",
  description:
    "Five ways to use Scrapitch: sales, jobs, graduate outreach, founder fundraising, and networking. One engine, five framings.",
};

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

type Bg = "dark" | "light";

type UseCaseData = {
  n: string;
  eyebrow: string;
  bg: Bg;
  title: { before: string; italic: string; after: string };
  caption: string;
  problems: [string, string, string];
  solutions: [string, string, string];
  email: { subject: string; body: string; signature: string };
  emailMeta: string;
  cta: string;
  secondaryCaption: string;
};

const USE_CASES: UseCaseData[] = [
  {
    n: "01",
    eyebrow: "for sales",
    bg: "dark",
    title: {
      before: "Quote ",
      italic: "their",
      after: " case studies. Not your features.",
    },
    caption: "for SDRs, account execs, and founder-led sales",
    problems: [
      "Your prospect read 40 cold emails this week. Yours has eight seconds to feel different before they archive it.",
      "You can't research every prospect. But every prospect you don't research sounds like every other email in the inbox.",
      "Templates feel safe and convert at 1 percent. Specificity feels risky and converts at 8.",
    ],
    solutions: [
      "Reads the prospect's homepage, product pages, and any case studies it finds.",
      "Pulls out their actual customers, their positioning language, their recent launches.",
      "Writes three variants that quote their context, not your pitch deck.",
    ],
    email: {
      subject: "Idea for Linear's enterprise pipeline",
      body: "Hi Karri, noticed Linear just rolled out the Asks integration to enterprise customers this month. The pattern I've seen with that kind of release: the AE team starts hearing 'can it also do X' from existing accounts, and the answer becomes a roadmap problem fast. We built a tool that turns those conversational asks into structured product feedback. Helped Notion's AE team last quarter cut the time from 'customer asked' to 'on the roadmap' from 6 weeks to 11 days. Worth fifteen minutes to see if it'd help here?",
      signature: "Maya · Operator at Bridgewise",
    },
    emailMeta: "generated in 8 seconds · scored 9.1",
    cta: "Try it for sales",
    secondaryCaption: "or scroll to see a job-seeker example",
  },
  {
    n: "02",
    eyebrow: "for job seekers",
    bg: "light",
    title: {
      before: "Cold emails recruiters ",
      italic: "actually",
      after: " open.",
    },
    caption: "for engineers, designers, analysts, and PMs",
    problems: [
      "LinkedIn easy-apply has a 1 percent response rate. A good cold email is 5 to 10x that.",
      "But every applicant uses the same template the same career service handed out. The recruiter can spot it in 4 seconds.",
      "You're applying to twenty companies. Researching every one of them on top of doing your current job is not a real plan.",
    ],
    solutions: [
      "Reads the company's careers page, engineering blog, and any product launches it finds.",
      "Pulls out the team's actual work, recent shipments, and stated challenges.",
      "Writes a short email that references their work and maps your fit in their language.",
    ],
    email: {
      subject: "Saw your team's vector store rewrite",
      body: "Hi Anjali, your blog post on rebuilding the vector search layer at Notion caught me. The hybrid approach with metadata filtering matches what I shipped at my last role on a smaller scale: I rewrote our document retrieval to use a similar pattern and cut p99 latency by 40 percent. I'm exploring infra-leaning ML roles. If your team is hiring or about to, I'd love fifteen minutes to learn what you're building next.",
      signature: "Kishan · github.com/kishanpreetam",
    },
    emailMeta: "generated in 9 seconds · scored 9.3",
    cta: "Try it for job hunting",
    secondaryCaption: "or see a grad school example below",
  },
  {
    n: "03",
    eyebrow: "for graduate outreach",
    bg: "dark",
    title: {
      before: "Email professors about ",
      italic: "their",
      after: " actual research.",
    },
    caption: "for master's and PhD applicants reaching out to labs",
    problems: [
      "A professor gets 30 to 80 prospective student emails a month. They open the ones that prove the sender read their work.",
      "Reading every faculty page across fifteen programs you're applying to is unrealistic. You have classes.",
      "The 'I'm interested in your research' email gets deleted in 3 seconds. The 'I read your 2025 paper on X and had a question about Y' email gets a reply.",
    ],
    solutions: [
      "Reads the professor's lab page, faculty bio, and any abstracts or projects linked there.",
      "Pulls out their stated research focus, recent paper themes, and ongoing projects.",
      "Writes an email engaging with one specific paper or project, with a clear ask.",
    ],
    email: {
      subject: "Question about your CRISPR delivery paper",
      body: "Dear Professor Chen, your 2025 paper on lipid nanoparticle delivery for in vivo gene editing answered something I've been wrestling with since my undergrad capstone on off-target effects. The endosomal escape problem you raised at the end, in particular: have you explored whether targeted ligand conjugation might shift the escape efficiency, or is that already in scope for your current lab? I'm applying to your Computational Biology PhD program for fall 2026 and would value fifteen minutes to discuss whether my background fits your current directions.",
      signature: "Kishan, Northeastern MS Analytics '25",
    },
    emailMeta: "generated in 11 seconds · scored 9.4",
    cta: "Try it for grad outreach",
    secondaryCaption: "or see a founder example below",
  },
  {
    n: "04",
    eyebrow: "for founders",
    bg: "light",
    title: {
      before: "Reach the ",
      italic: "operator",
      after: ". Skip the assistant.",
    },
    caption: "for early-stage founders pitching investors, partners, hires",
    problems: [
      "A VC partner gets 200 to 500 cold pitches a week. Their EA filters most. Their inbox folder eats the rest.",
      "Generic 'I'd love to share what we're building' emails go nowhere. A specific reference to their thesis or recent investment proves you respect their time.",
      "You don't have a research firm to brief you on every partner across forty firms on your list.",
    ],
    solutions: [
      "Reads the fund's website, the partner's bio, and any portfolio or thesis content.",
      "Pulls out their stated focus, recent bets, check size, and conviction language.",
      "Writes a short email referencing their thesis, framed around your traction.",
    ],
    email: {
      subject: "Noticed your bet on developer infrastructure",
      body: "Hi Sarah, your portfolio's leaned hard into developer tools for AI-native workflows: Hex, Modal, Wandb. Scrapitch sits at exactly that intersection: free tool for personalized outreach, three-agent pipeline, sub-ten-second generation. We've hit 1,200 generations a day in the first month with zero paid acquisition. The pattern you wrote about in your AI-native developer thesis last quarter, the one about consumer-grade UX being the new moat, that's what we're chasing. Would you have fifteen minutes to look at where we're heading?",
      signature: "Kishan · founder, Scrapitch",
    },
    emailMeta: "generated in 9 seconds · scored 8.9",
    cta: "Try it for executive outreach",
    secondaryCaption: "or see a networking example below",
  },
  {
    n: "05",
    eyebrow: "for networking",
    bg: "dark",
    title: {
      before: "Sound like a ",
      italic: "person",
      after: ". Not a pitch.",
    },
    caption: "for coffee chats, alumni intros, conference followups",
    problems: [
      "The strongest networking emails reference a specific thing the recipient did or said. The weakest ones just ask for time.",
      "You met someone at a conference, exchanged cards, and a week later you're staring at a blank compose window.",
      "The line between 'asking for time' and 'feeling presumptuous' is thinner than people admit. Specificity is what makes it work.",
    ],
    solutions: [
      "Reads their personal site, company page, or public profile if available.",
      "Pulls out what they're working on, any recent talks they've given, any posts they've published.",
      "Writes a short, warm email that references something specific and asks for a small, defined thing.",
    ],
    email: {
      subject: "Coffee chat after your talk at Lattice",
      body: "Hi Diego, your talk on rebuilding perf reviews landed. The line about replacing rubrics with stories stuck with me, especially the part about engineering managers being uncomfortable with narrative until they realized rubrics were just narrative with worse signal. I'm rebuilding something similar at my org right now and the same uncomfortable conversations are happening. Would love fifteen minutes whenever it works for you. Coffee on me if you're in Boston, or just a video call if easier.",
      signature: "Kishan · north end, boston",
    },
    emailMeta: "generated in 7 seconds · scored 9.0",
    cta: "Try it for networking",
    secondaryCaption: "or scroll up to revisit a use case",
  },
];

function palette(bg: Bg) {
  const isDark = bg === "dark";
  return {
    isDark,
    bg: isDark ? "#0a0a0a" : "#faf8f5",
    text: isDark ? "#f5f5f0" : "#1a1612",
    muted: isDark ? "#8a8a85" : "#6e6657",
    mutedSoft: isDark ? "#9a9a92" : "#6e6657",
    line: isDark ? "#2c241c" : "#d8d0bd",
    italic: isDark ? "#c9b896" : "#b89968",
    caption: "#8a7d63",
    cardBg: isDark ? "#111111" : "#ffffff",
    cardBorder: isDark ? "#1c1c1c" : "#e8e0cd",
    cardSig: isDark ? "#8a8a85" : "#6e6657",
  };
}

function UseCaseSection({ uc }: { uc: UseCaseData }) {
  const c = palette(uc.bg);

  return (
    <section
      style={{
        background: c.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div className="w-full mx-auto px-6" style={{ maxWidth: 900 }}>
        <div style={{ height: 1, background: c.line, marginBottom: 48 }} />

        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: c.muted,
            letterSpacing: "0.04em",
            marginBottom: 24,
          }}
        >
          {uc.n} · {uc.eyebrow}
        </p>

        <h2
          style={{
            fontSize: "clamp(40px, 5vw, 56px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: c.text,
            marginBottom: 18,
            maxWidth: 760,
          }}
        >
          {uc.title.before}
          <em
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              color: c.italic,
            }}
          >
            {uc.title.italic}
          </em>
          {uc.title.after}
        </h2>

        <p
          style={{
            fontFamily: SERIF_STACK,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 16,
            color: c.caption,
            letterSpacing: "0.01em",
            marginBottom: 64,
          }}
        >
          {uc.caption}
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 56 }}
        >
          {/* LEFT: problem + solution */}
          <div>
            <p
              className="font-mono"
              style={{
                fontSize: 10,
                color: c.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              the problem
            </p>
            <div style={{ marginBottom: 40 }}>
              {uc.problems.map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 16,
                    color: c.mutedSoft,
                    lineHeight: 1.6,
                    marginBottom: i < uc.problems.length - 1 ? 16 : 0,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>

            <p
              className="font-mono"
              style={{
                fontSize: 10,
                color: c.muted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 0,
              }}
            >
              what scrapitch does
            </p>
            <div>
              {uc.solutions.map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      height: 1,
                      background: c.line,
                      marginTop: 16,
                      marginBottom: 16,
                    }}
                  />
                  <p
                    style={{
                      fontSize: 16,
                      color: c.text,
                      lineHeight: 1.55,
                      fontWeight: 400,
                    }}
                  >
                    {s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: email mockup */}
          <div>
            <div
              style={{
                background: c.cardBg,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: 8,
                padding: 24,
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: c.text,
                  lineHeight: 1.4,
                  marginBottom: 14,
                }}
              >
                {uc.email.subject}
              </p>
              <div
                style={{
                  borderTop: `1px solid ${c.cardBorder}`,
                  paddingTop: 14,
                  marginBottom: 14,
                }}
              />
              <p
                style={{
                  fontSize: 14,
                  color: c.text,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {uc.email.body}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: c.cardSig,
                  lineHeight: 1.5,
                }}
              >
                {uc.email.signature}
              </p>
            </div>
            <p
              className="font-mono"
              style={{
                fontSize: 10,
                color: c.muted,
                letterSpacing: "0.04em",
                marginTop: 14,
              }}
            >
              {uc.emailMeta}
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: 20, marginTop: 64, marginBottom: 48 }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#3b82f6",
              }}
            />
            <Link
              href="/generator"
              className="hover:underline"
              style={{
                color: "#3b82f6",
                fontWeight: 500,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              {uc.cta}
            </Link>
          </div>
          <span
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 14,
              color: c.caption,
              letterSpacing: "0.01em",
            }}
          >
            {uc.secondaryCaption}
          </span>
        </div>

        <div style={{ height: 1, background: c.line }} />
      </div>
    </section>
  );
}

function HeaderSection() {
  return (
    <section
      style={{
        background: "#0a0a0a",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 160,
        paddingBottom: 80,
      }}
    >
      <div
        className="w-full mx-auto px-6 text-center"
        style={{ maxWidth: 720 }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: "#8a8a85",
            letterSpacing: "0.04em",
            marginBottom: 24,
          }}
        >
          five ways to use scrapitch
        </p>

        <div
          style={{
            height: 1,
            background: "#2c241c",
            width: 64,
            margin: "0 auto 40px",
          }}
        />

        <h1
          style={{
            fontSize: "clamp(44px, 5.5vw, 64px)",
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: "-0.028em",
            color: "#f5f5f0",
            marginBottom: 20,
          }}
        >
          One tool.{" "}
          <em
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              color: "#c9b896",
            }}
          >
            Five
          </em>{" "}
          kinds of email.
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "#8a8a85",
            lineHeight: 1.5,
            maxWidth: 480,
            margin: "0 auto 40px",
          }}
        >
          The engine is the same. The framing changes per use case. Pick yours.
        </p>

        <div
          style={{
            height: 1,
            background: "#2c241c",
            width: 64,
            margin: "0 auto",
          }}
        />
      </div>
    </section>
  );
}

function FooterCtaSection() {
  return (
    <section
      style={{
        background: "#0a0a0a",
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div
        className="w-full mx-auto px-6 text-center"
        style={{ maxWidth: 720 }}
      >
        <div
          style={{
            height: 1,
            background: "#2c241c",
            width: 64,
            margin: "0 auto 48px",
          }}
        />

        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: "#8a8a85",
            letterSpacing: "0.04em",
            marginBottom: 24,
          }}
        >
          pick yours
        </p>

        <h2
          style={{
            fontSize: "clamp(40px, 5vw, 56px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: "#f5f5f0",
            marginBottom: 20,
          }}
        >
          Five flavors. One{" "}
          <em
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              color: "#c9b896",
            }}
          >
            ten-second
          </em>{" "}
          flow.
        </h2>

        <p
          style={{
            fontSize: 17,
            color: "#8a8a85",
            lineHeight: 1.5,
            maxWidth: 460,
            margin: "0 auto 20px",
          }}
        >
          Paste a URL. Pick a use case. Send the email.
        </p>

        <p
          style={{
            fontFamily: SERIF_STACK,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 14,
            color: "#8a7d63",
            letterSpacing: "0.01em",
            marginBottom: 36,
          }}
        >
          ten seconds, on average
        </p>

        <div className="w-full max-w-[320px] mx-auto md:max-w-none">
          <DualCta
            primary={{ href: "/generator", label: "Try it free" }}
            secondary={{ href: "/how-it-works", label: "See how it works" }}
          />
        </div>

        <div
          style={{
            height: 1,
            background: "#2c241c",
            width: 64,
            margin: "48px auto 0",
          }}
        />
      </div>
    </section>
  );
}

export default function UseCasesPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <HeaderSection />
        {USE_CASES.map((uc) => (
          <UseCaseSection key={uc.n} uc={uc} />
        ))}
        <FooterCtaSection />
      </main>
      <Footer />
    </>
  );
}
