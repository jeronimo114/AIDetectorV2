"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/runs", label: "Runs" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit" }
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
    <div className="min-h-screen bg-[#f8f7f1]">
      <div className="border-b border-[#ded8ca]/80 bg-[#f8f7f1]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Admin</p>
            <p className="mt-1 text-sm font-semibold text-[#1f1f1c]">Veridict</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7b756a]">
              {role.replace("_", " ")}
            </p>
            <p className="text-sm text-[#1f1d18]">{email ?? ""}</p>
          </div>
        </div>
      </div>

      {impersonating && (
        <div className="border-b border-[#e0d6bf] bg-[#efe9d9]">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-3 text-sm text-[#6a5b3f]">
            <span>
              Viewing as {impersonating.email ?? impersonating.userId}.
            </span>
            <button
              type="button"
              onClick={handleClearImpersonation}
              className="rounded-full border border-[#b9b4a6] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6a5b3f]"
              disabled={clearing}
            >
              {clearing ? "Exiting..." : "Exit"}
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-4 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#1f2a1f] text-[#f6f5ef]"
                      : "text-[#4f4a40] hover:bg-[#f1eee6]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
