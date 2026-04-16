"use client";

import { useEffect, useRef, useState } from "react";

const withoutSteps = [
  { label: "Google the company", status: "done" as const },
  { label: "Read their about page", status: "done" as const },
  { label: "Find pain points", status: "active" as const },
  { label: "Write email draft", status: "pending" as const },
  { label: "Write 2 more variants", status: "pending" as const },
  { label: "Create follow-ups", status: "pending" as const },
];

const withSteps = [
  { label: "Paste URL" },
  { label: "AI scrapes & analyzes" },
  { label: "3 emails generated" },
  { label: "Follow-ups ready" },
  { label: "Scores calculated" },
  { label: "Copy & send" },
];

export default function HomeComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="border-t border-slate-200 py-24 md:py-32" style={{ background: "#f8fafc" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">COMPARISON</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#0f172a" }}>
            Manual research vs Scrapitch
          </h2>
          <p className="mt-4 text-lg" style={{ color: "#475569" }}>
            Same result. Radically different time investment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Without Scrapitch */}
          <div style={{
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
            padding: 28,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>Without Scrapitch</h3>
                <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>Est. 25–30 minutes</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)",
              }}>Manual</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#475569" }}>Progress</span>
                <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>42%</span>
              </div>
              <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: "linear-gradient(90deg, #ef4444, #f87171)",
                  borderRadius: 999,
                  width: visible ? "42%" : "0%",
                  transition: "width 1.8s ease-out 0.3s",
                }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {withoutSteps.map((step) => {
                const isDone = step.status === "done";
                const isActive = step.status === "active";
                return (
                  <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      background: isDone ? "rgba(239,68,68,0.12)" : isActive ? "rgba(245,158,11,0.12)" : "rgba(0,0,0,0.04)",
                      color: isDone ? "#ef4444" : isActive ? "#f59e0b" : "#94a3b8",
                      border: `1px solid ${isDone ? "rgba(239,68,68,0.3)" : isActive ? "rgba(245,158,11,0.3)" : "rgba(0,0,0,0.08)"}`,
                    }}>
                      {isDone ? "✓" : isActive ? "…" : "○"}
                    </span>
                    <span style={{ fontSize: 14, color: step.status === "pending" ? "#94a3b8" : "#475569", flex: 1 }}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>In progress</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* With Scrapitch */}
          <div style={{
            background: "rgba(59,130,246,0.04)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 16,
            padding: 28,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>With Scrapitch</h3>
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>Est. 10 seconds</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)",
              }}>Automated</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#475569" }}>Progress</span>
                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>100%</span>
              </div>
              <div style={{ height: 6, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                  borderRadius: 999,
                  width: visible ? "100%" : "0%",
                  transition: "width 0.9s ease-out 0.3s",
                }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {withSteps.map((step, i) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    background: visible ? "rgba(59,130,246,0.15)" : "rgba(0,0,0,0.04)",
                    color: visible ? "#3b82f6" : "#94a3b8",
                    border: `1px solid ${visible ? "rgba(59,130,246,0.35)" : "rgba(0,0,0,0.08)"}`,
                    transition: `all 0.3s ease ${i * 80}ms`,
                  }}>
                    {visible ? "✓" : "○"}
                  </span>
                  <span style={{
                    fontSize: 14,
                    color: visible ? "#475569" : "#94a3b8",
                    transition: `color 0.3s ease ${i * 80}ms`,
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
