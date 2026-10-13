import type { StopType } from "../types";

/** Absolute minutes since Day 1 00:00. Day 2 08:30 = 1440 + 510. */
export type Minutes = number;

export const DAY = 1440;

export const at = (hour: number, minute = 0, day = 1): Minutes =>
  (day - 1) * DAY + hour * 60 + minute;

export const dayOf = (t: Minutes): number => Math.floor(t / DAY) + 1;

export function fmt(t: Minutes): string {
  const m = ((t % DAY) + DAY) % DAY;
  const hhmm = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return dayOf(t) > 1 ? `Day ${dayOf(t)} • ${hhmm}` : hhmm;
}

/** Extra drive time when leaving inside a minutes-of-day window (e.g. Friday evening E311). */
export interface PeakTraffic {
  fromMinuteOfDay: number;
  toMinuteOfDay: number;
  extraMin: number;
}

export interface Leg {
  travelMin: number;
  peak?: PeakTraffic;
}

export type Constraint =
  | {
      id: string;
      kind: "arrive_before";
      /** Hard deadline for arrival (e.g. sunset). */
      deadline: Minutes;
      label: string;
    }
  | {
      id: string;
      kind: "reservation_hold";
      /** Booked table time. Arrivals before it wait; arrivals after reservedAt + holdMin forfeit the table. */
      reservedAt: Minutes;
      holdMin: number;
      /** Latest seating the kitchen accepts. */
      lastSeatAt: Minutes;
      bookingRef: string;
      label: string;
    }
  | {
      id: string;
      kind: "min_gap_after";
      /** Soft rule: this node may not start until `gapMin` after arriving at `afterNodeId` (e.g. hotel settle-in). */
      afterNodeId: string;
      gapMin: number;
      label: string;
    };

export interface TripNode {
  id: string;
  label: string;
  kind: StopType;
  dwellMin: number;
  /** The node cannot start before this (departure time, table time, Day 2 slot). */
  earliestStart?: Minutes;
  constraints: Constraint[];
  /** If set, a hard-deadline conflict may be repaired by moving this node to the next day at this slot. */
  movableToNextDayAt?: number; // minutes-of-day
  /** Arrival the external provider (hotel PMS) was originally told. */
  bookedArriveAt?: Minutes;
  bookingRef?: string;
}

export interface TripEdge extends Leg {
  from: string;
  to: string;
}

export interface TripGraph {
  nodes: Record<string, TripNode>;
  edges: TripEdge[];
  /** Drive times between any pair of nodes, keyed `from>to`; used when rewiring after a resequence. */
  travel: Record<string, Leg>;
  rootId: string;
}

export interface NodeTiming {
  arriveAt: Minutes;
  startAt: Minutes;
  leaveAt: Minutes;
  /** Smallest remaining margin across hard constraints; negative = violated. */
  slackMin: number | null;
  /** Margin on soft rules (settle-in); negative = violated. */
  softSlackMin: number | null;
}

export interface Violation {
  nodeId: string;
  constraintId: string;
  kind: Constraint["kind"];
  overByMin: number;
  message: string;
}

export interface Evaluation {
  order: string[];
  timings: Record<string, NodeTiming>;
  violations: Violation[];
}

export function legMinutes(leg: Leg, leaveAt: Minutes): number {
  if (!leg.peak) return leg.travelMin;
  const m = ((leaveAt % DAY) + DAY) % DAY;
  const inPeak = m >= leg.peak.fromMinuteOfDay && m < leg.peak.toMinuteOfDay;
  return leg.travelMin + (inPeak ? leg.peak.extraMin : 0);
}

export const clone = <T>(v: T): T => structuredClone(v);

export function topoOrder(g: TripGraph): string[] {
  const indeg: Record<string, number> = {};
  for (const id of Object.keys(g.nodes)) indeg[id] = 0;
  for (const e of g.edges) indeg[e.to]++;
  const queue = Object.keys(indeg).filter((id) => indeg[id] === 0);
  const out: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    out.push(id);
    for (const e of g.edges) {
      if (e.from === id && --indeg[e.to] === 0) queue.push(e.to);
    }
  }
  if (out.length !== Object.keys(g.nodes).length) {
    throw new Error("Itinerary graph contains a cycle");
  }
  return out;
}

/** Critical-path propagation: arrival = max over predecessors of (their leave + travel). */
export function evaluate(g: TripGraph): Evaluation {
  const order = topoOrder(g);
  const timings: Record<string, NodeTiming> = {};
  const violations: Violation[] = [];

  for (const id of order) {
    const node = g.nodes[id];
    const preds = g.edges.filter((e) => e.to === id);
    const arriveAt = preds.length
      ? Math.max(...preds.map((e) => timings[e.from].leaveAt + legMinutes(e, timings[e.from].leaveAt)))
      : node.earliestStart ?? 0;
    const startAt = Math.max(arriveAt, node.earliestStart ?? -Infinity);
    let slack: number | null = null;
    let softSlack: number | null = null;
    const note = (s: number) => (slack = slack === null ? s : Math.min(slack, s));
    const noteSoft = (s: number) => (softSlack = softSlack === null ? s : Math.min(softSlack, s));

    for (const c of node.constraints) {
      if (c.kind === "arrive_before") {
        const s = c.deadline - arriveAt;
        note(s);
        if (s < 0) {
          violations.push({
            nodeId: id,
            constraintId: c.id,
            kind: c.kind,
            overByMin: -s,
            message: `${node.label}: arrival ${fmt(arriveAt)} is ${-s}m past ${c.label} (${fmt(c.deadline)})`,
          });
        }
      } else if (c.kind === "min_gap_after") {
        const anchor = timings[c.afterNodeId];
        if (!anchor) continue;
        const s = startAt - (anchor.arriveAt + c.gapMin);
        noteSoft(s);
        if (s < 0) {
          violations.push({
            nodeId: id,
            constraintId: c.id,
            kind: c.kind,
            overByMin: -s,
            message: `${node.label}: only ${c.gapMin + s}m after ${g.nodes[c.afterNodeId].label} arrival; ${c.label} needs ${c.gapMin}m`,
          });
        }
      } else {
        const holdUntil = c.reservedAt + c.holdMin;
        const s = holdUntil - arriveAt;
        note(s);
        if (s < 0) {
          violations.push({
            nodeId: id,
            constraintId: c.id,
            kind: c.kind,
            overByMin: -s,
            message: `${node.label}: arrival ${fmt(arriveAt)} is ${-s}m past the ${c.holdMin}-min table hold (${fmt(holdUntil)})`,
          });
        }
      }
    }
    timings[id] = { arriveAt, startAt, leaveAt: startAt + node.dwellMin, slackMin: slack, softSlackMin: softSlack };
  }
  return { order, timings, violations };
}

/** Shift the departure; every downstream time follows via propagation. */
export function applyDelay(g: TripGraph, delayMin: number): TripGraph {
  const next = clone(g);
  const root = next.nodes[next.rootId];
  root.earliestStart = (root.earliestStart ?? 0) + delayMin;
  return next;
}

const pairTravel = (g: TripGraph, a: string, b: string): Leg | undefined =>
  g.travel[`${a}>${b}`];

/**
 * Pull a node out of the chain, reconnect its neighbours with direct drive times,
 * and re-attach it after the last remaining stop on the next day. Returns null if
 * the travel matrix cannot support the rewiring.
 */
export function resequenceToNextDay(g: TripGraph, nodeId: string): TripGraph | null {
  const node = g.nodes[nodeId];
  if (node?.movableToNextDayAt === undefined) return null;
  const next = clone(g);
  const preds = next.edges.filter((e) => e.to === nodeId);
  const succs = next.edges.filter((e) => e.from === nodeId);
  next.edges = next.edges.filter((e) => e.from !== nodeId && e.to !== nodeId);

  for (const p of preds) {
    for (const s of succs) {
      const leg = pairTravel(next, p.from, s.to) ?? { travelMin: p.travelMin + s.travelMin };
      next.edges.push({ from: p.from, to: s.to, ...leg });
    }
  }

  const sinks = Object.keys(next.nodes).filter(
    (id) => id !== nodeId && !next.edges.some((e) => e.from === id),
  );
  for (const sink of sinks) {
    const leg = pairTravel(next, sink, nodeId);
    if (!leg) return null;
    next.edges.push({ from: sink, to: nodeId, ...leg });
  }

  const moved = next.nodes[nodeId];
  moved.earliestStart = at(0, moved.movableToNextDayAt!, 2);
  moved.constraints = moved.constraints.map((c) =>
    c.kind === "arrive_before" ? { ...c, deadline: c.deadline + DAY } : c,
  );
  moved.movableToNextDayAt = undefined; // one move only
  return next;
}

export function retimeReservation(g: TripGraph, nodeId: string, newTime: Minutes): TripGraph | null {
  const next = clone(g);
  const node = next.nodes[nodeId];
  const c = node?.constraints.find((k) => k.kind === "reservation_hold");
  if (!c || c.kind !== "reservation_hold" || newTime > c.lastSeatAt) return null;
  c.reservedAt = newTime;
  node.earliestStart = newTime;
  return next;
}
