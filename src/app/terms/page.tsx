import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms and conditions · Glide",
  description: "Conditions for the Glide prelaunch site and local travel-agent test.",
};

export default function TermsPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-cream text-ink">
      <Header />
      <div className="landing-orb pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-sun/15 blur-3xl" aria-hidden />
      <article className="relative mx-auto max-w-2xl px-5 pb-24 pt-32 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet">Glide · Legal</p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.02em]">Terms and conditions</h1>
        <p className="mt-4 text-sm text-ink-soft">Last updated 25 October 2026</p>

        <div className="mt-10 space-y-9 text-base leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-2xl">The current service</h2>
            <p className="mt-3 text-ink-soft">
              These conditions cover the Glide website, illustrative app demo, and invitation-only local agent test. The current preview does not create a real account, travel reservation, purchase, payment, or WhatsApp booking. Displayed itineraries, prices, passes, and confirmations are examples, not live offers or proof of a reservation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Using the preview safely</h2>
            <p className="mt-3 text-ink-soft">
              Use the preview lawfully. Do not send passport, payment, or other sensitive information to the local agent. Do not attempt to disrupt the site, access another tester&apos;s session, automate abusive traffic, or misrepresent the demo as a confirmed booking. If you plan real travel, verify availability, prices, schedules, entry requirements, and reservations directly with the provider.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Purchases and booking changes</h2>
            <p className="mt-3 text-ink-soft">
              The preview cannot purchase travel or change a reservation. When live provider connections are introduced, each purchase or change will need your approval of the exact option, total price, fees, and applicable terms before action. A trip request, stated budget, or earlier approval does not authorize another transaction. Provider rules and cancellation terms will be shown with the relevant option.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Sample content and availability</h2>
            <p className="mt-3 text-ink-soft">
              Demo routes, timings, images, and passes explain the product and may differ from real travel options. Do not rely on them for a trip. The site or local test may change, pause, or be withdrawn during development. You may stop using the preview at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Content and feedback</h2>
            <p className="mt-3 text-ink-soft">
              Glide&apos;s name, artwork, copy, and interface are part of this project. You may view the site for personal evaluation; do not present its sample passes or screens as genuine travel documents. If you give feedback, the team may use it to improve the product without publishing your private test messages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Updates before public launch</h2>
            <p className="mt-3 text-ink-soft">
              We will revise these conditions before offering public accounts, live bookings, or payments. That version will identify the legal operator and direct contact, and explain payment, cancellation, provider, support, and dispute terms. Changes to this page will appear with a new date above.
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
