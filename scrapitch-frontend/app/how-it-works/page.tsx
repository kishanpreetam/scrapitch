import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DualCta from "@/components/DualCta";

export const metadata: Metadata = {
  title: "How it works · Scrapitch",
  description:
    "Three agents. One URL. Ten seconds. What Scrapitch does between you pasting a link and reading your first draft.",
};

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

type Bg = "dark" | "light";

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
    fieldBg: isDark ? "#0f0d0a" : "#f5f1ea",
    fieldBorder: isDark ? "#1c1812" : "#e8e0cd",
  };
}

function ItalicWord({ word, color }: { word: string; color: string }) {
  return (
    <em
      style={{
        fontFamily: SERIF_STACK,
        fontStyle: "italic",
        fontWeight: 400,
        color,
      }}
    >
      {word}
    </em>
  );
}

type DeepSectionProps = {
  bg: Bg;
  n: string;
  eyebrow: string;
  title: { before: string; italic: string; after: string };
  paragraphs: [string, string, string];
  right: React.ReactNode;
};

function DeepSection({ bg, n, eyebrow, title, paragraphs, right }: DeepSectionProps) {
  const c = palette(bg);

  return (
    <section
      style={{
        background: c.bg,
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div className="w-full mx-auto px-6" style={{ maxWidth: 1000 }}>
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
          {n} · {eyebrow}
        </p>

        <h2
          style={{
            fontSize: "clamp(40px, 5vw, 56px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: c.text,
            marginBottom: 56,
            maxWidth: 760,
          }}
        >
          {title.before}
          <ItalicWord word={title.italic} color={c.italic} />
          {title.after}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 56 }}>
          <div>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: 16,
                  color: c.mutedSoft,
                  lineHeight: 1.65,
                  marginBottom: i < paragraphs.length - 1 ? 20 : 0,
                }}
              >
                {p}
              </p>
            ))}
          </div>

          <div>{right}</div>
        </div>

        <div style={{ height: 1, background: c.line, marginTop: 64 }} />
      </div>
    </section>
  );
}

function FormMockup({ bg }: { bg: Bg }) {
  const c = palette(bg);
  const fields: { label: string; value: string }[] = [
    { label: "url", value: "https://scrapitch.com" },
    { label: "use case", value: "for sales" },
    {
      label: "about you",
      value: "Operator at Bridgewise, building onboarding for AI products.",
    },
    {
      label: "your ask",
      value: "Fifteen minute call about your use case routing.",
    },
    { label: "tone", value: "professional, warm" },
  ];

  return (
    <div
      style={{
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: 8,
        padding: 24,
      }}
    >
      {fields.map((f, i) => (
        <div
          key={f.label}
          style={{
            marginBottom: i < fields.length - 1 ? 18 : 0,
          }}
        >
          <p
            className="font-mono"
            style={{
              fontSize: 10,
              color: c.muted,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {f.label}
          </p>
          <div
            style={{
              background: c.fieldBg,
              border: `1px solid ${c.fieldBorder}`,
              borderRadius: 4,
              padding: "10px 12px",
              fontSize: 14,
              color: c.text,
              lineHeight: 1.5,
            }}
          >
            {f.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExtractedFields({ bg }: { bg: Bg }) {
  const c = palette(bg);
  const fields: { key: string; value: string }[] = [
    {
      key: "what_they_do",
      value: "AI powered personalized cold outreach",
    },
    {
      key: "who_they_serve",
      value: "Sales reps, job seekers, grad applicants, founders",
    },
    {
      key: "recent_signal",
      value: "Launched v2 with five use cases in May 2026",
    },
    { key: "team_size", value: "1, solo founder" },
  ];

  return (
    <div
      style={{
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: 8,
        padding: 24,
      }}
    >
      {fields.map((f, i) => (
        <div key={f.key}>
          {i > 0 && (
            <div
              style={{
                height: 1,
                background: c.cardBorder,
                margin: "16px 0",
              }}
            />
          )}
          <p
            className="font-mono"
            style={{
              fontSize: 11,
              color: c.italic,
              letterSpacing: "0.04em",
              marginBottom: 6,
            }}
          >
            {f.key}
          </p>
          <p
            style={{
              fontSize: 15,
              color: c.text,
              lineHeight: 1.5,
            }}
          >
            {f.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function FrameworkCards({ bg }: { bg: Bg }) {
  const c = palette(bg);
  const drafts: { framework: string; subject: string; preview: string; words: string }[] = [
    {
      framework: "problem, agitate, solution",
      subject: "The use case routing layer Scrapitch is missing",
      preview:
        "Multi vertical AI tools usually lose second month users to template confusion. We've seen the pattern twice this quarter.",
      words: "87 of 90",
    },
    {
      framework: "value first",
      subject: "Saw Scrapitch's v2 launch. Sharing what we learned.",
      preview:
        "Two early-stage AI companies hit the same multi vertical adoption issues last quarter. Both shipped a routing layer. Happy to share notes.",
      words: "102 of 110",
    },
    {
      framework: "curiosity icebreaker",
      subject: "Quick question about Scrapitch's five use cases",
      preview:
        "Did you ship the use case picker as part of the v2 launch, or are you experimenting with auto routing based on the URL alone?",
      words: "94 of 100",
    },
  ];

  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      {drafts.map((d) => (
        <div
          key={d.framework}
          style={{
            background: c.cardBg,
            border: `1px solid ${c.cardBorder}`,
            borderRadius: 8,
            padding: 18,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 10 }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: c.italic,
                letterSpacing: "0.04em",
              }}
            >
              {d.framework}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: c.muted,
                letterSpacing: "0.04em",
              }}
            >
              {d.words}
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: c.text,
              marginBottom: 6,
              lineHeight: 1.4,
            }}
          >
            {d.subject}
          </p>
          <p
            style={{
              fontSize: 13,
              color: c.mutedSoft,
              lineHeight: 1.55,
            }}
          >
            {d.preview}
          </p>
        </div>
      ))}
    </div>
  );
}

function ScoringPanel({ bg }: { bg: Bg }) {
  const c = palette(bg);
  const rows: { label: string; score: string; weight: string }[] = [
    { label: "Personalization", score: "9.2", weight: "30%" },
    { label: "Length", score: "8.5", weight: "20%" },
    { label: "Single ask", score: "10", weight: "15%" },
    { label: "Problem framing", score: "8.0", weight: "15%" },
    { label: "Subject line", score: "9.0", weight: "10%" },
    { label: "Spam signals", score: "9.5", weight: "10%" },
  ];

  return (
    <div
      style={{
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: 8,
        padding: 24,
      }}
    >
      {rows.map((row, i) => (
        <div key={row.label}>
          {i > 0 && (
            <div
              style={{
                height: 1,
                background: c.cardBorder,
                margin: "14px 0",
              }}
            />
          )}
          <div className="flex items-baseline justify-between" style={{ gap: 12 }}>
            <p
              style={{
                fontSize: 14,
                color: c.text,
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {row.label}
            </p>
            <div className="flex items-baseline" style={{ gap: 12 }}>
              <span
                style={{
                  fontSize: 16,
                  color: c.italic,
                  fontWeight: 500,
                }}
              >
                {row.score}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: c.muted,
                  letterSpacing: "0.04em",
                }}
              >
                {row.weight}
              </span>
            </div>
          </div>
        </div>
      ))}
      <div
        style={{
          height: 1,
          background: c.cardBorder,
          margin: "20px 0 16px",
        }}
      />
      <div className="flex items-baseline justify-between">
        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: c.muted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          total
        </p>
        <span
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: c.text,
            letterSpacing: "-0.01em",
          }}
        >
          8.97
        </span>
      </div>
    </div>
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
          how it works
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
          <ItalicWord word="Three" color="#c9b896" /> agents. One URL. Ten
          seconds.
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "#8a8a85",
            lineHeight: 1.5,
            maxWidth: 520,
            margin: "0 auto 40px",
          }}
        >
          What Scrapitch actually does between you pasting a link and reading
          your first draft.
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
          ready when you are
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
          Three agents. One{" "}
          <ItalicWord word="ten second" color="#c9b896" /> flow.
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

        <div className="w-full max-w-[320px] mx-auto md:max-w-none">
          <DualCta
            primary={{ href: "/generator", label: "Try it free" }}
            secondary={{ href: "/use-cases", label: "See use cases" }}
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

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <HeaderSection />

        <DeepSection
          bg="light"
          n="01"
          eyebrow="the input"
          title={{ before: "One URL is ", italic: "enough", after: "." }}
          paragraphs={[
            "Scrapitch accepts any public URL: company sites, lab pages, founder portfolios, public professional profiles.",
            "No CSV uploads. No spreadsheet of leads. No connectors to your CRM.",
            "Paste it once. Pick a use case. Add a sentence about who you are and what you want.",
          ]}
          right={<FormMockup bg="light" />}
        />

        <DeepSection
          bg="dark"
          n="02"
          eyebrow="research analyst"
          title={{
            before: "Reads their site like a ",
            italic: "person",
            after: " would.",
          }}
          paragraphs={[
            "The research agent visits the URL and any pages it links to: about, product, pricing, blog, careers.",
            "It extracts structured signal: what they do, who they serve, what they ship, recent launches.",
            "If the site is thin, it pulls what's there honestly. No fabrication.",
          ]}
          right={<ExtractedFields bg="dark" />}
        />

        <DeepSection
          bg="light"
          n="03"
          eyebrow="email writer"
          title={{
            before: "",
            italic: "Three",
            after: " drafts, three frameworks.",
          }}
          paragraphs={[
            "The writer uses three proven cold email frameworks: problem, agitate, solution; value first; and curiosity icebreaker.",
            "Each draft has a hard word ceiling: 90, 110, or 100 words. No padding.",
            "Strict no fabrication rule: only claims that came from your input or the scraped site.",
          ]}
          right={<FrameworkCards bg="light" />}
        />

        <DeepSection
          bg="dark"
          n="04"
          eyebrow="scoring judge"
          title={{
            before: "",
            italic: "Six",
            after: " factors. One score per draft.",
          }}
          paragraphs={[
            "The judge grades each draft against a rubric grounded in cold email research.",
            "Personalization counts most. Length, single ask, problem framing, subject line, spam signals fill out the rest.",
            "You see the score and the reasoning. Pick what fits, ignore what doesn't.",
          ]}
          right={<ScoringPanel bg="dark" />}
        />

        <FooterCtaSection />
      </main>
      <Footer />
    </>
  );
}
