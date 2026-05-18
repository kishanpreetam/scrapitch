import Link from "next/link";
import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

type Bg = "dark" | "light";

type UseCase = {
  n: string;
  eyebrow: string;
  bg: Bg;
  headline: { before: string; italic: string; after: string };
  subhead: string;
  caption: string;
  subject: string;
  cta: string;
};

const USE_CASES: UseCase[] = [
  {
    n: "01",
    eyebrow: "for sales",
    bg: "dark",
    headline: {
      before: "Quote ",
      italic: "their",
      after: " case studies. Not your features.",
    },
    subhead: "Outreach that sounds like you read the homepage. Because it did.",
    caption: "for founders, account execs, and SDRs",
    subject: "Idea for Stripe's Q2 pipeline",
    cta: "Try it for sales",
  },
  {
    n: "02",
    eyebrow: "for job seekers",
    bg: "light",
    headline: {
      before: "Cold emails recruiters ",
      italic: "actually",
      after: " open.",
    },
    subhead:
      "Mention the team's real work, the actual product, the exact problem.",
    caption: "for engineers, designers, and analysts",
    subject: "Saw your team's launch this week",
    cta: "Try it for job hunting",
  },
  {
    n: "03",
    eyebrow: "for graduate outreach",
    bg: "dark",
    headline: {
      before: "Email professors about ",
      italic: "their",
      after: " research.",
    },
    subhead:
      "Scrapitch reads their lab page and shapes your email around what they actually publish.",
    caption: "for master's and PhD applicants",
    subject: "Question about your CRISPR paper",
    cta: "Try it for grad outreach",
  },
  {
    n: "04",
    eyebrow: "for founders",
    bg: "light",
    headline: {
      before: "Reach the ",
      italic: "operator",
      after: ". Skip the assistant.",
    },
    subhead:
      "Personalized outreach to execs and investors, grounded in what they ship.",
    caption: "for early stage founders and angels",
    subject: "Noticed your latest portfolio bet",
    cta: "Try it for executive outreach",
  },
  {
    n: "05",
    eyebrow: "for networking",
    bg: "dark",
    headline: {
      before: "Sound like a ",
      italic: "person",
      after: ". Not a pitch.",
    },
    subhead: "Coffee chats, alumni intros, conference follow ups.",
    caption: "for warm intros and reconnections",
    subject: "Coffee chat after your talk",
    cta: "Try it for networking",
  },
];

function UseCasePanel({ uc }: { uc: UseCase }) {
  const isDark = uc.bg === "dark";
  const bg = isDark ? "#0a0a0a" : "#faf8f5";
  const text = isDark ? "#f5f5f0" : "#1a1612";
  const muted = isDark ? "#8a8a85" : "#6e6657";
  const line = isDark ? "#2c241c" : "#d8d0bd";
  const italicColor = isDark ? "#c9b896" : "#b89968";
  const captionColor = "#8a7d63";
  const cardBg = isDark ? "#111111" : "#ffffff";
  const cardBorder = isDark ? "#1c1c1c" : "#e8e0cd";
  const cardSubject = isDark ? "#f5f5f0" : "#1a1612";
  const cardLabel = isDark ? "#6e6657" : "#8a8a85";

  return (
    <section
      style={{
        background: bg,
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 96,
        paddingBottom: 96,
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
            color: muted,
            letterSpacing: "0.04em",
            marginBottom: 18,
          }}
        >
          {uc.n} · {uc.eyebrow}
        </p>

        <div
          style={{
            height: 1,
            background: line,
            width: 64,
            margin: "0 auto 40px",
          }}
        />

        <h2
          style={{
            fontSize: "clamp(36px, 4.5vw, 52px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: text,
            marginBottom: 20,
          }}
        >
          {uc.headline.before}
          <em
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              color: italicColor,
            }}
          >
            {uc.headline.italic}
          </em>
          {uc.headline.after}
        </h2>

        <p
          style={{
            fontSize: 17,
            lineHeight: 1.5,
            color: muted,
            maxWidth: 480,
            margin: "0 auto 24px",
          }}
        >
          {uc.subhead}
        </p>

        <p
          style={{
            fontFamily: SERIF_STACK,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 14,
            color: captionColor,
            letterSpacing: "0.01em",
            marginBottom: 36,
          }}
        >
          {uc.caption}
        </p>

        <div
          className="mx-auto text-left"
          style={{
            maxWidth: 420,
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 4,
            padding: 16,
            marginBottom: 36,
          }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: 10,
              color: cardLabel,
              letterSpacing: "0.04em",
              marginBottom: 8,
            }}
          >
            subject
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: cardSubject,
              lineHeight: 1.4,
            }}
          >
            {uc.subject}
          </p>
        </div>

        <div className="flex items-center justify-center" style={{ gap: 8 }}>
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

        <div
          style={{
            height: 1,
            background: line,
            width: 64,
            margin: "40px auto 0",
          }}
        />
      </div>
    </section>
  );
}

type PipelineCard = {
  n: string;
  title: { before: string; italic: string };
  body: string;
};

const PIPELINE_CARDS: PipelineCard[] = [
  {
    n: "01",
    title: { before: "Research ", italic: "Analyst" },
    body: "Scrapes the prospect's site and pulls structured signal: what they do, who they serve, what they ship.",
  },
  {
    n: "02",
    title: { before: "Email ", italic: "Writer" },
    body: "Drafts three variants using proven frameworks. Strict word ceilings. Zero fabricated details.",
  },
  {
    n: "03",
    title: { before: "Scoring ", italic: "Judge" },
    body: "Grades each email on six factors: personalization, length, single ask, problem framing, subject line, spam signals.",
  },
];

function PipelineSection() {
  return (
    <section
      style={{
        background: "#0a0a0a",
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div className="w-full mx-auto px-6" style={{ maxWidth: 1100 }}>
        <div style={{ height: 1, background: "#2c241c", marginBottom: 56 }} />

        <div className="text-center" style={{ marginBottom: 64 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 11,
              color: "#8a8a85",
              letterSpacing: "0.04em",
              marginBottom: 24,
            }}
          >
            the pipeline
          </p>
          <h2
            style={{
              fontSize: "clamp(40px, 5.5vw, 56px)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#f5f5f0",
              marginBottom: 20,
            }}
          >
            One URL in.{" "}
            <em
              style={{
                fontFamily: SERIF_STACK,
                fontStyle: "italic",
                fontWeight: 400,
                color: "#c9b896",
              }}
            >
              Three
            </em>{" "}
            drafts out.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#8a8a85",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Three specialist agents do the work. You read the result.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PIPELINE_CARDS.map((c) => (
            <div
              key={c.n}
              style={{
                background: "#0f0d0a",
                border: "1px solid #1c1812",
                borderRadius: 8,
                padding: 32,
              }}
            >
              <p
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: "#c9b896",
                  letterSpacing: "0.04em",
                  marginBottom: 24,
                }}
              >
                {c.n}
              </p>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#f5f5f0",
                  marginBottom: 12,
                  letterSpacing: "-0.01em",
                }}
              >
                {c.title.before}
                <em
                  style={{
                    fontFamily: SERIF_STACK,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#c9b896",
                  }}
                >
                  {c.title.italic}
                </em>
              </h3>
              <p style={{ fontSize: 15, color: "#9a9a92", lineHeight: 1.6 }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "#2c241c", marginTop: 80 }} />
      </div>
    </section>
  );
}

type ComparisonRow = {
  label: string;
  other: string;
  scrapitch: string;
};

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Source of personalization",
    other: "A CSV column",
    scrapitch: "The prospect's live site",
  },
  {
    label: "Research time",
    other: "You do it",
    scrapitch: "Ten seconds, automated",
  },
  {
    label: "Variants per prospect",
    other: "One",
    scrapitch: "Three, each a different framework",
  },
  {
    label: "Quality check",
    other: "Re-read it yourself",
    scrapitch: "Six-factor scoring",
  },
  {
    label: "Use cases",
    other: "B2B sales",
    scrapitch: "Sales, jobs, grad school, founders, networking",
  },
  {
    label: "Cost",
    other: "Subscription",
    scrapitch: "Free",
  },
];

function ComparisonSection() {
  return (
    <section
      style={{
        background: "#faf8f5",
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div className="w-full mx-auto px-6" style={{ maxWidth: 900 }}>
        <div style={{ height: 1, background: "#d8d0bd", marginBottom: 56 }} />

        <div className="text-center" style={{ marginBottom: 56 }}>
          <p
            className="font-mono"
            style={{
              fontSize: 11,
              color: "#6e6657",
              letterSpacing: "0.04em",
              marginBottom: 24,
            }}
          >
            the difference
          </p>
          <h2
            style={{
              fontSize: "clamp(40px, 5.5vw, 56px)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#1a1612",
              marginBottom: 20,
            }}
          >
            Personalized from{" "}
            <em
              style={{
                fontFamily: SERIF_STACK,
                fontStyle: "italic",
                fontWeight: 400,
                color: "#b89968",
              }}
            >
              their
            </em>{" "}
            site. Not your spreadsheet.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#6e6657",
              maxWidth: 580,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Other AI tools fill a template with name and company. Scrapitch
            reads the actual site.
          </p>
        </div>

        <div>
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{
              paddingTop: 16,
              paddingBottom: 16,
              borderBottom: "1px solid #d8d0bd",
              gap: 16,
            }}
          >
            <div></div>
            <div
              className="font-mono"
              style={{
                fontSize: 14,
                color: "#6e6657",
                letterSpacing: "0.04em",
              }}
            >
              Other AI tools
            </div>
            <div
              className="font-mono flex items-center"
              style={{
                gap: 8,
                fontSize: 14,
                color: "#1a1612",
                letterSpacing: "0.04em",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#b89968",
                }}
              />
              <span>Scrapitch</span>
            </div>
          </div>

          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-1 md:grid-cols-3"
              style={{
                paddingTop: 20,
                paddingBottom: 20,
                gap: 16,
                borderBottom:
                  i < COMPARISON_ROWS.length - 1
                    ? "1px solid #d8d0bd"
                    : "none",
              }}
            >
              <div
                style={{ fontSize: 16, fontWeight: 500, color: "#1a1612" }}
              >
                {row.label}
              </div>
              <div style={{ fontSize: 16, color: "#6e6657" }}>{row.other}</div>
              <div
                style={{ fontSize: 16, fontWeight: 500, color: "#1a1612" }}
              >
                {row.scrapitch}
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "#d8d0bd", marginTop: 56 }} />
      </div>
    </section>
  );
}

function FinalCtaSection() {
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
            margin: "0 auto 56px",
          }}
        />

        <h2
          style={{
            fontSize: "clamp(44px, 5vw, 60px)",
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: "#f5f5f0",
            marginBottom: 24,
          }}
        >
          Stop writing cold emails{" "}
          <em
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              color: "#c9b896",
            }}
          >
            alone
          </em>
          .
        </h2>

        <p
          style={{
            fontSize: 17,
            color: "#8a8a85",
            lineHeight: 1.5,
            maxWidth: 420,
            margin: "0 auto 20px",
          }}
        >
          Paste a URL. Get three drafts. Send the best one.
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
          no card, no setup, no catch
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
            margin: "56px auto 0",
          }}
        />
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <main className="overflow-x-hidden">
        <HomeHero />
        {USE_CASES.map((uc) => (
          <UseCasePanel key={uc.n} uc={uc} />
        ))}
        <PipelineSection />
        <ComparisonSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
