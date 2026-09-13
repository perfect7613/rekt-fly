import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "REKT FLY — A small brain. A volatile world.",
  description:
    "An interactive 3D DeFi survival experiment with a real FlyWire escape circuit and NeuroMechFly anatomical model.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
