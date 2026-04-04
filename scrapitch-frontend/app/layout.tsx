import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scrapitch — AI Cold Email Generator",
  description:
    "Paste any prospect URL. Scrapitch scrapes their website and writes 3 personalized cold emails with reply-rate scores. Built for agency owners, SDRs, and freelancers.",
  keywords: [
    "cold email",
    "AI email generator",
    "cold outreach",
    "B2B sales",
    "email personalization",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-50">
        {children}
      </body>
    </html>
  );
}
