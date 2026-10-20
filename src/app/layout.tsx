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
  title: "Glide — Your personal travel agent",
  description:
    "Glide brings your itinerary together and helps your travel plans adapt when the day changes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Capacitor owns the safe-area style attributes it injects before hydration.
      suppressHydrationWarning
      className={`${bodoni.variable} ${jost.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-cream text-ink font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=localStorage.getItem("glide-theme")==="dark";document.documentElement.classList.toggle("glide-theme-dark",d);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}`,
          }}
        />
        <LenisProvider>{children}</LenisProvider>
        <AgentCompanion />
      </body>
    </html>
  );
}
