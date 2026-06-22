"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  AuthShell,
  EyeIcon,
  MonoEyebrow,
  MonoLabel,
  SERIF_STACK,
} from "@/components/AuthChrome";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The reset email routes through /auth/callback, which establishes a
  // recovery session before redirecting here. Wait for that session.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) setReady(true);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setReady(true);
        setChecking(false);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const passwordValid = password.length >= 6;
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const confirmMismatch = confirm.length > 0 && password !== confirm;
  const isValid = passwordValid && passwordsMatch;

  const confirmBorderColor = passwordsMatch
    ? "#8ca56e"
    : confirmMismatch
      ? "#c97c5a"
      : "#2c241c";

  const fieldStyle = {
    background: "transparent",
    border: "1px solid #2c241c",
    borderRadius: 4,
    padding: "14px 16px",
    fontSize: 16,
    color: "#f5f5f0",
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/generator"), 1400);
  };

  return (
    <AuthShell>
      <MonoEyebrow>reset password</MonoEyebrow>

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
        Set a{" "}
        <em
          style={{
            fontFamily: SERIF_STACK,
            fontStyle: "italic",
            fontWeight: 400,
            color: "#c9b896",
          }}
        >
          new
        </em>{" "}
        password.
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
        Choose something you&apos;ll remember this time.
      </p>

      {checking ? (
        <p
          className="font-mono"
          style={{ fontSize: 12, color: "#6e6657", letterSpacing: "0.04em" }}
        >
          checking your link...
        </p>
      ) : done ? (
        <p style={{ fontSize: 15, color: "#8ca56e", lineHeight: 1.5 }}>
          Password updated. Taking you to the generator.
        </p>
      ) : !ready ? (
        <div style={{ textAlign: "left" }}>
          <p
            style={{
              fontSize: 15,
              color: "#8a8a85",
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            This page completes a password reset. Open the link from your reset
            email, or request a new one from the sign in page.
          </p>
          <Link
            href="/login"
            className="hover:underline transition-colors"
            style={{ color: "#3b82f6", fontWeight: 500, fontSize: 14 }}
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="text-left">
          {error && (
            <div
              style={{
                border: "1px solid rgba(212, 164, 164, 0.3)",
                background: "rgba(212, 164, 164, 0.06)",
                borderRadius: 4,
                padding: "12px 14px",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 13, color: "#d4a4a4", lineHeight: 1.5 }}>
                {error}
              </p>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <MonoLabel>new password</MonoLabel>
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
          </div>

          <div style={{ marginBottom: 24 }}>
            <MonoLabel>confirm password</MonoLabel>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              aria-describedby="reset-confirm-feedback"
              className="w-full focus:outline-none transition-colors"
              style={{ ...fieldStyle, borderColor: confirmBorderColor }}
            />
            <p
              id="reset-confirm-feedback"
              role="status"
              aria-live="polite"
              style={{
                marginTop: 8,
                minHeight: 18,
                fontFamily: SERIF_STACK,
                fontStyle: "italic",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              {passwordsMatch ? (
                <span className="fade-in-150" style={{ color: "#8ca56e" }}>
                  Passwords match.
                </span>
              ) : confirmMismatch ? (
                <span className="fade-in-150" style={{ color: "#c97c5a" }}>
                  Passwords don&apos;t match yet.
                </span>
              ) : null}
            </p>
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full hover:border-[#f5f5f0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "transparent",
              border: "1px solid #c9b896",
              borderRadius: 4,
              padding: "14px",
              fontSize: 16,
              fontWeight: 500,
              color: "#f5f5f0",
            }}
          >
            {loading ? "Updating" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
