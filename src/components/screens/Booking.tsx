"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { BotArt } from "@/components/GlideBot";
import { GlassButton, GlassPanel } from "@/components/ui/glass";
import {
  BUDGET_PRESETS_AED,
  applySwap,
  swapOptions,
  withPlanDefaults,
  type ApplySwapResult,
  type DestinationId,
  type PlanTripRequest,
  type SwapOption,
  type Trip,
  type TripItem,
} from "@/lib/planning";
import { PAYMENT_TRUST_LINE } from "@/lib/checkout";

const btn = "w-full py-3.5 tracking-wide";

const DEST_CHIPS: { id: DestinationId; label: string }[] = [
  { id: "ras-al-khaimah", label: "Ras Al Khaimah" },
  { id: "muscat", label: "Muscat" },
  { id: "hatta", label: "Hatta" },
];

function Status() {
  return <div className="pt-[max(env(safe-area-inset-top),12px)]" aria-hidden />;
}

function formatAed(amount: number): string {
  return `AED ${Math.round(amount).toLocaleString("en-AE")}`;
}

function formatRange(from: string, to: string): string {
  try {
    const a = new Date(`${from}T12:00:00Z`);
    const b = new Date(`${to}T12:00:00Z`);
    const opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" };
    return `${a.toLocaleDateString("en-GB", opts)} → ${b.toLocaleDateString("en-GB", opts)}`;
  } catch {
    return `${from} → ${to}`;
  }
}

function guestCount(request: PlanTripRequest): number {
  const adults = request.travellers ?? 2;
  const kids = request.kids ?? 0;
  return Math.max(1, adults + kids);
}

function parseHmm(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Deduped trip items (travel, hotel, day plans). */
function timelineItems(trip: Trip): TripItem[] {
  const out: TripItem[] = [];
  const seen = new Set<string>();
  for (const item of [trip.travel, trip.hotel, ...trip.days.flatMap((d) => d.plans)]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** Group by day, sort each day by startTime — UI-only; planning data unchanged. */
function timelineByDay(trip: Trip): { day: number; date?: string; items: TripItem[] }[] {
  const byDay = new Map<number, TripItem[]>();
  for (const item of timelineItems(trip)) {
    const list = byDay.get(item.day) ?? [];
    list.push(item);
    byDay.set(item.day, list);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, items]) => ({
      day,
      date: trip.days.find((d) => d.day === day)?.date,
      items: [...items].sort((a, b) => parseHmm(a.startTime) - parseHmm(b.startTime)),
    }));
}

export function proposalSummary(trip: Trip): string {
  const place = trip.destinationLabel;
  const total = formatAed(trip.facts.totalAED);
  const people = trip.travellers + (trip.kids ?? 0);
  const parts: string[] = [];
  if (trip.facts.withinBudget) {
    parts.push(`Here's your weekend in ${place}. It comes to ${total} for ${people}, within your budget.`);
  } else {
    parts.push(
      `This comes to ${total}, a bit over your ${formatAed(trip.budgetAED)}. Want a cheaper hotel?`,
    );
  }
  if (trip.facts.highlight?.copy) parts.push(trip.facts.highlight.copy);
  return parts.join(" ");
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
          Follow the sample day, or plan a new weekend.
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

export function AskPrefsScreen({
  request,
  index,
  onChange,
  onBack,
  onNext,
}: {
  request: PlanTripRequest;
  index: number;
  onChange: (request: PlanTripRequest) => void;
  onBack?: () => void;
  onNext?: () => void;
}) {
  const resolved = withPlanDefaults(request);
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
          DEST_CHIPS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange({ ...request, destination: d.id })}
              className={`glass-control w-full rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold transition-colors hover:bg-accent ${
                resolved.destination === d.id ? "ring-2 ring-violet" : ""
              }`}
            >
              {d.label}
            </button>
          ))}
        {step === "when" && (
          <GlassPanel className="p-4">
            <p className="text-[15px] font-semibold">{formatRange(resolved.startDate, resolved.endDate)}</p>
            <p className="mt-1 text-[12px] text-ink-soft">Default: Friday to Sunday</p>
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
                  onClick={() => onChange({ ...request, travellers: Math.max(1, resolved.travellers - 1) })}
                >
                  −
                </GlassButton>
                <span className="num w-8 text-center text-xl">{resolved.travellers}</span>
                <GlassButton
                  variant="secondary"
                  className="min-h-11 min-w-11 px-0"
                  aria-label="More adults"
                  onClick={() => onChange({ ...request, travellers: Math.min(8, resolved.travellers + 1) })}
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
                  onClick={() => onChange({ ...request, kids: Math.max(0, (request.kids ?? 0) - 1) })}
                >
                  −
                </GlassButton>
                <span className="num w-8 text-center text-xl">{request.kids ?? 0}</span>
                <GlassButton
                  variant="secondary"
                  className="min-h-11 min-w-11 px-0"
                  aria-label="Add kids"
                  onClick={() => onChange({ ...request, kids: Math.min(6, (request.kids ?? 0) + 1) })}
                >
                  +
                </GlassButton>
              </div>
            </GlassPanel>
          </>
        )}
        {step === "budget" &&
          BUDGET_PRESETS_AED.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onChange({ ...request, budgetAED: amount })}
              className={`glass-control w-full rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold transition-colors hover:bg-accent ${
                resolved.budgetAED === amount ? "ring-2 ring-violet" : ""
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
  onChange,
  onBack,
  onReview,
}: {
  trip: Trip;
  onChange: (trip: Trip) => void;
  onBack?: () => void;
  onReview?: () => void;
}) {
  const [swapId, setSwapId] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<SwapOption[]>([]);
  const [swapNote, setSwapNote] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<ApplySwapResult | null>(null);
  const days = timelineByDay(trip);
  const items = days.flatMap((d) => d.items);
  const people = trip.travellers + (trip.kids ?? 0);

  const openSwap = (itemId: string) => {
    setPending(null);
    setSwapNote(null);
    setSwapId(itemId);
    try {
      setOptions(swapOptions(trip, itemId).slice(0, 2));
    } catch {
      setOptions([]);
    }
  };

  const applyOption = (optionId: string) => {
    if (!swapId) return;
    const result = applySwap(trip, swapId, optionId);
    if (result.lateItems.length > 0) {
      setPending(result);
      return;
    }
    onChange(result.trip);
    setSwapNote("Here are two other hotels. I've re-checked your timings, and both still work.");
    setSwapId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="text-[26px] leading-[1.08] tracking-[-0.02em]">{proposalSummary(trip)}</h3>
        {!trip.facts.withinBudget && trip.facts.cheaperHotel ? (
          <button
            type="button"
            className="mt-2 text-left text-[13px] font-semibold text-violet"
            onClick={() => {
              const hotelOpts = swapOptions(trip, trip.hotel.id);
              const match = hotelOpts.find((o) => o.catalogId === trip.facts.cheaperHotel?.catalogId);
              if (match) {
                const result = applySwap(trip, trip.hotel.id, match.id);
                onChange(result.trip);
              }
            }}
          >
            Switch to {trip.facts.cheaperHotel.title} · save {formatAed(trip.facts.cheaperHotel.savesAED)}
          </button>
        ) : null}
      </div>
      <div className="relative mx-5 mt-3 h-[88px] overflow-hidden rounded-[28px]">
        <Image
          src={
            items.find((i) => i.kind !== "travel" && i.photo)?.photo ??
            trip.hotel.photo ??
            "/images/hd/jebel_jais_sunset.jpg"
          }
          alt=""
          fill
          sizes="720px"
          className="object-cover"
        />
        <span className="glide-glass-photo-label absolute bottom-2 left-2 z-10 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-[0_8px_18px_-12px_rgba(28,18,48,0.75)]">
          Total {formatAed(trip.facts.totalAED)} for {people}.
        </span>
      </div>
      <ol className="glass-panel relative mx-5 mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl px-4" data-lenis-prevent>
        {days.map((day) => (
          <li key={day.day} className="border-b border-ink/10 py-2 last:border-0">
            <p className="px-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
              Day {day.day}
              {day.date ? ` · ${day.date}` : ""}
            </p>
            <ol>
              {day.items.map((item, i) => (
                <li key={item.id} className="relative flex items-center gap-3 py-2">
                  <span className={`z-10 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${day.day === 1 && i === 0 ? "bg-violet text-paper" : "bg-paper text-ink ring-2 ring-ink/20"}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate font-display text-[15px] italic">{item.title}</p>
                    <p className="truncate text-[10.5px] text-ink-soft">
                      {item.startTime}
                      {item.costAED ? ` · ${formatAed(item.costAED)}` : ""}
                    </p>
                  </div>
                  {item.kind !== "travel" ? (
                    <button
                      type="button"
                      className="min-h-11 shrink-0 px-2 text-[12px] font-semibold text-violet"
                      onClick={() => openSwap(item.id)}
                    >
                      Swap
                    </button>
                  ) : null}
                  <p className="num w-12 shrink-0 text-right text-lg leading-none">{item.startTime}</p>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
      <p className="px-5 pt-2 text-[13px] font-semibold">
        Total {formatAed(trip.facts.totalAED)} for {people}.
      </p>
      {swapId ? (
        <GlassPanel className="mx-5 mb-2 max-h-[40%] overflow-y-auto p-3" data-lenis-prevent>
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-[12px] font-semibold leading-snug">
              {pending
                ? "That moves dinner past 22:00. Want me to shift it?"
                : swapNote ??
                  "Here are two other hotels. I've re-checked your timings, and both still work."}
            </p>
            <button type="button" className="shrink-0 text-[12px] text-violet" onClick={() => setSwapId(null)}>
              Close
            </button>
          </div>
          {pending ? (
            <div className="space-y-2">
              <GlassButton
                className={btn}
                onClick={() => {
                  onChange(pending.trip);
                  setPending(null);
                  setSwapId(null);
                }}
              >
                Shift dinner
              </GlassButton>
              <GlassButton variant="ghost" className="w-full min-h-11" onClick={() => setPending(null)}>
                Keep current
              </GlassButton>
            </div>
          ) : (
            <ul className="space-y-2">
              {options.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-2 text-left hover:bg-accent/40"
                    onClick={() => applyOption(opt.id)}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image src={opt.photo ?? "/images/hd/ic_rak_resort.jpg"} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{opt.title}</span>
                      <span className="block text-[11px] text-ink-soft">
                        {opt.startTime ?? "—"} · {formatAed(opt.costAED)}
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
  notice,
  onBack,
  onBook,
  onDemoConfirm,
}: {
  trip: Trip;
  busy?: boolean;
  notice?: string | null;
  onBack?: () => void;
  onBook?: () => void;
  /** Shown when returning from demo checkout redirect — explicit confirm only. */
  onDemoConfirm?: () => void;
}) {
  const days = timelineByDay(trip);
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="text-[32px] leading-[0.95] tracking-[-0.02em]">
          Ready to <em className="text-violet">book?</em>
        </h3>
      </div>
      <ul className="glass-panel mx-5 mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl px-3" data-lenis-prevent>
        {days.map((day) => (
          <li key={day.day} className="border-b border-ink/10 py-2 last:border-0">
            <p className="px-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">
              Day {day.day}
            </p>
            <ul>
              {day.items.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{s.title}</p>
                    <p className="truncate text-[10.5px] text-ink-soft">{s.startTime}</p>
                  </div>
                  <p className="num shrink-0 text-[13px]">{s.costAED ? formatAed(s.costAED) : "—"}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
        <li className="flex items-center justify-between py-3">
          <p className="text-[14px] font-semibold">Total</p>
          <p className="num text-xl text-violet">{formatAed(trip.facts.totalAED)}</p>
        </li>
      </ul>
      <div className="space-y-2 px-5 pb-5 pt-3">
        {notice ? <p className="text-center text-[12px] text-ink-soft">{notice}</p> : null}
        {onDemoConfirm ? (
          <GlassButton onClick={onDemoConfirm} disabled={busy} className={btn}>
            {busy ? "Confirming…" : "Confirm demo booking"}
          </GlassButton>
        ) : (
          <GlassButton onClick={onBook} disabled={busy} className={btn}>
            {busy ? "Opening checkout…" : "Book this trip"}
          </GlassButton>
        )}
        <p className="text-center text-[11px] leading-snug text-ink-soft">
          {PAYMENT_TRUST_LINE} Demo mode, so you won&apos;t be charged.
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
  trip,
  onEnter,
}: {
  trip: Trip;
  onEnter?: () => void;
}) {
  const tickets = React.useMemo(() => {
    const list: { key: string; title: string; photo?: string }[] = [];
    list.push({ key: "hotel", title: "Hotel booked", photo: trip.hotel.photo });
    const dinner = trip.days.flatMap((d) => d.plans).find((p) => p.kind === "dining");
    if (dinner) list.push({ key: "dinner", title: "Dinner booked", photo: dinner.photo });
    if (trip.facts.highlight) {
      list.push({
        key: "highlight",
        title: `${trip.facts.highlight.title} booked`,
        photo: trip.days.flatMap((d) => d.plans).find((p) => p.id === trip.facts.highlight!.itemId)?.photo,
      });
    }
    return list;
  }, [trip]);

  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    if (shown >= tickets.length) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), 450);
    return () => window.clearTimeout(t);
  }, [shown, tickets.length]);
  const done = shown >= tickets.length;

  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="text-[28px] leading-[1.05] tracking-[-0.02em]">
          {done
            ? "You're all set. Your passes are in Wallet, and I'll keep an eye on the day for you."
            : "Booking now…"}
        </h3>
      </div>
      <ul className="mx-5 mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto" data-lenis-prevent>
        {tickets.slice(0, shown).map((t) => (
          <li key={t.key}>
            <GlassPanel className="flex items-center gap-3 p-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <Image src={t.photo ?? "/images/hd/ic_rak_resort.jpg"} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <p className="min-w-0 flex-1 font-display text-[18px] italic">{t.title}</p>
              <Check className="h-5 w-5 shrink-0 text-violet" aria-hidden />
              <span className="sr-only">Confirmed</span>
            </GlassPanel>
          </li>
        ))}
      </ul>
      <div className="px-5 pb-5 pt-3">
        <GlassButton onClick={onEnter} disabled={!done} className={btn}>
          Open my trip
        </GlassButton>
      </div>
    </div>
  );
}

export function BookedRouteScreen({ trip }: { trip: Trip }) {
  const items = timelineItems(trip);
  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">Booked</p>
        <h3 className="mt-1 text-[32px] leading-[0.95] tracking-[-0.02em]">
          Your <em className="text-violet">weekend.</em>
        </h3>
      </div>
      <div className="relative mx-5 mt-3 h-[96px] overflow-hidden rounded-[28px]">
        <Image src={trip.hotel.photo ?? "/images/hd/jebel_jais_sunset.jpg"} alt="" fill sizes="720px" className="object-cover" />
        <span className="glide-glass-photo-label absolute bottom-2 left-2 z-10 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-ink">
          {trip.destinationLabel}
        </span>
      </div>
      <ol className="glass-panel relative mx-5 mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl px-4" data-lenis-prevent>
        {items.map((s, i) => (
          <li key={s.id} className="relative flex items-center gap-3 py-2">
            <span className={`z-10 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-violet text-paper" : "bg-paper text-ink ring-2 ring-ink/20"}`}>
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-display text-[15px] italic">{s.title}</p>
              <p className="truncate text-[10.5px] text-ink-soft">
                Day {s.day} · {s.location}
              </p>
            </div>
            <p className="num text-right text-lg leading-none">{s.startTime}</p>
          </li>
        ))}
      </ol>
      <p className="px-5 pb-5 pt-3 text-center text-[11px] text-ink-soft">
        {formatAed(trip.facts.totalAED)} · nothing charged in demo
      </p>
    </div>
  );
}

export function BookedPlanScreen({ trip }: { trip: Trip }) {
  const passes = (trip.confirmations ?? []).filter((c) => c.walletPass);
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
        {passes.map((c) => (
          <li key={c.itemId}>
            <GlassPanel className="p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-soft">Wallet pass · demo</p>
              <p className="mt-1 font-display text-xl italic">{c.walletPass!.title}</p>
              <p className="num mt-1 text-2xl">
                {c.walletPass!.time} · {c.walletPass!.date}
              </p>
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

export { withPlanDefaults, guestCount, formatAed };
