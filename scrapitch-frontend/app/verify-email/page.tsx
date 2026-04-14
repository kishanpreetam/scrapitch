import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md text-center">
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-10 sm:p-12">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-1.5 mb-8">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-white">Scrap</span>
              <span className="text-[#a855f7]">itch</span>
            </span>
          </Link>

          {/* Icon */}
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-white/8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#a8a8a8]">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-3">Check your email</h1>
          <p className="text-[#a8a8a8] text-sm leading-relaxed mb-8">
            We sent you a confirmation link to activate your account.<br />
            Click the link in the email to get started.
          </p>

          <p className="text-xs text-[#6b6b6b]">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <Link href="/signup" className="text-[#a8a8a8] hover:text-white transition-colors">
              try a different email
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
