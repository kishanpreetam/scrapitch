import Link from "next/link";

const footerLinks = {
  Product: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/use-cases",    label: "Use Cases" },
    { href: "/generator",    label: "Generator" },
  ],
  Company: [
    { href: "/pricing", label: "Pricing" },
    { href: "/faq",     label: "FAQ" },
  ],
  Legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "GDPR Policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-purple-400/30 bg-[#0a0a0a] mt-auto">
      <div className="w-full px-10 lg:px-16 py-10">

        {/* 4-column grid — brand wider on the left */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-16">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1.5 mb-3">
              <span className="text-sm font-black tracking-tight">
                <span className="text-white">Scrap</span><span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">itch</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              AI cold email from any URL. 3 scored variants in seconds.
            </p>
            <p className="mt-3 text-xs text-zinc-600">$9.99/mo · Cancel anytime</p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                {group}
              </p>
              <ul className="space-y-3">
                {items.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
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
        <div className="mt-8 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Scrapitch. All rights reserved.</p>
          <p className="text-center text-zinc-700 max-w-md">
            AI-generated emails are suggestions only. Users are responsible for compliance with CAN-SPAM, GDPR, and CASL.
          </p>
          <p>Built for agency owners, SDRs &amp; freelancers.</p>
        </div>
      </div>
    </footer>
  );
}
