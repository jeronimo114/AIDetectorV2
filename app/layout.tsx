import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import JsonLd, { organizationSchema, softwareApplicationSchema } from "@/components/JsonLd";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"]
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500"]
});

const siteUrl = "https://veridict.com";

export const metadata: Metadata = {
  title: {
    default: "Veridict | AI Writing Detector for Students",
    template: "%s | Veridict"
  },
  description:
    "Check if your essay looks AI-generated before submitting. Get actionable signals to reduce false positives on Turnitin and other detectors.",
  keywords: [
    "AI writing detector",
    "AI detector for students",
    "AI-generated text checker",
    "Turnitin AI detection",
    "GPTZero alternative",
    "AI plagiarism checker",
    "essay AI check"
  ],
  authors: [{ name: "Veridict" }],
  creator: "Veridict",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Veridict",
    title: "Veridict | AI Writing Detector for Students",
    description:
      "Check if your essay looks AI-generated before submitting. Get actionable signals to reduce false positives.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veridict - AI Writing Detector for Students"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Veridict | AI Writing Detector for Students",
    description:
      "Check if your essay looks AI-generated before submitting. Get actionable signals to reduce false positives.",
    images: ["/og-image.png"]
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
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={softwareApplicationSchema} />
      </head>
      <body className="font-sans">
        <GoogleAnalytics />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
