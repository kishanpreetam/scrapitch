"use client";

import { Briefcase, GraduationCap, Target, Crown, Coffee } from "lucide-react";

const useCases = [
  {
    icon: Briefcase,
    title: "B2B Sales",
    description: "Pitch a product or service to a business prospect. Short, outcome-led, replies fast.",
  },
  {
    icon: GraduationCap,
    title: "Master's and PhD Outreach",
    description: "Reach out to professors and labs about research opportunities. Specific, respectful, substantive.",
  },
  {
    icon: Target,
    title: "Job Hunt",
    description: "Cold message hiring managers and recruiters. Confident, never desperate.",
  },
  {
    icon: Crown,
    title: "Executive Outreach",
    description: "Peer-to-peer notes to C-suite contacts. Ultra-concise, insight-driven, zero fluff.",
  },
  {
    icon: Coffee,
    title: "Networking",
    description: "Warm intros and coffee chats. Human, low-pressure, builds real connections.",
  },
];

export default function HomeUseCases() {
  return (
    <section className="border-t border-[#e8e4dc] py-24 md:py-32" style={{ background: "#f0ede7" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-3">OUTREACH TYPES</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
            Built for every kind of outreach
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: "#5a5a52" }}>
            Sales is just one job. Scrapitch personalizes for every cold email you write.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl p-7 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl mb-5"
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(59,130,246,0.08)",
                  color: "#3b82f6",
                  border: "1px solid rgba(59,130,246,0.15)",
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <p className="text-base font-bold mb-2" style={{ color: "#1a1a1a" }}>
                {title}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#5a5a52" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
