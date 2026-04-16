"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Zap, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { href: "/",             label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/use-cases",    label: "Use Cases" },
  { href: "/faq",          label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-white/8"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="w-full px-6 lg:px-10">
        <div className="relative flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 z-10">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">Scrap</span><span className="text-[#3b82f6]">itch</span>
            </span>
          </Link>

          {/* Nav links — centered */}
          <nav className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href
                    ? "text-[#3b82f6]"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 shrink-0 z-10">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full bg-white/6 border border-white/10 px-4 py-1.5 hover:bg-white/10 hover:border-white/15 transition-all"
                  aria-label="Account menu"
                >
                  <span className="text-sm font-medium text-white">
                    {((user.user_metadata?.name || user.email?.split("@")[0] || "Account") as string).split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#888888] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl border border-white/8 bg-[#141414] shadow-xl overflow-hidden transition-all duration-150 origin-top-right ${
                    dropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-4 border-b border-white/6">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.user_metadata?.name || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-[#666666] truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="p-1.5">
                    <Link
                      href="/generator"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#a8a8a8] hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Zap className="w-4 h-4 shrink-0" />
                      Generator
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#a8a8a8] hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Settings className="w-4 h-4 shrink-0" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="border-t border-white/6 p-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#666666] hover:text-red-400 hover:bg-red-500/8 transition-all"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#888888] hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 text-[#888888] hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-200 origin-center ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current rounded-full transition-all duration-200 origin-center ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/6 bg-[#0a0a0a] px-4 py-4">
          <nav className="flex flex-col gap-1 mb-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "text-white bg-white/6"
                    : "text-[#888888] hover:text-white hover:bg-white/4"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/6 pt-4 flex flex-col gap-2">
            {user ? (
              <>
                <span className="text-xs text-[#666666] px-3 truncate">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="w-full text-center rounded-lg border border-white/8 px-4 py-2.5 text-sm font-medium text-[#a8a8a8] hover:text-white hover:border-white/15 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2563eb] transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-lg border border-white/8 px-4 py-2.5 text-sm font-medium text-[#a8a8a8] hover:text-white hover:border-white/15 transition-colors"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
