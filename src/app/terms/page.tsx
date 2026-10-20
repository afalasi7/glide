import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms and conditions · Glide",
  description: "Terms and conditions for using Glide.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Header />
      <article className="mx-auto max-w-2xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Legal</p>
        <h1 className="mt-3 text-[clamp(2.4rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.02em]">Terms and conditions</h1>
        <p className="mt-4 text-sm text-ink-soft">Last updated 20 October 2026</p>
        <div className="mt-10 space-y-6 text-base font-light leading-relaxed text-ink">
          <p>
            Glide is a personal travel-agent demo. By using the site or the interactive demo, you agree to use it for personal evaluation only.
            Trip plans, reservations and wallet passes shown here are illustrative and do not create real bookings.
          </p>
          <p>
            You may not reverse engineer, scrape, or misuse the service in a way that harms Glide, its hosts, or other users.
            We may update these terms; continued use after a change means you accept the revised terms.
          </p>
          <p>
            The demo is provided as-is, without warranties of any kind. To the fullest extent permitted by law, Glide is not liable for decisions
            you make based on demo content.
          </p>
        </div>
        <p className="mt-12">
          <Link href="/" className="font-medium text-violet underline-offset-4 hover:underline">
            Back to Glide
          </Link>
        </p>
      </article>
    </main>
  );
}
