import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    label: "Try it",
    description: "Trust and habit, not extraction.",
    cta: "Start free",
    ctaHref: "/signup",
    highlights: [
      "5 analyses included per day",
      "Up to 1,500 characters per run",
      "Basic verdict + confidence",
      "History: last 5 runs"
    ]
  },
  {
    name: "Starter",
    price: "$4",
    label: "Most popular",
    description: "For people who edit, not just check.",
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
    label: "Serious option",
    description: "Proof, iteration, and control.",
    cta: "Go Pro",
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
  ["Signal breakdown", "✕", "✓", "✓"],
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
    <main className="relative min-h-screen overflow-hidden bg-[#f8f7f1]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#e5edd8] opacity-60 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#f3e3cf] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-col px-6 pb-20 pt-14">
        <header className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-[#7b756a]">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-[#1f1d18]">
            Know what changed. Not just what it is.
          </h1>
          <p className="mt-4 text-base text-[#4f4a40]">
            AI Detector helps you understand how small edits affect AI detection.
            Built for iteration, not guesswork.
          </p>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur ${
                tier.name === "Starter" ? "ring-1 ring-[#1f2a1f]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
                  {tier.name}
                </p>
                {tier.name === "Starter" && (
                  <span className="rounded-full border border-[#1f2a1f] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#1f2a1f]">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-4 text-3xl font-semibold text-[#1f1d18]">
                {tier.price}
                <span className="text-sm font-medium text-[#6a6459]">/month</span>
              </p>
              <p className="mt-2 text-sm text-[#4f4a40]">{tier.description}</p>
              <Link
                href={tier.ctaHref}
                className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                  tier.name === "Starter"
                    ? "bg-[#1f2a1f] text-[#f6f5ef]"
                    : "border border-[#b9b4a6] text-[#4f4a40]"
                }`}
              >
                {tier.cta}
              </Link>
              <ul className="mt-5 space-y-2 text-sm text-[#4f4a40]">
                {tier.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1f2a1f]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
            Feature ladder
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-[#7b756a]">
                <tr>
                  <th className="py-2">Feature</th>
                  <th className="py-2">Free</th>
                  <th className="py-2">Starter</th>
                  <th className="py-2">Pro</th>
                </tr>
              </thead>
              <tbody className="text-[#4f4a40]">
                {featureRows.map((row) => (
                  <tr key={row[0]} className="border-t border-[#eee9db]">
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

        <section className="mt-12 rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
            Why people pay
          </p>
          <div className="mt-4 space-y-2 text-sm text-[#4f4a40]">
            <p>Detection is probabilistic, not binary.</p>
            <p>Edits matter more than verdicts.</p>
            <p>Confidence comes from iteration.</p>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#d6d2c6] bg-[#f6f3ea] p-6 text-sm text-[#4f4a40]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">
            Need scale?
          </p>
          <p className="mt-3">
            Need bulk analysis, datasets, or institutional access?{" "}
            <Link href="mailto:hello@aidetector.app" className="font-semibold text-[#1f1d18]">
              Contact us.
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
