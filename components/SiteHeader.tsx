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

  const plan =
    typeof user?.user_metadata?.plan === "string"
      ? user.user_metadata.plan.toLowerCase()
      : "free";
  const normalizedPlan = plan === "starter" || plan === "pro" ? plan : "free";
  const planLabel =
    normalizedPlan === "pro"
      ? "Pro"
      : normalizedPlan === "starter"
        ? "Starter"
        : "Free";
  const planStyles =
    normalizedPlan === "pro"
      ? "bg-orange-50 text-orange-600 border-orange-200"
      : normalizedPlan === "starter"
        ? "bg-blue-50 text-blue-600 border-blue-200"
        : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Veridict</span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/detector"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              pathname === "/detector"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Detector
          </Link>
          <Link
            href="/pricing"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              pathname === "/pricing"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              pathname?.startsWith("/blog")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Blog
          </Link>
          {isReady && user && (
            <Link
              href="/dashboard"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Plan badge - only for logged in users */}
          {isReady && user && (
            <span
              className={`hidden sm:inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${planStyles}`}
              title={`Current plan: ${planLabel}`}
            >
              {planLabel}
            </span>
          )}

          {/* Auth section */}
          {isReady && user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60"
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
            >
              {isLoggingOut && (
                <span
                  className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"
                  aria-hidden="true"
                />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                Login
              </Link>
              <LoadingLink
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
              >
                Get Started
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path
                    d="M6 12l4-4-4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </LoadingLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
