import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    label: "Free",
    description: "For occasional checks.",
    cta: "Start free",
    ctaHref: "/signup",
    highlights: [
      "5 analyses included per day",
      "Up to 1,500 characters per run",
      "Basic verdict + confidence",
      "Last 5 runs saved"
    ]
  },
  {
    name: "Starter",
    price: "$4",
    label: "Recommended",
    description: "For regular revisions and guidance.",
    cta: "Upgrade to Starter",
    ctaHref: "/signup",
    highlights: [
      "100 analyses included per month",
      "Up to 6,000 characters per run",
      "Edit and recheck workflow",
      "What changed panel + confidence deltas",
      "Signal breakdown",
      "Full history"
    ]
  },
  {
    name: "Pro",
    price: "$12",
    label: "Pro",
    description: "For higher volume and exports.",
    cta: "Upgrade to Pro",
    ctaHref: "/signup",
    highlights: [
      "500 analyses included per month",
      "Up to 12,000 characters per run",
      "Unlimited edit chains",
      "Comparison history",
      "Exports (PDF / CSV)",
      "Shareable private links",
      "Priority processing",
      "Early access to new models"
    ]
  }
];

const featureRows = [
  ["Basic verdict", "✓", "✓", "✓"],
  ["Confidence score", "✓", "✓", "✓"],
  ["Signal explanations", "✕", "✓", "✓"],
  ["Edit and recheck", "✕", "✓", "✓"],
  ["What changed feedback", "✕", "✓", "✓"],
  ["Full run history", "✕", "✓", "✓"],
  ["Comparison chains", "✕", "✕", "✓"],
  ["Exports", "✕", "✕", "✓"],
  ["Shareable reports", "✕", "✕", "✓"],
  ["Priority processing", "✕", "✕", "✓"]
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-60 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#edf2f5] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-col px-6 pb-20 pt-14">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7a7670]">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c]">
            See the signals. Decide what to change.
          </h1>
          <p className="mt-4 text-base text-[#4c4b45]">
            Veridict explains how edits shift detection signals. It supports calm
            iteration.
          </p>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur ${
                tier.name === "Starter" ? "ring-1 ring-[#2f3e4e]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
                  {tier.name}
                </p>
                {tier.name === "Starter" && (
                  <span className="rounded-full border border-[#2f3e4e] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#2f3e4e]">
                    Recommended
                  </span>
                )}
              </div>
              <p className="mt-4 text-3xl font-semibold text-[#1f1f1c]">
                {tier.price}
                <span className="text-sm font-medium text-[#7a7670]">/month</span>
              </p>
              <p className="mt-2 text-sm text-[#4c4b45]">{tier.description}</p>
              <Link
                href={tier.ctaHref}
                className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                  tier.name === "Starter"
                    ? "bg-[#2f3e4e] text-[#f7f7f4]"
                    : "border border-[#c4c1b8] text-[#4c4b45]"
                }`}
              >
                {tier.cta}
              </Link>
              <ul className="mt-5 space-y-2 text-sm text-[#4c4b45]">
                {tier.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2f3e4e]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Feature ladder
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-[#7a7670]">
                <tr>
                  <th className="py-2">Feature</th>
                  <th className="py-2">Free</th>
                  <th className="py-2">Starter</th>
                  <th className="py-2">Pro</th>
                </tr>
              </thead>
              <tbody className="text-[#4c4b45]">
                {featureRows.map((row) => (
                  <tr key={row[0]} className="border-t border-[#ebe7de]">
                    <td className="py-2">{row[0]}</td>
                    <td className="py-2">{row[1]}</td>
                    <td className="py-2">{row[2]}</td>
                    <td className="py-2">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#d8d6cf] bg-white/85 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Why people pay
          </p>
          <div className="mt-4 space-y-2 text-sm text-[#4c4b45]">
            <p>Explanations over conclusions.</p>
            <p>Signals over accusations.</p>
            <p>Probability over certainty.</p>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#d8d6cf] bg-[#f3f3ef] p-6 text-sm text-[#4c4b45]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Need scale?
          </p>
          <p className="mt-3">
            Need bulk analysis, datasets, or institutional access?{" "}
            <Link href="mailto:hello@aidetector.app" className="font-semibold text-[#1f1f1c]">
              Contact us.
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
