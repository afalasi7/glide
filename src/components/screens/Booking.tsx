"use client";

import React from "react";
import Image from "next/image";
import { Car, Check, Hotel, Mountain, UtensilsCrossed } from "lucide-react";
import { BotArt } from "@/components/GlideBot";
import { GlassButton, GlassPanel } from "@/components/ui/glass";
import {
  BUDGET_PRESETS_AED,
  PAYMENT_TRUST_LINE,
  applyCatalogPrices,
  applySwap,
  swapOptions,
  withFacts,
  withPlanDefaults,
  type ApplySwapResult,
  type DestinationId,
  type PlanTripRequest,
  type SwapOption,
  type Trip,
  type TripItem,
} from "@/lib/planning";
import {
  LOWEST_PRICE_NOTICE,
  adaptOverBudgetUi,
  formatAed,
  proposalBudgetLine,
  setBudgetButtonLabel,
  shortenTripOneNight,
  type CheapestFix,
} from "@/lib/proposal-copy";

const btn = "w-full py-3.5 tracking-wide";

const WALLET_CHIPS = ["Apple Wallet", "Google Wallet", "Samsung Wallet"] as const;

const KIND_PHOTO: Record<TripItem["kind"], string> = {
  hotel: "/images/hd/ic_rak_resort.jpg",
  dining: "/images/hd/levant_nar_dining.jpg",
  activity: "/images/hd/jebel_jais_sunset.jpg",
  travel: "/images/hd/traffic_road.jpg",
};

const DEST_CHIPS: { id: DestinationId; label: string }[] = [
  { id: "ras-al-khaimah", label: "Ras Al Khaimah" },
  { id: "muscat", label: "Muscat" },
  { id: "hatta", label: "Hatta" },
];

function Status() {
  return <div className="pt-[max(env(safe-area-inset-top),12px)]" aria-hidden />;
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

/** "Friday 23 Oct" from ISO YYYY-MM-DD (UTC), normal case. */
function formatDayHeader(iso?: string, dayNum?: number): string {
  if (!iso) return dayNum != null ? `Day ${dayNum}` : "Day";
  try {
    const d = new Date(`${iso}T12:00:00Z`);
    const parts = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).formatToParts(d);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const day = parts.find((p) => p.type === "day")?.value ?? "";
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    return `${weekday} ${day} ${month}`.trim();
  } catch {
    return dayNum != null ? `Day ${dayNum}` : iso;
  }
}

function isPayOnSite(item: TripItem): boolean {
  const blob = `${item.notes ?? ""}`.toLowerCase();
  return /pay[- ]?on[- ]?site|pay there|pay at (the )?venue|pay on arrival/.test(blob);
}

function costLabel(item: TripItem): string {
  if (item.costAED > 0) return formatAed(item.costAED);
  if (isPayOnSite(item)) return "Pay there";
  return "Free";
}

function resolveItemPhoto(item?: Pick<TripItem, "photo" | "kind"> | null): string | null {
  if (item?.photo) return item.photo;
  if (item?.kind) return KIND_PHOTO[item.kind] ?? null;
  return null;
}

/** Strip meal-type suffixes so tickets read as venue names. */
function venueLabel(title: string): string {
  return title
    .replace(/\s*\((?:lunch|dinner)\)\s*$/i, "")
    .replace(/\s+(?:lunch|dinner)\s*$/i, "")
    .trim();
}

/** "Friday 20:00" from ISO day + HH:MM. */
function formatTicketWhen(iso: string | undefined, time: string): string {
  if (!iso) return time;
  try {
    const d = new Date(`${iso}T12:00:00Z`);
    const weekday = d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
    return `${weekday} ${time}`;
  } catch {
    return time;
  }
}

/**
 * Ticket thumb: use the item's own photo when unique on this screen.
 * Meals never fall back to the shared Levant photo — utensils tile instead.
 */
function ticketPhotoFor(
  item: Pick<TripItem, "photo" | "kind"> | null | undefined,
  kind: TripItem["kind"],
  usedPhotos: Set<string>,
  walletPhoto?: string,
): string | null {
  const own = item?.photo || walletPhoto || undefined;
  if (own && !usedPhotos.has(own)) {
    usedPhotos.add(own);
    return own;
  }
  if (kind === "dining") return null;
  const fallback = KIND_PHOTO[kind];
  if (fallback && !usedPhotos.has(fallback)) {
    usedPhotos.add(fallback);
    return fallback;
  }
  return null;
}

function TicketIcon({ kind }: { kind?: TripItem["kind"] }) {
  const cls = "h-5 w-5 text-ink-soft";
  if (kind === "hotel") return <Hotel className={cls} aria-hidden />;
  if (kind === "dining") return <UtensilsCrossed className={cls} aria-hidden />;
  if (kind === "travel") return <Car className={cls} aria-hidden />;
  return <Mountain className={cls} aria-hidden />;
}

function TicketThumb({
  photo,
  kind,
}: {
  photo?: string | null;
  kind?: TripItem["kind"];
}) {
  if (photo) {
    return (
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
        <Image src={photo} alt="" fill sizes="48px" className="object-cover" />
      </span>
    );
  }
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink/5 ring-1 ring-ink/10">
      <TicketIcon kind={kind} />
    </span>
  );
}

function walletReply(brand: string) {
  return `${brand} isn't connected in this demo. The passes above are what Glide would add.`;
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

/** Deduped trip items (travel, return, hotel, day plans — incl. lunches). */
function timelineItems(trip: Trip): TripItem[] {
  const out: TripItem[] = [];
  const seen = new Set<string>();
  const source = [
    trip.travel,
    ...(trip.returnTravel ? [trip.returnTravel] : []),
    trip.hotel,
    ...trip.days.flatMap((d) => d.plans),
  ];
  for (const item of source) {
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

export { proposalBudgetLine } from "@/lib/proposal-copy";

/** @deprecated Prefer heading + proposalBudgetLine; kept for older call sites. */
export function proposalSummary(trip: Trip): string {
  const parts = [`Your weekend in ${trip.destinationLabel}.`, proposalBudgetLine(trip)];
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
        <h3 className="mt-3 font-display text-[34px] leading-[0.95] tracking-[-0.02em]">
          What should we <em className="text-violet">open?</em>
        </h3>
        <p className="mt-2 text-[13px] font-light text-ink-soft">
          Plan a new weekend, or follow the sample day.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 px-6">
        <GlassButton onClick={onPlan} className={btn}>
          Plan a new trip
        </GlassButton>
        <button
          type="button"
          onClick={onDemo}
          className="min-h-11 text-center text-[14px] font-semibold text-violet underline-offset-4 transition-colors hover:underline"
        >
          Open the sample trip
        </button>
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
  onSetBudget,
}: {
  trip: Trip;
  onChange: (trip: Trip) => void;
  onBack?: () => void;
  onReview?: () => void;
  /** Re-plan with a higher budget so the current total fits. */
  onSetBudget?: (budgetAED: number) => void;
}) {
  const [swapId, setSwapId] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<SwapOption[]>([]);
  const [swapNote, setSwapNote] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<Extract<ApplySwapResult, { ok: true }> | null>(null);
  const days = timelineByDay(trip);
  const items = days.flatMap((d) => d.items);
  const people = trip.travellers + (trip.kids ?? 0);
  const recovery = adaptOverBudgetUi({ ...trip, hotelId: trip.hotel.id });

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
    if (!result.ok) {
      setSwapNote(result.reason);
      return;
    }
    if (result.lateItems.length > 0) {
      setPending(result);
      return;
    }
    onChange(result.trip);
    setSwapNote("Here are two other hotels. I've re-checked your timings, and both still work.");
    setSwapId(null);
  };

  const applyCatalogFix = (fix: CheapestFix) => {
    try {
      if (fix.kind === "swap-hotel" || fix.kind === "swap-meal") {
        const itemId =
          fix.apply?.itemId ?? (fix.kind === "swap-hotel" ? trip.hotel.id : undefined);
        if (!itemId) return;
        const opts = swapOptions(trip, itemId);
        const match =
          (fix.apply?.optionId ? opts.find((o) => o.id === fix.apply!.optionId) : undefined) ??
          (fix.apply?.catalogId
            ? opts.find((o) => o.catalogId === fix.apply!.catalogId)
            : undefined) ??
          (trip.facts.cheaperHotel
            ? opts.find((o) => o.catalogId === trip.facts.cheaperHotel!.catalogId)
            : undefined);
        if (!match) {
          setSwapNote("I couldn't apply that change — try Swap on the row.");
          return;
        }
        const result = applySwap(trip, itemId, match.id);
        if (!result.ok) {
          setSwapNote(result.reason);
          return;
        }
        if (result.lateItems.length > 0) {
          setPending(result);
          setSwapId(itemId);
          return;
        }
        onChange(result.trip);
        setSwapNote(null);
        setSwapId(null);
        setPending(null);
        return;
      }
      if (fix.kind === "drop-item" && fix.apply?.itemId) {
        const dropId = fix.apply.itemId;
        const nextDays = trip.days.map((d) => ({
          ...d,
          plans: d.plans.filter((p) => p.id !== dropId),
        }));
        const priced = applyCatalogPrices({ ...trip, days: nextDays, status: "proposed" });
        onChange(withFacts(priced));
        setSwapNote(null);
      }
    } catch {
      setSwapNote("I couldn't apply that change — try Swap on the row.");
    }
  };

  const applyShorten = () => {
    const next = shortenTripOneNight(trip);
    if (next) onChange(next);
  };

  const heroPhoto =
    resolveItemPhoto(items.find((i) => i.kind === "activity" && i.photo)) ??
    resolveItemPhoto(items.find((i) => i.kind !== "travel")) ??
    KIND_PHOTO.activity;

  return (
    <div className="flex h-full flex-col">
      <Status />
      {/* Sticky top: heading + budget + recovery CTA stay put while the list scrolls. */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-ink/5 bg-cream/95 px-5 pb-3 pt-2 backdrop-blur-sm">
        <h3 className="font-display text-[30px] leading-[1.05] tracking-[-0.025em]">
          Your weekend in {trip.destinationLabel}.
        </h3>
        <p className="mt-2 text-[14px] font-light leading-snug text-ink-soft">
          {proposalBudgetLine(trip)}
        </p>
        {recovery?.mode === "catalogFix" ? (
          <GlassButton
            type="button"
            variant="secondary"
            className="mt-2 min-h-11 w-full tracking-wide"
            onClick={() => applyCatalogFix(recovery.fix)}
            data-testid="over-budget-action"
            data-action={recovery.fix.kind}
          >
            {recovery.buttonLabel}
          </GlassButton>
        ) : null}
        {recovery?.mode === "noCatalogFix" ? (
          <div className="mt-2 space-y-1.5">
            <p className="text-[13px] font-light leading-snug text-ink-soft" data-testid="lowest-price-notice">
              {LOWEST_PRICE_NOTICE}
            </p>
            {recovery.shorten ? (
              <GlassButton
                type="button"
                variant="secondary"
                className="min-h-11 w-full tracking-wide"
                onClick={applyShorten}
                data-testid="over-budget-action"
                data-action="shorten-trip"
              >
                Make it one night shorter
              </GlassButton>
            ) : null}
            {recovery.setBudgetAED != null ? (
              <GlassButton
                type="button"
                variant={recovery.shorten ? "ghost" : "secondary"}
                className="min-h-11 w-full tracking-wide"
                onClick={() => onSetBudget?.(recovery.setBudgetAED!)}
                data-testid={recovery.shorten ? "set-budget-action" : "over-budget-action"}
                data-action="raise-budget"
              >
                {setBudgetButtonLabel(recovery.setBudgetAED)}
              </GlassButton>
            ) : null}
          </div>
        ) : null}
        {trip.facts.highlight?.copy ? (
          <p className="mt-2 text-[13px] font-light leading-snug text-ink-soft">
            {trip.facts.highlight.copy}
          </p>
        ) : null}
      </div>
      <div className="relative mx-5 mt-3 h-[88px] shrink-0 overflow-hidden rounded-[28px]">
        <Image src={heroPhoto} alt="" fill sizes="720px" className="object-cover" />
      </div>
      <ol className="glass-panel relative mx-5 mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl px-4" data-lenis-prevent>
        {days.map((day) => (
          <li key={day.day} className="border-b border-ink/10 py-2 last:border-0">
            <p className="px-0.5 text-[13px] font-semibold text-ink">
              {formatDayHeader(day.date, day.day)}
            </p>
            <ol>
              {day.items.map((item) => (
                <li key={item.id} className="relative flex items-center gap-3 py-2">
                  <p className="num w-12 shrink-0 text-lg leading-none">{item.startTime}</p>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate font-display text-[15px] italic">{item.title}</p>
                    {item.costAED > 0 ? (
                      <p className="truncate text-[10.5px] text-ink-soft">{formatAed(item.costAED)}</p>
                    ) : null}
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
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
      <p className="shrink-0 px-5 pt-2 text-[13px] font-semibold">
        Total {formatAed(trip.facts.totalAED)} for {people}.
      </p>
      {swapId ? (
        <GlassPanel className="mx-5 mb-2 max-h-[40%] shrink-0 overflow-y-auto p-3" data-lenis-prevent>
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
      <div className="flex shrink-0 gap-2 px-5 pb-5 pt-2">
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
            <p className="px-0.5 text-[13px] font-semibold text-ink">
              {formatDayHeader(day.date, day.day)}
            </p>
            <ul>
              {day.items.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold">{s.title}</p>
                    <p className="truncate text-[10.5px] text-ink-soft">{s.startTime}</p>
                  </div>
                  <p className="num shrink-0 text-[13px]">{costLabel(s)}</p>
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
    const plans = trip.days.flatMap((d) => d.plans);
    const byId = new Map<string, TripItem>([
      [trip.hotel.id, trip.hotel],
      ...plans.map((p) => [p.id, p] as const),
    ]);
    const dateForDay = (day: number) => trip.days.find((d) => d.day === day)?.date;

    type Ticket = {
      key: string;
      title: string;
      when: string;
      photo: string | null;
      kind: TripItem["kind"];
      day: number;
      startTime: string;
    };

    const usedPhotos = new Set<string>();
    const draft: Omit<Ticket, "photo">[] = [];

    const pushItem = (item: TripItem, titleSource: string) => {
      draft.push({
        key: item.id,
        title: `${venueLabel(titleSource)} booked`,
        when: formatTicketWhen(dateForDay(item.day), item.startTime),
        kind: item.kind,
        day: item.day,
        startTime: item.startTime,
      });
    };

    // Hotel + dining + highlight only (not every travel/activity confirmation).
    if (trip.confirmations?.length) {
      const hotelC = trip.confirmations.find((c) => c.kind === "hotel" || c.itemId === trip.hotel.id);
      if (hotelC) {
        const item = byId.get(hotelC.itemId) ?? trip.hotel;
        pushItem(item, item.title || hotelC.title);
      }
      for (const c of trip.confirmations.filter((c) => c.kind === "dining")) {
        const item = byId.get(c.itemId);
        if (!item) continue;
        pushItem(item, item.title || c.title);
      }
      if (trip.facts.highlight) {
        const h = trip.facts.highlight;
        if (!draft.some((t) => t.key === h.itemId)) {
          const item = byId.get(h.itemId);
          if (item) pushItem(item, h.title || item.title);
        }
      }
    } else {
      pushItem(trip.hotel, trip.hotel.title);
      for (const d of plans.filter((p) => p.kind === "dining")) {
        pushItem(d, d.title);
      }
      if (trip.facts.highlight) {
        const item = plans.find((p) => p.id === trip.facts.highlight!.itemId);
        if (item && !draft.some((t) => t.key === item.id)) {
          pushItem(item, trip.facts.highlight.title || item.title);
        }
      }
    }

    draft.sort(
      (a, b) => a.day - b.day || parseHmm(a.startTime) - parseHmm(b.startTime),
    );

    return draft.map((t) => {
      const item = byId.get(t.key) ?? (t.key === trip.hotel.id ? trip.hotel : undefined);
      const walletPhoto = trip.confirmations?.find((c) => c.itemId === t.key)?.walletPass?.photo;
      return {
        ...t,
        photo: ticketPhotoFor(item, t.kind, usedPhotos, walletPhoto),
      };
    });
  }, [trip]);

  const [shown, setShown] = React.useState(0);
  const [walletNote, setWalletNote] = React.useState<string | null>(null);
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
        <h3 className="font-display text-[28px] leading-[1.05] tracking-[-0.02em]">
          {done
            ? "You're all set. Your passes are in Wallet, and I'll keep an eye on the day for you."
            : "Booking now…"}
        </h3>
      </div>
      <ul className="mx-5 mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto" data-lenis-prevent>
        {tickets.slice(0, shown).map((t) => (
          <li key={t.key}>
            <GlassPanel className="flex items-center gap-3 p-3">
              <TicketThumb photo={t.photo} kind={t.kind} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-display text-[17px] italic">{t.title}</p>
                <p className="mt-0.5 truncate text-[12px] text-ink-soft">{t.when}</p>
              </div>
              <Check className="h-5 w-5 shrink-0 text-violet" aria-hidden />
              <span className="sr-only">Confirmed</span>
            </GlassPanel>
          </li>
        ))}
      </ul>
      <div className="space-y-2 px-5 pb-5 pt-3">
        {done ? (
          <>
            <ul className="flex flex-wrap gap-1.5" aria-label="Add passes to wallet">
              {WALLET_CHIPS.map((w) => (
                <li key={w}>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground ring-1 ring-foreground/20 transition-colors hover:bg-accent"
                    onClick={() => setWalletNote(walletReply(w))}
                  >
                    {w}
                  </button>
                </li>
              ))}
            </ul>
            {walletNote ? (
              <p className="text-[12px] leading-snug text-ink-soft" aria-live="polite">
                {walletNote}
              </p>
            ) : null}
          </>
        ) : null}
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
  const [walletNote, setWalletNote] = React.useState<string | null>(null);
  const byId = React.useMemo(() => {
    const map = new Map<string, TripItem>();
    map.set(trip.hotel.id, trip.hotel);
    for (const p of trip.days.flatMap((d) => d.plans)) map.set(p.id, p);
    return map;
  }, [trip]);

  return (
    <div className="flex h-full flex-col">
      <Status />
      <div className="px-5 pt-2">
        <h3 className="font-display text-[34px] leading-[0.95] tracking-[-0.02em]">
          Passes, <em className="text-violet">in Wallet.</em>
        </h3>
        <p className="mt-2 text-[13px] text-ink-soft">I&apos;ll keep an eye on the day for you.</p>
      </div>
      <ul className="mx-5 mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto" data-lenis-prevent>
        {passes.map((c) => {
          const item = byId.get(c.itemId);
          const kind = item?.kind ?? c.kind;
          const own = item?.photo || c.walletPass?.photo;
          const photo = own ?? (kind === "dining" ? null : KIND_PHOTO[kind] ?? null);
          return (
            <li key={c.itemId}>
              <GlassPanel className="p-3">
                <div className="flex items-start gap-3">
                  <TicketThumb photo={photo} kind={kind} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl italic">{venueLabel(c.walletPass!.title)}</p>
                    <p className="num mt-1 text-2xl">
                      {c.walletPass!.time} · {c.walletPass!.date}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            </li>
          );
        })}
        <li>
          <ul className="flex flex-wrap gap-1.5" aria-label="Add passes to wallet">
            {WALLET_CHIPS.map((w) => (
              <li key={w}>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground ring-1 ring-foreground/20 transition-colors hover:bg-accent"
                  onClick={() => setWalletNote(walletReply(w))}
                >
                  {w}
                </button>
              </li>
            ))}
          </ul>
          {walletNote ? (
            <p className="mt-2 text-[12px] leading-snug text-ink-soft" aria-live="polite">
              {walletNote}
            </p>
          ) : null}
        </li>
      </ul>
      <div className="mt-auto flex items-center gap-2 px-5 pb-5">
        <div className="h-8 w-8"><BotArt mood="happy" small /></div>
        <p className="text-[11px] leading-tight text-ink-soft">Demo passes only. Add-to-wallet is not connected.</p>
      </div>
    </div>
  );
}

export { withPlanDefaults, guestCount, formatAed };
