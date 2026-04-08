import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      {/* Radial glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-175 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-75 w-100 rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-sm p-10 sm:p-12">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-1.5 mb-8">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-white">Scrap</span>
              <span className="bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">itch</span>
            </span>
          </Link>

          {/* Icon */}
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 className="text-2xl font-black text-zinc-50 mb-3">Check your email</h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            We sent you a confirmation link to activate your account.<br />
            Click the link in the email to get started.
          </p>

          <p className="text-xs text-zinc-600">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
              try a different email
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
