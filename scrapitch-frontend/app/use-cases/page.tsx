import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    caption: "for SDRs, account execs, and founder led sales",
    problems: [
      "Generic outreach gets ignored. Prospects can spot a templated email in two seconds. Mail merge personalization is over.",
      "You don't have time to read every prospect's site, but skipping it means your email sounds like everyone else's.",
      "Your reply rate sits at 1 to 2 percent. Most prospects never even open.",
    ],
    solutions: [
      "Reads the prospect's homepage, about page, and any product or pricing pages it finds.",
      "Pulls out what they actually ship, who they serve, and their positioning in their own words.",
      "Writes three variants that quote their context, not your pitch deck.",
    ],
    email: {
      subject: "Idea for Stripe's Q2 pipeline",
      body: "Hi Patrick, noticed Stripe Atlas just expanded into three new markets this quarter. The pattern I've seen with similar geo expansions: founders need help with local payment ops they didn't know they needed. We helped two YC companies set this up last quarter, both with similar Atlas customer profiles. Worth fifteen minutes to compare notes?",
      signature: "Maya · Operator at Bridgewise",
    },
    emailMeta: "generated in 9 seconds · scored 8.7",
    cta: "Try it for sales",
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
      "LinkedIn easy apply has a 1 percent response rate. Cold emails to recruiters or hiring managers are 5x better, when written well.",
      "But every job seeker copies the same template. Recruiters get hundreds. Yours needs to feel specific in ten seconds.",
      "You can't write a custom email for every company. You're applying to twenty.",
    ],
    solutions: [
      "Reads the company's careers page, engineering blog, and product pages.",
      "Pulls out the team's actual work, recent launches, and stated challenges.",
      "Writes a short email referencing their work, framing your fit in their language.",
    ],
    email: {
      subject: "Saw your team's recent vector store launch",
      body: "Hi Anjali, your blog post on rebuilding the vector search layer at Notion caught me. The hybrid approach with metadata filtering matches what I shipped at my last role on a smaller scale. I'm exploring infra leaning ML roles. If your team is hiring or about to, I'd love fifteen minutes to learn what you're building next.",
      signature: "Kishan · github.com/kishanpreetam",
    },
    emailMeta: "generated in 9 seconds · scored 8.7",
    cta: "Try it for job hunting",
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
      "Generic 'I'm interested in your research' emails get deleted. Professors can tell when you haven't read their work.",
      "Reading every faculty page for every program you're applying to is unrealistic. You have a list of fifteen.",
      "Your application is competing with hundreds of others. A real connection with a professor moves you up the stack.",
    ],
    solutions: [
      "Reads the professor's lab page, faculty bio, and any recent publication abstracts it finds linked.",
      "Pulls out their actual research focus and recent paper themes.",
      "Writes an email that engages with one specific paper or project, with a clear ask.",
    ],
    email: {
      subject: "Question about your CRISPR delivery paper",
      body: "Dear Professor Chen, your 2025 paper on lipid nanoparticle delivery for in vivo gene editing answered something I've been thinking about since my undergrad capstone on CRISPR off target effects. The endosomal escape problem you raised at the end resonated. I'm applying to your program for fall 2026 and would value fifteen minutes to discuss whether my background fits your current lab directions.",
      signature: "Kishan · Northeastern '25",
    },
    emailMeta: "generated in 9 seconds · scored 8.7",
    cta: "Try it for grad outreach",
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
    caption: "for early stage founders pitching investors, partners, hires",
    problems: [
      "Investors get hundreds of cold emails a week. Generic pitches don't make it past their EA.",
      "You can't pay a research firm to brief you on every fund partner. You have a list of forty.",
      "A specific reference to their thesis or recent investment shows you did the work and respect their time.",
    ],
    solutions: [
      "Reads the fund's website, the partner's bio page, and any portfolio or thesis content it finds.",
      "Pulls out their stated focus areas, recent bets, and stated check size.",
      "Writes a short email referencing their thesis, framed around your traction.",
    ],
    email: {
      subject: "Noticed your bet on developer infrastructure",
      body: "Hi Sarah, your portfolio's leaned heavily into developer tools for AI native workflows. We're seeing the same gap your thesis hints at: existing platforms don't handle the agent to agent handoff well. We've shipped a working version with 200 paying teams in six months. Would you have fifteen minutes to look at where we're heading?",
      signature: "Kishan · founder, Scrapitch",
    },
    emailMeta: "generated in 9 seconds · scored 8.7",
    cta: "Try it for executive outreach",
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
    caption: "for coffee chats, alumni intros, conference follow ups",
    problems: [
      "Most networking emails read like sales pitches. The asker wants something. The reader can tell.",
      "You met someone at a conference, exchanged cards, and now you're staring at a blank email a week later.",
      "The line between asking for time and feeling presumptuous is thinner than people admit.",
    ],
    solutions: [
      "Reads their personal site, company page, or any publicly visible LinkedIn profile.",
      "Pulls out what they're working on right now and any recent talks or posts.",
      "Writes a short, warm email that references something specific and asks for a small, defined thing.",
    ],
    email: {
      subject: "Coffee chat after your talk at Lattice",
      body: "Hi Diego, your talk on rebuilding the perf review system landed. The line about replacing rubrics with stories stuck with me. I'm rebuilding something similar at my org and would love fifteen minutes whenever it works. Coffee on me, or just a video call if easier.",
      signature: "Kishan · north end, boston",
    },
    emailMeta: "generated in 9 seconds · scored 8.7",
    cta: "Try it for networking",
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
            see a longer example
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
          Same engine, different framing per use case. Pick yours.
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
            ten second
          </em>{" "}
          flow.
        </h2>

        <p
          style={{
            fontSize: 17,
            color: "#8a8a85",
            lineHeight: 1.5,
            maxWidth: 460,
            margin: "0 auto 36px",
          }}
        >
          Paste a URL. Pick a use case. Send the email.
        </p>

        <div className="flex items-center justify-center">
          <Link
            href="/generator"
            className="hover:underline"
            style={{
              color: "#3b82f6",
              fontWeight: 500,
              fontSize: 17,
              textDecoration: "none",
            }}
          >
            Try it free
          </Link>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: 1,
              height: 12,
              background: "#3a3328",
              margin: "0 20px",
            }}
          />
          <Link
            href="/how-it-works"
            className="hover:text-[#3b82f6] transition-colors"
            style={{
              color: "#f5f5f0",
              fontWeight: 500,
              fontSize: 17,
              textDecoration: "none",
            }}
          >
            See how it works
          </Link>
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
