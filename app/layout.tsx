import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import JsonLd, { organizationSchema, softwareApplicationSchema } from "@/components/JsonLd";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"]
});

const siteUrl = "https://veridict.xyz";

export const metadata: Metadata = {
  title: {
    default: "Veridict | Korean Skincare Brand Showcase",
    template: "%s | Veridict"
  },
  description:
    "A clean Korean skincare-inspired showcase for Veridict, built around soft aqua-green color, premium product presentation, and calm brand storytelling.",
  keywords: [
    "Veridict",
    "Korean skincare brand",
    "skincare showcase",
    "K-beauty branding",
    "aqua green skincare",
    "brand presentation"
  ],
  authors: [{ name: "Veridict" }],
  creator: "Veridict",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Veridict",
    title: "Veridict | Korean Skincare Brand Showcase",
    description:
      "A clean Korean skincare-inspired showcase with soft aqua-green color and premium product presentation."
  },
  twitter: {
    card: "summary_large_image",
    title: "Veridict | Korean Skincare Brand Showcase",
    description:
      "A clean Korean skincare-inspired showcase with soft aqua-green color and premium product presentation."
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: ["/favicon.ico"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={softwareApplicationSchema} />
      </head>
      <body className="font-sans bg-white text-gray-900">
        <SiteHeader />
        {children}
        <SiteFooter />
        <CookieConsent />
      </body>
    </html>
  );
}
