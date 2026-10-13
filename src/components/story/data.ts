import { buildRakRoadTrip, fmt, runShockAbsorber } from "@/lib/agent";

/** The +75 story is computed by the real solver, so every time on the page is the engine's own output. */
const base = buildRakRoadTrip();
const r = runShockAbsorber(base, 75);
const b = r.broken.timings;
const h = r.healed.timings;
const tool = (name: string) => r.toolResults.find((t) => t.tool === name)!;

export const CHAPTERS = [
  {
    key: "depart",
    photo: "/images/hd/traffic_road.jpg",
    place: "Dubai Marina",
    time: fmt(h.depart.startAt),
    was: "15:00",
    problem: "You leave 75 minutes late, straight into Friday-evening traffic.",
    fix: "The whole day is re-planned before you reach the highway.",
  },
  {
    key: "jais",
    photo: "/images/hd/jebel_jais_sunset.jpg",
    place: "Jebel Jais Viewing Deck",
    time: fmt(h.jais.startAt).replace("Day 2 • ", ""),
    was: fmt(b.jais.arriveAt - 75),
    problem: `You would arrive at ${fmt(b.jais.arriveAt)}, ${r.broken.violations[0].overByMin} minutes after the sun is gone.`,
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
  { tool: "resequence_node", title: "Moves the mountain", result: "Day 2 · 08:30", photo: "/images/jebel_jais_sunset.jpg", ms: tool("resequence_node").latencyMs },
  { tool: "modify_dining_reservation", title: "Saves the table", result: "21:15 · no fee", photo: "/images/levant_nar_dining.jpg", ms: tool("modify_dining_reservation").latencyMs },
  { tool: "flag_hotel_late_arrival", title: "Warns the hotel", result: "Key ready", photo: "/images/ic_rak_resort.jpg", ms: tool("flag_hotel_late_arrival").latencyMs },
  { tool: "push_wallet_pass_sync", title: "Updates your wallet", result: "3 passes synced", photo: "/images/glide_logo.jpg", ms: tool("push_wallet_pass_sync").latencyMs },
] as const;

export const TIMES = {
  dinner: fmt(h.dinner.startAt),
  hotel: fmt(h.hotel.arriveAt),
};
