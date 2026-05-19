"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  AuthShell,
  EyeIcon,
  GoogleIcon,
  MonoEyebrow,
  MonoLabel,
  SERIF_STACK,
} from "@/components/AuthChrome";

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
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  }), [password]);

  const strengthScore = Object.values(checks).filter(Boolean).length;

  const allChecksPassed = Object.values(checks).every(Boolean);
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const confirmMismatch = confirm.length > 0 && password !== confirm;
  const formReady =
    allChecksPassed && passwordsMatch && name.trim().length > 0 && email.trim().length > 0;

  const handleSignUp = async () => {
    if (!formReady) return;
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/generator");
  };

  const handleGoogle = async () => {
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (googleError) setError(googleError.message);
  };

  const fieldStyle = {
    background: "transparent",
    border: "1px solid #2c241c",
    borderRadius: 4,
    padding: "14px 16px",
    fontSize: 15,
    color: "#f5f5f0",
  } as const;

  return (
    <AuthShell>
      <MonoEyebrow>start here</MonoEyebrow>

      <h1
        style={{
          fontSize: "clamp(28px, 3.5vw, 36px)",
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "#f5f5f0",
          marginBottom: 12,
        }}
      >
        <em
          style={{
            fontFamily: SERIF_STACK,
            fontStyle: "italic",
            fontWeight: 400,
            color: "#c9b896",
          }}
        >
          Make
        </em>{" "}
        an account.
      </h1>

      <p
        style={{
          fontFamily: SERIF_STACK,
          fontStyle: "italic",
          fontSize: 15,
          color: "#8a7d63",
          marginBottom: 40,
        }}
      >
        Free. No card. No catch.
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center hover:border-[#c9b896] transition-colors"
        style={{
          background: "transparent",
          border: "1px solid #2c241c",
          borderRadius: 4,
          padding: "14px 16px",
          fontSize: 15,
          fontWeight: 500,
          color: "#f5f5f0",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="flex items-center" style={{ gap: 12, margin: "24px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#2c241c" }} />
        <span
          className="font-mono"
          style={{ fontSize: 11, color: "#6e6657", letterSpacing: "0.04em" }}
        >
          or
        </span>
        <div style={{ flex: 1, height: 1, background: "#2c241c" }} />
      </div>

      {error && (
        <div
          style={{
            border: "1px solid rgba(212, 164, 164, 0.3)",
            background: "rgba(212, 164, 164, 0.06)",
            borderRadius: 4,
            padding: "12px 14px",
            marginBottom: 20,
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: 13, color: "#d4a4a4", lineHeight: 1.5 }}>{error}</p>
        </div>
      )}

      <form className="text-left">
        <div style={{ marginBottom: 20 }}>
          <MonoLabel>name</MonoLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            className="w-full focus:border-[#c9b896] focus:outline-none transition-colors"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <MonoLabel>email</MonoLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full focus:border-[#c9b896] focus:outline-none transition-colors"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <MonoLabel>password</MonoLabel>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="w-full focus:border-[#c9b896] focus:outline-none transition-colors"
              style={{ ...fieldStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="hover:text-[#c9b896] transition-colors"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6e6e6e",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {password.length > 0 && (
            <div className="flex" style={{ gap: 4, marginTop: 10 }}>
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  style={{
                    height: 2,
                    flex: 1,
                    borderRadius: 2,
                    background: level <= strengthScore ? "#c9b896" : "#2c241c",
                    transition: "background 200ms ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <MonoLabel>confirm password</MonoLabel>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="w-full focus:border-[#c9b896] focus:outline-none transition-colors"
              style={{ ...fieldStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="hover:text-[#c9b896] transition-colors"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6e6e6e",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
          {confirmMismatch && (
            <p
              style={{
                fontSize: 12,
                color: "#d4a4a4",
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              Passwords don&apos;t match.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignUp}
          disabled={!formReady || loading}
          className="w-full hover:border-[#f5f5f0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "transparent",
            border: "1px solid #c9b896",
            borderRadius: 4,
            padding: "14px",
            fontSize: 15,
            fontWeight: 500,
            color: "#f5f5f0",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center" style={{ gap: 8 }}>
              <span
                className="animate-spin rounded-full"
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(245,245,240,0.3)",
                  borderTopColor: "#f5f5f0",
                }}
              />
              Creating account
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p
        className="font-mono mx-auto text-center"
        style={{
          fontSize: 12,
          color: "#6e6657",
          letterSpacing: "0.02em",
          maxWidth: 320,
          lineHeight: 1.5,
          marginTop: 24,
        }}
      >
        By creating an account, you agree to our{" "}
        <Link
          href="/terms"
          className="hover:underline transition-colors"
          style={{ color: "#8a7d63" }}
        >
          terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="hover:underline transition-colors"
          style={{ color: "#8a7d63" }}
        >
          privacy policy
        </Link>
        .
      </p>

      <p
        className="text-center"
        style={{ fontSize: 14, color: "#8a8a85", marginTop: 24 }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="hover:underline transition-colors"
          style={{ color: "#3b82f6", fontWeight: 500 }}
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
