"use client";

import { useState } from "react";

const tabs = ["Email Variants", "Follow-up Sequence", "Reply Scoring", "Tone Matching"] as const;
type Tab = typeof tabs[number];

// ── Tab 1: Email Variants ─────────────────────────────────────────

function EmailVariantsTab() {
  const variants = [
    {
      variantId: "A",
      label: "The Direct / PAS",
      accentColor: "#3b82f6",
      score: 9,
      scoreColor: "#22c55e",
      scoreBg: "rgba(34,197,94,0.1)",
      scoreBorder: "rgba(34,197,94,0.25)",
      subject: "Your pipeline gap",
      preview: "Most agencies lose 30–40% of inbound leads before conversion. We fix that with AI-written follow-up sequences that reference what each prospect actually cares about.",
    },
    {
      variantId: "B",
      label: "Value-First",
      accentColor: "#22c55e",
      score: 8,
      scoreColor: "#f59e0b",
      scoreBg: "rgba(245,158,11,0.1)",
      scoreBorder: "rgba(245,158,11,0.25)",
      subject: "2x reply rate, zero extra work",
      preview: "Agencies using personalized cold outreach see 2x reply rates vs templates. Scrapitch writes them in 10 seconds per prospect. No LinkedIn needed.",
    },
    {
      variantId: "C",
      label: "The Curious",
      accentColor: "#f59e0b",
      score: 9,
      scoreColor: "#22c55e",
      scoreBg: "rgba(34,197,94,0.1)",
      scoreBorder: "rgba(34,197,94,0.25)",
      subject: "Noticed your case study",
      preview: "Just read your SaaS growth case study. Impressive 3x result. Curious whether you're personalizing your outreach yet or still doing it manually.",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "stretch" }}>
      {variants.map((v) => (
        <div
          key={v.variantId}
          style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.07)",
            borderLeft: `3px solid ${v.accentColor}`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Card header */}
          <div style={{
            padding: "13px 16px 11px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            background: "#faf8f5",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#8a8a82",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                Variant {v.variantId}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                color: v.scoreColor, background: v.scoreBg, border: `1px solid ${v.scoreBorder}`,
              }}>
                {v.score}/10
              </span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{v.label}</p>
          </div>

          {/* Email preview */}
          <div style={{ padding: "12px 16px", flex: 1 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: "#8a8a82",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4,
            }}>Subject</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 10 }}>
              {v.subject}
            </p>
            <p style={{ fontSize: 12, color: "#5a5a52", lineHeight: 1.65 }}>
              {v.preview}
            </p>
          </div>

          {/* Footer */}
          <div style={{
            padding: "8px 16px",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "flex-end",
          }}>
            <button style={{
              fontSize: 12, fontWeight: 600, color: "#3b82f6",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}>
              Copy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab 2: Follow-up Sequence ─────────────────────────────────────

function FollowUpTab() {
  const sequence = [
    {
      day: "Day 3",
      type: "Light bump",
      subject: "Quick follow-up",
      body: "Just wanted to resurface this. Still think there's a fit here. Happy to keep it to 15 minutes if that's easier.",
      isLast: false,
    },
    {
      day: "Day 7",
      type: "New angle",
      subject: "Something worth sharing",
      body: "We helped a similar agency cut outreach time by 80% last quarter. Wanted to share in case it's useful context for your team.",
      isLast: false,
    },
    {
      day: "Day 14",
      type: "Breakup email",
      subject: "Closing the loop",
      body: "I'll leave it here. If the timing's ever right, you know where to find me. Good luck with the growth work.",
      isLast: true,
    },
  ];

  return (
    <div style={{ position: "relative", paddingLeft: 44 }}>
      {/* Vertical timeline line */}
      <div style={{
        position: "absolute",
        left: 12,
        top: 18,
        bottom: 18,
        width: 2,
        borderRadius: 999,
        background: "linear-gradient(to bottom, #3b82f6 0%, #3b82f6 62%, #d1d5db 62%, #d1d5db 100%)",
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sequence.map((item, i) => (
          <div key={i} style={{ position: "relative" }}>
            {/* Timeline dot */}
            <div style={{
              position: "absolute",
              left: -38,
              top: 18,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: item.isLast ? "#d1d5db" : "#3b82f6",
              boxShadow: item.isLast ? "none" : "0 0 0 3px rgba(59,130,246,0.15)",
            }} />

            {/* Card */}
            <div style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: 12,
              padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  color: item.isLast ? "#8a8a82" : "#3b82f6",
                  background: item.isLast ? "rgba(0,0,0,0.04)" : "rgba(59,130,246,0.08)",
                  border: `1px solid ${item.isLast ? "rgba(0,0,0,0.1)" : "rgba(59,130,246,0.2)"}`,
                  padding: "2px 8px", borderRadius: 6,
                }}>
                  {item.day}
                </span>
                <span style={{ fontSize: 11, color: "#8a8a82", fontWeight: 500 }}>{item.type}</span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 5 }}>
                &ldquo;{item.subject}&rdquo;
              </p>
              <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.6 }}>{item.body}</p>
              <p style={{ fontSize: 11, color: "#8a8a82", marginTop: 8 }}>
                Under 50 words · Single CTA
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Reply Scoring ──────────────────────────────────────────

function ScoringTab() {
  const factors = [
    { label: "Personalization depth", weight: 30, fill: 90, score: 9 },
    { label: "Length compliance",      weight: 20, fill: 100, score: 10 },
    { label: "Single CTA",             weight: 15, fill: 100, score: 10 },
    { label: "Problem-first framing",  weight: 15, fill: 85,  score: 8 },
    { label: "Subject line quality",   weight: 10, fill: 80,  score: 8 },
    { label: "No spam phrases",        weight: 10, fill: 100, score: 10 },
  ];

  return (
    <div>
      {/* Score header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        marginBottom: 24, paddingBottom: 20,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(34,197,94,0.08)", border: "2px solid rgba(34,197,94,0.25)",
        }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>9</span>
          <span style={{ fontSize: 11, color: "#8a8a82", fontWeight: 600 }}>/10</span>
        </div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", marginBottom: 2 }}>Reply Rate Score</p>
          <p style={{ fontSize: 13, color: "#5a5a52", marginBottom: 8 }}>Weighted across 6 factors</p>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: "#15803d",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            padding: "3px 10px", borderRadius: 999,
          }}>
            Strong send
          </span>
        </div>
      </div>

      {/* Factor bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 20 }}>
        {factors.map((f, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500, flex: 1 }}>{f.label}</span>
              <span style={{ fontSize: 11, color: "#8a8a82", marginRight: 10 }}>{f.weight}% weight</span>
              <span style={{
                fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: "right",
                color: f.score >= 9 ? "#22c55e" : "#f59e0b",
              }}>
                {f.score}/10
              </span>
            </div>
            <div style={{ height: 6, background: "#e5e5e0", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: "#3b82f6",
                width: `${f.fill}%`,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Reasoning box */}
      <div style={{
        background: "#f8f6f2",
        border: "1px solid rgba(0,0,0,0.07)",
        borderLeft: "3px solid #3b82f6",
        borderRadius: 10,
        padding: "12px 16px",
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#3b82f6",
          marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Score Reasoning
        </p>
        <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.65 }}>
          Strong personalization referencing their case study. Clean single CTA. Subject line is specific and under 6 words.
        </p>
      </div>
    </div>
  );
}

// ── Tab 4: Tone Matching ──────────────────────────────────────────

function ToneTab() {
  return (
    <div>
      {/* Detected tone header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#5a5a52", fontWeight: 600, marginRight: 2 }}>Detected tone:</span>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.35)",
          color: "#3b82f6",
        }}>
          Professional
        </span>
        <span style={{
          fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 999,
          background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)",
          color: "#8a8a82",
        }}>
          Casual
        </span>
        <span style={{
          fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 999,
          background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)",
          color: "#8a8a82",
        }}>
          Bold
        </span>
      </div>

      {/* Before / After cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Before */}
        <div style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.07)",
          borderLeft: "3px solid #e8a87c",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: "#8a8a82",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
          }}>
            Before (no tone matching)
          </p>
          <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.7, fontStyle: "italic", marginBottom: 16, flex: 1 }}>
            &ldquo;Dear Sir/Madam, I am writing to inquire about a potential partnership between our organizations. Our company provides solutions that may be of interest.&rdquo;
          </p>
          <span style={{
            display: "inline-flex", alignItems: "center", alignSelf: "flex-start",
            fontSize: 11, fontWeight: 600, color: "#c2410c",
            background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
            padding: "3px 10px", borderRadius: 999,
          }}>
            Mismatch: formal tone sent to a casual brand
          </span>
        </div>

        {/* After */}
        <div style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.07)",
          borderLeft: "3px solid #3b82f6",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: "#3b82f6",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
          }}>
            After (tone matched)
          </p>
          <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.7, fontStyle: "italic", marginBottom: 16, flex: 1 }}>
            &ldquo;Hey, read through your site. You&apos;re helping B2B clients crush their ROI targets. We do something similar for outreach. Worth a quick chat?&rdquo;
          </p>
          <span style={{
            display: "inline-flex", alignItems: "center", alignSelf: "flex-start",
            fontSize: 11, fontWeight: 600, color: "#15803d",
            background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)",
            padding: "3px 10px", borderRadius: 999,
          }}>
            Match: casual tone matches their website voice
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────

export default function HomeTabbedShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>("Email Variants");

  const content: Record<Tab, React.ReactNode> = {
    "Email Variants":    <EmailVariantsTab />,
    "Follow-up Sequence": <FollowUpTab />,
    "Reply Scoring":     <ScoringTab />,
    "Tone Matching":     <ToneTab />,
  };

  return (
    <section className="border-t border-[#e8e4dc] py-24 md:py-32" style={{ background: "#f0ede7" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">FEATURES</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
            Everything you need to close more deals
          </h2>
          <p className="mt-4 text-lg" style={{ color: "#5a5a52" }}>
            Not a template engine. A research and writing layer that reads, understands, and writes.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 4,
          background: "white",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          overflowX: "auto",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, minWidth: 120, padding: "9px 16px", borderRadius: 999,
                fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                background: activeTab === tab ? "#3b82f6" : "transparent",
                color: activeTab === tab ? "white" : "#8a8a82",
                border: `1px solid ${activeTab === tab ? "#3b82f6" : "transparent"}`,
                transition: "all 0.2s ease",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content panel */}
        <div style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          padding: 28,
          minHeight: 350,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {content[activeTab]}
        </div>
      </div>
    </section>
  );
}
