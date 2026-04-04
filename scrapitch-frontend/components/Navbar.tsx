"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/use-cases",    label: "Use Cases" },
  { href: "/pricing",      label: "Pricing" },
  { href: "/faq",          label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/10 ${
        scrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-10 lg:px-12">
        <div className="relative flex items-center justify-between py-5">

          {/* Logo — far left */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group z-10">
            <span className="text-xl select-none">⚡</span>
            <span className="text-2xl font-black tracking-tight">
              <span className="text-white">Scrap</span><span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">itch</span>
            </span>
          </Link>

          {/* Nav links — absolutely centered */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-base font-semibold tracking-wide transition-colors whitespace-nowrap ${
                  pathname === href
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA — far right */}
          <div className="hidden md:flex items-center gap-4 shrink-0 z-10">
            <Link
              href="/login"
              className="text-base font-medium text-zinc-400 hover:text-zinc-100 transition-colors whitespace-nowrap"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-base font-bold text-white hover:opacity-90 transition-opacity"
            >
              Sign Up Free →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] text-zinc-400 hover:text-zinc-200 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-200 origin-center ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-200 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0a] px-4 py-5 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                pathname === href
                  ? "text-white bg-white/[0.06]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/[0.06] mt-3 flex flex-col gap-2">
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="block text-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-base font-bold text-white hover:opacity-90 transition-opacity"
            >
              Sign Up Free →
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center rounded-xl border border-white/[0.08] px-6 py-3 text-base font-medium text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
