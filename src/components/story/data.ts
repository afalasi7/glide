import { buildRakRoadTrip, fmt, runShockAbsorber, type ToolResult, type Violation } from "@/lib/agent";

/** Strip the Day N prefix so clocks can sit large in the UI. */
export const clock = (t: string) => t.replace(/^Day \d • /, "");

/** Look up a solver tool result without throwing when the tool never ran. */
export function findToolResult(results: readonly ToolResult[], name: string): ToolResult | undefined {
  return results.find((t) => t.tool === name);
}

/** Prefer the sunset constraint by id, then by arrive_before kind — never by index. */
export function findSunsetViolation(violations: readonly Violation[]): Violation | undefined {
  return (
    violations.find((v) => v.constraintId === "jais-sunset") ??
    violations.find((v) => v.kind === "arrive_before")
  );
}

/** The +75 story is computed by the real solver, so every time on the page is the engine's own output. */
const base = buildRakRoadTrip();
const r = runShockAbsorber(base, 75);
const b = r.broken.timings;
const h = r.healed.timings;
const sunset = findSunsetViolation(r.broken.violations);
const toolMs = (name: string) => findToolResult(r.toolResults, name)?.latencyMs ?? 0;

export const CHAPTERS = [
  {
    key: "plan",
    photo: "/images/hd/traffic_road.jpg",
    place: "Dubai → Ras Al Khaimah",
    time: fmt(base.nodes.depart.earliestStart ?? 0),
    was: "",
    problem: "Your route, mountain stop, hotel and dinner are all part of one trip.",
    fix: "Glide connects the timings and details so every stop fits the whole journey.",
  },
  {
    key: "depart",
    photo: "/images/hd/traffic_road.jpg",
    place: "Dubai Marina",
    time: fmt(h.depart.startAt),
    was: "15:00",
    problem: "You leave 75 minutes late, straight into Friday-evening traffic.",
    fix: "Glide checks the rest of your itinerary and reshapes the day around what still matters.",
  },
  {
    key: "jais",
    photo: "/images/hd/jebel_jais_sunset.jpg",
    place: "Jebel Jais Viewing Deck",
    time: clock(fmt(h.jais.startAt)),
    was: fmt(b.jais.arriveAt - 75),
    problem: sunset
      ? `You would arrive at ${fmt(b.jais.arriveAt)}, ${sunset.overByMin} minutes after the sun is gone.`
      : `You would arrive at ${fmt(b.jais.arriveAt)}, after the sun is gone.`,
    fix: "Moved to tomorrow morning, when the road and the light are both better.",
  },
  {
    key: "hotel",
    photo: "/images/hd/ic_rak_resort.jpg",
    place: "InterContinental RAK",
    time: fmt(h.hotel.arriveAt),
    was: fmt(base.nodes.hotel.bookedArriveAt ?? 0),
    problem: "Check-in slips an hour and nobody at the desk knows.",
    fix: "The hotel is told your new arrival and your mobile key is already on your phone.",
  },
  {
    key: "dinner",
    photo: "/images/hd/levant_nar_dining.jpg",
    place: "Levant & Nar",
    time: fmt(h.dinner.startAt),
    was: "20:00",
    problem: "The table is held for 15 minutes. You would be 30 minutes too late.",
    fix: "Re-booked for the first seating after you have had time to settle in. No fee.",
  },
] as const;

export const TICKETS = [
  { tool: "resequence_node", title: "Fits the stops to your trip", result: "Day 2 · 08:30", photo: "/images/hd/jebel_jais_sunset.jpg", ms: toolMs("resequence_node") },
  { tool: "modify_dining_reservation", title: "Moves your reservation", result: "21:15 · no fee", photo: "/images/hd/levant_nar_dining.jpg", ms: toolMs("modify_dining_reservation") },
  { tool: "flag_hotel_late_arrival", title: "Updates your hotel", result: "Key ready", photo: "/images/hd/ic_rak_resort.jpg", ms: toolMs("flag_hotel_late_arrival") },
] as const;

export const TIMES = {
  dinner: clock(fmt(h.dinner.startAt)),
  hotel: clock(fmt(h.hotel.arriveAt)),
  /** Booked hotel arrival from the scenario graph — single source for original check-in copy. */
  hotelBooked: clock(fmt(base.nodes.hotel.bookedArriveAt ?? 0)),
};
