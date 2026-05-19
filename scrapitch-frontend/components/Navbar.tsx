"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Zap, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

const navLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/faq", label: "FAQ" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center shrink-0 z-10">
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
  );
}

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Account";
  const firstName = displayName.split(" ")[0];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2c241c]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="w-full px-6 lg:px-10">
        <div className="relative flex items-center justify-between" style={{ height: 56 }}>
          <Logo />

          {/* Centered nav links */}
          <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2" style={{ gap: 28 }}>
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition-colors ${
                    isActive
                      ? "text-[#f5f5f0]"
                      : "text-[#9ca3af] hover:text-[#f5f5f0]"
                  }`}
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                    paddingBottom: 4,
                    borderBottom: `1px solid ${isActive ? "#c9b896" : "transparent"}`,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center shrink-0 z-10" style={{ gap: 16 }}>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center hover:bg-white/5 transition-colors"
                  style={{
                    border: "1px solid #374151",
                    padding: "8px 14px",
                    borderRadius: 8,
                    color: "#f5f5f0",
                    fontWeight: 500,
                    fontSize: 14,
                    gap: 8,
                  }}
                  aria-label="Account menu"
                >
                  <span>{firstName}</span>
                  <ChevronDown
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    style={{ width: 14, height: 14, color: "#9ca3af" }}
                  />
                </button>

                <div
                  className={`absolute right-0 mt-2 overflow-hidden transition-all duration-150 origin-top-right ${
                    dropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  style={{
                    width: 256,
                    background: "#111111",
                    border: "1px solid #1c1c1c",
                    borderRadius: 12,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  <div style={{ padding: "16px 18px", borderBottom: "1px solid #1c1c1c" }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#f5f5f0",
                        marginBottom: 2,
                      }}
                    >
                      {displayName}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6e6657",
                      }}
                    >
                      {user.email}
                    </p>
                  </div>

                  <div style={{ padding: 6 }}>
                    <Link
                      href="/generator"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center hover:bg-white/5 transition-colors"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        fontSize: 14,
                        color: "#9ca3af",
                        gap: 12,
                      }}
                    >
                      <Zap style={{ width: 16, height: 16 }} />
                      Generator
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center hover:bg-white/5 transition-colors"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        fontSize: 14,
                        color: "#9ca3af",
                        gap: 12,
                      }}
                    >
                      <Settings style={{ width: 16, height: 16 }} />
                      Account settings
                    </Link>
                  </div>

                  <div style={{ borderTop: "1px solid #1c1c1c", padding: 6 }}>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center hover:bg-white/5 transition-colors"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        fontSize: 14,
                        color: "#9ca3af",
                        gap: 12,
                      }}
                    >
                      <LogOut style={{ width: 16, height: 16 }} />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-[#f5f5f0] transition-colors"
                  style={{
                    color: "#9ca3af",
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="hover:bg-white/5 transition-colors"
                  style={{
                    border: "1px solid #374151",
                    padding: "8px 16px",
                    borderRadius: 8,
                    color: "#f5f5f0",
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            className="md:hidden font-mono hover:text-[#f5f5f0] transition-colors"
            style={{
              fontSize: 14,
              color: "#c9b896",
              letterSpacing: "0.04em",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 4px",
            }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            menu
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <div
        className="md:hidden fixed left-0 right-0 top-0"
        style={{
          background: "#0a0a0a",
          borderBottom: "1px solid #2c241c",
          borderTop: "1px solid #2c241c",
          zIndex: 60,
          transform: mobileOpen ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 200ms ease",
          padding: "24px 24px 32px 24px",
          pointerEvents: mobileOpen ? "auto" : "none",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
        aria-hidden={!mobileOpen}
      >
        {/* Mirror navbar row with close */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 32 }}
        >
          <Logo />
          <button
            className="font-mono hover:text-[#f5f5f0] transition-colors"
            style={{
              fontSize: 14,
              color: "#c9b896",
              letterSpacing: "0.04em",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 4px",
            }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            close
          </button>
        </div>

        {/* Stacked links */}
        <nav className="flex flex-col">
          {navLinks.map(({ href, label }, i) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: "#f5f5f0",
                  padding: "14px 0",
                  borderTop: i === 0 ? "1px solid #2c241c" : undefined,
                  borderBottom: "1px solid #2c241c",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    borderBottom: isActive ? "1px solid #c9b896" : undefined,
                    paddingBottom: isActive ? 2 : 0,
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Auth block */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
          {user ? (
            <>
              <p
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: "#6e6657",
                  letterSpacing: "0.02em",
                }}
              >
                {user.email}
              </p>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: "#c9b896",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: 0,
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: "#f5f5f0",
                  padding: "4px 0",
                }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="hover:bg-white/5 transition-colors block text-center"
                style={{
                  border: "1px solid #c9b896",
                  padding: "16px",
                  borderRadius: 4,
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#f5f5f0",
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
