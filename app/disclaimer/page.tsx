import type { Metadata } from "next";

import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important information about the limitations of AI detection and use of the Veridict service."
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      description="Please read these important notes about AI detection results and service limitations."
      lastUpdated="January 7, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">AI detection is probabilistic</h2>
        <p>
          Veridict provides probabilistic signals and explanations. It does not
          verify authorship and does not determine intent. Results can vary between
          detectors, and false positives are possible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Not an institutional decision</h2>
        <p>
          Veridict is a self-check tool for students and writers. It does not make
          academic integrity decisions and is not a substitute for institutional
          policies or instructor judgment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">No guarantees</h2>
        <p>
          Using Veridict does not guarantee that a submission will be accepted by
          any institution or evaluator. You are responsible for your own work and
          for complying with relevant policies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Third party services</h2>
        <p>
          The Service may rely on third party infrastructure and analytics tools.
          We are not responsible for third party services or their availability.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#1f1f1c]">Contact</h2>
        <p>
          If you have questions about this disclaimer, email us at{" "}
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
