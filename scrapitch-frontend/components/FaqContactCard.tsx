"use client";

import Link from "next/link";

export default function FaqContactCard() {
  return (
    <div
      className="rounded-2xl border border-white/8 bg-[#141414] p-10 sm:p-14"
      style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "";
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
        Still have a question?
      </h2>
      <p className="text-[#a8a8a8] mb-10 text-base sm:text-lg">
        We respond within 24 hours.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="mailto:hello@scrapitch.com"
          className="w-full sm:w-auto rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-[#d4d4d4] hover:border-white/25 hover:text-white transition-colors text-center"
        >
          Email us → hello@scrapitch.com
        </Link>
        <Link
          href="/signup"
          className="w-full sm:w-auto rounded-xl bg-[#7c3aed] px-6 py-3 text-sm font-bold text-white hover:bg-[#6d28d9] transition-colors text-center"
        >
          Try Scrapitch free →
        </Link>
      </div>
    </div>
  );
}
