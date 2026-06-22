import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy · Scrapitch",
  description:
    "How Scrapitch collects, uses, and protects your data, including our GDPR policy.",
};

export const dynamic = "force-static";

export default function PrivacyPage() {
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", "privacy-policy.md"),
    "utf8",
  );

  return (
    <>
      <Navbar />
      <LegalDocument markdown={markdown} eyebrow="privacy policy" title="Privacy policy" />
      <Footer />
    </>
  );
}
