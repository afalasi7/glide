"use client";

import React from "react";
import Image from "next/image";
import { BotArt } from "@/components/GlideBot";
import { GlassButton, GlassPanel } from "@/components/ui/glass";
import {
  BUDGET_CHIPS,
  DESTINATION_CHIPS,
  applySwapStub,
  formatAed,
} from "@/lib/booking-stub";
import type { BookingResult, ProposedTrip, TripRequest } from "@/lib/booking-types";

export {
  defaultTripRequest,
  proposeTripStub,
  startCheckoutStub,
  parseTripIntentStub,
  formatAed,
  guestCount,
} from "@/lib/booking-stub";
export type { TripRequest, ProposedTrip, BookingResult } from "@/lib/booking-types";

const btn = "w-full py-3.5 tracking-wide";

function Status() {
  return <div className="pt-[max(env(safe-area-inset-top),12px)]" aria-hidden />;
}

function PhotoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="glide-glass-photo-label absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] whitespace-nowrap rounded-full bg-paper px-3 py-1.5 text-xs font-semibold leading-none text-ink shadow-[0_8px_18px_-12px_rgba(28,18,48,0.75)]">
      {children}
    </span>
  );
}

export function ChooseTripScreen({
  onDemo,
  onPlan,
}: {
  onDemo?: () => void;
  onPlan?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-6 pt-3">
        <div className="h-14 w-14"><BotArt mood="happy" /></div>
        <h3 className="mt-3 text-[34px] leading-[0.95] tracking-[-0.02em]">
          What should we <em className="text-violet">open?</em>
        </h3>
        <p className="mt-2 text-[13px] font-light text-ink-soft">
          Follow the sample day, or plan a new weekend with demo prices.
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
          <p className="mt-1 text-[12px] text-ink-soft">Where, when, who, and budget — then one plan you can swap and book.</p>
          <GlassButton variant="secondary" onClick={onPlan} className={`${btn} mt-4`}>Plan a new trip</GlassButton>
        </GlassPanel>
      </div>
    </div>
  );
}

const ASK = ["where", "when", "who", "budget"] as const;

function formatRange(from: string, to: string): string {
  try {
    const a = new Date(`${from}T12:00:00`);
    const b = new Date(`${to}T12:00:00`);
    const opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return `${a.toLocaleDateString("en-GB", opts)} → ${b.toLocaleDateString("en-GB", opts)}`;
  } catch {
    return `${from} → ${to}`;
  }
}

/** Four questions with the Designer&apos;s exact prompts and defaults. */
export function AskPrefsScreen({
  request,
  index,
  onChange,
  onBack,
  onNext,
}: {
  request: TripRequest;
  index: number;
  onChange: (request: TripRequest) => void;
  onBack?: () => void;
  onNext?: () => void;
}) {
  const step = ASK[Math.min(ASK.length - 1, Math.max(0, index))]!;
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-6 pt-3">
        <h3 className="text-[32px] leading-[0.95] tracking-[-0.02em]">
          {step === "where" && <>Where <em className="text-violet">to?</em></>}
          {step === "when" && <>When?</>}
          {step === "who" && <>Who&apos;s <em className="text-violet">coming?</em></>}
          {step === "budget" && <>Rough <em className="text-violet">budget?</em></>}
        </h3>
      </div>
      <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto px-6" data-lenis-prevent>
        {step === "where" &&
          DESTINATION_CHIPS.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => onChange({ ...request, where: place })}
              className={`glass-control w-full rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold transition-colors hover:bg-accent ${
                request.where === place ? "ring-2 ring-violet" : ""
              }`}
            >
              {place}
            </button>
          ))}
        {step === "when" && (
          <GlassPanel className="p-4">
            <p className="text-[15px] font-semibold">{formatRange(request.from, request.to)}</p>
            <p className="mt-1 text-[12px] text-ink-soft">Default: next Thursday to Saturday</p>
          </GlassPanel>
        )}
        {step === "who" && (
          <>
            <GlassPanel className="flex items-center justify-between p-4">
              <span className="text-[15px] font-semibold">Adults</span>
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="secondary"
                  className="min-h-11 min-w-11 px-0"
                  aria-label="Fewer adults"
                  onClick={() => onChange({ ...request, adults: Math.max(1, request.adults - 1) })}
                >
                  −
                </GlassButton>
                <span className="num w-8 text-center text-xl">{request.adults}</span>
                <GlassButton
                  variant="secondary"
                  className="min-h-11 min-w-11 px-0"
                  aria-label="More adults"
                  onClick={() => onChange({ ...request, adults: Math.min(8, request.adults + 1) })}
                >
                  +
                </GlassButton>
              </div>
            </GlassPanel>
            <GlassPanel className="flex items-center justify-between p-4">
              <span className="text-[15px] font-semibold">Kids</span>
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="secondary"
                  className="min-h-11 min-w-11 px-0"
                  aria-label="Fewer kids"
                  onClick={() => onChange({ ...request, kids: Math.max(0, request.kids - 1) })}
                >
                  −
                </GlassButton>
                <span className="num w-8 text-center text-xl">{request.kids}</span>
                <GlassButton
                  variant="secondary"
                  className="min-h-11 min-w-11 px-0"
                  aria-label="Add kids"
                  onClick={() => onChange({ ...request, kids: Math.min(6, request.kids + 1) })}
                >
                  +
                </GlassButton>
              </div>
            </GlassPanel>
            <p className="text-[12px] text-ink-soft">Default 2 adults. You can add kids.</p>
          </>
        )}
        {step === "budget" &&
          BUDGET_CHIPS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onChange({ ...request, budgetAed: amount })}
              className={`glass-control w-full rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold transition-colors hover:bg-accent ${
                request.budgetAed === amount ? "ring-2 ring-violet" : ""
              }`}
            >
              {formatAed(amount)}
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
          {index >= ASK.length - 1 ? "Show my plan" : "Continue"}
        </GlassButton>
      </div>
    </div>
  );
}

export function ProposeTripScreen({
  trip,
  guests,
  onChange,
  onBack,
  onReview,
}: {
  trip: ProposedTrip;
  guests: number;
  onChange: (trip: ProposedTrip) => void;
  onBack?: () => void;
  onReview?: () => void;
}) {
  const [swapId, setSwapId] = React.useState<string | null>(null);
  const [swapNote, setSwapNote] = React.useState<string | null>(null);
  const [conflict, setConflict] = React.useState<{ message: string; next: ProposedTrip } | null>(null);
  const active = trip.items.find((i) => i.id === swapId);

  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="text-[28px] leading-[1.05] tracking-[-0.02em]">{trip.summary}</h3>
      </div>
      <div className="relative mx-5 mt-3 h-[88px] overflow-hidden rounded-[28px]">
        <Image
          src={trip.items.find((s) => s.kind !== "transfer")?.photo ?? "/images/hd/jebel_jais_sunset.jpg"}
          alt=""
          fill
          sizes="720px"
          className="object-cover"
        />
        <PhotoLabel>
          Total {formatAed(trip.totalAed)} for {guests}.
        </PhotoLabel>
      </div>
      <div className="relative mx-5 mt-3 min-h-0 flex-1 overflow-y-auto" data-lenis-prevent>
        <ol className="glass-panel space-y-0 rounded-xl px-3 py-1">
          {trip.days.map((day) => (
            <li key={day.day} className="border-b border-ink/10 py-2 last:border-0">
              <p className="px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
                Day {day.day} · {day.label}
              </p>
              <ul>
                {day.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[15px] italic">{item.title}</p>
                      <p className="truncate text-[10.5px] text-ink-soft">
                        {item.time}
                        {item.priceAed ? ` · ${formatAed(item.priceAed)}` : ""}
                      </p>
                    </div>
                    {item.alternatives.length > 0 ? (
                      <GlassButton
                        variant="secondary"
                        className="min-h-11 shrink-0 px-3 text-[12px]"
                        onClick={() => {
                          setConflict(null);
                          setSwapNote(null);
                          setSwapId(item.id);
                        }}
                      >
                        Swap
                      </GlassButton>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-3 px-1 text-[13px] font-semibold">
          Total {formatAed(trip.totalAed)} for {guests}.
        </p>
      </div>
      {swapId && active ? (
        <GlassPanel className="mx-5 mb-2 max-h-[42%] overflow-y-auto p-3" data-lenis-prevent>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold">
              {swapNote ??
                (active.kind === "hotel"
                  ? "Here are two other hotels. I've re-checked your timings, and all of them still work."
                  : "Here are two other options. I've re-checked your timings, and all of them still work.")}
            </p>
            <button type="button" className="shrink-0 text-[12px] text-violet" onClick={() => setSwapId(null)}>
              Close
            </button>
          </div>
          {conflict ? (
            <div className="space-y-2">
              <p className="text-[13px]">{conflict.message}</p>
              <GlassButton
                className={btn}
                onClick={() => {
                  onChange(conflict.next);
                  setConflict(null);
                  setSwapId(null);
                  setSwapNote("Here are two other hotels. I've re-checked your timings, and all of them still work.");
                }}
              >
                Shift dinner
              </GlassButton>
              <GlassButton variant="ghost" className="w-full min-h-11" onClick={() => setConflict(null)}>
                Keep current
              </GlassButton>
            </div>
          ) : (
            <ul className="space-y-2">
              {active.alternatives.slice(0, 2).map((alt) => (
                <li key={alt.id}>
                  <button
                    type="button"
                    className="glass-control flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-accent"
                    onClick={() => {
                      const outcome = applySwapStub(trip, swapId, alt.id);
                      if (!outcome.ok) {
                        setConflict({ message: outcome.message, next: outcome.tripIfShifted });
                        return;
                      }
                      onChange(outcome.trip);
                      setSwapNote(outcome.note);
                      setSwapId(null);
                    }}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image src={alt.photo ?? "/images/hd/ic_rak_resort.jpg"} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{alt.title}</span>
                      <span className="block text-[11px] text-ink-soft">
                        {alt.time} · {formatAed(alt.priceAed)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
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

export function ReviewBookScreen({
  trip,
  busy,
  testModeNote,
  onBack,
  onBook,
}: {
  trip: ProposedTrip;
  busy?: boolean;
  testModeNote?: string | null;
  onBack?: () => void;
  onBook?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="text-[32px] leading-[0.95] tracking-[-0.02em]">
          Ready to <em className="text-violet">book?</em>
        </h3>
      </div>
      <ul className="glass-panel mx-5 mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl px-3" data-lenis-prevent>
        {trip.items.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 border-b border-ink/10 py-2.5 last:border-0">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{s.title}</p>
              <p className="truncate text-[10.5px] text-ink-soft">
                Day {s.day} · {s.time}
              </p>
            </div>
            <p className="num shrink-0 text-[13px]">{s.priceAed ? formatAed(s.priceAed) : "—"}</p>
          </li>
        ))}
        <li className="flex items-center justify-between py-3">
          <p className="text-[14px] font-semibold">Total</p>
          <p className="num text-xl text-violet">{formatAed(trip.totalAed)}</p>
        </li>
      </ul>
      <div className="space-y-2 px-5 pb-5 pt-3">
        {testModeNote ? <p className="text-center text-[11px] font-medium text-violet">{testModeNote}</p> : null}
        <GlassButton onClick={onBook} disabled={busy} className={btn}>
          {busy ? "Opening checkout…" : "Book this trip"}
        </GlassButton>
        <p className="text-center text-[11px] leading-snug text-ink-soft">
          Your card is encrypted and handled by Stripe. Glide never sees or stores it. Demo mode, so you won&apos;t be charged.
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

export function BookingConfirmScreen({
  booking,
  trip,
  onEnter,
}: {
  booking: BookingResult;
  trip: ProposedTrip;
  onEnter?: () => void;
}) {
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    if (shown >= booking.confirmations.length) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), 450);
    return () => window.clearTimeout(t);
  }, [shown, booking.confirmations.length]);

  const done = shown >= booking.confirmations.length;

  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="text-[32px] leading-[0.95] tracking-[-0.02em]">
          {done ? (
            <>You&apos;re all set. Your passes are in Wallet, and I&apos;ll keep an eye on the day for you.</>
          ) : (
            <>Booking <em className="text-violet">now…</em></>
          )}
        </h3>
      </div>
      <ul className="mx-5 mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto" data-lenis-prevent>
        {booking.confirmations.slice(0, shown).map((c) => {
          const item = trip.items.find((i) => i.id === c.itemId);
          return (
            <li key={c.itemId}>
              <GlassPanel className="flex items-center gap-3 p-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item?.photo ?? "/images/hd/ic_rak_resort.jpg"} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <p className="font-display text-[18px] italic">{c.label}</p>
              </GlassPanel>
            </li>
          );
        })}
      </ul>
      <div className="px-5 pb-5 pt-3">
        <GlassButton onClick={onEnter} disabled={!done} className={btn}>
          Open my trip
        </GlassButton>
      </div>
    </div>
  );
}

export function BookedRouteScreen({ trip, booking }: { trip: ProposedTrip; booking: BookingResult }) {
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">
          Booked · {booking.mode === "stripe" ? "Stripe test" : "demo"}
        </p>
        <h3 className="mt-1 text-[32px] leading-[0.95] tracking-[-0.02em]">
          Your <em className="text-violet">weekend.</em>
        </h3>
      </div>
      <div className="relative mx-5 mt-3 h-[96px] overflow-hidden rounded-[28px]">
        <Image
          src={trip.items.find((s) => s.kind !== "transfer")?.photo ?? "/images/hd/jebel_jais_sunset.jpg"}
          alt=""
          fill
          sizes="720px"
          className="object-cover"
        />
        <PhotoLabel>{trip.destination}</PhotoLabel>
      </div>
      <ol className="glass-panel relative mx-5 mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl px-4" data-lenis-prevent>
        {trip.items.map((s, i) => (
          <li key={s.id} className="relative flex items-center gap-3 py-2">
            <span className={`z-10 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-violet text-paper" : "bg-paper text-ink ring-2 ring-ink/20"}`}>
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-display text-[15px] italic">{s.title}</p>
              <p className="truncate text-[10.5px] text-ink-soft">
                Day {s.day} · {s.place ?? s.kind}
              </p>
            </div>
            <p className="num text-right text-lg leading-none">{s.time}</p>
          </li>
        ))}
      </ol>
      <p className="px-5 pb-5 pt-3 text-center text-[11px] text-ink-soft">
        Demo booking · {formatAed(trip.totalAed)} · nothing charged
      </p>
    </div>
  );
}

export function BookedPlanScreen({ booking }: { booking: BookingResult }) {
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="text-[34px] leading-[0.95] tracking-[-0.02em]">
          Passes, <em className="text-violet">in Wallet.</em>
        </h3>
        <p className="mt-2 text-[13px] text-ink-soft">I&apos;ll keep an eye on the day for you.</p>
      </div>
      <ul className="mx-5 mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto" data-lenis-prevent>
        {booking.walletPasses.map((pass) => (
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
