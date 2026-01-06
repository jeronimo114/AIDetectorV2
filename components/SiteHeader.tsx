"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import LoadingLink from "@/components/LoadingLink";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) {
        return;
      }
      if (error) {
        setUser(null);
      } else {
        setUser(data.user ?? null);
      }
      setIsReady(true);
    };

    void refreshUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      if (!isMounted) {
        return;
      }
      void refreshUser();
    });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshUser();
      }
    };

    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const linkBase =
    "text-xs uppercase tracking-[0.3em] transition hover:text-[#1f1f1c]";
  const active = "text-[#1f1f1c]";
  const inactive = "text-[#7a7670]";
  const plan =
    typeof user?.user_metadata?.plan === "string"
      ? user.user_metadata.plan.toLowerCase()
      : "free";
  const normalizedPlan = plan === "starter" || plan === "pro" ? plan : "free";
  const planLabel =
    normalizedPlan === "pro"
      ? "Pro member"
      : normalizedPlan === "starter"
        ? "Starter member"
        : "Free plan";
  const planStyles =
    normalizedPlan === "pro"
      ? "border-[#b8c7d4] bg-[#e6ecf1] text-[#1f2a36]"
      : normalizedPlan === "starter"
        ? "border-[#c9d5de] bg-[#edf2f5] text-[#2f3e4e]"
        : "border-[#d8d6cf] bg-[#f3f3ef] text-[#4c4b45]";
  const detectorActive = pathname === "/";
  const detectorLabel = detectorActive ? "Detector" : "Back to detector";
  const detectorClassName = detectorActive
    ? "inline-flex items-center justify-center rounded-full border border-[#c9d5de] bg-[#edf2f5] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f3e4e] shadow-[inset_0_0_0_1px_rgba(47,62,78,0.06)]"
    : "inline-flex items-center justify-center rounded-full border border-[#2f3e4e] bg-[#2f3e4e] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f7f7f4] shadow-[0_8px_24px_rgba(31,42,54,0.18)] transition hover:bg-[#27323f]";
  const detectorIcon = detectorActive ? (
    <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
  ) : (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M12.5 4.5 7 10l5.5 5.5" />
      <path d="M7.5 10h9" />
    </svg>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-[#d8d6cf]/80 bg-[#f7f7f4]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.35em] text-[#1f1f1c]"
        >
          Veridict
        </Link>
        <nav className="flex items-center gap-6">
          <LoadingLink
            href="/"
            className={detectorClassName}
            aria-label="Go back to the detector"
            aria-current={detectorActive ? "page" : undefined}
            leadingIcon={detectorIcon}
          >
            {detectorLabel}
          </LoadingLink>
          {isReady && user && (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${planStyles}`}
              title={`Current plan: ${planLabel}.`}
            >
              {planLabel}
            </span>
          )}
          <Link
            href="/pricing"
            className={`${linkBase} ${pathname === "/pricing" ? active : inactive}`}
          >
            Pricing
          </Link>
          {isReady && user ? (
            <>
              <Link
                href="/dashboard"
                className={`${linkBase} ${
                  pathname === "/dashboard" ? active : inactive
                }`}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={`${linkBase} ${inactive} inline-flex items-center gap-2 disabled:opacity-60`}
                disabled={isLoggingOut}
                aria-busy={isLoggingOut}
              >
                <span
                  className={`h-3 w-3 rounded-full border-2 border-current border-t-transparent transition-opacity ${
                    isLoggingOut ? "animate-spin opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`${linkBase} ${pathname === "/login" ? active : inactive}`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${linkBase} ${pathname === "/signup" ? active : inactive}`}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
