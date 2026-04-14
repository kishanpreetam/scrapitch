"use client";

type Props = {
  q: string;
  a: string;
};

export default function PricingFaqItem({ q, a }: Props) {
  return (
    <details
      className="group rounded-xl border border-white/8 bg-[#141414]"
      style={{ transition: "all 0.2s ease" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.16)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      <summary className="flex cursor-pointer items-center justify-between px-6 py-5 font-semibold text-[#f5f5f0] hover:text-white transition-colors list-none">
        {q}
        <span className="ml-4 shrink-0 text-[#6b6b6b] text-lg leading-none transition-transform duration-300 group-open:rotate-180">
          ↓
        </span>
      </summary>
      <div className="border-t border-white/8 px-6 pb-5 pt-4 text-sm text-[#a8a8a8] leading-relaxed">
        {a}
      </div>
    </details>
  );
}
