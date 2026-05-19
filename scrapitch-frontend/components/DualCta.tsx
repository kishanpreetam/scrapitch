import Link from "next/link";

type CtaLink = { href: string; label: string };

export default function DualCta({
  primary,
  secondary,
}: {
  primary: CtaLink;
  secondary: CtaLink;
}) {
  return (
    <>
      {/* Mobile: stacked outlined buttons */}
      <div className="flex flex-col md:hidden" style={{ gap: 12 }}>
        <Link
          href={primary.href}
          className="block text-center transition-colors hover:bg-[#3b82f6]/5"
          style={{
            border: "1px solid #3b82f6",
            color: "#3b82f6",
            padding: 14,
            borderRadius: 4,
            fontWeight: 500,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          {primary.label}
        </Link>
        <Link
          href={secondary.href}
          className="block text-center transition-colors hover:bg-white/5"
          style={{
            border: "1px solid #c9b896",
            color: "#f5f5f0",
            padding: 14,
            borderRadius: 4,
            fontWeight: 500,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          {secondary.label}
        </Link>
      </div>

      {/* Desktop: text link + divider */}
      <div className="hidden md:flex items-center justify-center">
        <Link
          href={primary.href}
          className="hover:underline"
          style={{
            color: "#3b82f6",
            fontWeight: 500,
            fontSize: 17,
            textDecoration: "none",
          }}
        >
          {primary.label}
        </Link>
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 1,
            height: 12,
            background: "#3a3328",
            margin: "0 20px",
          }}
        />
        <Link
          href={secondary.href}
          className="hover:text-[#3b82f6] transition-colors"
          style={{
            color: "#f5f5f0",
            fontWeight: 500,
            fontSize: 17,
            textDecoration: "none",
          }}
        >
          {secondary.label}
        </Link>
      </div>
    </>
  );
}
