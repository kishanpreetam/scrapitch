"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = useMemo(() => ({
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*]/.test(password),
  }), [password]);

  const strengthScore = Object.values(checks).filter(Boolean).length;

  const allChecksPassed = Object.values(checks).every(Boolean);
  const passwordsMatch  = confirm.length > 0 && password === confirm;
  const confirmMismatch = confirm.length > 0 && password !== confirm;
  const formReady       = allChecksPassed && passwordsMatch && name.trim().length > 0 && email.trim().length > 0;

  const handleSignUp = async () => {
    console.log("[signup] handleSignUp called", { name, email, formReady });
    if (!formReady) return;
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    console.log("[signup] supabase.auth.signUp result", { signUpError });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/generator");
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    console.log("Google OAuth error:", error);
    if (error) setError(error.message);
  };

  const inputBase = "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:ring-2 transition-all pr-11";

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-10 sm:p-12">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-6">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-white">Scrap</span>
                <span className="text-[#3b82f6]">itch</span>
              </span>
            </Link>
            <h1 className="text-2xl font-black text-white">Create your account</h1>
            <p className="text-sm text-[#6b6b6b] mt-1">Start generating in seconds. No setup required.</p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-[#6b6b6b] font-medium">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className={`${inputBase} border-white/20 focus:border-[#3b82f6]/50 focus:ring-[#3b82f6]/15`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={`${inputBase} border-white/20 focus:border-[#3b82f6]/50 focus:ring-[#3b82f6]/15`}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className={`${inputBase} border-white/20 focus:border-[#3b82f6]/50 focus:ring-[#3b82f6]/15`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[#6b6b6b] hover:text-[#d4d4d4] transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength bar + checklist */}
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const color = strengthScore >= 4 ? "bg-emerald-500" : strengthScore >= 3 ? "bg-yellow-500" : strengthScore >= 2 ? "bg-orange-500" : "bg-red-500";
                    return <div key={level} className={`h-1 flex-1 rounded-full transition-all ${level <= strengthScore ? color : "bg-white/10"}`} />;
                  })}
                </div>
              )}
              {password.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {[
                    { key: "length",    label: "At least 8 characters" },
                    { key: "uppercase", label: "One uppercase letter" },
                    { key: "number",    label: "One number" },
                    { key: "special",   label: "One special character (!@#$%^&*)" },
                  ].map(({ key, label }) => {
                    const ok = checks[key as keyof typeof checks];
                    return (
                      <li key={key} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-emerald-400" : "text-[#6b6b6b]"}`}>
                        <span className="w-3.5 text-center font-bold">{ok ? "✓" : "·"}</span>
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#a8a8a8] uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className={`${inputBase} ${
                    confirmMismatch
                      ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/20"
                      : passwordsMatch
                        ? "border-emerald-500/70 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "border-white/20 focus:border-[#3b82f6]/50 focus:ring-[#3b82f6]/15"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[#6b6b6b] hover:text-[#d4d4d4] transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordsMatch && (
                <p className="mt-1.5 text-xs text-emerald-400">Passwords match ✓</p>
              )}
              {confirmMismatch && (
                <p className="mt-1.5 text-xs text-red-400">Passwords don&apos;t match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSignUp}
              disabled={!formReady || loading}
              className="w-full rounded-xl bg-[#3b82f6] py-3 text-sm font-bold text-white hover:bg-[#2563eb] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-[#6b6b6b] leading-relaxed">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-[#6b6b6b] hover:text-[#d4d4d4] underline underline-offset-2 transition-colors">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[#6b6b6b] hover:text-[#d4d4d4] underline underline-offset-2 transition-colors">Privacy Policy</Link>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b6b6b]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#3b82f6] hover:opacity-80 transition-opacity">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
