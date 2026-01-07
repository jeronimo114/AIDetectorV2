import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Veridict, including account responsibilities, acceptable use, and service limitations."
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms explain the rules and responsibilities for using Veridict."
      lastUpdated="January 7, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Acceptance of terms</h2>
        <p>
          By accessing or using Veridict (the "Service"), you agree to these terms.
          If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Eligibility and accounts</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You must be at least 13 years old to use the Service.</li>
          <li>You are responsible for maintaining the security of your account.</li>
          <li>You agree to provide accurate information and keep it updated.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Use of the Service</h2>
        <p>
          Veridict is a self-check tool for students and writers. You are responsible
          for how you use it and for complying with your institution&apos;s academic
          integrity policies.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Do not use the Service for unlawful, harmful, or deceptive purposes.</li>
          <li>Do not attempt to interfere with or disrupt the Service.</li>
          <li>Do not submit content you do not have the right to use.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Content you submit</h2>
        <p>
          You retain ownership of the content you submit. You grant us a limited
          license to process, analyze, and store that content to provide the Service
          and improve its performance. You are responsible for ensuring that your
          content does not violate any rights or policies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">AI detection results</h2>
        <p>
          The Service provides probabilistic signals and explanations. Results are
          not definitive proof of authorship and should be used as guidance, not as
          a final verdict. Veridict does not make academic integrity decisions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Subscriptions and payments</h2>
        <p>
          If you purchase a paid plan, you agree to pay the fees displayed at the
          time of purchase. Payments are handled by our payment processor. Fees are
          non-refundable unless required by law or explicitly stated otherwise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Service availability</h2>
        <p>
          We aim to provide reliable access to the Service, but we do not guarantee
          uninterrupted availability. We may modify, suspend, or discontinue
          features at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Termination</h2>
        <p>
          We may suspend or terminate access if you violate these terms or if we
          believe your use poses a risk to the Service or other users. You may stop
          using the Service at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Disclaimers</h2>
        <p>
          The Service is provided "as is" without warranties of any kind. We do not
          guarantee that results will meet your expectations or that the Service
          will identify or avoid all false positives.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Veridict is not liable for any
          indirect, incidental, special, or consequential damages arising from your
          use of the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Governing law</h2>
        <p>
          These terms are governed by the laws of Colombia, without regard to
          conflict of law principles. You agree to the exclusive jurisdiction of
          the courts located in Medellin, Colombia.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Contact</h2>
        <p>
          If you have questions about these terms, email us at{" "}
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
