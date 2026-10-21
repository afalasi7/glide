"use client";

import React from "react";
import Image from "next/image";
import { BotArt } from "@/components/GlideBot";
import { GlassButton, GlassPanel, GlassTag } from "@/components/ui/glass";
import { clock } from "@/components/story/data";
import {
  BUDGET_DEFAULTS,
  DESTINATION_OPTIONS,
  alternativesForStop,
  applyStopSwap,
  buildProposedTrip,
  defaultPrefs,
  formatAed,
  type BookedTrip,
  type BudgetBand,
  type ProposedTrip,
  type TripPrefs,
} from "@/lib/booking";

const btn = "w-full py-3.5 tracking-wide";

function Status({ time = "16:15" }: { time?: string }) {
  return <div className="pt-[max(env(safe-area-inset-top),12px)]" aria-hidden data-time={time} />;
}

function PhotoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="glide-glass-photo-label absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] whitespace-nowrap rounded-full bg-paper px-3 py-1.5 text-xs font-semibold leading-none text-ink shadow-[0_8px_18px_-12px_rgba(28,18,48,0.75)]">
      {children}
    </span>
  );
}

/** After onboarding: follow the sample day, or plan a new demo trip. */
export function ChooseTripScreen({
  onDemo,
  onPlan,
}: {
  onDemo?: () => void;
  onPlan?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Status time="9:44" />
      <div className="px-6 pt-3">
        <div className="h-14 w-14"><BotArt mood="happy" /></div>
        <h3 className="mt-3 text-[34px] leading-[0.95] tracking-[-0.02em]">
          What should we <em className="text-violet">open?</em>
        </h3>
        <p className="mt-2 text-[13px] font-light text-ink-soft">
          Follow the sample Dubai to Ras Al Khaimah day, or plan a new trip with demo prices.
        </p>
      </div>
      <div className="mt-6 space-y-3 px-6">
        <GlassPanel className="p-4">
          <p className="font-display text-xl italic">Sample day trip</p>
          <p className="mt-1 text-[12px] text-ink-soft">Dubai Marina → Jebel Jais → InterContinental → Levant &amp; Nar</p>
          <GlassButton onClick={onDemo} className={`${btn} mt-4`}>Open the sample trip</GlassButton>
        </GlassPanel>
        <GlassPanel className="p-4">
          <p className="font-display text-xl italic">Plan a new trip</p>
          <p className="mt-1 text-[12px] text-ink-soft">Where, when, who, and budget — then a single plan you can swap and book (demo).</p>
          <GlassButton variant="secondary" onClick={onPlan} className={`${btn} mt-4`}>Plan a new trip</GlassButton>
        </GlassPanel>
      </div>
      <p className="mt-auto px-6 pb-7 text-center text-[11px] text-ink-soft">Demo only. Nothing is charged.</p>
    </div>
  );
}

const ASK_STEPS = ["where", "when", "who", "budget"] as const;

/** Four questions, one at a time, each with a sensible default. */
export function AskPrefsScreen({
  prefs,
  index,
  onChange,
  onBack,
  onNext,
}: {
  prefs: TripPrefs;
  index: number;
  onChange: (prefs: TripPrefs) => void;
  onBack?: () => void;
  onNext?: () => void;
}) {
  const step = ASK_STEPS[Math.min(ASK_STEPS.length - 1, Math.max(0, index))]!;
  return (
    <div className="flex h-full flex-col">
      <Status time="9:45" />
      <div className="px-6 pt-3">
        <h3 className="text-[32px] leading-[0.95] tracking-[-0.02em]">
          {step === "where" && <>Where are we <em className="text-violet">going?</em></>}
          {step === "when" && <>How long is the <em className="text-violet">trip?</em></>}
          {step === "who" && <>Who&apos;s <em className="text-violet">coming?</em></>}
          {step === "budget" && <>What&apos;s the <em className="text-violet">pace?</em></>}
        </h3>
        <p className="mt-2 text-[12px] text-ink-soft">
          Question {index + 1} of {ASK_STEPS.length}
          {prefs.note ? ` · from “${prefs.note}”` : ""}
        </p>
      </div>
      <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto px-6" data-lenis-prevent>
        {step === "where" &&
          DESTINATION_OPTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={!d.available}
              onClick={() => d.available && onChange({ ...prefs, destinationId: d.id as TripPrefs["destinationId"] })}
              className={`glass-control flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${
                d.available && prefs.destinationId === d.id ? "ring-2 ring-violet" : ""
              } ${d.available ? "hover:bg-accent" : "opacity-40"}`}
            >
              <span>
                <span className="block text-[15px] font-semibold">{d.label}</span>
                <span className="block text-[11px] text-ink-soft">{d.blurb}</span>
              </span>
              {!d.available ? <GlassTag>Soon</GlassTag> : null}
            </button>
          ))}
        {step === "when" &&
          [
            { nights: 0, label: "Day trip", hint: "Out and back today" },
            { nights: 1, label: "One night", hint: "Arrive, dinner, morning" },
            { nights: 2, label: "Long weekend", hint: "Two nights · default" },
          ].map((opt) => (
            <button
              key={opt.nights}
              type="button"
              onClick={() => onChange({ ...prefs, nights: opt.nights })}
              className={`glass-control w-full rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-accent ${
                prefs.nights === opt.nights ? "ring-2 ring-violet" : ""
              }`}
            >
              <span className="block text-[15px] font-semibold">{opt.label}</span>
              <span className="block text-[11px] text-ink-soft">{opt.hint}</span>
            </button>
          ))}
        {step === "who" &&
          [1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...prefs, travellers: n })}
              className={`glass-control w-full rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold transition-colors hover:bg-accent ${
                prefs.travellers === n ? "ring-2 ring-violet" : ""
              }`}
            >
              {n} traveller{n > 1 ? "s" : ""}
            </button>
          ))}
        {step === "budget" &&
          (Object.keys(BUDGET_DEFAULTS) as BudgetBand[]).map((band) => (
            <button
              key={band}
              type="button"
              onClick={() => onChange({ ...prefs, budgetBand: band })}
              className={`glass-control w-full rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-accent ${
                prefs.budgetBand === band ? "ring-2 ring-violet" : ""
              }`}
            >
              <span className="block text-[15px] font-semibold">{BUDGET_DEFAULTS[band].label}</span>
              <span className="block text-[11px] text-ink-soft">
                Around {formatAed(BUDGET_DEFAULTS[band].hintAed)} · demo guide
              </span>
            </button>
          ))}
      </div>
      <div className="flex gap-2 px-6 pb-7 pt-3">
        {onBack ? (
          <GlassButton variant="ghost" onClick={onBack} className="min-h-11 px-4">
            Back
          </GlassButton>
        ) : null}
        <GlassButton onClick={onNext} className={`${btn} flex-1`}>
          {index >= ASK_STEPS.length - 1 ? "Show my plan" : "Continue"}
        </GlassButton>
      </div>
    </div>
  );
}

/** Single proposed itinerary in Trip-tab timeline style, with tap-to-swap. */
export function ProposeTripScreen({
  trip,
  onChange,
  onBack,
  onReview,
}: {
  trip: ProposedTrip;
  onChange: (trip: ProposedTrip) => void;
  onBack?: () => void;
  onReview?: () => void;
}) {
  const [swapId, setSwapId] = React.useState<string | null>(null);
  const alts = swapId ? alternativesForStop(trip, swapId) : [];
  const days = [...new Set(trip.stops.map((s) => s.day))].sort((a, b) => a - b);

  return (
    <div className="flex h-full flex-col">
      <Status time="10:12" />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">{trip.subtitle}</p>
        <h3 className="mt-1 text-[30px] leading-[0.95] tracking-[-0.02em]">
          {trip.title.split(" ").slice(0, -1).join(" ")}{" "}
          <em className="text-violet">{trip.title.split(" ").slice(-1)}.</em>
        </h3>
      </div>
      <div className="relative mx-5 mt-3 h-[88px] overflow-hidden rounded-[28px]">
        <Image
          src={trip.stops.find((s) => s.kind !== "transfer")?.photo ?? "/images/hd/jebel_jais_sunset.jpg"}
          alt=""
          fill
          sizes="720px"
          className="object-cover"
        />
        <PhotoLabel>{formatAed(trip.totalAed)} · demo total</PhotoLabel>
      </div>
      <div className="relative mx-5 mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl" data-lenis-prevent>
        <ol className="glass-panel space-y-0 rounded-xl px-4">
          {days.map((day) => (
            <li key={day} className="border-b border-ink/10 py-2 last:border-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">Day {day}</p>
              <ul>
                {trip.stops
                  .filter((s) => s.day === day)
                  .map((s, i) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={s.kind === "transfer"}
                        onClick={() => s.kind !== "transfer" && setSwapId(s.id)}
                        className="relative flex w-full items-center gap-3 py-2 text-left disabled:cursor-default"
                      >
                        <span className={`z-10 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-violet text-paper" : "bg-paper text-ink ring-2 ring-ink/20"}`}>
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="truncate font-display text-[15px] italic">{s.title}</p>
                          <p className="truncate text-[10.5px] text-ink-soft">
                            {s.place}
                            {s.kind !== "transfer" ? " · tap to swap" : ""}
                          </p>
                        </div>
                        <p className="num text-right text-lg leading-none">
                          {clock(s.startAt)}
                          <span className="mt-0.5 block text-[10px] text-ink-soft">{s.priceAed ? formatAed(s.priceAed) : "Included"}</span>
                        </p>
                      </button>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
      {swapId && alts.length > 0 ? (
        <GlassPanel className="mx-5 mb-2 max-h-[40%] overflow-y-auto p-3" data-lenis-prevent>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] font-semibold">Swap this stop</p>
            <button type="button" className="text-[12px] text-violet" onClick={() => setSwapId(null)}>
              Close
            </button>
          </div>
          <ul className="space-y-2">
            {alts.map((alt) => (
              <li key={alt.id}>
                <button
                  type="button"
                  className="glass-control flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-accent"
                  onClick={() => {
                    onChange(applyStopSwap(trip, swapId, alt.id));
                    setSwapId(null);
                  }}
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image src={alt.photo} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{alt.title}</span>
                    <span className="block text-[11px] text-ink-soft">{alt.blurb}</span>
                  </span>
                  <span className="num text-[12px]">{formatAed(alt.priceAed)}</span>
                </button>
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}
      <div className="flex gap-2 px-5 pb-5 pt-2">
        {onBack ? (
          <GlassButton variant="ghost" onClick={onBack} className="min-h-11 px-4">
            Back
          </GlassButton>
        ) : null}
        <GlassButton onClick={onReview} className={`${btn} flex-1`}>
          Review &amp; book
        </GlassButton>
      </div>
    </div>
  );
}

/** Review every line item, then book / pay via Stripe Checkout or demo fallback. */
export function ReviewBookScreen({
  trip,
  busy,
  testModeNote,
  onBack,
  onBook,
  onPay,
}: {
  trip: ProposedTrip;
  busy?: boolean;
  testModeNote?: string | null;
  onBack?: () => void;
  onBook?: () => void;
  onPay?: () => void;
}) {
  const [committed, setCommitted] = React.useState(false);
  return (
    <div className="flex h-full flex-col">
      <Status time="10:18" />
      <div className="px-5 pt-2">
        <h3 className="text-[32px] leading-[0.95] tracking-[-0.02em]">
          Review, then <em className="text-violet">book.</em>
        </h3>
        <p className="mt-2 text-[13px] font-light text-ink-soft">
          Demo prices in AED. Nothing books until you confirm. Card details stay with Stripe.
        </p>
      </div>
      <ul className="glass-panel mx-5 mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl px-3" data-lenis-prevent>
        {trip.stops.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 border-b border-ink/10 py-2.5 last:border-0">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{s.title}</p>
              <p className="truncate text-[10.5px] text-ink-soft">
                Day {s.day} · {s.startAt}
              </p>
            </div>
            <p className="num shrink-0 text-[13px]">{s.priceAed ? formatAed(s.priceAed) : "—"}</p>
          </li>
        ))}
        <li className="flex items-center justify-between py-3">
          <p className="text-[14px] font-semibold">Demo total</p>
          <p className="num text-xl text-violet">{formatAed(trip.totalAed)}</p>
        </li>
      </ul>
      <div className="space-y-2 px-5 pb-5 pt-3">
        {testModeNote ? <p className="text-center text-[11px] font-medium text-violet">{testModeNote}</p> : null}
        {!committed ? (
          <GlassButton
            onClick={() => {
              setCommitted(true);
              onBook?.();
            }}
            disabled={busy}
            className={btn}
          >
            Book this trip
          </GlassButton>
        ) : (
          <GlassButton onClick={onPay} disabled={busy} className={btn}>
            {busy ? "Opening checkout…" : "Pay securely"}
          </GlassButton>
        )}
        <p className="text-center text-[11px] leading-snug text-ink-soft">
          Your card is encrypted and handled by Stripe. Glide never sees or stores it.
        </p>
        {onBack ? (
          <GlassButton variant="ghost" onClick={onBack} className="w-full min-h-11">
            Back to plan
          </GlassButton>
        ) : null}
      </div>
    </div>
  );
}

/** Confirmation tickets after a successful book (or demo fallback). */
export function BookingConfirmScreen({
  booked,
  onEnter,
}: {
  booked: BookedTrip;
  onEnter?: () => void;
}) {
  const items = booked.stops.filter((s) => s.kind !== "transfer");
  return (
    <div className="flex h-full flex-col">
      <Status time="10:22" />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">
          {booked.checkoutMode === "stripe" ? "Paid · test mode" : "Booked · demo"}
        </p>
        <h3 className="mt-1 text-[32px] leading-[0.95] tracking-[-0.02em]">
          You&apos;re <em className="text-violet">set.</em>
        </h3>
        <p className="mt-2 text-[13px] font-light text-ink-soft">
          Confirmations came back one by one. Wallet passes are ready in Plan.
        </p>
      </div>
      <ul className="mx-5 mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto" data-lenis-prevent>
        {items.map((s) => (
          <li key={s.id}>
            <GlassPanel className="flex items-center gap-3 p-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <Image src={s.photo} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[16px] italic">{s.title}</p>
                <p className="num text-[12px] text-ink-soft">{booked.confirmationCodes[s.id]}</p>
              </div>
              <GlassTag className="text-[10px]">Confirmed</GlassTag>
            </GlassPanel>
          </li>
        ))}
      </ul>
      <div className="px-5 pb-5 pt-3">
        <GlassButton onClick={onEnter} className={btn}>
          Open my trip
        </GlassButton>
      </div>
    </div>
  );
}

/** Trip tab for a booked (demo) itinerary. */
export function BookedRouteScreen({ booked }: { booked: BookedTrip }) {
  const days = [...new Set(booked.stops.map((s) => s.day))].sort((a, b) => a - b);
  return (
    <div className="flex h-full flex-col">
      <Status time="16:15" />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">
          Booked · demo · {booked.checkoutMode === "stripe" ? "Stripe test" : "local confirm"}
        </p>
        <h3 className="mt-1 text-[32px] leading-[0.95] tracking-[-0.02em]">
          Your <em className="text-violet">itinerary.</em>
        </h3>
      </div>
      <div className="relative mx-5 mt-3 h-[96px] overflow-hidden rounded-[28px]">
        <Image src={booked.stops.find((s) => s.kind !== "transfer")?.photo ?? "/images/hd/jebel_jais_sunset.jpg"} alt="" fill sizes="720px" className="object-cover" />
        <PhotoLabel>{booked.title}</PhotoLabel>
      </div>
      <ol className="glass-panel relative mx-5 mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl px-4" data-lenis-prevent>
        {days.flatMap((day) =>
          booked.stops
            .filter((s) => s.day === day)
            .map((s, i) => (
              <li key={s.id} className="relative flex items-center gap-3 py-2">
                <span className={`z-10 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${i === 0 && day === 1 ? "bg-violet text-paper" : "bg-paper text-ink ring-2 ring-ink/20"}`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate font-display text-[15px] italic">{s.title}</p>
                  <p className="truncate text-[10.5px] text-ink-soft">
                    Day {day} · {booked.confirmationCodes[s.id] ?? s.place}
                  </p>
                </div>
                <p className="num text-right text-lg leading-none">{clock(s.startAt)}</p>
              </li>
            )),
        )}
      </ol>
      <p className="px-5 pb-5 pt-3 text-center text-[11px] text-ink-soft">Demo booking · {formatAed(booked.totalAed)} · nothing charged</p>
    </div>
  );
}

/** Plan tab showing wallet-style passes for a booked trip. */
export function BookedPlanScreen({ booked }: { booked: BookedTrip }) {
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">Your trip · booked</p>
        <h3 className="mt-1 text-[34px] leading-[0.95] tracking-[-0.02em]">
          Passes, <em className="text-violet">in sync.</em>
        </h3>
      </div>
      <ul className="mx-5 mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto" data-lenis-prevent>
        {booked.walletPasses.map((pass) => (
          <li key={pass.id}>
            <GlassPanel className="p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">Wallet pass · demo</p>
              <p className="mt-1 font-display text-xl italic">{pass.title}</p>
              <p className="num mt-1 text-2xl">{pass.detail}</p>
            </GlassPanel>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-2 px-5 pb-5">
        <div className="h-8 w-8"><BotArt mood="happy" small /></div>
        <p className="text-[11px] leading-tight text-ink-soft">Demo passes only. Add-to-wallet is not connected.</p>
      </div>
    </div>
  );
}

export { defaultPrefs, buildProposedTrip };
