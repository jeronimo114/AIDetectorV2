import Link from "next/link";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/disclaimer", label: "Disclaimer" }
];

type LegalPageProps = {
  title: string;
  description?: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export default function LegalPage({
  title,
  description,
  lastUpdated,
  children
}: LegalPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f4]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e6ecf1] opacity-70 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#edf2f5] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[860px] px-6 pb-24 pt-16">
        <p className="text-xs uppercase tracking-[0.4em] text-[#7a7670]">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#1f1f1c]">{title}</h1>
        {description && (
          <p className="mt-3 text-base text-[#4c4b45]">{description}</p>
        )}
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#7a7670]">
          Last updated {lastUpdated}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#4c4b45]">
          {children}
        </div>

        <div className="mt-12 rounded-3xl border border-[#d8d6cf] bg-white/85 p-5 text-sm text-[#4c4b45]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a7670]">
            Other legal pages
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[#d8d6cf] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#2f3e4e] transition hover:border-[#c4c1b8]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
