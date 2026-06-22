import { permanentRedirect } from "next/navigation";

// GDPR rights are a section of the Privacy Policy, so /gdpr permanently
// redirects (308) to that anchor.
export default function GdprPage() {
  permanentRedirect("/privacy#gdpr");
}
