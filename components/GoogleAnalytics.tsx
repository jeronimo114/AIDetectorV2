"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-RPKNR2XQGW";

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
    window.gtag?.("event", action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
