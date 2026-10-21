import type { BudgetBand, DestinationId, TripPrefs } from "./types";

const DEST_ALIASES: { id: DestinationId; needles: string[] }[] = [
  { id: "rak", needles: ["ras al khaimah", "ras al khaima", "rak", "jebel jais", "jebel"] },
  { id: "hatta", needles: ["hatta"] },
];

/**
 * Prefill planning prefs from a chat-like phrase, e.g.
 * "a long weekend in Ras Al Khaimah for two".
 */
export function parseTripIntent(message: string): Partial<TripPrefs> | null {
  const q = message.toLowerCase().trim();
  if (!q) return null;

  const looksLikePlan =
    /\b(book|plan|weekend|trip|getaway|night|nights|day trip|vacation|holiday)\b/.test(q) ||
    DEST_ALIASES.some((d) => d.needles.some((n) => q.includes(n)));
  if (!looksLikePlan) return null;

  const destinationId =
    DEST_ALIASES.find((d) => d.needles.some((n) => q.includes(n)))?.id ?? ("rak" as DestinationId);

  let nights = 1;
  if (/\b(day trip|same day|one day)\b/.test(q)) nights = 0;
  else if (/\b(long weekend|3 nights|three nights)\b/.test(q)) nights = 2;
  else if (/\b(weekend|2 nights|two nights|couple of nights)\b/.test(q)) nights = 2;
  else if (/\b(night|overnight)\b/.test(q)) nights = 1;

  let travellers = 2;
  const forMatch = q.match(/\bfor\s+(\d+|two|three|four|one|a couple)\b/);
  if (forMatch) {
    const token = forMatch[1]!;
    const map: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, "a couple": 2 };
    const fromMap = map[token];
    const fromDigits = Number(token);
    travellers = fromMap ?? (Number.isFinite(fromDigits) && fromDigits > 0 ? fromDigits : 2);
  } else if (/\b(solo|just me|myself)\b/.test(q)) travellers = 1;
  else if (/\b(family|kids)\b/.test(q)) travellers = 4;

  let budgetBand: BudgetBand = "comfort";
  if (/\b(cheap|budget|smart|value)\b/.test(q)) budgetBand = "smart";
  if (/\b(luxe|luxury|splurge|five.?star)\b/.test(q)) budgetBand = "luxe";

  return {
    destinationId,
    nights,
    travellers,
    budgetBand,
    note: message.trim().slice(0, 160),
  };
}

export function defaultPrefs(partial?: Partial<TripPrefs>): TripPrefs {
  return {
    destinationId: partial?.destinationId ?? "rak",
    nights: partial?.nights ?? 2,
    travellers: partial?.travellers ?? 2,
    budgetBand: partial?.budgetBand ?? "comfort",
    note: partial?.note,
  };
}
