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
          className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-gray-200 bg-white/95 p-4 text-xs text-gray-700 shadow-lg backdrop-blur sm:left-auto sm:right-4 sm:w-[340px]"
          role="dialog"
          aria-live="polite"
        >
          <p>We use cookies for authentication and basic functionality.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-full bg-gray-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-gray-800"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="rounded-full border border-gray-300 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              Reject non-essential
            </button>
            <Link
              href="/privacy-policy"
              className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 transition hover:text-gray-700"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
