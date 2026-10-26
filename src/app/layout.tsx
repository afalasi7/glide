import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { LenisProvider } from "@/components/LenisProvider";
import { AgentCompanion } from "@/components/AgentCompanion";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${inter.variable} ${geistMono.variable} antialiased`}
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
