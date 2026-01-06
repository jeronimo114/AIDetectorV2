import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

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

export const metadata: Metadata = {
  title: "Veridict",
  description: "Understand AI detection signals and avoid surprises when it matters."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
