import type { ReactNode, CSSProperties } from "react";

/**
 * Renders a legal Markdown document inside the shared site shell's light
 * legal layout. The Markdown is rendered faithfully (headings, lists, links,
 * bold, italic, blockquotes, code, horizontal rules). The source file is the
 * single source of truth; this component does not alter the legal text.
 *
 * Headings are given slug ids. Any heading containing the word "GDPR" is
 * given id="gdpr" so the footer "GDPR policy" link (/privacy#gdpr) scrolls to
 * it. The global `scroll-margin-top: 80px` offsets the fixed navbar.
 */

const LIGHT_BG = "#faf8f5";
const TEXT = "#0a0a0a";
const MUTED = "#5a5347";
const HAIRLINE = "#d8d0bd";
const LINK = "#2563eb";

const pStyle: CSSProperties = { fontSize: 16, lineHeight: 1.75, color: TEXT, margin: "0 0 20px" };
const h1Style: CSSProperties = { fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em", color: TEXT, margin: "0 0 24px" };
const h2Style: CSSProperties = { fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", color: TEXT, margin: "48px 0 16px" };
const h3Style: CSSProperties = { fontSize: 19, fontWeight: 600, lineHeight: 1.4, color: TEXT, margin: "32px 0 12px" };
const h4Style: CSSProperties = { fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: TEXT, margin: "24px 0 8px" };
const listStyle: CSSProperties = { margin: "0 0 20px", paddingLeft: 24, color: TEXT, listStyleType: "disc" };
const liStyle: CSSProperties = { fontSize: 16, lineHeight: 1.7, color: TEXT, marginBottom: 8 };
const hrStyle: CSSProperties = { border: "none", borderTop: `1px solid ${HAIRLINE}`, margin: "40px 0" };
const bqStyle: CSSProperties = { borderLeft: `2px solid ${HAIRLINE}`, paddingLeft: 16, margin: "0 0 20px", color: MUTED, fontStyle: "italic" };
const codeStyle: CSSProperties = { fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.9em", background: "rgba(0,0,0,0.05)", padding: "1px 5px", borderRadius: 3 };

function slugify(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("gdpr")) return "gdpr";
  const base = lower
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base || "section";
}

let inlineKey = 0;

function renderInline(text: string): ReactNode {
  const patterns: { re: RegExp; node: (m: RegExpExecArray) => ReactNode }[] = [
    {
      re: /\[([^\]]+)\]\(([^)\s]+)\)/,
      node: (m) => {
        const href = m[2];
        const external = /^https?:\/\//.test(href);
        return (
          <a
            key={inlineKey++}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            style={{ color: LINK, textDecoration: "underline" }}
          >
            {renderInline(m[1])}
          </a>
        );
      },
    },
    { re: /\*\*([^*]+)\*\*/, node: (m) => <strong key={inlineKey++} style={{ fontWeight: 600 }}>{renderInline(m[1])}</strong> },
    { re: /__([^_]+)__/, node: (m) => <strong key={inlineKey++} style={{ fontWeight: 600 }}>{renderInline(m[1])}</strong> },
    { re: /\*([^*]+)\*/, node: (m) => <em key={inlineKey++}>{renderInline(m[1])}</em> },
    { re: /`([^`]+)`/, node: (m) => <code key={inlineKey++} style={codeStyle}>{m[1]}</code> },
  ];

  let best: { idx: number; m: RegExpExecArray; node: (m: RegExpExecArray) => ReactNode } | null = null;
  for (const p of patterns) {
    const m = p.re.exec(text);
    if (m && (best === null || m.index < best.idx)) best = { idx: m.index, m, node: p.node };
  }
  if (!best) return text;

  const before = text.slice(0, best.idx);
  const after = text.slice(best.idx + best.m[0].length);
  return (
    <>
      {before}
      {best.node(best.m)}
      {renderInline(after)}
    </>
  );
}

function renderMarkdown(md: string): ReactNode[] {
  inlineKey = 0;
  const lines = md.replace(/\r\n/g, "\n").replace(/\t/g, "  ").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flush = () => {
    if (para.length) {
      blocks.push(<p key={`p${key++}`} style={pStyle}>{renderInline(para.join(" "))}</p>);
      para = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (line === "") {
      flush();
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      blocks.push(<hr key={`hr${key++}`} style={hrStyle} />);
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      const text = h[2].replace(/\s+#+\s*$/, "");
      const id = slugify(text);
      const content = renderInline(text);
      if (level === 1) blocks.push(<h1 key={`h${key++}`} id={id} style={h1Style}>{content}</h1>);
      else if (level === 2) blocks.push(<h2 key={`h${key++}`} id={id} style={h2Style}>{content}</h2>);
      else if (level === 3) blocks.push(<h3 key={`h${key++}`} id={id} style={h3Style}>{content}</h3>);
      else blocks.push(<h4 key={`h${key++}`} id={id} style={h4Style}>{content}</h4>);
      i++;
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul${key++}`} style={listStyle}>
          {items.map((it, idx) => (
            <li key={idx} style={liStyle}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol${key++}`} style={{ ...listStyle, listStyleType: "decimal" }}>
          {items.map((it, idx) => (
            <li key={idx} style={liStyle}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(<blockquote key={`bq${key++}`} style={bqStyle}>{renderInline(quote.join(" "))}</blockquote>);
      continue;
    }

    para.push(line);
    i++;
  }
  flush();
  return blocks;
}

export default function LegalDocument({
  markdown,
  eyebrow,
  title,
}: {
  markdown: string;
  eyebrow: string;
  title: string;
}) {
  // Use the document's own leading H1 as the page title (shown in the dark
  // header), removing it from the body so it is not rendered twice. If the
  // document has no leading H1, fall back to the provided title.
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let docTitle = title;
  let body = markdown;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === "") continue;
    const m = /^#\s+(.*)$/.exec(t);
    if (m) {
      docTitle = m[1].trim();
      lines.splice(i, 1);
      body = lines.join("\n");
    }
    break;
  }

  const blocks = renderMarkdown(body);

  return (
    <main>
      {/* Dark arrival header: gives the transparent navbar a dark backdrop */}
      <section style={{ background: "#0a0a0a", paddingTop: 140, paddingBottom: 72 }}>
        <div className="w-full mx-auto px-6 text-center" style={{ maxWidth: 720 }}>
          <p className="font-mono" style={{ fontSize: 11, color: "#8a8a85", letterSpacing: "0.04em", marginBottom: 24 }}>
            {eyebrow}
          </p>
          <div style={{ height: 1, background: "#2c241c", width: 64, margin: "0 auto 32px" }} />
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.028em", color: "#f5f5f0", margin: 0 }}>
            {docTitle}
          </h1>
        </div>
      </section>

      {/* Light legal body */}
      <section style={{ background: LIGHT_BG }}>
        <div className="w-full mx-auto px-6" style={{ maxWidth: 720, paddingTop: 72, paddingBottom: 120 }}>
          {blocks}
        </div>
      </section>
    </main>
  );
}
