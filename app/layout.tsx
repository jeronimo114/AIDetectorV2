import "./globals.css";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "AI Detector",
  description: "Paste text to estimate likelihood of AI generation."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
