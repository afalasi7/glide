import type { Metadata, Viewport } from "next";
import { GlideApp } from "@/components/screens/GlideApp";

export const metadata: Metadata = { title: "Glide app" };
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF3DF" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function AppPage() {
  return <GlideApp />;
}
