import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Scrapitch",
  description: "Scrapitch is completely free. No plans, no limits.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] pt-14">
        <section className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center px-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3b82f6] mb-4">PRICING</p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6">
              Scrapitch is{" "}
              <span style={{ color: "#3b82f6" }}>completely free.</span>
            </h1>
            <p className="text-xl text-[#94a3b8] max-w-xl mx-auto mb-10 leading-relaxed">
              No plans. No credit card. No limits. Create an account and start generating
              personalized cold emails immediately.
            </p>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-10 py-4 text-base font-bold text-white hover:bg-[#2563eb] transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
