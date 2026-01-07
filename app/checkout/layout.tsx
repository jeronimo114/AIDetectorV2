import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Veridict",
  description: "Subscribe to Veridict and unlock full AI detection features.",
  robots: { index: false, follow: false }
};

export default function CheckoutLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
