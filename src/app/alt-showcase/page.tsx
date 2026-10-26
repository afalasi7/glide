import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ShowcaseLanding } from "@/components/alt/ShowcaseLanding";

export const metadata: Metadata = {
  title: "Glide — showcase variant",
  description:
    "Alternative landing page: Glide as a centred, photo-led product showcase — how it works, the +75 scenario, and what is live today.",
};

export default function ShowcasePage() {
  return (
    <>
      <Header />
      <ShowcaseLanding />
    </>
  );
}
