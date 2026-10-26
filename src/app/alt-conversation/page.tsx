import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ConversationLanding } from "@/components/alt/ConversationLanding";

export const metadata: Metadata = {
  title: "Glide — chat variant",
  description: "Alternative landing page: Glide as a live WhatsApp conversation, message to itinerary to approval.",
};

export default function ConversationPage() {
  return (
    <>
      <Header />
      <ConversationLanding />
    </>
  );
}
