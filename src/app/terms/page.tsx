import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms of service · Glide",
  description: "Terms for the Glide prelaunch site and local travel-agent test.",
};

export default function TermsPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-cream text-ink">
      <Header />
      <div className="landing-orb pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-sun/15 blur-3xl" aria-hidden />
      <article className="relative mx-auto max-w-2xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Glide · Legal</p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.02em]">Terms of service</h1>
        <p className="mt-4 text-sm text-ink-soft">Last updated 22 October 2026</p>

        <div className="mt-10 space-y-9 text-base leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-2xl">The current service</h2>
            <p className="mt-3 text-ink-soft">
              Glide is in prelaunch. This site and app demo illustrate a personal travel agent; the local n8n workflow is for invited testing. No real account, travel reservation, purchase, payment, or WhatsApp booking service is created through the current demo. Displayed itineraries, prices, passes, and confirmations are examples, not live offers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Using the preview</h2>
            <p className="mt-3 text-ink-soft">
              Use the preview lawfully and avoid sending sensitive personal or payment details to the local test agent. Check travel requirements, availability, timing, prices, and reservations directly with the relevant provider before relying on them. Do not interfere with the site, its local test endpoint, or other testers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Approval for future transactions</h2>
            <p className="mt-3 text-ink-soft">
              When live provider connections are introduced, Glide will show the specific option, total price, fees, and applicable terms before each purchase or change to an existing booking. A general trip request or budget is not approval for a transaction. The current preview cannot carry out those transactions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Availability and changes</h2>
            <p className="mt-3 text-ink-soft">
              The prelaunch site and local test may change or be unavailable. We may revise these terms as the service develops and will post a new update date when we do. Before a public booking service launches, we will publish terms covering payments, cancellations, provider responsibilities, support, and the legal operator of Glide.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Questions</h2>
            <p className="mt-3 text-ink-soft">
              If you were invited to test Glide, contact the person who shared the preview with you. A direct service contact will be listed here before public testing.
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
