"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/disclaimer", label: "Disclaimer" }
];

const FOOTERLESS_ROUTES = ["/validacion-2da-hipotesis"];

export default function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (FOOTERLESS_ROUTES.some((route) => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Veridict</p>
            <p className="mt-2 text-xs text-gray-600">
              Medellin, Colombia. Calle 23 #54-46 Veridict.
            </p>
            <a
              href="mailto:veridictaidetector@gmail.com"
              className="mt-2 inline-flex text-xs font-semibold text-gray-900"
            >
              veridictaidetector@gmail.com
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-gray-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-8 text-xs text-gray-500">© {year} Veridict. All rights reserved.</p>
      </div>
    </footer>
  );
}
