import Link from "next/link";
import Footer from "@/components/Footer";
import HomeHero from "@/components/HomeHero";

const useCaseSections = [
  {
    id: "sales",
    bg: "dark" as const,
    eyebrow: "For sales",
    headline: "Quote their case studies. Not your features.",
    subhead:
      "Scrapitch reads their site and writes outreach that sounds like you've actually done the homework.",
    sampleSubject: "Idea for [Company]'s Q2 pipeline",
    samplePreview: [
      "Saw the case study with your enterprise customer.",
      "There is a similar pattern in your mid market segment that...",
    ],
    cta: "Try it for sales",
    href: "/generator",
  },
  {
    id: "jobs",
    bg: "light" as const,
    eyebrow: "For job seekers",
    headline: "Cold emails recruiters actually open.",
    subhead:
      "Mention the team's real work, the actual product, the exact challenge. In your voice, not a template's.",
    sampleSubject: "Saw your team's recent launch",
    samplePreview: [
      "Noticed your team shipped the new ingest pipeline.",
      "I built something similar at my last role and...",
    ],
    cta: "Try it for job hunting",
    href: "/generator",
  },
  {
    id: "masters",
    bg: "dark" as const,
    eyebrow: "For master's outreach",
    headline: "Email professors about their research. Not a generic ask.",
    subhead:
      "Scrapitch reads their lab page and shapes your email around the work they actually publish.",
    sampleSubject: "Question about your CRISPR delivery paper",
    samplePreview: [
      "Read your 2025 paper on lipid nanoparticle targeting.",
      "I am curious about the tradeoff between specificity and...",
    ],
    cta: "Try it for master's outreach",
    href: "/generator",
  },
  {
    id: "founders",
    bg: "light" as const,
    eyebrow: "For founders",
    headline: "Reach the operator. Skip the assistant.",
    subhead:
      "Personalized outreach to execs and investors built on what they care about, pulled from what they ship.",
    sampleSubject: "Noticed your latest portfolio bet",
    samplePreview: [
      "Saw your check into the developer tools company last month.",
      "We are building in an adjacent space and would love your...",
    ],
    cta: "Try it for executive outreach",
    href: "/generator",
  },
  {
    id: "networking",
    bg: "dark" as const,
    eyebrow: "For networking",
    headline: "Sound like a person. Not a pitch.",
    subhead:
      "Coffee chats, alumni intros, conference followups. Personalized enough to deserve a reply.",
    sampleSubject: "Coffee chat after your talk",
    samplePreview: [
      "Your point about agent evaluation in the keynote stuck with me.",
      "I would love to hear more about how your team is thinking about...",
    ],
    cta: "Try it for networking",
    href: "/generator",
  },
];

const pipelineCards = [
  {
    number: "01",
    title: "Research Analyst",
    body: "Scrapes the prospect's site and pulls structured signal: what they do, who they serve, what they ship.",
  },
  {
    number: "02",
    title: "Email Writer",
    body: "Drafts three variants using proven frameworks. Strict word ceilings. Zero fabricated details.",
  },
  {
    number: "03",
    title: "Scoring Judge",
    body: "Grades each email on six factors: personalization, length, single ask, problem framing, subject line, spam signals.",
  },
];

const comparisonRows = [
  {
    label: "Source of personalization",
    others: "A CSV column",
    scrapitch: "The prospect's live website",
  },
  {
    label: "Research time",
    others: "You do it",
    scrapitch: "Ten seconds, automated",
  },
  {
    label: "Variants per prospect",
    others: "One",
    scrapitch: "Three, each a different framework",
  },
  {
    label: "Quality check",
    others: "Re-read it yourself",
    scrapitch: "Six-factor scoring with reasoning",
  },
  {
    label: "Use cases",
    others: "B2B sales",
    scrapitch: "Sales, jobs, grad school, founders, networking",
  },
  {
    label: "Cost",
    others: "Subscription",
    scrapitch: "Free",
  },
];

function UseCaseSection({
  section,
}: {
  section: (typeof useCaseSections)[number];
}) {
  const isDark = section.bg === "dark";
  const bg = isDark ? "#0a0a0a" : "#faf8f5";
  const headingColor = isDark ? "#ffffff" : "#0a0a0a";
  const eyebrowColor = isDark ? "#9ca3af" : "#6b7280";
  const subheadColor = isDark ? "#9ca3af" : "#525252";
  const cardBg = isDark ? "#111111" : "#ffffff";
  const cardBorder = isDark ? "#1f2937" : "rgba(0,0,0,0.08)";
  const cardSubject = isDark ? "#ffffff" : "#0a0a0a";
  const cardBody = isDark ? "#9ca3af" : "#525252";

  return (
    <section
      style={{
        background: bg,
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div
        className="w-full mx-auto px-6 text-center"
        style={{ maxWidth: 900 }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: eyebrowColor,
            marginBottom: 20,
          }}
        >
          {section.eyebrow}
        </p>
        <h2
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: headingColor,
            marginBottom: 20,
          }}
        >
          {section.headline}
        </h2>
        <p
          style={{
            fontSize: 18,
            color: subheadColor,
            lineHeight: 1.55,
            maxWidth: 640,
            margin: "0 auto 40px",
          }}
        >
          {section.subhead}
        </p>

        {/* Sample email card */}
        <div
          className="mx-auto text-left"
          style={{
            maxWidth: 520,
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isDark ? "#6b7280" : "#9ca3af",
              marginBottom: 10,
            }}
          >
            Sample subject
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: cardSubject,
              marginBottom: 14,
              lineHeight: 1.4,
            }}
          >
            {section.sampleSubject}
          </p>
          <div
            style={{
              borderTop: `1px solid ${cardBorder}`,
              paddingTop: 14,
            }}
          >
            {section.samplePreview.map((line, i) => (
              <p
                key={i}
                style={{
                  fontSize: 14,
                  color: cardBody,
                  lineHeight: 1.6,
                  marginBottom: i === section.samplePreview.length - 1 ? 0 : 6,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <Link
          href={section.href}
          className="hover:underline"
          style={{
            color: "#3b82f6",
            fontWeight: 500,
            fontSize: 17,
            textDecoration: "none",
          }}
        >
          {section.cta}
        </Link>
      </div>
    </section>
  );
}

function PipelineSection() {
  return (
    <section style={{ background: "#0a0a0a", paddingTop: 120, paddingBottom: 120 }}>
      <div className="w-full mx-auto px-6" style={{ maxWidth: 1100 }}>
        <div className="text-center" style={{ marginBottom: 64 }}>
          <h2
            style={{
              fontSize: "clamp(34px, 5vw, 56px)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: 20,
            }}
          >
            One URL in. Three emails out.
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "#9ca3af",
              maxWidth: 600,
              margin: "0 auto",
              lineHeight: 1.55,
            }}
          >
            Three specialist agents do the work. You read the result.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pipelineCards.map((card) => (
            <div
              key={card.number}
              style={{
                background: "#111111",
                border: "1px solid #1f2937",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#3b82f6",
                  marginBottom: 24,
                  letterSpacing: "0.02em",
                }}
              >
                {card.number}
              </p>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#ffffff",
                  marginBottom: 12,
                  letterSpacing: "-0.01em",
                }}
              >
                {card.title}
              </h3>
              <p style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.6 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section style={{ background: "#faf8f5", paddingTop: 120, paddingBottom: 120 }}>
      <div className="w-full mx-auto px-6" style={{ maxWidth: 1000 }}>
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: "clamp(34px, 5vw, 56px)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0a0a0a",
              marginBottom: 20,
            }}
          >
            Personalized from their website. Not your spreadsheet.
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "#525252",
              maxWidth: 640,
              margin: "0 auto",
              lineHeight: 1.55,
            }}
          >
            Every other AI email tool fills a template with name and company. Scrapitch reads the actual site.
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{
              background: "#f5f1ea",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                fontSize: 13,
                fontWeight: 500,
                color: "#6b7280",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Feature
            </div>
            <div
              style={{
                padding: "18px 24px",
                fontSize: 13,
                fontWeight: 500,
                color: "#6b7280",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                borderLeft: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Other AI tools
            </div>
            <div
              style={{
                padding: "18px 24px",
                fontSize: 13,
                fontWeight: 500,
                color: "#0a0a0a",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                borderLeft: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              Scrapitch
            </div>
          </div>

          {comparisonRows.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-1 md:grid-cols-3"
              style={{
                borderBottom:
                  i < comparisonRows.length - 1
                    ? "1px solid rgba(0,0,0,0.05)"
                    : "none",
              }}
            >
              <div
                style={{
                  padding: "18px 24px",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#0a0a0a",
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  padding: "18px 24px",
                  fontSize: 15,
                  color: "#6b7280",
                  borderLeft: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                {row.others}
              </div>
              <div
                style={{
                  padding: "18px 24px",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#0a0a0a",
                  borderLeft: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                {row.scrapitch}
              </div>
            </div>
          ))}
        </div>
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
      <div className="w-full mx-auto px-6 text-center" style={{ maxWidth: 800 }}>
        <h2
          style={{
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: 24,
          }}
        >
          Stop writing cold emails alone.
        </h2>
        <p
          style={{
            fontSize: 20,
            color: "#9ca3af",
            lineHeight: 1.5,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}
        >
          Paste a URL. Get three emails. Send the best one.
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
              height: 20,
              background: "#374151",
              margin: "0 20px",
            }}
          />
          <Link
            href="/how-it-works"
            className="hover:text-[#3b82f6] transition-colors"
            style={{
              color: "#ffffff",
              fontWeight: 500,
              fontSize: 17,
              textDecoration: "none",
            }}
          >
            See how it works
          </Link>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginTop: 40,
          }}
        >
          Free. No card required. Works on any website with a homepage.
        </p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <main className="overflow-x-hidden">
        <HomeHero />
        {useCaseSections.map((section) => (
          <UseCaseSection key={section.id} section={section} />
        ))}
        <PipelineSection />
        <ComparisonSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
