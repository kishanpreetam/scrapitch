"use client";

type Props = {
  q: string;
  a: string;
};

export default function FaqAccordionItem({ q, a }: Props) {
  return (
    <details
      className="group rounded-2xl border border-white/8 bg-[#141414] overflow-hidden"
      style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.16)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-5 list-none">
        <span className="font-semibold text-[#f5f5f0] group-hover:text-white transition-colors text-sm sm:text-base leading-snug">
          {q}
        </span>
        <span
          className="text-[#6b6b6b] shrink-0 mt-0.5 transition-transform duration-300 group-open:rotate-180 text-base leading-none"
          aria-hidden="true"
        >
          ↓
        </span>
      </summary>
      <div className="px-5 pb-5 pt-3 text-sm text-[#a8a8a8] leading-relaxed border-t border-white/6">
        {a}
      </div>
    </details>
  );
}
