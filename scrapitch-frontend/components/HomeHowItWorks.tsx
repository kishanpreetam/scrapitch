"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "01",
    title: "Paste URL",
    desc: "Drop in any company website. That is all you need to provide.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Research Agent",
    desc: "Agent 1 reads their homepage and about page. It extracts company details, industry, tone, pain points, and specific references worth mentioning in an email.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Writing Agent",
    desc: "Agent 2 takes the research and writes 3 variants (Direct, Value First, Curious) with industry matched tone, 3 subject lines each, and a Day 3, 7, 14 follow up sequence.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Scoring Agent",
    desc: "Agent 3 independently evaluates each email across 6 factors. Personalization depth, length, CTA quality, problem first framing, subject line, and spam phrases.",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function HomeHowItWorks() {
  const [activeStep, setActiveStep] = useState(-1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep((prev) => Math.max(prev, i));
          }
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="border-t border-[#e8e4dc] py-24 md:py-32" style={{ background: "#faf8f5" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">HOW IT WORKS</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
            Three agents.{" "}
            <span style={{ color: "#3b82f6" }}>Ten seconds.</span>
          </h2>
          <p className="mt-4 text-lg" style={{ color: "#5a5a52" }}>One URL in. Three specialized AI agents do the rest.</p>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:grid grid-cols-4 gap-3">
          {steps.map((step, i) => (
            <div key={i} style={{ position: "relative" }}>
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute",
                  top: 36,
                  left: "calc(50% + 28px)",
                  right: "-50%",
                  height: 1,
                  zIndex: 0,
                  background: i < activeStep ? "#3b82f6" : "rgba(0,0,0,0.08)",
                  transition: "background 0.5s ease",
                }} />
              )}
              <div
                ref={(el) => { stepRefs.current[i] = el; }}
                className="hover:-translate-y-0.5"
                style={{
                  padding: "24px 20px",
                  borderRadius: 16,
                  border: `1px solid ${i <= activeStep ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.08)"}`,
                  background: i <= activeStep ? "rgba(59,130,246,0.05)" : "#ffffff",
                  boxShadow: i <= activeStep ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.5s ease",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i <= activeStep ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.06)",
                  color: i <= activeStep ? "#3b82f6" : "#8a8a82",
                  transition: "all 0.5s ease",
                }}>
                  {step.icon}
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 26, height: 26, borderRadius: "50%", marginBottom: 10,
                  background: i <= activeStep ? "rgba(59,130,246,0.12)" : "rgba(0,0,0,0.05)",
                  border: `1px solid ${i <= activeStep ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.1)"}`,
                  fontSize: 10, fontWeight: 800, fontFamily: "monospace",
                  color: i <= activeStep ? "#3b82f6" : "#8a8a82",
                  transition: "all 0.5s ease",
                }}>
                  {step.num}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden flex flex-col gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => { stepRefs.current[i] = el; }}
              style={{
                padding: "20px 24px",
                borderRadius: 16,
                border: `1px solid ${i <= activeStep ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.08)"}`,
                background: i <= activeStep ? "rgba(59,130,246,0.05)" : "#ffffff",
                boxShadow: i <= activeStep ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                display: "flex", gap: 16, alignItems: "flex-start",
                transition: "all 0.5s ease",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: i <= activeStep ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.06)",
                color: i <= activeStep ? "#3b82f6" : "#8a8a82",
                transition: "all 0.5s ease",
              }}>
                {step.icon}
              </div>
              <div>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 26, height: 26, borderRadius: "50%", marginBottom: 8,
                  background: i <= activeStep ? "rgba(59,130,246,0.12)" : "rgba(0,0,0,0.05)",
                  border: `1px solid ${i <= activeStep ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.1)"}`,
                  fontSize: 10, fontWeight: 800, fontFamily: "monospace",
                  color: i <= activeStep ? "#3b82f6" : "#8a8a82",
                  transition: "all 0.5s ease",
                }}>
                  {step.num}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: "#5a5a52", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
