"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ClarityAnalytics from "@/components/ClarityAnalytics";
import GoogleAnalytics from "@/components/GoogleAnalytics";

type ConsentState = "unknown" | "unset" | "essential" | "all";

const CONSENT_KEY = "veridict-cookie-consent";

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("unknown");

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);

    if (stored === "all" || stored === "essential") {
      setConsent(stored);
    } else {
      setConsent("unset");
    }
  }, []);

  const handleAccept = () => {
    window.localStorage.setItem(CONSENT_KEY, "all");
    setConsent("all");
  };

  const handleReject = () => {
    window.localStorage.setItem(CONSENT_KEY, "essential");
    setConsent("essential");
  };

  const shouldShowBanner = consent === "unset";
  const allowAnalytics = consent === "all";

  return (
    <>
      {allowAnalytics && (
        <>
          <GoogleAnalytics />
          <ClarityAnalytics />
        </>
      )}

      {shouldShowBanner && (
        <div
          className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-200/50 backdrop-blur-sm sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] animate-slide-up"
          role="dialog"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-orange-500">
                <path d="M12 15v2m0-8v4m0 8c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Cookie Preferences</p>
              <p className="mt-1 text-sm text-gray-500">We use cookies for authentication and basic functionality.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md hover:-translate-y-0.5"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              Essential Only
            </button>
          </div>
          <Link
            href="/privacy-policy"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-orange-500"
          >
            Privacy Policy
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}
