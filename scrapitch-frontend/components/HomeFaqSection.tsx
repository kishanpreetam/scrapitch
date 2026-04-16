"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "How does Scrapitch personalize emails without LinkedIn?",
    a: "It reads the prospect's actual website: homepage hero copy, about page, case studies, and value proposition. It passes that as structured context to our AI. Every email must reference specific details scraped from their site. There's no generic template involved.",
  },
  {
    q: "What industries does it support?",
    a: "12 verticals with tailored frameworks: B2B SaaS, Marketing & Creative Agency, Sales & Revenue Consulting, IT Services & MSP, Recruiting & Staffing, Legal Services, Financial Services & Fintech, Real Estate, Healthcare & MedTech, Manufacturing & Industrial, Ecommerce & DTC, and Freelancer / Solo Consultant. Auto-detect picks the right one from the URL.",
  },
  {
    q: "How is the reply rate score calculated?",
    a: "Each email is scored 1–10 across six factors: personalization depth (30%), email length (20%), CTA clarity (15%), problem framing (15%), subject line quality (10%), and spam avoidance (10%). The score comes with written reasoning so you understand what to fix.",
  },
  {
    q: "How is this different from other email tools?",
    a: "Most tools require you to do all the research yourself. Scrapitch does the research layer automatically: it scrapes the site, detects the industry, matches the tone, selects the right framework, and returns three ready-to-send emails with scoring. URL to email in 10 seconds, not 20 minutes.",
  },
  {
    q: "Do you store my data or the prospect's data?",
    a: "Scraped content is used only within the request lifecycle to generate emails, then discarded. We do not persist prospect website data, scraped text, or generated email content after the API response is returned. Your account stores only your email address and generation count.",
  },
];

export default function HomeFaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-[#e8e4dc] py-24 md:py-32" style={{ background: "#faf8f5" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>Common questions</h2>
          <p className="mt-4 text-lg" style={{ color: "#5a5a52" }}>Real answers. No vague marketing speak.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: "#ffffff",
                border: `1px solid ${open === i ? "rgba(59,130,246,0.25)" : "rgba(0,0,0,0.08)"}`,
                borderLeft: open === i ? "3px solid #3b82f6" : "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "18px 22px",
                  textAlign: "left", cursor: "pointer", background: "transparent", border: "none",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", flex: 1, paddingRight: 16 }}>
                  {faq.q}
                </span>
                <span style={{
                  flexShrink: 0, fontSize: 18, color: "#3b82f6", fontWeight: 700,
                  transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  display: "block",
                  lineHeight: 1,
                }}>
                  ↓
                </span>
              </button>
              <div style={{
                maxHeight: open === i ? 300 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}>
                <div style={{
                  padding: "16px 22px 18px",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                }}>
                  <p style={{ fontSize: 14, color: "#5a5a52", lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link
            href="/faq"
            style={{
              fontSize: 14, fontWeight: 600, color: "#3b82f6",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3b82f6")}
          >
            See all questions
          </Link>
        </div>
      </div>
    </section>
  );
}
