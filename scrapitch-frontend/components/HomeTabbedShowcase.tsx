"use client";

import { useState } from "react";

const tabs = ["Email Variants", "Follow-up Sequence", "Reply Scoring", "Tone Matching"] as const;
type Tab = typeof tabs[number];

function EmailVariantsTab() {
  const variants = [
    {
      label: "A · Direct / PAS", score: 9, scoreColor: "#22c55e", scoreBg: "rgba(34,197,94,0.1)", scoreBorder: "rgba(34,197,94,0.25)",
      subject: "Your pipeline gap",
      body: "Most agencies lose 30–40% of inbound leads before conversion. We fix that with AI-written follow-up sequences that reference what each prospect actually cares about.",
    },
    {
      label: "B · Value-First", score: 8, scoreColor: "#f59e0b", scoreBg: "rgba(245,158,11,0.1)", scoreBorder: "rgba(245,158,11,0.25)",
      subject: "2x reply rate, zero extra work",
      body: "Agencies using personalized cold outreach see 2x reply rates vs templated emails. Scrapitch writes them in 10 seconds per prospect, no LinkedIn needed.",
    },
    {
      label: "C · The Curious", score: 9, scoreColor: "#22c55e", scoreBg: "rgba(34,197,94,0.1)", scoreBorder: "rgba(34,197,94,0.25)",
      subject: "Noticed your case study",
      body: "Just read your SaaS growth case study. Impressive 3x result. Curious whether you're personalizing your outreach yet or still doing it manually.",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {variants.map((v, i) => (
        <div key={i} style={{
          background: "#f8f6f2", border: "1px solid rgba(0,0,0,0.06)",
          borderLeft: `3px solid ${["#3b82f6", "#22c55e", "#f59e0b"][i]}`,
          borderRadius: 14, padding: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#5a5a52" }}>{v.label}</span>
            <span style={{
              fontSize: 12, fontWeight: 800, padding: "2px 9px", borderRadius: 6,
              color: v.scoreColor, background: v.scoreBg, border: `1px solid ${v.scoreBorder}`,
            }}>{v.score}/10</span>
          </div>
          <p style={{ fontSize: 11, color: "#8a8a82", marginBottom: 10, fontWeight: 600, fontFamily: "monospace" }}>
            Subject: &ldquo;{v.subject}&rdquo;
          </p>
          <p style={{ fontSize: 12, color: "#5a5a52", lineHeight: 1.6 }}>{v.body}</p>
        </div>
      ))}
    </div>
  );
}

function FollowUpTab() {
  const days = [
    {
      day: "Day 3",
      label: "Light bump",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.05)",
      border: "rgba(59,130,246,0.2)",
      body: "Just wanted to follow up on my last email. Still think there's a fit here, happy to keep it to 15 minutes if that's easier.",
    },
    {
      day: "Day 7",
      label: "New value angle",
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.05)",
      border: "rgba(124,58,237,0.2)",
      body: "One more thought: we helped a similar agency cut outreach time by 80% last quarter. Worth a quick chat to see if it translates to your setup?",
    },
    {
      day: "Day 14",
      label: "Breakup email",
      color: "#8a8a82",
      bg: "rgba(0,0,0,0.03)",
      border: "rgba(0,0,0,0.1)",
      body: "I'll leave it here. If the timing's off, no worries at all. Feel free to reach out whenever it makes sense. Good luck with the growth work.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {days.map((d, i) => (
        <div key={i} style={{
          background: d.bg, border: `1px solid ${d.border}`,
          borderRadius: 14, padding: 20, display: "flex", gap: 16,
        }}>
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: d.color, display: "block" }}>{d.day}</span>
            <span style={{ fontSize: 10, color: "#8a8a82", whiteSpace: "nowrap" }}>{d.label}</span>
          </div>
          <div style={{ width: 1, background: `${d.color}30`, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.6, flex: 1 }}>{d.body}</p>
        </div>
      ))}
    </div>
  );
}

function ScoringTab() {
  const factors = [
    { label: "Personalization depth", weight: 30, score: 9 },
    { label: "Email length", weight: 20, score: 8 },
    { label: "Single CTA", weight: 15, score: 10 },
    { label: "Problem-first framing", weight: 15, score: 9 },
    { label: "Subject line quality", weight: 10, score: 8 },
    { label: "No spam phrases", weight: 10, score: 10 },
  ];
  const total = Math.round(factors.reduce((acc, f) => acc + (f.score * f.weight / 10), 0) / 10);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)",
        }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#22c55e" }}>{total}</span>
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>Reply Rate Score</p>
          <p style={{ fontSize: 13, color: "#5a5a52" }}>Weighted across 6 factors · explains what to improve</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {factors.map((f, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: "#5a5a52" }}>{f.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#8a8a82" }}>{f.weight}% weight</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: f.score >= 9 ? "#22c55e" : f.score >= 7 ? "#f59e0b" : "#ef4444" }}>
                  {f.score}/10
                </span>
              </div>
            </div>
            <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: f.score >= 9 ? "#22c55e" : f.score >= 7 ? "#f59e0b" : "#ef4444",
                width: `${f.score * 10}%`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToneTab() {
  const tones = ["Professional", "Casual", "Bold"] as const;
  const [selected, setSelected] = useState<typeof tones[number]>("Professional");

  const examples = {
    Professional: {
      before: "I hope this email finds you well. I am reaching out to explore potential synergies between our organizations.",
      after: "Read through your homepage. You're serving B2B clients who care about ROI. Here's how we can help you book more of them.",
    },
    Casual: {
      before: "Hey! Just saw your site and thought it was super cool. Would love to chat sometime if you're free!",
      after: "Saw you're scaling your agency. We help teams like yours cut outreach time by 80%. Quick call this week?",
    },
    Bold: {
      before: "Our revolutionary solution will transform your business and disrupt the market with unprecedented results.",
      after: "Your competitors are already using personalized outreach. You're not. That gap costs you deals every week.",
    },
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tones.map((tone) => (
          <button
            key={tone}
            onClick={() => setSelected(tone)}
            style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: selected === tone ? "rgba(59,130,246,0.12)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${selected === tone ? "rgba(59,130,246,0.4)" : "rgba(0,0,0,0.08)"}`,
              color: selected === tone ? "#3b82f6" : "#5a5a52",
              transition: "all 0.2s ease",
            }}
          >
            {tone}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#3b82f6", fontWeight: 600, display: "flex", alignItems: "center" }}>
          Detected: {selected}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Generic opener</p>
          <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.6, fontStyle: "italic" }}>&ldquo;{examples[selected].before}&rdquo;</p>
        </div>
        <div style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Scrapitch output</p>
          <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.6, fontStyle: "italic" }}>&ldquo;{examples[selected].after}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}

export default function HomeTabbedShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>("Email Variants");

  const content: Record<Tab, React.ReactNode> = {
    "Email Variants": <EmailVariantsTab />,
    "Follow-up Sequence": <FollowUpTab />,
    "Reply Scoring": <ScoringTab />,
    "Tone Matching": <ToneTab />,
  };

  return (
    <section className="border-t border-[#e8e4dc] py-24 md:py-32" style={{ background: "#f0ede7" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">FEATURES</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
            Everything you need to close more deals
          </h2>
          <p className="mt-4 text-lg" style={{ color: "#5a5a52" }}>Not a template engine. A research and writing layer that reads, understands, and writes.</p>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 4, background: "white",
          border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12,
          padding: 4, marginBottom: 24, overflowX: "auto",
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

        {/* Tab content */}
        <div style={{
          background: "white", border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16, padding: 24, minHeight: 280,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {content[activeTab]}
        </div>
      </div>
    </section>
  );
}
