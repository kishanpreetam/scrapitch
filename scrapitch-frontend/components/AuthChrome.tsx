import Link from "next/link";

export const SERIF_STACK = "'New York', 'Times New Roman', Charter, Georgia, serif";

export function AuthLogo() {
  return (
    <Link href="/" className="inline-block" style={{ marginBottom: 56 }}>
      <span style={{ fontWeight: 500, fontSize: 24, letterSpacing: "-0.01em" }}>
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

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "#0a0a0a" }}
    >
      <div className="w-full text-center" style={{ maxWidth: 400 }}>
        <AuthLogo />
        <div
          style={{
            height: 1,
            background: "#2c241c",
            width: 48,
            margin: "0 auto 32px",
          }}
        />
        {children}
        <div
          style={{
            height: 1,
            background: "#2c241c",
            width: 48,
            margin: "56px auto 0",
          }}
        />
      </div>
    </main>
  );
}

export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

export function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-left"
      style={{
        fontSize: 11,
        color: "#c9b896",
        letterSpacing: "0.04em",
        marginBottom: 8,
      }}
    >
      {children}
    </p>
  );
}

export function MonoEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono"
      style={{
        fontSize: 11,
        color: "#6e6e6e",
        letterSpacing: "0.04em",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  );
}
