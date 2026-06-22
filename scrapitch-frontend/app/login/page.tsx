"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleForgot = async () => {
    setNotice(null);
    setError(null);
    if (!email.trim()) {
      setError("Enter your email above, then tap reset.");
      return;
    }
    setResetting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` },
    );
    setResetting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Password reset link sent. Check your email.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (signInError.message === "Invalid login credentials") {
        setError("No account with that email and password. Check your details, or sign up.");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/generator");
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <AuthShell>
      <MonoEyebrow>welcome back</MonoEyebrow>

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
        Sign{" "}
        <em
          style={{
            fontFamily: SERIF_STACK,
            fontStyle: "italic",
            fontWeight: 400,
            color: "#c9b896",
          }}
        >
          in
        </em>{" "}
        to Scrapitch.
      </h1>

      <p
        style={{
          fontFamily: SERIF_STACK,
          fontStyle: "italic",
          fontSize: 16,
          color: "#8a7d63",
          marginBottom: 40,
        }}
      >
        Pick up where you left off.
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
          fontSize: 16,
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

      {notice && (
        <div
          style={{
            border: "1px solid rgba(140, 165, 110, 0.3)",
            background: "rgba(140, 165, 110, 0.06)",
            borderRadius: 4,
            padding: "12px 14px",
            marginBottom: 20,
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: 13, color: "#8ca56e", lineHeight: 1.5 }}>{notice}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-left">
        <div style={{ marginBottom: 20 }}>
          <MonoLabel>email</MonoLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full focus:border-[#c9b896] focus:outline-none transition-colors"
            style={{
              background: "transparent",
              border: "1px solid #2c241c",
              borderRadius: 4,
              padding: "14px 16px",
              fontSize: 16,
              color: "#f5f5f0",
            }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <MonoLabel>password</MonoLabel>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full focus:border-[#c9b896] focus:outline-none transition-colors"
              style={{
                background: "transparent",
                border: "1px solid #2c241c",
                borderRadius: 4,
                padding: "14px 44px 14px 16px",
                fontSize: 16,
                color: "#f5f5f0",
              }}
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
        </div>

        <div style={{ textAlign: "right", marginBottom: 24 }}>
          <button
            type="button"
            onClick={handleForgot}
            disabled={resetting}
            className="hover:text-[#c9b896] transition-colors text-[13px] md:text-[12px] disabled:opacity-50"
            style={{
              fontFamily: SERIF_STACK,
              fontStyle: "italic",
              color: "#8a7d63",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {resetting ? "Sending reset link..." : "Forgot password?"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full hover:border-[#f5f5f0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "transparent",
            border: "1px solid #c9b896",
            borderRadius: 4,
            padding: "14px",
            fontSize: 16,
            fontWeight: 500,
            color: "#f5f5f0",
            marginTop: 8,
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
              Signing in
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p
        className="text-center"
        style={{ fontSize: 14, color: "#8a8a85", marginTop: 32 }}
      >
        No account yet?{" "}
        <Link
          href="/signup"
          className="hover:underline transition-colors"
          style={{ color: "#3b82f6", fontWeight: 500 }}
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
