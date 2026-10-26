import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { BentoLanding } from "@/components/alt/BentoLanding";

export const metadata: Metadata = {
  title: "Glide — bento variant",
  description:
    "Alternative landing page: Glide as a bento product page — capabilities, example requests and questions.",
};

export default function BentoPage() {
  return (
    <>
      <Header />
      <BentoLanding />
    </>
  );
}
