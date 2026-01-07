"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    )
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    )
  },
  {
    href: "/admin/runs",
    label: "Runs",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M4 8a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    href: "/admin/audit",
    label: "Audit Log",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    )
  }
];

type AdminShellProps = {
  role: "admin" | "super_admin";
  email: string | null;
  impersonating: null | { userId: string; email: string | null };
  children: React.ReactNode;
};

export default function AdminShell({ role, email, impersonating, children }: AdminShellProps) {
  const pathname = usePathname();
  const [clearing, setClearing] = useState(false);

  const handleClearImpersonation = async () => {
    setClearing(true);
    await fetch("/admin/impersonate/clear", { method: "POST" });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Veridict</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-sm font-medium text-orange-700">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {role.replace("_", " ")}
              </p>
              <p className="text-sm text-gray-900">{email ?? ""}</p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              Exit Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Impersonation Banner */}
      {impersonating && (
        <div className="border-b border-yellow-200 bg-yellow-50">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-3 text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-yellow-600">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>
                Viewing as <strong>{impersonating.email ?? impersonating.userId}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearImpersonation}
              className="rounded-full bg-yellow-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-yellow-700"
              disabled={clearing}
            >
              {clearing ? "Exiting..." : "Exit Impersonation"}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm h-fit">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Quick Links</p>
            <div className="mt-2 space-y-1">
              <Link
                href="/detector"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Go to Detector
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                View Pricing
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
