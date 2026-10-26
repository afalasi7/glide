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
        <p className="mt-4 text-sm text-ink-soft">Last updated 25 October 2026</p>

        <div className="mt-10 space-y-9 text-base leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-2xl">What this policy covers</h2>
            <p className="mt-3 text-ink-soft">
              This policy covers the Glide website, its illustrative app demo, and an invitation-only local travel-agent test. It does not describe a live booking service. Public WhatsApp messaging, travel-provider accounts, payments, and real Glide accounts are not active in this preview. We will revise this policy before those services collect personal data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">What information is used</h2>
            <p className="mt-3 text-ink-soft">
              The site stores your light or dark theme choice in your browser. If you enter a name in the demo, it also stores that name in this browser. These values help the preview remember your choices. The demo account screen does not create an account or send its email or password to Glide. Itineraries, reservations, prices, and passes shown on the site are sample content. As with most websites, the hosting server may process basic request data such as IP address, browser type, requested page, and time to deliver and protect the site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Invitation-only agent testing</h2>
            <p className="mt-3 text-ink-soft">
              If you are invited to test the local workflow, your messages and session ID are processed by a local n8n instance and language model so the agent can reply and remember recent context. n8n may retain execution records. Do not send passport details, payment information, health information, or other sensitive data to this test. The workflow cannot make a booking or charge you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Sharing, storage, and retention</h2>
            <p className="mt-3 text-ink-soft">
              The local test is not connected to booking, payment, or WhatsApp providers. Glide does not sell personal information collected through this preview. Browser values remain until you clear them. Local test messages and execution records remain according to the n8n instance&apos;s settings or until an operator removes them. A fixed retention period has not been set for this private test; one must be set and published before public testing. Website hosting may process routine request data to serve and protect the site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Security and your choices</h2>
            <p className="mt-3 text-ink-soft">
              The local workflow is intended for controlled testing, but no online service can promise absolute security. You can use the website without entering personal details, and you can clear the demo&apos;s browser storage at any time. If someone invited you to the local test, ask that person to review or remove your conversation data. Depending on where you live, you may also have rights to access, correct, or delete personal data, or object to its use.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Children and policy changes</h2>
            <p className="mt-3 text-ink-soft">
              This preview is not designed to collect information from children. If you believe a child shared personal information in the local test, tell the person who invited them so it can be reviewed and removed. We will update this page before introducing public accounts, WhatsApp messaging, travel providers, or payments, and show the new date above.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Contact</h2>
            <p className="mt-3 text-ink-soft">
              For this invitation-only test, contact the person who shared access with you. Glide will publish a direct privacy contact before public testing begins.
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
