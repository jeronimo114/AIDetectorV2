import type { Metadata } from "next";
import Link from "next/link";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Veridict collects, uses, and protects your information when you use our AI detection self-check service."
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains how we collect, use, and protect information when you use Veridict."
      lastUpdated="January 7, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Overview</h2>
        <p>
          Veridict helps students review their writing before submission. We collect
          limited information to provide the service, keep your account secure, and
          improve the product. This policy applies to our website, applications, and
          related services (collectively, the "Service").
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Account information such as email address and authentication details
            when you create an account.
          </li>
          <li>
            Content you submit for analysis, including text and related metadata,
            along with the results generated for your account.
          </li>
          <li>
            Usage data such as pages visited, actions taken, and device information
            to understand how the Service is used.
          </li>
          <li>
            Payment details if you purchase a plan. Payments are handled by our
            payment processor, and we do not store full card numbers.
          </li>
          <li>
            Cookies and similar technologies as described in our{" "}
            <Link href="/cookie-policy" className="font-semibold text-[#1f1f1c]">
              Cookie Policy
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">How we use information</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide and operate the Service, including analysis results.</li>
          <li>Authenticate users, prevent abuse, and keep accounts secure.</li>
          <li>Improve accuracy, performance, and user experience.</li>
          <li>Communicate important updates, notices, or support responses.</li>
          <li>Comply with legal obligations and enforce our terms.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">How we share information</h2>
        <p>
          We share information only as needed to operate the Service, such as with
          infrastructure providers, analytics tools, and payment processors. We may
          also disclose information to comply with legal requests or to protect our
          rights and users. We do not sell your personal data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Analytics and tracking</h2>
        <p>
          We use analytics tools like Google Analytics and Microsoft Clarity to
          understand usage patterns and improve the Service. These tools may set
          cookies or collect device information. You can learn more in our{" "}
          <Link href="/cookie-policy" className="font-semibold text-[#1f1f1c]">
            Cookie Policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Data retention</h2>
        <p>
          We retain account information and analysis history while your account is
          active or as needed to provide the Service. You can request deletion of
          your data by contacting us.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational measures
          to protect your information. No system is perfectly secure, so please use
          the Service responsibly and keep your credentials safe.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">International transfers</h2>
        <p>
          We may process and store information in the countries where we or our
          service providers operate. By using the Service, you consent to these
          transfers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Your choices</h2>
        <p>
          You may request access, correction, or deletion of your personal
          information, subject to applicable law. You can also manage cookie
          preferences through your browser settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Children&apos;s privacy</h2>
        <p>
          The Service is not intended for children under 13. If you believe a child
          has provided personal data, contact us and we will take appropriate
          action.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Changes to this policy</h2>
        <p>
          We may update this policy from time to time. We will post updates here and
          revise the last updated date above.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Contact</h2>
        <p>
          For questions or requests about this policy, email us at{" "}
          <a href="mailto:hello@aidetector.app" className="font-semibold text-[#1f1f1c]">
            hello@aidetector.app
          </a>
          .
        </p>
        <p>Veridict, Calle 23 #54-46, Medellin, Colombia.</p>
      </section>
    </LegalPage>
  );
}
