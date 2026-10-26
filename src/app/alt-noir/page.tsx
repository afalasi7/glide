import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { NoirLanding } from "@/components/alt/NoirLanding";

export const metadata: Metadata = {
  title: "Glide — noir variant",
  description:
    "Alternative landing page: Glide as a dark, cinematic page — a delay absorbed, a trip held together.",
};

export default function NoirPage() {
  return (
    <>
      <Header />
      <NoirLanding />
    </>
  );
}
