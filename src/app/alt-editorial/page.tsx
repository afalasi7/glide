import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { EditorialLanding } from "@/components/alt/EditorialLanding";

export const metadata: Metadata = {
  title: "Glide — editorial variant",
  description: "Alternative landing page: Glide as an editorial travel story, from a 75-minute delay to a re-plan.",
};

export default function EditorialPage() {
  return (
    <>
      <Header />
      <EditorialLanding />
    </>
  );
}
