import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Geist_Mono,
  Playfair_Display,
  Cormorant_Garamond,
  Cinzel,
} from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-luxury",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Glide",
  description: "Road trip peace of mind across the UAE. Your trip, handled.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} ${playfair.variable} ${cormorant.variable} ${cinzel.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground selection:bg-accent/30 font-sans">
        {children}
      </body>
    </html>
  );
}
