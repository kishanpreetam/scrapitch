import Link from "next/link";

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

const footerLinks = {
  Product: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/generator", label: "Generator" },
  ],
  Company: [
    { href: "/faq", label: "FAQ" },
  ],
  Legal: [
    { href: "#", label: "Privacy policy" },
    { href: "#", label: "Terms of service" },
    { href: "#", label: "GDPR policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto" style={{ background: "#0a0a0a", borderTop: "1px solid #2c241c" }}>
      <div className="w-full px-10 lg:px-16 py-10">

        {/* 4-column grid — brand wider on the left */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-16">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center mb-3">
              <span style={{ fontWeight: 500, fontSize: 18, letterSpacing: "-0.01em" }}>
                <span style={{ color: "#f5f5f0" }}>Scrap</span>
                <span
                  style={{
                    fontFamily: SERIF_STACK,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#c9b896",
                  }}
                >
                  itch
                </span>
              </span>
            </Link>
            <p style={{ fontSize: 14, color: "#8a8a85", lineHeight: 1.55 }}>
              AI cold outreach from any URL. Three scored drafts in ten seconds.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, items]) => (
            <div key={group}>
              <p
                className="font-mono"
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "#c9b896",
                  letterSpacing: "0.04em",
                  marginBottom: 14,
                }}
              >
                {group}
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="transition-colors hover:text-[#f5f5f0]"
                      style={{
                        fontSize: 15,
                        fontWeight: 400,
                        color: "#8a8a85",
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 py-6 flex flex-col sm:flex-row items-center justify-between"
          style={{ borderTop: "1px solid #2c241c", gap: 12 }}
        >
          <p
            className="font-mono"
            style={{ fontSize: 12, color: "#6e6657", letterSpacing: "0.02em" }}
          >
            © {new Date().getFullYear()} Scrapitch · Solo founder, Boston
          </p>
          <p
            className="font-mono text-center"
            style={{
              fontSize: 12,
              color: "#6e6657",
              letterSpacing: "0.02em",
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            AI-generated emails are suggestions only. Users are responsible for compliance with CAN-SPAM, GDPR, and CASL.
          </p>
        </div>
      </div>
    </footer>
  );
}
