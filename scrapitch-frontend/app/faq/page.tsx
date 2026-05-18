import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "FAQ — Scrapitch",
  description:
    "Common questions about Scrapitch: pricing, data handling, supported sites, and how the generation works.",
};

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

type Question = {
  n: string;
  q: { before: string; italic: string; after: string };
  a: string;
};

const QUESTIONS: Question[] = [
  {
    n: "01",
    q: { before: "Is Scrapitch ", italic: "really", after: " free?" },
    a: "Yes. No card required, no trial period, no usage cap that flips into pricing. The product is free while we figure out what people use it for. If pricing ever changes, current users keep what they have.",
  },
  {
    n: "02",
    q: { before: "What sites can Scrapitch ", italic: "read", after: "?" },
    a: "Most public web pages: company sites, blogs, lab pages, founder portfolios. Sites that aggressively block scraping (LinkedIn, gated platforms) return less. Public profile pages on most platforms work.",
  },
  {
    n: "03",
    q: { before: "What happens to ", italic: "my", after: " data?" },
    a: "Your input and the scraped content go to Anthropic's Claude API for generation. Anthropic does not train on API inputs. We store your generations so you can come back to them. We don't share data with third parties.",
  },
  {
    n: "04",
    q: {
      before: "How is this ",
      italic: "different",
      after: " from ChatGPT or other AI writers?",
    },
    a: "Other AI writers personalize from what you type. Scrapitch reads the prospect's actual site at generation time. The personalization comes from their public content, not your imagination.",
  },
  {
    n: "05",
    q: { before: "Can I ", italic: "edit", after: " the drafts?" },
    a: "Yes. The drafts are starting points. Copy them, tweak them, send them. The scoring is a guide, not a verdict.",
  },
  {
    n: "06",
    q: {
      before: "Does it work for ",
      italic: "languages",
      after: " other than English?",
    },
    a: "English works best today. Other languages will improve as we tune the prompts. Try it and tell us what falls short.",
  },
  {
    n: "07",
    q: { before: "How ", italic: "long", after: " does generation take?" },
    a: "Ten seconds on average. Slower if the site is large or slow to load. Faster if the site is small.",
  },
  {
    n: "08",
    q: { before: "", italic: "Who", after: " built this?" },
    a: "One founder, in Boston. Kishan Kommana. Reach out at kommana.k@northeastern.edu if you have something to say.",
  },
];

function ItalicWord({ word }: { word: string }) {
  return (
    <em
      style={{
        fontFamily: SERIF_STACK,
        fontStyle: "italic",
        fontWeight: 400,
        color: "#b89968",
      }}
    >
      {word}
    </em>
  );
}

function HeaderSection() {
  return (
    <section
      style={{
        background: "#0a0a0a",
        minHeight: "50vh",
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
          questions, answered
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
          Frequently{" "}
          <em
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              color: "#c9b896",
            }}
          >
            asked
          </em>
          .
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "#8a8a85",
            lineHeight: 1.5,
            maxWidth: 460,
            margin: "0 auto 40px",
          }}
        >
          What people ask before they paste their first URL.
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

function FaqBody() {
  return (
    <section
      style={{
        background: "#faf8f5",
        paddingTop: 120,
        paddingBottom: 120,
      }}
    >
      <div className="w-full mx-auto px-6" style={{ maxWidth: 720 }}>
        {QUESTIONS.map((item, i) => (
          <div
            key={item.n}
            style={{ paddingTop: i === 0 ? 0 : 40, paddingBottom: 40 }}
          >
            <p
              className="font-mono"
              style={{
                fontSize: 11,
                color: "#6e6657",
                letterSpacing: "0.04em",
                marginBottom: 14,
              }}
            >
              Q · {item.n}
            </p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: "#1a1612",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                marginBottom: 14,
              }}
            >
              {item.q.before}
              <ItalicWord word={item.q.italic} />
              {item.q.after}
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#6e6657",
                lineHeight: 1.6,
              }}
            >
              {item.a}
            </p>
            {i < QUESTIONS.length - 1 && (
              <div
                style={{
                  height: 1,
                  background: "#d8d0bd",
                  marginTop: 40,
                }}
              />
            )}
          </div>
        ))}
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
          still curious
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
          The fastest answer is{" "}
          <em
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              fontWeight: 400,
              color: "#c9b896",
            }}
          >
            trying
          </em>{" "}
          it.
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
          Paste a URL. Get three drafts. See what falls out.
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

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <HeaderSection />
        <FaqBody />
        <FooterCtaSection />
      </main>
      <Footer />
    </>
  );
}
