import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy policy · Glide",
  description: "How the Glide prelaunch site and local travel-agent test handle information.",
};

export default function PrivacyPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-cream text-ink">
      <Header />
      <div className="landing-orb pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-sun/15 blur-3xl" aria-hidden />
      <article className="relative mx-auto max-w-2xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Glide · Legal</p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.02em]">Privacy policy</h1>
        <p className="mt-4 text-sm text-ink-soft">Last updated 22 October 2026</p>

        <div className="mt-10 space-y-9 text-base leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-2xl">Where Glide stands today</h2>
            <p className="mt-3 text-ink-soft">
              This site introduces Glide and includes a local, illustrative app demo. A separate local n8n workflow lets the team test a travel conversation. Public WhatsApp service, live travel-provider connections, payments, and real accounts are not active yet. We will update this policy before those services launch.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Information used in the demo</h2>
            <p className="mt-3 text-ink-soft">
              The site stores your light or dark theme choice and, if you enter one in the demo, a display name in this browser&apos;s local storage. You can clear them through your browser settings. The demo account screen does not create an account or submit its email or password to Glide. The illustrated itinerary, reservations, and wallet passes are sample content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Local agent testing</h2>
            <p className="mt-3 text-ink-soft">
              If you are invited to test the local travel-agent workflow, the messages, session ID, and replies you send are processed by the local n8n instance and local language model to generate a response. n8n may retain workflow execution records, and the agent keeps short conversation context in its local memory. Do not send passport numbers, payment details, or other sensitive information during this prelaunch test.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Sharing and retention</h2>
            <p className="mt-3 text-ink-soft">
              The current local test has no connected booking, payment, or WhatsApp provider. We do not sell personal information. The browser values remain until you clear them; test conversation data is subject to the local n8n instance&apos;s configured retention and manual deletion. Retention periods and provider sharing for a public service will be stated here before launch.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Your choices and questions</h2>
            <p className="mt-3 text-ink-soft">
              You can avoid entering personal details in the demo and clear its browser storage at any time. If someone invited you to the local test, ask that person to review or remove your test conversation data. A dedicated privacy contact and request process will be published before public testing begins.
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link href="/" className="font-medium text-violet underline-offset-4 hover:underline">Back to Glide</Link>
        </p>
      </article>
    </main>
  );
}
