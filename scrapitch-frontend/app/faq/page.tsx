import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Scrapitch",
  description:
    "Common questions about Scrapitch — personalization, web scraping, GDPR/CAN-SPAM compliance, limits, editing emails, and integrations.",
};

const faqSections = [
  {
    section: "Personalization",
    icon: "🎯",
    questions: [
      {
        q: "How personalized are the generated emails, really?",
        a: "Very. Scrapitch reads the prospect's actual website copy — their hero headline, value proposition, tone, and audience signals — and passes that as context to the AI. The result is emails that reference what the company actually says, not a name-merged template. We enforce a rule: every email must reference specific content from the scraped site. If scraping fails and we fall back to domain-level data, we flag it so you know the personalization depth is lower.",
      },
      {
        q: "Can I control the tone and framework?",
        a: "Yes. The generator has dropdowns for Framework (All 3, Direct/PAS, Value-First, Curiosity Gap), Tone (Professional, Casual, Bold, Friendly), and Your Industry (B2B Agency, SaaS, Consulting, Freelance, Other). These are passed to the AI as additional context and shape how the emails are written.",
      },
      {
        q: "Do the emails sound like they were written by AI?",
        a: "They're designed not to. We enforce strict rules: no 'I hope this finds you well', no generic filler openers, short and specific copy, exactly one CTA, and language that mirrors the prospect's own tone. The Curiosity Gap variant in particular is built to feel entirely handwritten. That said, all output is a starting point — editing before sending is always encouraged.",
      },
      {
        q: "What if two prospects have similar websites?",
        a: "The emails will reflect the actual differences in their site copy — even small ones. Two SaaS companies will get noticeably different emails because their hero headlines, client language, and value propositions differ. If their sites are truly identical (rare), the emails may be similar, but they'll still be personalized to their specific language.",
      },
    ],
  },
  {
    section: "Scraping & Technology",
    icon: "🔍",
    questions: [
      {
        q: "How does the website scraping work?",
        a: "Scrapitch sends an HTTP request to the prospect's URL using a real browser user-agent. It fetches the homepage and, as a fallback, the /about page. It strips scripts, styles, and navigation noise, then extracts the company name, what they do, who they serve, their value proposition, key copy, and brand tone. The entire extraction takes 1–5 seconds depending on server response time.",
      },
      {
        q: "What if the website uses Cloudflare or bot protection?",
        a: "Scrapitch sends realistic browser headers and tries both the main URL and /about. If Cloudflare or similar protection returns a challenge page, we detect it and fall back gracefully to domain-level data (company name from the domain, generic positioning signals). The email is still generated, but we flag in the response that personalization depth is limited. You can supplement manually using the tone and industry dropdowns.",
      },
      {
        q: "What if the website is JavaScript-heavy and renders content client-side?",
        a: "Scrapitch is a server-side HTTP scraper, not a headless browser. Fully JS-rendered sites (like SPAs with no server-side content) may return minimal HTML. In those cases, the meta description, og:title, and any static content are extracted. If that's insufficient, the domain fallback kicks in. This is a known limitation — full headless browser support is on the roadmap.",
      },
      {
        q: "Does Scrapitch store or cache scraped data?",
        a: "No. Scraped data is used only within the request lifecycle to generate the emails, then discarded. We do not store prospect website data, email content, or any scraped information after the response is returned.",
      },
    ],
  },
  {
    section: "Legal & Compliance",
    icon: "🛡️",
    questions: [
      {
        q: "Is web scraping legal?",
        a: "Scraping publicly available web pages for legitimate purposes (like informing your own communication) is generally considered legal in most jurisdictions. Scrapitch only scrapes publicly accessible pages — the same content anyone can view in a browser. We do not bypass authentication, access private pages, or violate terms of service that explicitly prohibit automated access for commercial use. Always ensure your specific use case complies with the laws of your jurisdiction.",
      },
      {
        q: "Are the generated emails CAN-SPAM compliant?",
        a: "The email copy itself follows CAN-SPAM best practices: no deceptive subject lines, no false identity, clear purpose, and no misleading sender claims. However, CAN-SPAM compliance is about the full send — your sending domain, physical address, unsubscribe mechanism, and sender identity must all be set up correctly in your sending tool. Scrapitch generates compliant copy; your outreach infrastructure handles the rest.",
      },
      {
        q: "Are the generated emails GDPR compliant?",
        a: "GDPR compliance for B2B cold email is complex and jurisdiction-specific. In the EU, you generally need a 'legitimate interest' basis for processing and contacting business contacts. The emails Scrapitch generates are compliant in tone and structure, but GDPR compliance depends on your data handling, consent processes, and sending practices — not just the email copy. We recommend consulting a GDPR advisor if you're sending into EU countries at scale.",
      },
      {
        q: "Can I use Scrapitch emails with any sending tool?",
        a: "Yes. Scrapitch generates plain text subject lines and email bodies. You can paste them into Instantly, Lemlist, Apollo, Smartlead, HubSpot, Outreach, or any other tool that accepts text. Compliance (unsubscribes, physical address, sending domain reputation) is managed by your sending platform.",
      },
    ],
  },
  {
    section: "Limits & Usage",
    icon: "⚡",
    questions: [
      {
        q: "Is there a limit on how many emails I can generate?",
        a: "No hard limit on the $9.99/month plan. Generate as many as you need. We built it for high-volume outreach workflows where you might be running 100+ prospects a week.",
      },
      {
        q: "How fast does generation happen?",
        a: "End-to-end (scraping + AI generation) takes 8–20 seconds depending on the target website's response time and current API load. Websites with bot protection or slow servers take longer. The AI generation itself is typically 3–6 seconds.",
      },
      {
        q: "What if a generation fails?",
        a: "If scraping fails completely, the domain fallback ensures you still get 3 email variants based on the company name and domain. If the AI generation fails (rare), you'll see a clear error message. Most errors are transient — retry and it usually works on the second attempt.",
      },
      {
        q: "Can I generate emails in bulk for a list of prospects?",
        a: "The current interface is one URL at a time. Bulk/CSV upload with multi-URL processing is on the product roadmap. If you need bulk generation right now, the underlying API can be accessed programmatically — contact us.",
      },
    ],
  },
  {
    section: "Editing & Output",
    icon: "✏️",
    questions: [
      {
        q: "Should I edit the emails before sending?",
        a: "Yes, and we encourage it. Scrapitch generates a highly personalized starting point, not final copy. The best practice is: read the email, make sure it sounds like you, tweak one or two phrases to add your voice, and send. The scoring system helps you understand which variant is strongest so you're not editing blindly.",
      },
      {
        q: "Can I edit and regenerate?",
        a: "Currently the editor is read-only — you copy the output and edit in your sending tool or a text editor. An in-browser edit + re-score feature is planned for a future release.",
      },
      {
        q: "What does the score reasoning tell me?",
        a: "Each email comes with a plain-English explanation of why it scored 7 vs 9 — which specific factors dragged it down and what you could fix. For example: 'Score is 7/10. Strong personalization and subject line. Deducted 2 points because the CTA is vague (\"let me know if you're interested\") — swap it for a specific ask like \"does Thursday at 2pm work for a 15-min call?\"'",
      },
      {
        q: "Can I export or save emails?",
        a: "Currently the copy button grabs subject + body. Export to CSV or a saved history feature is on the roadmap. For now, paste into a Google Doc or your outreach tool directly.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-800/60">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-purple-500/5 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">
              FAQ
            </p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-50 mb-6">
              Every question, answered.
            </h1>
            <p className="text-xl text-zinc-400 max-w-xl mx-auto">
              Personalization, scraping, legal compliance, limits, editing — if
              you&apos;re wondering about it, it&apos;s here.
            </p>
          </div>
        </section>

        {/* FAQ sections */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-16">
            {faqSections.map((section) => (
              <div key={section.section}>
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-50">
                    {section.section}
                  </h2>
                </div>

                <div className="space-y-3">
                  {section.questions.map((faq) => (
                    <details
                      key={faq.q}
                      className="group rounded-xl border border-zinc-800 bg-zinc-900/40"
                    >
                      <summary className="flex cursor-pointer items-start justify-between px-6 py-5 font-semibold text-zinc-100 hover:text-purple-300 transition-colors list-none gap-4">
                        <span>{faq.q}</span>
                        <span className="text-zinc-600 group-open:rotate-180 transition-transform text-lg leading-none mt-0.5 shrink-0">
                          ↓
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-4">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still have questions */}
        <section className="border-t border-zinc-800/60 py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-black tracking-tight text-zinc-50 mb-4">
              Still have a question?
            </h2>
            <p className="text-zinc-400 mb-8">
              Drop us a message. We respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="mailto:hello@scrapitch.com"
                className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
              >
                Email us →
              </Link>
              <Link
                href="/generator"
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-bold text-[#0a0a0a] hover:opacity-90 transition-opacity"
              >
                Try Scrapitch free →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
