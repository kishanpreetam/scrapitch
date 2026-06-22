import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Service · Scrapitch",
  description: "The terms that govern your use of Scrapitch.",
};

export const dynamic = "force-static";

export default function TermsPage() {
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", "terms-of-service.md"),
    "utf8",
  );

  return (
    <>
      <Navbar />
      <LegalDocument markdown={markdown} eyebrow="terms of service" title="Terms of service" />
      <Footer />
    </>
  );
}
