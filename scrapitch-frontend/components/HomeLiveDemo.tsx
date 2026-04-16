"use client";

import { useState, useEffect, useRef } from "react";

const DEMO_URL = "acmeagency.com";
type Phase = "typing" | "loading" | "result" | "fade";

const cards = [
  {
    label: "The Direct / PAS",
    score: 9,
    scoreColor: "#22c55e",
    scoreBg: "rgba(34,197,94,0.1)",
    scoreBorder: "rgba(34,197,94,0.25)",
    subject: "Your pipeline gap",
    body: "Most agencies lose 30–40% of inbound leads before they convert. We fix that with AI-written sequences referencing what prospects actually care about. Worth a 15-min call?",
  },
  {
    label: "Value-First",
    score: 8,
    scoreColor: "#f59e0b",
    scoreBg: "rgba(245,158,11,0.1)",
    scoreBorder: "rgba(245,158,11,0.25)",
    subject: "2x reply rate, zero extra work",
    body: "Agencies using personalized cold outreach see 2x reply rates vs templates. Scrapitch writes them in 10 seconds per prospect, referencing their actual site. Happy to show you a demo.",
  },
  {
    label: "The Curious",
    score: 9,
    scoreColor: "#22c55e",
    scoreBg: "rgba(34,197,94,0.1)",
    scoreBorder: "rgba(34,197,94,0.25)",
    subject: "Noticed your case study",
    body: "Just read through your SaaS case study. Impressive 3x growth result. Curious whether you're automating cold outreach yet or still doing it manually. Happy to share what's working.",
  },
];

export default function HomeLiveDemo() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clear = () => { if (timer.current) clearTimeout(timer.current); };
    if (phase === "typing") {
      if (typed.length < DEMO_URL.length) {
        timer.current = setTimeout(() => setTyped(DEMO_URL.slice(0, typed.length + 1)), 80);
      } else {
        timer.current = setTimeout(() => setPhase("loading"), 700);
      }
    } else if (phase === "loading") {
      timer.current = setTimeout(() => setPhase("result"), 2000);
    } else if (phase === "result") {
      timer.current = setTimeout(() => setPhase("fade"), 4500);
    } else if (phase === "fade") {
      timer.current = setTimeout(() => { setTyped(""); setPhase("typing"); }, 700);
    }
    return clear;
  }, [phase, typed]);

  const showResult = phase === "result" || phase === "fade";

  return (
    <section className="py-24 md:py-32" style={{ background: "#faf8f5" }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">LIVE PREVIEW</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>See it in action</h2>
          <p className="mt-4 text-lg" style={{ color: "#5a5a52" }}>Watch Scrapitch turn a URL into 3 scored cold emails.</p>
        </div>

        <div
          className={`rounded-2xl transition-opacity duration-700 ${phase === "fade" ? "opacity-0" : "opacity-100"}`}
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.07)",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {/* URL input row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#f5f3ef", border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 16,
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#8a8a82" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
            <span style={{ flex: 1, fontFamily: "monospace", fontSize: 14, color: "#5a5a52" }}>
              {typed.length > 0
                ? <>{`https://${typed}`}</>
                : <span style={{ color: "#8a8a82" }}>https://</span>
              }
              {phase === "typing" && <span className="cursor-blink" style={{ color: "#1a1a1a" }}>|</span>}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 999, flexShrink: 0,
              background: showResult ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)",
              color: showResult ? "#22c55e" : "#3b82f6",
              border: `1px solid ${showResult ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.25)"}`,
            }}>
              {phase === "loading" ? "Analyzing…" : showResult ? "Done ✓" : "Analyze"}
            </span>
          </div>

          {/* Loading bar */}
          {(phase === "loading" || showResult) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#5a5a52" }}>
                  {phase === "loading" ? "Analyzing website…" : "Done · 3 emails ready"}
                </span>
                <span style={{ fontSize: 12, color: "#8a8a82" }}>{phase === "loading" ? "…" : "100%"}</span>
              </div>
              <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <div
                  className={phase === "loading" ? "demo-bar" : ""}
                  style={{
                    height: "100%", borderRadius: 999, background: "#3b82f6",
                    width: phase !== "loading" ? "100%" : undefined,
                  }}
                />
              </div>
            </div>
          )}

          {/* Email cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {showResult
              ? cards.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f8f6f2",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: 12,
                      padding: 16,
                      opacity: phase === "result" ? 1 : 0,
                      transform: phase === "result" ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 0.4s ease ${i * 120}ms, transform 0.4s ease ${i * 120}ms`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#5a5a52" }}>{card.label}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                        color: card.scoreColor, background: card.scoreBg, border: `1px solid ${card.scoreBorder}`,
                      }}>{card.score}/10</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#8a8a82", marginBottom: 8, fontStyle: "italic" }}>
                      &ldquo;{card.subject}&rdquo;
                    </p>
                    <p style={{ fontSize: 11, color: "#5a5a52", lineHeight: 1.6 }}>
                      {card.body.slice(0, 90)}…
                    </p>
                  </div>
                ))
              : [...Array(3)].map((_, i) => (
                  <div key={i} style={{
                    background: "#f8f6f2", border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 12, padding: 16,
                  }}>
                    <div style={{ height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4, width: "65%", marginBottom: 10 }} />
                    <div style={{ height: 6, background: "rgba(0,0,0,0.04)", borderRadius: 4, width: "80%", marginBottom: 6 }} />
                    <div style={{ height: 6, background: "rgba(0,0,0,0.04)", borderRadius: 4, width: "65%", marginBottom: 6 }} />
                    <div style={{ height: 6, background: "rgba(0,0,0,0.04)", borderRadius: 4, width: "50%" }} />
                  </div>
                ))
            }
          </div>

          {/* Footer row */}
          <div style={{
            marginTop: 16, paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 11, color: "#8a8a82" }}>Generated in ~9.4s</span>
            <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>✓ Follow-up sequence included</span>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#8a8a82", marginTop: 8 }}>
          Looping demo · real generation takes ~10 seconds
        </p>
      </div>
    </section>
  );
}
