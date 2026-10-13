import type { Metadata } from "next";
import { Bodoni_Moda, Jost, Geist_Mono } from "next/font/google";
import { LenisProvider } from "@/components/LenisProvider";
import { AgentCompanion } from "@/components/AgentCompanion";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glide — Your trip, handled.",
  description:
    "When a road trip runs late, Glide's agents move the mountain, save the dinner table and tell the hotel before you notice. Zero phone calls.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${jost.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-cream text-ink font-sans">
        <LenisProvider>{children}</LenisProvider>
        <AgentCompanion />
      </body>
    </html>
  );
}
