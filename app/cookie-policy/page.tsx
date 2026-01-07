import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how Veridict uses cookies and similar technologies, and how you can control your preferences."
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="This policy explains how cookies are used on Veridict and how you can manage them."
      lastUpdated="January 7, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">What are cookies</h2>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help the site remember your preferences and understand how
          the site is used.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">How we use cookies</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Essential cookies to keep you signed in and secure your session.
          </li>
          <li>
            Analytics cookies to understand usage and improve the Service.
          </li>
          <li>
            Preference cookies to remember settings and improve your experience.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Analytics tools</h2>
        <p>
          We use Google Analytics and Microsoft Clarity to understand aggregated
          usage patterns. These tools may set their own cookies and collect device
          information to provide reporting.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Your choices</h2>
        <p>
          You can control cookies through your browser settings. If you disable
          cookies, some features may not work as intended. You can also use browser
          tools to delete existing cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Changes</h2>
        <p>
          We may update this Cookie Policy from time to time. We will post updates
          here and revise the last updated date above.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Contact</h2>
        <p>
          If you have questions about cookies, email us at{" "}
          <a href="mailto:veridictaidetector@gmail.com" className="font-semibold text-[#1f1f1c]">
            veridictaidetector@gmail.com
          </a>
          .
        </p>
        <p>Veridict, Calle 23 #54-46, Medellin, Colombia.</p>
      </section>
    </LegalPage>
  );
}
