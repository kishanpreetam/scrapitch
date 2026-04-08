"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Zap, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/use-cases",    label: "Use Cases" },
  { href: "/pricing",      label: "Pricing" },
  { href: "/faq",          label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5"
    >
      <div className="w-full px-10 lg:px-12">
        <div className="relative flex items-center justify-between py-5">

          {/* Logo — far left */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group z-10">
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
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Trigger */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200 ${
                    dropdownOpen
                      ? "border-purple-500/40 bg-purple-500/10"
                      : "border-white/10 hover:border-purple-500/30 hover:bg-white/3"
                  }`}
                  aria-label="Account menu"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {(user.user_metadata?.name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-300 max-w-32 truncate hidden lg:block">
                    {user.user_metadata?.name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown — always rendered, toggled via CSS */}
                <div
                  className={`absolute right-0 mt-2.5 w-64 rounded-xl border border-purple-500/20 bg-[#0f0f0f]/95 backdrop-blur-md shadow-xl shadow-black/50 overflow-hidden transition-all duration-150 origin-top-right ${
                    dropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {/* User info */}
                  <div className="px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {(user.user_metadata?.name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">
                        {user.user_metadata?.name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="h-px bg-white/6" />

                  {/* Menu items */}
                  <div className="py-1.5">
                    <Link
                      href="/generator"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-purple-500/10 transition-colors"
                    >
                      <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                      Generator
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-purple-500/10 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-zinc-400 shrink-0" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="h-px bg-white/6" />

                  {/* Sign out */}
                  <div className="py-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
              </>
            )}
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
            {user ? (
              <>
                <span className="block text-center text-sm text-zinc-400 py-1 truncate">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-center rounded-xl border border-white/[0.08] px-6 py-3 text-base font-medium text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
