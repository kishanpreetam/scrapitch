"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  AuthShell,
  MonoEyebrow,
  SERIF_STACK,
} from "@/components/AuthChrome";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) {
      setResendState("error");
      setResendError("Open this page from your signup confirmation to resend.");
      return;
    }
    setResendState("sending");
    setResendError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setResendState("error");
      setResendError(error.message);
    } else {
      setResendState("sent");
    }
  };

  return (
    <>
      <MonoEyebrow>check your email</MonoEyebrow>

      <h1
        style={{
          fontSize: "clamp(28px, 3.5vw, 36px)",
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "#f5f5f0",
          marginBottom: 20,
        }}
      >
        We sent you a{" "}
        <em
          style={{
            fontFamily: SERIF_STACK,
            fontStyle: "italic",
            fontWeight: 400,
            color: "#c9b896",
          }}
        >
          link
        </em>
        .
      </h1>

      <p
        className="mx-auto"
        style={{
          fontSize: 15,
          color: "#8a8a85",
          lineHeight: 1.5,
          maxWidth: 360,
          marginBottom: 24,
        }}
      >
        Click the link in the email we just sent to activate your account. It might take a minute. Check your spam folder if you don&apos;t see it.
      </p>

      <p
        style={{
          fontFamily: SERIF_STACK,
          fontStyle: "italic",
          fontSize: 14,
          color: "#8a7d63",
          marginBottom: 32,
        }}
      >
        you can close this tab once you&apos;ve clicked the link
      </p>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendState === "sending"}
        className="font-mono hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontSize: 12,
          color: "#6e6657",
          letterSpacing: "0.02em",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecorationThickness: 1,
        }}
      >
        {resendState === "sending"
          ? "resending..."
          : resendState === "sent"
            ? "resent. check your inbox again."
            : "didn't get the email? resend"}
      </button>

      {resendError && (
        <p
          style={{
            fontSize: 12,
            color: "#d4a4a4",
            lineHeight: 1.5,
            marginTop: 12,
          }}
        >
          {resendError}
        </p>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
