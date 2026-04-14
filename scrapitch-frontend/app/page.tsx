"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

// ── Typing animation config ──────────────────────────────────────
const SUFFIXES = ["for SDRs", "for agency owners", "for consultants", "for freelancers", "for founders"];
const TYPING_SPEED = 65;
const ERASING_SPEED = 35;
const PAUSE_DURATION = 2000;

// ── Hero demo config
const DEMO_URL = "acme-agency.com";
type DemoPhase = "typing" | "loading" | "result" | "fade";

// ── Types ────────────────────────────────────────────────────────
type BentoCard = {
  span: string;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  body: string;
  tag: string | null;
  icon?: React.ReactNode;
  topBorderColor: string;
};
type WhoCard = { role: string; problem: string; solution: string; icon: React.ReactNode };
type PricingFeature = { text: string; soon?: boolean };

// ── Step accent colors (01=purple, 02=orange, 03=green, 04=blue) ──
const stepColors = ["#7c3aed", "#fb923c", "#34d399", "#60a5fa"];

// ── Data ─────────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    title: "Paste any prospect URL",
    detail: "Drop in any company website: homepage, landing page, or about page. Scrapitch handles the rest. No LinkedIn required. No manual research. Just the URL.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "AI reads their entire website",
    detail: "Our scraper reads the homepage, about page, hero copy, and case studies. It extracts company name, what they do, who they serve, their tone of voice, value proposition, and customers' pain points.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Writes 3 personalized email variants",
    detail: "Scrapitch generates three distinct emails: Direct/PAS leads with the problem, Value-First leads with an insight, Curious opens a loop the prospect wants to close. Each gets 3 subject lines and a reply-rate score 1–10.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Delivers a full follow-up sequence",
    detail: "80% of replies come after the first email. Scrapitch auto-generates a 3-email follow-up sequence: Day 3 (light bump), Day 7 (new angle), Day 14 (low-pressure breakup). Each under 60 words, single CTA.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const bentoCards: BentoCard[] = [
  {
    span: "lg:col-span-2",
    title: "Deep Website Intelligence",
    subtitle: "No LinkedIn required",
    subtitleColor: "#16a34a",
    body: "Most cold email tools use LinkedIn or CSV uploads. Scrapitch reads the prospect's actual website — homepage, about page, hero copy, case studies — to build a complete picture of who they are and what they care about. No LinkedIn required. No manual research.",
    tag: "Core",
    topBorderColor: "#60a5fa",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
  },
  {
    span: "lg:col-span-2",
    title: "12 Industry Frameworks",
    subtitle: "Auto-detected from their site",
    subtitleColor: "#0369a1",
    body: "Generic cold email fails because every industry speaks a different language. Scrapitch auto-detects the prospect's industry and applies the right framework — legal firms get compliance-aware copy; SaaS companies get churn-reduction hooks; agencies get ROI framing. 12 industries covered.",
    tag: "Frameworks",
    topBorderColor: "#fb923c",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    span: "lg:col-span-2",
    title: "3 Proven Email Variants",
    subtitle: "PAS · Value-First · Curiosity Gap",
    subtitleColor: "#7c3aed",
    body: "Every prospect responds differently. Direct/PAS leads with the problem. Value-First opens with an insight or benchmark. Curious creates an open loop the prospect wants to close. You get all three — pick the fit, or A/B test them.",
    tag: "Variants",
    topBorderColor: "#34d399",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    span: "lg:col-span-2",
    title: "Follow-Up Sequences",
    subtitle: "80% of replies come from follow-ups",
    subtitleColor: "#b45309",
    body: "Most SDRs send generic 'just checking in' bumps. Scrapitch generates a 3-email sequence (Day 3, 7, 14) with fresh angles, decreasing pressure, and a breakup email that often gets the most replies. Each under 60 words with a single CTA.",
    tag: "Sequences",
    topBorderColor: "#a78bfa",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    span: "lg:col-span-1",
    title: "Subject Line A/B",
    subtitle: "3 options per variant",
    subtitleColor: "#0369a1",
    body: "3 subject line options per email variant. All under 7 words — the length that consistently drives the highest open rates. Test what resonates.",
    tag: null,
    topBorderColor: "#facc15",
  },
  {
    span: "lg:col-span-1",
    title: "Tone Matching",
    subtitle: "Detected from their copy",
    subtitleColor: "#0369a1",
    body: "Scrapitch detects whether the prospect writes formally, casually, technically, or inspirationally — and matches your email's voice to theirs. Mismatched tone is one of the biggest reply-rate killers.",
    tag: null,
    topBorderColor: "#f87171",
  },
  {
    span: "lg:col-span-1",
    title: "Reply Rate Scoring",
    subtitle: "6-factor rubric",
    subtitleColor: "#555555",
    body: "Every email is scored 1–10 across: personalization depth, length, CTA clarity, problem framing, subject line quality, and spam avoidance. The score tells you which variant to send first.",
    tag: null,
    topBorderColor: "#34d399",
  },
  {
    span: "lg:col-span-1",
    title: "One CTA Enforced",
    subtitle: "No multi-asks",
    subtitleColor: "#16a34a",
    body: "Every generated email has exactly one call to action. No 'reply to this OR book a call OR visit the link.' One clear ask. Higher reply rates.",
    tag: null,
    topBorderColor: "#60a5fa",
  },
];

const comparisonRows: { feature: string; scrapitch: string; generic: string | React.ReactNode }[] = [
  { feature: "Live website scraping", scrapitch: "✓", generic: "✗" },
  { feature: "No LinkedIn / CSV required", scrapitch: "✓", generic: "✗" },
  { feature: "Industry auto-detection", scrapitch: "✓", generic: "✗" },
  { feature: "Tone matching from site", scrapitch: "✓", generic: "✗" },
  { feature: "3 structured email frameworks", scrapitch: "✓", generic: "~" },
  { feature: "3 subject line options per email", scrapitch: "✓", generic: "✗" },
  { feature: "Full follow-up sequence (Day 3/7/14)", scrapitch: "✓", generic: "✗" },
  { feature: "Reply rate scoring with reasoning", scrapitch: "✓", generic: "~" },
  { feature: "One CTA enforced", scrapitch: "✓", generic: "✗" },
  { feature: "Research takes < 10 seconds", scrapitch: "✓", generic: "✗" },
];

const whoCards: WhoCard[] = [
  {
    role: "SDR at a B2B SaaS company",
    problem: "Spending 20 minutes researching each prospect before writing one email — and still ending up with semi-generic copy.",
    solution: "Paste their URL. Get 3 personalized emails + Day 3/7/14 follow-up sequence in 10 seconds. Research done.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    role: "Agency owner doing outbound",
    problem: "Generic cold emails get ignored. Need something that references the prospect's actual business — not a merge-tag template.",
    solution: "Scrapitch reads their site, detects they're a marketing agency, and applies agency-specific ROI and client-results framing automatically.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    role: "Freelance consultant prospecting",
    problem: "No time to write personalized emails for every lead. Spending hours on outreach that should take minutes.",
    solution: "URL in → personalized email out. Full follow-up sequence included. Spend time closing, not writing.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role: "Recruiter reaching out to companies",
    problem: "Need to reach hiring managers with relevant, specific outreach — not 'I wanted to connect' LinkedIn spam.",
    solution: "Paste the company URL, get emails tailored to recruiting context with industry-appropriate tone and a clear value hook.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    role: "Founder doing their own outreach",
    problem: "Cold email feels unnatural. Don't know what framework to use. Can't tell if the email is good or not.",
    solution: "Scrapitch handles the framework, the research, and the follow-ups. Scoring tells you which variant is strongest. Just review and send.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

const emailPreviews = [
  {
    variant: "A",
    label: "The Direct / PAS",
    variantColor: "#7c3aed",
    subjectLines: ["Your pipeline bottleneck", "Leads leaking post-demo?", "Quick question, [Company]"],
    body: "Most teams at your stage are leaving 30–40% of inbound leads unconverted because follow-up sequences aren't personalized. We fix that with AI-written sequences that reference what your prospects actually care about. Worth a 15-min call?",
    score: 9,
  },
  {
    variant: "B",
    label: "Value-First",
    variantColor: "#b45309",
    subjectLines: ["2x reply rate, zero extra work", "What 40 personalized emails/hr looks like", "Your outreach gap"],
    body: "Agencies using personalized cold outreach see 2x reply rates vs templated emails. Scrapitch writes them in 10 seconds per prospect — referencing your prospect's actual site, not a template. I'd love to show you a live demo.",
    score: 8,
  },
  {
    variant: "C",
    label: "The Curious",
    variantColor: "#0369a1",
    subjectLines: ["Noticed your case study page", "That 3x growth result though", "Real question about your outbound"],
    body: "Just read through your agency's case study on the SaaS client — impressive 3x growth result. Curious whether you're personalizing cold emails yourself or have something automated. Happy to share what's working for similar agencies.",
    score: 9,
  },
];

// Pro features (used in both Pro display and Growth "Everything in Pro" list)
const proFeatures: PricingFeature[] = [
  { text: "Unlimited generations" },
  { text: "Priority processing" },
  { text: "All 3 email variants (PAS, Value-First, Curious)" },
  { text: "3 subject lines per variant" },
  { text: "Reply rate scoring + reasoning" },
  { text: "Full follow-up sequence (Day 3/7/14)" },
  { text: "12 industry frameworks + tone detection" },
  { text: "All future Phase 1 updates" },
];

const growthFeatures: PricingFeature[] = [
  { text: "Google News trigger emails", soon: true },
  { text: "Icebreaker-only mode", soon: true },
  { text: "Spam score checker", soon: true },
  { text: "Competitor mention detection", soon: true },
];

const faqs = [
  {
    q: "How does Scrapitch personalize emails without LinkedIn?",
    a: "It reads the prospect's actual website — homepage hero copy, about page, case studies, and value proposition — and passes that as structured context to our AI. Every email must reference specific details scraped from their site. There's no generic template involved.",
  },
  {
    q: "What industries does it support?",
    a: "12 verticals with tailored frameworks: B2B SaaS, Marketing & Creative Agency, Sales & Revenue Consulting, IT Services & MSP, Recruiting & Staffing, Legal Services, Financial Services & Fintech, Real Estate, Healthcare & MedTech, Manufacturing & Industrial, Ecommerce & DTC, and Freelancer / Solo Consultant. Auto-detect picks the right one from the URL.",
  },
  {
    q: "What email frameworks does it use, and why those three?",
    a: "The Direct/PAS (Problem-Agitate-Solution) framework is the highest-converting cold email structure — it leads with a pain point the prospect already feels. Value-First leads with an insight or benchmark before making an ask, building credibility first. The Curious framework opens with a specific observation and ends with a soft question — ideal for warm-ish accounts. All three are used because different prospects respond to different openers.",
  },
  {
    q: "How is the reply rate score calculated?",
    a: "Each email is scored 1–10 across six factors: personalization depth (how specifically does it reference the prospect?), email length (shorter is better), CTA clarity (is there one clear ask?), problem framing (does it address a real pain point?), subject line quality, and spam avoidance (no trigger words, no excessive punctuation). The score comes with written reasoning so you understand why.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. Create a free account and get 3 full email generations — each with 3 variants, 3 subject lines per variant, reply-rate scoring, and a complete follow-up sequence. No credit card required. After that, Pro is $9.99/month for unlimited access.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT requires you to do all the research yourself — you have to read the prospect's site, summarize it, write a detailed prompt, and hope the output is good. Scrapitch does the research layer automatically: it scrapes the site, detects the industry, matches the tone, selects the right framework, and returns three ready-to-send emails with scoring. You go from URL to email in 10 seconds, not 20 minutes.",
  },
  {
    q: "How is this different from Apollo or Instantly?",
    a: "Apollo and Instantly are built around sequencing, deliverability, and database access — they help you send emails at scale but generate them from merge-tag templates. Scrapitch does the opposite: it generates a genuinely personalized email for a specific prospect by reading their website, not filling in [FIRST_NAME] and [COMPANY]. The tools are complementary — use Scrapitch to write the email, use Apollo/Instantly to send it.",
  },
  {
    q: "Can I use it for any niche?",
    a: "Yes. If there's a publicly accessible website, Scrapitch can scrape it. Auto-detect handles most B2B industries out of the box. You can also manually select from 12 industry options if you want to override the detection or experiment with different frameworks.",
  },
  {
    q: "Is the generated email ready to send?",
    a: "It's a strong first draft — in most cases 80–90% there. Read it, make sure it sounds like you, tweak one or two phrases, and send. The reply-rate score tells you which variant to start with. The AI writes in a human voice with no buzzwords or filler, but a quick personal read before sending is always worth it.",
  },
  {
    q: "What happens after my 3 free generations?",
    a: "You'll be prompted to upgrade to Pro ($9.99/mo) for unlimited access. Your existing results and account data are preserved. There's no auto-upgrade — you choose when and whether to upgrade.",
  },
  {
    q: "Do you store my data or the prospect's data?",
    a: "Scraped content is used only within the request lifecycle to generate emails, then discarded. We do not persist prospect website data, scraped text, or generated email content after the API response is returned. Your account stores only your email address and generation count.",
  },
  {
    q: "Is web scraping legal?",
    a: "Scraping publicly available websites for research and analysis purposes is broadly legal in most jurisdictions — multiple court cases (including hiQ v. LinkedIn) have confirmed that public data is fair game. Scrapitch only reads publicly accessible pages, does not bypass authentication, and does not store or republish scraped content. That said, always review the terms of service of any website you're targeting for compliance with your own obligations.",
  },
];

// ── Component ─────────────────────────────────────────────────────
export default function LandingPage() {
  const [typedSuffix, setTypedSuffix] = useState("");
  const [suffixIndex, setSuffixIndex] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoPhase, setDemoPhase] = useState<DemoPhase>("typing");
  const [demoTyped, setDemoTyped] = useState("");

  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 3D tilt for feature cards
  const handleCardTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -3;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 3;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    card.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)";
  };
  const handleCardTiltReset = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
    e.currentTarget.style.boxShadow = "";
  };

  // ── Typing animation
  useEffect(() => {
    const current = SUFFIXES[suffixIndex];
    if (!isErasing) {
      if (typedSuffix.length < current.length) {
        typingRef.current = setTimeout(() => setTypedSuffix(current.slice(0, typedSuffix.length + 1)), TYPING_SPEED);
      } else {
        typingRef.current = setTimeout(() => setIsErasing(true), PAUSE_DURATION);
      }
    } else {
      if (typedSuffix.length > 0) {
        typingRef.current = setTimeout(() => setTypedSuffix(current.slice(0, typedSuffix.length - 1)), ERASING_SPEED);
      } else {
        setIsErasing(false);
        setSuffixIndex((i) => (i + 1) % SUFFIXES.length);
      }
    }
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [typedSuffix, isErasing, suffixIndex]);

  // ── Hero demo loop
  useEffect(() => {
    if (demoPhase === "typing") {
      if (demoTyped.length < DEMO_URL.length) {
        demoRef.current = setTimeout(() => setDemoTyped(DEMO_URL.slice(0, demoTyped.length + 1)), 90);
      } else {
        demoRef.current = setTimeout(() => setDemoPhase("loading"), 700);
      }
    } else if (demoPhase === "loading") {
      demoRef.current = setTimeout(() => setDemoPhase("result"), 1800);
    } else if (demoPhase === "result") {
      demoRef.current = setTimeout(() => setDemoPhase("fade"), 3800);
    } else if (demoPhase === "fade") {
      demoRef.current = setTimeout(() => { setDemoTyped(""); setDemoPhase("typing"); }, 700);
    }
    return () => { if (demoRef.current) clearTimeout(demoRef.current); };
  }, [demoPhase, demoTyped]);

  // ── Section reveal via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-visible");
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ── Hero parallax
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScroll = () => {
      const hero = document.getElementById("hero-content");
      if (hero && window.scrollY < window.innerHeight) {
        hero.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const demoLoadingText =
    demoPhase === "loading" ? "Analyzing website…" :
    demoPhase === "result" || demoPhase === "fade" ? "Done · 3 emails ready" : "";

  return (
    <>
      <Navbar />
      <main className="pt-20 overflow-x-hidden">

        {/* ── HERO ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: "#0a0a0a", paddingBottom: "48px" }}>
          {/* Ambient glow — slow pulse behind all content */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              animation: "hero-ambient 8s ease-in-out infinite",
              background:
                "radial-gradient(ellipse 55% 35% at 75% 25%, rgba(251,146,60,0.14) 0%, transparent 55%), " +
                "radial-gradient(ellipse 45% 35% at 20% 65%, rgba(96,165,250,0.12) 0%, transparent 55%), " +
                "radial-gradient(ellipse 65% 50% at 50% -5%, rgba(124,58,237,0.38) 0%, rgba(124,58,237,0.10) 45%, transparent 68%)",
            }}
          />
          {/* Subtle grid texture — à la Linear/Vercel */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              opacity: 0.03,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm40 0h-1v40h1zM0 0v1h40V0zm0 40v-1h40v1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div id="hero-content" className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center" style={{ zIndex: 1 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px 6px 6px",
              borderRadius: "100px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(8px)",
              marginBottom: "32px",
              cursor: "default",
            }}>
              <span style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.65)",
                fontWeight: "400",
                letterSpacing: "0.01em",
              }}>
                Free to start. No card. No catch. →
              </span>
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] mb-8">
              <span className="text-white">
                {["Scrape", "any", "website."].map((word, i) => (
                  <span key={i} className="word-reveal" style={{ animationDelay: `${i * 80}ms` }}>{word}{" "}</span>
                ))}
              </span>
              <br />
              <span className="text-white">
                <span className="word-reveal" style={{ animationDelay: `${3 * 80}ms` }}>Write{" "}</span>
                <span className="word-reveal" style={{ animationDelay: `${4 * 80}ms` }}>any{" "}</span>
                <span className="word-reveal" style={{ animationDelay: `${5 * 80}ms` }}>cold{" "}</span>
                <span className="word-reveal" style={{ animationDelay: `${6 * 80}ms` }}>email.</span>
              </span>
            </h1>

            {/* Typing subtitle */}
            <p className="mx-auto mt-2 mb-5 text-xl sm:text-2xl text-[#d4d4d4]">
              Personalized outreach{" "}
              <span className="text-white font-semibold">
                {typedSuffix}<span className="cursor-blink text-white">|</span>
              </span>
            </p>

            {/* Long-form value subheadline */}
            <p className="mx-auto max-w-2xl text-lg text-[#a8a8a8] leading-relaxed mb-12">
              Paste any prospect&apos;s website URL. Scrapitch reads their homepage, about page, and case studies, extracts their industry, tone, pain points, and value proposition, then writes 3 personalized cold emails using proven frameworks, each with 3 subject line options and a reply-rate score. Plus a full Day 3, 7, 14 follow-up sequence. All in under 10 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/signup"
                className="rounded-2xl bg-[#7c3aed] px-10 py-4 text-lg font-bold text-white hover:bg-[#6d28d9] transition-colors"
              >
                Start Free — No Card Required →
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-2xl border border-white/20 px-10 py-4 text-lg font-semibold text-[#d4d4d4] hover:border-white/30 hover:text-white transition-colors"
              >
                See how it works
              </Link>
            </div>
            <p className="text-sm text-[#6b6b6b] mb-14">3 free generations · no credit card required · cancel anytime</p>

            {/* Flow pills */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                { num: "01", label: "Paste URL" },
                { num: "02", label: "AI Scrapes Site" },
                { num: "03", label: "3 Emails Written" },
                { num: "04", label: "Follow-Up Ready" },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2.5 rounded-full border border-white/12 bg-[#1c1c1c] px-5 py-2.5">
                    <span className="text-xs font-black text-[#a855f7] font-mono tracking-widest">{step.num}</span>
                    <span className="text-sm font-semibold text-[#d4d4d4] whitespace-nowrap">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <span className="text-[#7c3aed] font-bold select-none">→</span>}
                </div>
              ))}
            </div>

            {/* ── Mini animated demo ──────────────── */}
            <div style={{ width: "100%", maxWidth: "900px", margin: "48px auto 0", marginBottom: 0, paddingBottom: 0 }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6b6b] mb-3">Live preview</p>
              <div
                className={`rounded-2xl p-6 transition-opacity duration-700 ${demoPhase === "fade" ? "opacity-0" : "opacity-100"}`}
                style={{ background: "#111111", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 0 40px rgba(124,58,237,0.08)" }}
              >
                {/* URL input row */}
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 mb-4">
                  <svg className="w-4 h-4 text-[#6b6b6b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                  <span className="flex-1 text-sm font-mono text-[#d4d4d4]">
                    {demoTyped.length > 0 ? `https://${demoTyped}` : <span className="text-[#6b6b6b]">https://</span>}
                    {(demoPhase === "typing") && <span className="cursor-blink text-white">|</span>}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 transition-all ${
                    demoPhase === "loading" || demoPhase === "result" || demoPhase === "fade"
                      ? "bg-white/10 text-[#a8a8a8]"
                      : "bg-white/8 text-[#6b6b6b]"
                  }`}>
                    {demoPhase === "loading" ? "Analyzing…" : demoPhase === "result" || demoPhase === "fade" ? "Done ✓" : "Analyze →"}
                  </span>
                </div>

                {/* Loading bar */}
                {(demoPhase === "loading" || demoPhase === "result" || demoPhase === "fade") && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#a8a8a8]">{demoLoadingText}</span>
                      <span className="text-xs text-[#6b6b6b]">{demoPhase === "loading" ? "…" : "100%"}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                      <div className={`h-full rounded-full bg-[#7c3aed] ${demoPhase === "loading" ? "demo-bar" : "w-full"}`} />
                    </div>
                  </div>
                )}

                {/* Scraped intel panel */}
                {(demoPhase === "result" || demoPhase === "fade") && (
                  <div className={`mb-4 rounded-xl bg-[#1c1c1c] border border-white/8 px-4 py-3 transition-all duration-500 ${demoPhase === "result" ? "opacity-100" : "opacity-0"}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6b6b] mb-2">Scraped intel</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Company", value: "Acme Agency" },
                        { label: "Industry", value: "Marketing Agency" },
                        { label: "Tone", value: "Professional" },
                        { label: "ICP", value: "B2B Clients" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5 rounded-lg bg-white/6 px-2.5 py-1">
                          <span className="text-[10px] text-[#6b6b6b]">{item.label}:</span>
                          <span className="text-[11px] font-semibold text-[#d4d4d4]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result email mini-cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Direct / PAS", score: 9, subject: "Your client pipeline gap", lines: ["Most agencies lose", "clients before they", "see real ROI…"], border: "border-blue-500/25", bg: "bg-blue-500/5", scoreColor: "text-blue-400" },
                    { label: "Value-First", score: 8, subject: "2x agency reply rates", lines: ["Agencies that nail", "outreach see 2x", "client reply rates…"], border: "border-emerald-500/25", bg: "bg-emerald-500/5", scoreColor: "text-emerald-400" },
                    { label: "The Curious", score: 9, subject: "Losing clients to competitors?", lines: ["Noticed Acme Agency", "targets B2B clients —", "are they converting?…"], border: "border-white/12", bg: "bg-white/3", scoreColor: "text-[#a8a8a8]" },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border ${card.border} ${card.bg} p-3 transition-all duration-500 ${
                        demoPhase === "result" || demoPhase === "fade"
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3"
                      }`}
                      style={{ transitionDelay: demoPhase === "result" ? `${i * 130}ms` : "0ms" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-[#a8a8a8] leading-tight">{card.label}</span>
                        <span className={`text-[9px] font-black ${card.scoreColor}`}>{card.score}/10</span>
                      </div>
                      <p className="text-[9px] text-[#6b6b6b] mb-2 font-medium truncate">&ldquo;{card.subject}&rdquo;</p>
                      <div className="space-y-1">
                        {card.lines.map((line, li) => (
                          <div key={li} className="h-[7px] bg-white/8 rounded-full" style={{ width: `${95 - li * 12}%` }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {demoPhase !== "result" && demoPhase !== "fade" && (
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-3">
                        <div className="h-2 bg-white/8 rounded-full w-3/4 mb-2" />
                        <div className="space-y-1.5">
                          <div className="h-[6px] bg-white/6 rounded-full w-full" />
                          <div className="h-[6px] bg-white/6 rounded-full w-4/5" />
                          <div className="h-[6px] bg-white/6 rounded-full w-3/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer row */}
                <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between">
                  <span className="text-[10px] text-[#6b6b6b]">Generated in ~9.4s</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#6b6b6b]">Follow-up sequence included</span>
                    <span className="text-[10px] font-bold text-[#4ade80]">✓</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-[#6b6b6b] mt-2 text-center">Looping demo · real generation takes ~10 seconds</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <section className="reveal border-t border-[#e8e4df] bg-[#f7f6f3]" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] mb-4">How it works</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f0f0f]">Four steps. <span className="text-[#7c3aed]">Ten seconds.</span></h2>
              <p className="mt-5 text-xl text-[#6b6b6b] max-w-xl mx-auto">No research. No templates. No wasted hours.</p>
            </Reveal>

            {/* Desktop layout */}
            <div className="hidden lg:flex items-stretch gap-4">
              {steps.map((step, i) => (
                <React.Fragment key={step.num}>
                  <div className="flex-1 relative reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                    <span className="absolute -top-4 right-3 text-[110px] font-black select-none pointer-events-none leading-none z-0" style={{ color: "rgba(15,15,15,0.04)" }}>{step.num}</span>
                    <div className="h-full rounded-xl border border-[#e8e4df] bg-white p-7 relative z-10" style={{ transition: "all 0.2s ease", borderLeft: `3px solid ${stepColors[i]}` }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${stepColors[i]}1a`, color: stepColors[i] }}>
                        {step.icon}
                      </div>
                      <span className="text-xs font-mono font-bold tracking-widest" style={{ color: stepColors[i] }}>{step.num}</span>
                      <h3 className="mt-1.5 text-xl font-bold text-[#0f0f0f] leading-snug mb-2.5">{step.title}</h3>
                      <p className="text-base text-[#6b6b6b] leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="relative flex items-center w-8 shrink-0 self-center" style={{ marginTop: "1.5rem" }}>
                      <div className="w-full h-[1px] border-t border-dashed border-[#c8c4bf]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile / Tablet */}
            <div className="lg:hidden grid sm:grid-cols-2 gap-5">
              {steps.map((step, i) => (
                <Reveal key={step.num} delay={i * 80}>
                  <div className="h-full relative rounded-xl border border-[#e8e4df] bg-white p-7" style={{ transition: "all 0.2s ease", borderLeft: `3px solid ${stepColors[i]}` }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                    <div className="absolute -top-4 right-4 text-[100px] font-black select-none pointer-events-none leading-none" style={{ color: "rgba(15,15,15,0.04)" }}>{step.num}</div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl relative z-10" style={{ background: `${stepColors[i]}1a`, color: stepColors[i] }}>
                      {step.icon}
                    </div>
                    <span className="text-xs font-mono font-bold tracking-widest relative z-10" style={{ color: stepColors[i] }}>{step.num}</span>
                    <h3 className="mt-1.5 text-xl font-bold text-[#0f0f0f] leading-snug mb-2.5 relative z-10">{step.title}</h3>
                    <p className="text-base text-[#6b6b6b] leading-relaxed relative z-10">{step.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-12 text-center">
              <Link href="/how-it-works" className="text-base text-[#7c3aed] hover:text-[#6d28d9] font-medium transition-colors">
                Full breakdown →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── BENTO FEATURES GRID ───────────────────────────── */}
        <section className="reveal border-t border-[#e8e4df] py-28 md:py-36 bg-[#f7f6f3]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] mb-4">Features</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f0f0f]">
                Everything you need to close more deals
              </h2>
              <p className="mt-5 text-xl text-[#6b6b6b] max-w-xl mx-auto">Not a template engine. A research + writing layer that reads, understands, and writes like a human.</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {bentoCards.map((card, i) => (
                <Reveal key={card.title} delay={i * 60} className={card.span}>
                  <div
                    className="h-full rounded-xl border border-[#e8e4df] bg-[#f7f6f3] p-8 hover:border-[#d4d0cb]"
                    onMouseMove={handleCardTilt}
                    onMouseLeave={handleCardTiltReset}
                    style={{ transition: "all 0.2s ease", borderTop: `2px solid ${card.topBorderColor}` }}
                  >
                    {/* Tag / badge */}
                    {card.tag ? (
                      <span className="inline-block mb-4" style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#555555", border: "1px solid rgba(0,0,0,0.12)", background: "transparent" }}>
                        {card.tag}
                      </span>
                    ) : (
                      <div className="mb-4 h-7" />
                    )}
                    {/* Icon */}
                    {card.icon && (
                      <div className="w-14 h-14 mb-4 rounded-2xl bg-black/6 flex items-center justify-center text-[#555555]">
                        {card.icon}
                      </div>
                    )}
                    {/* Heading */}
                    <h3 className="text-2xl lg:text-3xl font-bold text-[#0f0f0f] mb-2 leading-tight">{card.title}</h3>
                    {/* Subtitle */}
                    {card.subtitle && (
                      <span className="inline-block mb-3" style={{
                        borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em",
                        color: card.subtitleColor || "#555555",
                        border: `1px solid ${card.subtitleColor === "#555555" ? "rgba(0,0,0,0.12)" : (card.subtitleColor || "#555555") + "40"}`,
                        background: "transparent",
                      }}>
                        {card.subtitle}
                      </span>
                    )}
                    <p className="text-lg text-[#6b6b6b] leading-relaxed">{card.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── VS CHATGPT ───────────────────────────────────── */}
        <section className="reveal border-t border-[#dde5ff] py-28 md:py-32 bg-[#f7f6f3]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] mb-4">vs generic AI</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f0f0f]">Why not just use ChatGPT?</h2>
              <p className="mt-5 text-xl text-[#6b6b6b] max-w-2xl mx-auto">
                ChatGPT writes emails. Scrapitch writes emails about{" "}
                <em className="not-italic text-[#0f0f0f] font-semibold">your specific prospect</em> — after reading their website, detecting their industry, matching their tone, and applying the framework most likely to get a reply. The difference isn&apos;t the AI. It&apos;s the research layer underneath it.
              </p>
            </Reveal>

            <Reveal>
              <div className="rounded-2xl border border-[#dde5ff] bg-white overflow-hidden">
                <div className="grid grid-cols-3 bg-[#f0f4ff] border-b border-[#dde5ff]">
                  <div className="px-6 py-5 text-base font-semibold text-[#6b6b6b]">Feature</div>
                  <div className="px-6 py-5 text-base font-bold text-[#7c3aed] text-center border-l border-[#dde5ff]">Scrapitch</div>
                  <div className="px-6 py-5 text-base font-semibold text-[#888888] text-center border-l border-[#dde5ff]">Generic AI</div>
                </div>
                {comparisonRows.map((row, i) => (
                  <div key={row.feature} className={`grid grid-cols-3 border-b border-[#dde5ff] last:border-0 ${i % 2 !== 0 ? "bg-[#f7f9ff]" : "bg-white"}`}>
                    <div className="px-6 py-4 text-sm text-[#555555]">{row.feature}</div>
                    <div className="px-6 py-4 text-center border-l border-[#dde5ff] flex items-center justify-center">
                      <span className="text-xl font-black text-[#16a34a]">✓</span>
                    </div>
                    <div className="px-6 py-4 text-center border-l border-[#dde5ff] flex items-center justify-center">
                      {row.generic === "~" ? (
                        <span style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#a16207", border: "1px solid rgba(161,98,7,0.25)", background: "transparent" }}>Manual only</span>
                      ) : (
                        <span className="text-xl font-bold text-[#d1d5db]">✗</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="mt-10 text-center">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[#7c3aed] px-8 py-4 text-lg font-bold text-white hover:bg-[#6d28d9] transition-colors">
                Try it free — see the difference →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── WHO IT'S FOR ─────────────────────────────────── */}
        <section className="reveal border-t border-[#f0e8df] py-28 md:py-32 bg-[#f7f6f3]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] mb-4">Who it&apos;s for</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f0f0f]">Built for anyone doing B2B outreach</h2>
              <p className="mt-5 text-xl text-[#6b6b6b] max-w-xl mx-auto">If you write cold emails to people who have a website, Scrapitch speeds up your research and makes your copy better.</p>
            </Reveal>

            {/* Top row — 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6">
              {whoCards.slice(0, 3).map((card, i) => (
                <Reveal key={card.role} delay={i * 70}>
                  <div className="h-full rounded-xl border border-[#f0e8df] bg-white p-8" style={{ transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "#e8d8cc"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#f7f1ea] flex items-center justify-center text-[#888888] shrink-0">
                        {card.icon}
                      </div>
                      <p className="text-base font-semibold text-[#0f0f0f] leading-snug">{card.role}</p>
                    </div>
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#dc2626] mb-2">The Problem</p>
                      <p className="text-sm text-[#6b6b6b] leading-relaxed">{card.problem}</p>
                    </div>
                    <div className="h-px bg-[#f0e8df] mb-5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#16a34a] mb-2">How Scrapitch Helps</p>
                      <p className="text-sm text-[#0f0f0f] leading-relaxed">{card.solution}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Bottom row — 2 cards centered */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:justify-center">
              {whoCards.slice(3).map((card, i) => (
                <Reveal key={card.role} delay={(i + 3) * 70} className="md:w-1/3">
                  <div className="h-full rounded-xl border border-[#f0e8df] bg-white p-8" style={{ transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "#e8d8cc"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#f7f1ea] flex items-center justify-center text-[#888888] shrink-0">
                        {card.icon}
                      </div>
                      <p className="text-base font-semibold text-[#0f0f0f] leading-snug">{card.role}</p>
                    </div>
                    <div className="mb-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#dc2626] mb-2">The Problem</p>
                      <p className="text-sm text-[#6b6b6b] leading-relaxed">{card.problem}</p>
                    </div>
                    <div className="h-px bg-[#f0e8df] mb-5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#16a34a] mb-2">How Scrapitch Helps</p>
                      <p className="text-sm text-[#0f0f0f] leading-relaxed">{card.solution}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── REAL EMAIL PREVIEWS ──────────────────────────── */}
        <section className="reveal border-t border-[#d1fae5] py-28 md:py-32 bg-[#f7f6f3]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] mb-4">3 variants, every time</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f0f0f]">Real emails. Real scores.</h2>
              <p className="mt-5 text-xl text-[#6b6b6b] max-w-xl mx-auto">This is what Scrapitch generates from a single URL. Three frameworks, three angles, one right fit for your prospect.</p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {emailPreviews.map((v, i) => (
                <Reveal key={v.variant} delay={i * 80}>
                  <div
                    className="relative overflow-hidden rounded-xl border border-[#d1fae5] bg-white p-8 h-full flex flex-col"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "#a3f0c7"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = ""; }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span style={{ borderRadius: "6px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: v.variantColor, border: `1px solid ${v.variantColor}40`, background: "transparent" }}>
                        {v.variant} · {v.label}
                      </span>
                      <span style={v.score >= 8
                        ? { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" }
                        : v.score >= 5
                          ? { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#a16207", background: "#fefce8", border: "1px solid #fde68a" }
                          : { borderRadius: "6px", padding: "3px 10px", fontSize: "13px", fontWeight: 600, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca" }
                      }>
                        {v.score}/10
                      </span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#888888] mb-3">Subject options</p>
                    <div className="space-y-2 mb-5">
                      {v.subjectLines.map((sl, si) => (
                        <div key={si} className="flex items-center gap-2">
                          <span className="text-xs text-[#888888] font-bold w-3">{si + 1}</span>
                          <p className="text-sm text-[#555555]">{sl}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#888888] mb-3">Body</p>
                    <p className="text-sm text-[#0f0f0f] leading-relaxed flex-1">{v.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-12 text-center">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-[#7c3aed] px-8 py-4 text-lg font-bold text-white hover:bg-[#6d28d9] transition-colors">
                Create Free Account →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── PRICING — Pro + Growth only ───────────────────── */}
        <section className="reveal border-t border-[#e8e4df] py-28 md:py-32 bg-[#f7f6f3]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] mb-4">Pricing</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f0f0f]">Simple, honest pricing.</h2>
              <p className="mt-5 text-xl text-[#6b6b6b] max-w-xl mx-auto">Start with 3 free generations. Unlock unlimited for less than a coffee per week.</p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* ── PRO CARD ── */}
              <Reveal delay={0}>
                <div className="relative rounded-xl border border-[#e8e4df] bg-white overflow-hidden" style={{ borderTop: "4px solid #7c3aed", boxShadow: "0 4px 16px rgba(124,58,237,0.1)", transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.1)"; }}>
                  <div className="p-6 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ borderRadius: "6px", padding: "3px 10px", background: "#7c3aed" }}>
                        Most Popular
                      </span>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#888888] mb-4 mt-3">Pro</p>
                    <div className="mb-1">
                      <span className="text-4xl font-black text-[#0f0f0f] leading-none">$9.99</span>
                    </div>
                    <p className="text-xs text-[#888888] mb-4">/ month · cancel anytime</p>
                    <ul className="space-y-2 mb-6">
                      {proFeatures.map((f) => (
                        <li key={f.text} className="flex items-center gap-3 text-sm text-[#555555]">
                          <span className="text-[#16a34a] font-bold shrink-0 text-base">✓</span>
                          {f.text}
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="block w-full text-center rounded-xl bg-[#7c3aed] py-2.5 text-sm font-bold text-white hover:bg-[#6d28d9] transition-colors">
                      Start Pro →
                    </Link>
                    <p className="text-center text-sm text-[#888888] mt-3">3 free generations to start · no card required</p>
                  </div>
                </div>
              </Reveal>

              {/* ── GROWTH CARD ── */}
              <Reveal delay={80}>
                <div className="rounded-xl border border-[#e8e4df] bg-white p-6" style={{ borderTop: "4px solid #fb923c", transition: "all 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <p className="text-sm font-bold uppercase tracking-widest text-[#888888] mb-4">Growth</p>
                  <div className="mb-1">
                    <span className="text-4xl font-black text-[#0f0f0f] leading-none">$15.99</span>
                  </div>
                  <p className="text-xs text-[#888888] mb-4">/ month · cancel anytime</p>
                  {/* Everything in Pro */}
                  <div className="mb-6 rounded-xl bg-[#f7f6f3] border border-[#e8e4df] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">Everything in Pro, plus:</p>
                    <ul className="space-y-2">
                      {proFeatures.slice(0, 4).map((f) => (
                        <li key={f.text} className="flex items-center gap-2 text-sm text-[#888888]">
                          <span className="text-[#888888]">✓</span> {f.text}
                        </li>
                      ))}
                      <li className="text-sm text-[#888888] pl-5">+ {proFeatures.length - 4} more…</li>
                    </ul>
                  </div>
                  {/* Coming soon features */}
                  <ul className="space-y-2 mb-6">
                    {growthFeatures.map((f) => (
                      <li key={f.text} className="flex items-center gap-3 text-sm text-[#555555]">
                        <span className="text-[#888888] font-bold shrink-0 text-base">+</span>
                        <span className="flex-1">{f.text}</span>
                        <span className="ml-auto shrink-0" style={{ borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.02em", color: "#a16207", border: "1px solid rgba(161,98,7,0.25)", background: "transparent" }}>Soon</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block w-full text-center rounded-xl border-2 border-[#0f0f0f] py-2.5 text-sm font-bold text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-white transition-colors">
                    Start Growth →
                  </Link>
                  <p className="text-center text-sm text-[#888888] mt-3">Lock in early-access pricing now</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="reveal border-t border-[#e8e4df] py-28 md:py-32 bg-[#f7f6f3]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-20">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] mb-4">FAQ</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#0f0f0f]">Everything you want to know</h2>
              <p className="mt-5 text-xl text-[#6b6b6b] max-w-xl mx-auto">Real answers. No vague marketing speak.</p>
            </Reveal>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 35}>
                  <div
                    className={`rounded-xl border overflow-hidden ${
                      openFaq === i ? "bg-white border-[#d4d0cb]" : "bg-[#f7f6f3] border-[#e8e4df] hover:border-[#d4d0cb]"
                    }`}
                    style={{ transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-7 py-5 text-left font-medium text-[#0f0f0f] transition-colors text-base"
                    >
                      {faq.q}
                      <span className={`ml-4 shrink-0 text-[#7c3aed] transition-transform duration-200 text-xl leading-none ${openFaq === i ? "rotate-180" : ""}`}>↓</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-7 pb-6 pt-1 text-sm text-[#6b6b6b] leading-relaxed border-t border-[#e8e4df]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-10 text-center">
              <Link href="/faq" className="text-base text-[#7c3aed] hover:text-[#6d28d9] font-medium transition-colors">
                See all questions →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────── */}
        <section className="reveal py-28 md:py-32 bg-[#0a0a0a]">
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-6xl sm:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
              Your next reply is<br />one URL away.
            </h2>
            <p className="text-xl font-medium text-[#a0a0a0] mb-12 max-w-2xl mx-auto">
              Paste a URL. Get 3 personalized cold emails, 3 subject line options each, reply-rate scoring, and a full follow-up sequence — in under 10 seconds. Start for free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                href="/signup"
                className="rounded-2xl bg-[#7c3aed] px-12 py-5 text-lg font-bold text-white hover:bg-[#6d28d9] transition-colors"
              >
                Start Free — No Card Required →
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-2xl border border-white/20 px-12 py-5 text-lg font-bold text-white/70 hover:border-white/30 hover:text-white transition-colors"
              >
                See It In Action →
              </Link>
            </div>
            <p className="mt-7 text-sm text-[#6b6b6b]">3 free email generations · cancel anytime · no setup required</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
