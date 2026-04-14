import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import FaqAccordionItem from "@/components/FaqAccordionItem";
import FaqContactCard from "@/components/FaqContactCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Scrapitch",
  description:
    "Everything you need to know about Scrapitch — personalization, industries, pricing, privacy, and how the scraping works.",
};

const faqSections = [
  {
    section: "Product",
    questions: [
      {
        q: "How does Scrapitch personalize emails?",
        a: "It reads the prospect's actual website copy — hero headline, about page, value proposition, tone, audience — and passes that as structured context to the AI. Every generated email is required to reference specific scraped content. If scraping fails, we fall back to domain-level data and flag it.",
      },
      {
        q: "What industries does Scrapitch support?",
        a: "12 industry verticals: B2B SaaS, Marketing & Creative Agency, Sales & Revenue Consulting, IT Services & MSP, Recruiting & Staffing, Legal Services, Financial Services & Fintech, Real Estate, Healthcare & MedTech, Manufacturing & Industrial, Ecommerce & DTC, and Freelancer / Solo Consultant. Each has a custom email framework and tone.",
      },
      {
        q: "How is this different from ChatGPT or Apollo?",
        a: "ChatGPT requires you to research the prospect yourself and write a prompt. Apollo uses name-merge templates. Scrapitch scrapes the live website, auto-detects the industry, applies the right framework, and generates structured cold emails with subject variants and follow-up sequences — all in under 10 seconds.",
      },
      {
        q: "Can I use it for any niche?",
        a: "Yes. If there's a publicly accessible website, Scrapitch can scrape it. Auto-detect handles most B2B industries. You can also manually select from the 12 industry options.",
      },
      {
        q: "Do the emails sound like AI wrote them?",
        a: "They're engineered not to. We enforce: no generic openers like \"I hope this finds you well\", under 80 words, exactly one CTA, and language that mirrors the prospect's own tone. The Curious variant is specifically designed to feel handwritten. Editing before sending is always encouraged.",
      },
      {
        q: "Is the generated email ready to send?",
        a: "It's a strong starting point. Best practice: read it, confirm it sounds like you, tweak 1–2 phrases for your voice, then send. The scoring helps you pick the strongest variant.",
      },
      {
        q: "What is the follow-up sequence?",
        a: "After the 3 main variants, Scrapitch generates a 3-email follow-up sequence: Day 3 (light bump), Day 7 (new value angle), Day 14 (low-pressure breakup). Each is under 50 words with a single CTA.",
      },
      {
        q: "What does the reply rate score mean?",
        a: "Each email is scored 1–10 across 6 factors: personalization depth (30%), length (20%), single CTA (15%), problem-first framing (15%), subject line quality (10%), no spam phrases (10%). The score comes with plain-English reasoning so you know what to fix.",
      },
    ],
  },
  {
    section: "Pricing",
    questions: [
      {
        q: "Is there a free trial?",
        a: "Yes. Create a free account and get 3 email generations — no credit card required. After that, Pro is $9.99/month for unlimited access.",
      },
      {
        q: "What happens after my 3 free generations?",
        a: "You'll see an upgrade prompt. Your existing results are preserved. Upgrade to Pro for unlimited access.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes, cancel from account settings at any time. No contracts, no cancellation fees. Access continues through the end of your current billing period.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes — within 7 days of your first paid charge if you're not satisfied. Email hello@scrapitch.com.",
      },
      {
        q: "What's included in the Growth plan?",
        a: "Everything in Pro, plus upcoming features: Google News-triggered outreach, Icebreaker mode (personalized openers from recent news/activity), spam score checker, and bulk URL processing. Growth plan customers get early access.",
      },
    ],
  },
  {
    section: "Privacy & Compliance",
    questions: [
      {
        q: "Do you store my data?",
        a: "Scraped data is used only within the request lifecycle to generate emails, then discarded. We do not store prospect website data, email content, or scraped information after the response is returned.",
      },
      {
        q: "Is web scraping legal?",
        a: "Scraping publicly accessible web pages for legitimate communication purposes is generally legal in most jurisdictions. Scrapitch only accesses publicly available content — the same content anyone can see in a browser. We do not bypass authentication or access private pages.",
      },
      {
        q: "Are the generated emails CAN-SPAM compliant?",
        a: "The email copy follows CAN-SPAM best practices: no deceptive subject lines, no false identity, clear purpose. Full compliance also requires your sending domain setup, physical address, and unsubscribe mechanism — managed by your sending tool.",
      },
      {
        q: "Are the emails GDPR compliant?",
        a: "The email copy is compliant in tone and structure. GDPR compliance for B2B cold email depends on your data handling, consent basis, and sending practices. If you're sending into the EU at scale, consult a GDPR advisor.",
      },
    ],
  },
  {
    section: "Technical",
    questions: [
      {
        q: "How does the scraping work?",
        a: "Scrapitch sends an HTTP request using a realistic browser user-agent, fetches the homepage and /about page as fallback, strips noise, and extracts: company name, what they do, who they serve, value prop, tone, and key copy signals.",
      },
      {
        q: "What if a site uses Cloudflare?",
        a: "We detect Cloudflare challenge pages and fall back to domain-level data. The email is still generated; you'll see a note that personalization depth may be limited. Supplement using the industry and tone dropdowns.",
      },
      {
        q: "What if the site is JavaScript-heavy?",
        a: "Scrapitch is an HTTP scraper, not a headless browser. Fully JS-rendered SPAs may return minimal HTML. We extract meta description, og:title, and any static content. Full headless browser support is on the roadmap.",
      },
      {
        q: "How fast is it?",
        a: "End-to-end (scraping + AI generation) typically takes 8–20 seconds depending on the target site. The AI generation itself is 3–6 seconds.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a]">
        {/* Hero */}
        <section className="border-b border-white/6 bg-section-alt pt-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-28 text-center">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b6b6b] mb-5">
                FAQ
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05]">
                Every question, <span className="bg-linear-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">answered.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg sm:text-xl text-[#a8a8a8] max-w-lg mx-auto leading-relaxed">
                From how it personalizes to what data we store — it&apos;s all here.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FAQ sections */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-20">
            {faqSections.map((section, sectionIdx) => (
              <Reveal key={section.section} delay={sectionIdx * 40}>
                <div>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-7">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#7c3aed]">
                      {section.section}
                    </h2>
                  </div>

                  {/* Accordion items */}
                  <div className="space-y-2">
                    {section.questions.map((faq) => (
                      <FaqAccordionItem key={faq.q} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="border-t border-white/8 py-24 md:py-32 bg-[#111111]">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Reveal>
              <FaqContactCard />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
