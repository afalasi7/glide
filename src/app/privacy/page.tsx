import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy policy · Glide",
  description: "How Glide handles information in the marketing site and demo.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Header />
      <article className="mx-auto max-w-2xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Legal</p>
        <h1 className="mt-3 text-[clamp(2.4rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.02em]">Privacy policy</h1>
        <p className="mt-4 text-sm text-ink-soft">Last updated 20 October 2026</p>
        <div className="mt-10 space-y-6 text-base font-light leading-relaxed text-ink">
          <p>
            Glide’s marketing site and app demo are built to show how a personal travel agent could work. We do not sell your personal data.
          </p>
          <p>
            Theme preference and the sample name you enter may be stored locally in your browser. The account form does not create an account.
            Its email and password are not sent to a server or saved. Chat messages stay in the current browser session.
          </p>
          <p>
            If you contact us, we use the details you share only to respond. Questions about this policy: reach out via the contact path on the main site.
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
