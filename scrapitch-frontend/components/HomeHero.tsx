"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const TARGET_URL = "https://stripe.com";
const TYPING_MS = 1500;
const STEP_MS = 600;
const PIPELINE_DELAY_MS = 300;
const LOOP_MS = 6000;

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

const PILLS = ["Researching", "Writing", "Scoring"] as const;

const EMAIL_CARDS = [
  {
    subject: "Quick question about Stripe's docs",
    preview: [
      "Saw the redesigned docs nav. The...",
      "Worth a 10 minute look next week?",
    ],
  },
  {
    subject: "Idea for Stripe's growth team",
    preview: [
      "Spotted a pattern in your latest...",
      "Open to a 15 minute call?",
    ],
  },
];

function HomeNavbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 lg:px-10 py-5 flex items-center justify-between">
      <Link
        href="/"
        className="text-white"
        style={{ fontWeight: 500, fontSize: 18, letterSpacing: "-0.01em" }}
      >
        Scrapitch
      </Link>
      <div className="hidden md:flex items-center" style={{ gap: 28, fontWeight: 500, fontSize: 14 }}>
        <Link href="/how-it-works" className="transition-colors" style={{ color: "#9ca3af" }}>
          <span className="hover:text-white transition-colors">How it works</span>
        </Link>
        <Link href="/use-cases" className="transition-colors" style={{ color: "#9ca3af" }}>
          <span className="hover:text-white transition-colors">Use cases</span>
        </Link>
        <Link href="/login" className="transition-colors" style={{ color: "#9ca3af" }}>
          <span className="hover:text-white transition-colors">Sign in</span>
        </Link>
        <Link
          href="/signup"
          className="text-white hover:bg-white/5 transition-colors"
          style={{
            border: "1px solid #374151",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}

type ProductVisualProps = {
  typedChars: number;
  pillIndex: number;
  visibleCards: number;
};

function ProductVisual({ typedChars, pillIndex, visibleCards }: ProductVisualProps) {
  const typed = TARGET_URL.slice(0, typedChars);

  return (
    <div className="flex flex-col md:flex-row md:items-stretch gap-4">
      {/* Stage 1: browser bar with URL typing */}
      <Stage>
        <div className="flex items-center gap-2 mb-4">
          <span style={dotStyle("#ef4444")} />
          <span style={dotStyle("#eab308")} />
          <span style={dotStyle("#22c55e")} />
        </div>
        <div
          className="font-mono flex items-center"
          style={{
            background: "#0a0a0a",
            border: "1px solid #1f2937",
            borderRadius: 8,
            padding: "10px 12px",
            color: "#e5e7eb",
            fontSize: 13,
            minHeight: 42,
          }}
        >
          <span>{typed}</span>
          <span
            className="cursor-blink"
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: 2,
              height: 14,
              background: "#ffffff",
              marginLeft: 2,
            }}
          />
        </div>
      </Stage>

      {/* Stage 2: pipeline pills */}
      <Stage>
        <div className="flex flex-col gap-3">
          {PILLS.map((label, i) => {
            const active = pillIndex === i;
            const past = pillIndex > i;
            const lit = active || past;
            return (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg"
                style={{
                  padding: "10px 14px",
                  background: active ? "rgba(59,130,246,0.08)" : "#0a0a0a",
                  border: `1px solid ${active ? "rgba(59,130,246,0.4)" : "#1f2937"}`,
                  transition: "background 200ms ease, border-color 200ms ease",
                }}
              >
                <span
                  className={active ? "scrapitch-pulse" : undefined}
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: lit ? "#3b82f6" : "#4b5563",
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: lit ? "#ffffff" : "#6b7280",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </Stage>

      {/* Stage 3: email preview cards */}
      <Stage>
        <div className="flex flex-col gap-2.5">
          {EMAIL_CARDS.map((card, i) => {
            const shown = visibleCards > i;
            return (
              <div
                key={i}
                style={{
                  background: "#ffffff",
                  borderRadius: 12,
                  padding: 16,
                  opacity: shown ? 1 : 0,
                  transform: shown ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 400ms ease, transform 400ms ease",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: "#0a0a0a", marginBottom: 6, lineHeight: 1.3 }}>
                  {card.subject}
                </p>
                {card.preview.map((line, j) => (
                  <p key={j} style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                    {line}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </Stage>
    </div>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        background: "#111111",
        border: "1px solid #1f2937",
        borderRadius: 16,
        padding: "14px 18px",
      }}
    >
      {children}
    </div>
  );
}

function dotStyle(color: string): React.CSSProperties {
  return {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: color,
  };
}

export default function HomeHero() {
  const [typedChars, setTypedChars] = useState(0);
  const [pillIndex, setPillIndex] = useState(-1);
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    function clearAll() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function start() {
      if (cancelled) return;
      setTypedChars(0);
      setPillIndex(-1);
      setVisibleCards(0);

      const charDuration = TYPING_MS / TARGET_URL.length;
      for (let i = 1; i <= TARGET_URL.length; i++) {
        const charIdx = i;
        timers.push(setTimeout(() => setTypedChars(charIdx), charIdx * charDuration));
      }

      const pipelineStart = TYPING_MS + PIPELINE_DELAY_MS;
      timers.push(setTimeout(() => setPillIndex(0), pipelineStart));
      timers.push(setTimeout(() => {
        setPillIndex(1);
        setVisibleCards(1);
      }, pipelineStart + STEP_MS));
      timers.push(setTimeout(() => {
        setPillIndex(2);
        setVisibleCards(2);
      }, pipelineStart + STEP_MS * 2));
      timers.push(setTimeout(() => setVisibleCards(3), pipelineStart + STEP_MS * 3));
      timers.push(setTimeout(() => {
        clearAll();
        start();
      }, LOOP_MS));
    }

    start();

    return () => {
      cancelled = true;
      clearAll();
    };
  }, []);

  return (
    <section
      className="relative flex flex-col"
      style={{ background: "#0a0a0a", minHeight: "100vh" }}
    >
      <HomeNavbar />

      {/* Top metadata bar */}
      <div className="flex justify-between items-center w-full max-w-[1100px] mx-auto px-6 mb-14" style={{ paddingTop: 96 }}>
        <div className="flex items-center gap-2 text-[11px] text-[#6e6e6e] font-mono">
          <span className="w-[5px] h-[5px] rounded-full bg-[#3b82f6]"></span>
          <span>scrapitch</span>
        </div>
        <div className="text-[11px] text-[#4a4a48] font-mono tracking-wider">v2 · may &apos;26</div>
      </div>

      {/* Top hairline */}
      <div className="h-px bg-[#1a1a1a] w-full max-w-[1100px] mx-auto mb-16"></div>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col items-center w-full mx-auto px-6"
        style={{ maxWidth: 1100 }}
      >
        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(40px, 5.5vw, 56px)",
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: "-0.028em",
            color: "#f5f5f0",
            marginBottom: 24,
            textAlign: "center",
            maxWidth: 720,
          }}
        >
          Read{" "}
          <em
            className="font-serif italic font-normal text-[#f5f5f0]"
            style={{ fontFamily: SERIF_STACK }}
          >
            their
          </em>{" "}
          site.
          <br />
          Write the email.
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontSize: 17,
            fontWeight: 400,
            color: "#8a8a85",
            maxWidth: 460,
            marginBottom: 40,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Three personalized drafts. From a single URL. In ten seconds.
        </p>

        {/* CTA row */}
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

        {/* Product visual */}
        <div style={{ marginTop: 120, width: "100%" }}>
          <div className="h-px bg-[#1a1a1a] w-16 mx-auto mb-16"></div>
          <ProductVisual
            typedChars={typedChars}
            pillIndex={pillIndex}
            visibleCards={visibleCards}
          />
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="h-px bg-[#1a1a1a] w-full max-w-[1100px] mx-auto mt-16 mb-3"></div>

      {/* Bottom metadata bar */}
      <div className="flex justify-between items-center w-full max-w-[1100px] mx-auto px-6 mb-10 text-[11px] text-[#4a4a48] font-mono tracking-wider">
        <span>free · no card</span>
        <span>any url</span>
      </div>
    </section>
  );
}
