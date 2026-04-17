"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { JetBrains_Mono, DM_Sans } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const TARGET_URL = "https://www.webfx.com";

const AGENTS = [
  { label: "Researcher", num: "01" },
  { label: "Writer", num: "02" },
  { label: "Scorer", num: "03" },
];

const EMAIL_CARDS = [
  {
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.25)",
    label: "A / PAS",
    subject: "Clicks vs. revenue",
    body: "Your team drives $10B+ in client revenue, but most agencies at your scale still rely on generic outreach that lands in spam...",
    score: 8.2,
  },
  {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    label: "B / Value-First",
    subject: "12 meetings in 3 weeks",
    body: "We helped a similar agency book 12 meetings without changing their offer. Just the outreach copy.",
    score: 8.5,
  },
  {
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    label: "C / Curiosity",
    subject: "Revenue growth partner",
    body: "Noticed WebFX positions itself as a revenue growth partner for the AI era. Most agencies targeting that angle...",
    score: 9.1,
  },
];

// Stagger delays for card reveal (ms)
const CARD_DELAYS = [200, 500, 800];

export default function HomeLiveDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  const [typedCount, setTypedCount] = useState(0);
  // 0 = waiting, 1 = agent1 active, 2 = agent2 active, 3 = agent3 active, 4 = all done
  const [agentPhase, setAgentPhase] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [scoreValues, setScoreValues] = useState([0, 0, 0]);

  const startAnimation = useCallback(() => {
    // Type URL character by character at 35ms per char
    let count = 0;
    const typeInterval = setInterval(() => {
      count++;
      setTypedCount(count);
      if (count >= TARGET_URL.length) {
        clearInterval(typeInterval);
        // 400ms pause, then light up agents one by one
        setTimeout(() => {
          setAgentPhase(1);
          setTimeout(() => {
            setAgentPhase(2);
            setTimeout(() => {
              setAgentPhase(3);
              setTimeout(() => {
                setAgentPhase(4);
                setCardsVisible(true);
                // Count score numbers up from 0.0 to final over 600ms (~30 steps)
                const targets = EMAIL_CARDS.map((c) => c.score);
                const totalSteps = 30;
                const stepMs = 600 / totalSteps;
                let step = 0;
                const scoreTimer = setInterval(() => {
                  step++;
                  const t = Math.min(step / totalSteps, 1);
                  setScoreValues(targets.map((v) => parseFloat((v * t).toFixed(1))));
                  if (step >= totalSteps) {
                    clearInterval(scoreTimer);
                    setScoreValues([...targets]);
                  }
                }, stepMs);
              }, 900);
            }, 900);
          }, 900);
        }, 400);
      }
    }, 35);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRun.current) {
          hasRun.current = true;
          observer.disconnect();
          startAnimation();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startAnimation]);

  const getAgentState = (index: number): "idle" | "active" | "done" => {
    if (agentPhase === 0) return "idle";
    if (agentPhase === index + 1) return "active";
    if (agentPhase > index + 1) return "done";
    return "idle";
  };

  // Show cursor only while URL is still being typed
  const showCursor = typedCount > 0 && typedCount < TARGET_URL.length;

  const cursorEl = (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 14,
        background: "#3b82f6",
        marginLeft: 1,
        verticalAlign: "text-bottom",
        animation: "blink 1s step-end infinite",
      }}
    />
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32"
      style={{
        // Seamlessly blend with the dark→cream gradient div above by
        // starting at cream and quickly transitioning to dark
        background: "linear-gradient(180deg, #faf8f5 0px, #0a0a0a 80px)",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#3b82f6",
              textTransform: "uppercase",
              marginBottom: 12,
              fontFamily: jetbrainsMono.style.fontFamily,
            }}
          >
            LIVE PREVIEW
          </p>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: "#ffffff",
              marginBottom: 12,
              letterSpacing: "-0.02em",
              fontFamily: dmSans.style.fontFamily,
            }}
          >
            See it in action
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#94a3b8",
              fontFamily: dmSans.style.fontFamily,
            }}
          >
            Watch three AI agents turn a URL into 3 scored cold emails.
          </p>
        </div>

        {/* macOS app window */}
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            background: "#0d0d0d",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              background: "#161616",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Traffic light dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginLeft: 10 }}>
              {["Generate", "History", "Tones"].map((tab, i) => (
                <div
                  key={tab}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 5,
                    fontSize: 11,
                    fontFamily: jetbrainsMono.style.fontFamily,
                    color: i === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                    background: i === 0 ? "rgba(255,255,255,0.08)" : "transparent",
                    cursor: "default",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Brand name */}
            <div
              style={{
                marginLeft: "auto",
                fontFamily: jetbrainsMono.style.fontFamily,
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: 1,
              }}
            >
              SCRAPITCH
            </div>
          </div>

          {/* Window content */}
          <div style={{ padding: "16px 14px" }}>

            {/* URL input row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "9px 12px",
                marginBottom: 10,
              }}
            >
              <svg
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
                />
              </svg>

              <span
                style={{
                  flex: 1,
                  fontFamily: jetbrainsMono.style.fontFamily,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {typedCount === 0 ? (
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>
                    https://{cursorEl}
                  </span>
                ) : (
                  <>
                    {TARGET_URL.slice(0, typedCount)}
                    {showCursor && cursorEl}
                  </>
                )}
              </span>

              {/* Status badge */}
              <span
                style={{
                  fontFamily: jetbrainsMono.style.fontFamily,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 6,
                  flexShrink: 0,
                  color:
                    agentPhase === 4
                      ? "#10b981"
                      : agentPhase > 0
                      ? "#3b82f6"
                      : "rgba(255,255,255,0.3)",
                  background:
                    agentPhase === 4
                      ? "rgba(16,185,129,0.1)"
                      : agentPhase > 0
                      ? "rgba(59,130,246,0.1)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    agentPhase === 4
                      ? "rgba(16,185,129,0.25)"
                      : agentPhase > 0
                      ? "rgba(59,130,246,0.2)"
                      : "rgba(255,255,255,0.06)"
                  }`,
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {agentPhase === 0
                  ? "Generate"
                  : agentPhase === 4
                  ? "Done \u2713"
                  : "Working..."}
              </span>
            </div>

            {/* Agent pipeline strip */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {AGENTS.map((agent, i) => {
                const state = getAgentState(i);
                return (
                  <div key={i} style={{ position: "relative", flex: 1 }}>
                    <div
                      style={{
                        borderRadius: 8,
                        padding: "8px 10px",
                        textAlign: "center",
                        background:
                          state === "active"
                            ? "rgba(59,130,246,0.08)"
                            : state === "done"
                            ? "rgba(16,185,129,0.06)"
                            : "rgba(255,255,255,0.02)",
                        border: `1px solid ${
                          state === "active"
                            ? "rgba(59,130,246,0.2)"
                            : state === "done"
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(255,255,255,0.06)"
                        }`,
                        transition:
                          "background 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: jetbrainsMono.style.fontFamily,
                          fontSize: 9,
                          fontWeight: 600,
                          color:
                            state === "active"
                              ? "#3b82f6"
                              : state === "done"
                              ? "#10b981"
                              : "rgba(255,255,255,0.25)",
                          marginBottom: 3,
                          transition: "color 0.3s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      >
                        {state === "done" ? "\u2713" : agent.num}
                      </div>
                      <div
                        style={{
                          fontFamily: dmSans.style.fontFamily,
                          fontSize: 11,
                          color:
                            state === "active"
                              ? "rgba(255,255,255,0.8)"
                              : state === "done"
                              ? "rgba(255,255,255,0.6)"
                              : "rgba(255,255,255,0.25)",
                          transition: "color 0.3s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      >
                        {agent.label}
                      </div>
                    </div>

                    {/* Connector line between agents */}
                    {i < AGENTS.length - 1 && (
                      <div
                        style={{
                          position: "absolute",
                          right: -6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 6,
                          height: 1,
                          background: "rgba(255,255,255,0.1)",
                          zIndex: 1,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Email cards — 3 columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {EMAIL_CARDS.map((card, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 8,
                    background: cardsVisible ? card.bg : "rgba(255,255,255,0.02)",
                    border: `1px solid ${cardsVisible ? card.border : "rgba(255,255,255,0.05)"}`,
                    overflow: "hidden",
                    opacity: cardsVisible ? 1 : 0.3,
                    transform: cardsVisible ? "translateY(0)" : "translateY(8px)",
                    transition: [
                      `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${CARD_DELAYS[i]}ms`,
                      `transform 0.5s cubic-bezier(0.4,0,0.2,1) ${CARD_DELAYS[i]}ms`,
                      `background 0.5s cubic-bezier(0.4,0,0.2,1) ${CARD_DELAYS[i]}ms`,
                      `border-color 0.5s cubic-bezier(0.4,0,0.2,1) ${CARD_DELAYS[i]}ms`,
                    ].join(", "),
                  }}
                >
                  {/* 2px accent line at top */}
                  <div
                    style={{
                      height: 2,
                      background: cardsVisible ? card.color : "rgba(255,255,255,0.05)",
                      transition: `background 0.5s cubic-bezier(0.4,0,0.2,1) ${CARD_DELAYS[i]}ms`,
                    }}
                  />

                  <div style={{ padding: "10px 10px 8px" }}>
                    {/* Variant label */}
                    <div
                      style={{
                        fontFamily: jetbrainsMono.style.fontFamily,
                        fontSize: 9,
                        fontWeight: 600,
                        color: cardsVisible ? card.color : "rgba(255,255,255,0.2)",
                        marginBottom: 6,
                        transition: `color 0.5s cubic-bezier(0.4,0,0.2,1) ${CARD_DELAYS[i]}ms`,
                      }}
                    >
                      {card.label}
                    </div>

                    {/* Subject line */}
                    <div
                      style={{
                        fontFamily: dmSans.style.fontFamily,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.85)",
                        marginBottom: 6,
                        lineHeight: 1.3,
                      }}
                    >
                      {card.subject}
                    </div>

                    {/* Body preview */}
                    <div
                      style={{
                        fontFamily: dmSans.style.fontFamily,
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    >
                      {card.body}
                    </div>

                    {/* Score bar + number */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: card.color,
                            borderRadius: 2,
                            width: cardsVisible ? `${(card.score / 10) * 100}%` : "0%",
                            transition: `width 0.6s cubic-bezier(0.4,0,0.2,1) ${CARD_DELAYS[i] + 200}ms`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: jetbrainsMono.style.fontFamily,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.7)",
                          minWidth: 28,
                        }}
                      >
                        {scoreValues[i].toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
