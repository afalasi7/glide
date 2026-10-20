/**
 * Mock external tool layer. Each tool validates its arguments and returns an HTTP-style
 * result, as the real SevenRooms / Cloudbeds / Apple Wallet clients will. State lives in
 * a MockWorld so repeated calls are idempotent and inspectable by tests.
 */

import { scenarioHotelBookedArrive } from "./scenario";

export type ToolName =
  | "resequence_node"
  | "modify_dining_reservation"
  | "flag_hotel_late_arrival"
  | "push_wallet_pass_sync";

export interface ToolResult {
  tool: ToolName;
  args: Record<string, unknown>;
  status: 200 | 400 | 404 | 409;
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
  /** Deterministic simulated latency; no real waiting. */
  latencyMs: number;
}

export interface MockWorld {
  reservations: Record<string, { time: string; table: string; party: number; feeCents: number; revision: number }>;
  hotelBookings: Record<string, { etaTime: string; mobileKeyDispatched: boolean; status: "expected" | "late_flagged" }>;
  walletPasses: Record<string, { revision: number; lastReason: string }>;
  itineraryMoves: Record<string, { day: number; time: string }>;
}

export function createMockWorld(): MockWorld {
  const hotelEta = scenarioHotelBookedArrive();
  return {
    reservations: { "SR-994182": { time: "20:00", table: "Terrace #14", party: 2, feeCents: 0, revision: 0 } },
    hotelBookings: { "IC-RAK-4089": { etaTime: hotelEta, mobileKeyDispatched: false, status: "expected" } },
    walletPasses: {
      "apple:SR-994182": { revision: 0, lastReason: "" },
      "apple:IC-RAK-4089": { revision: 0, lastReason: "" },
    },
    itineraryMoves: {},
  };
}

const LATENCY: Record<ToolName, number> = {
  resequence_node: 380,
  modify_dining_reservation: 520,
  flag_hotel_late_arrival: 310,
  push_wallet_pass_sync: 250,
};

const TIME_RE = /^\d{2}:\d{2}$/;
const str = (v: unknown): v is string => typeof v === "string" && v.length > 0;

export function executeTool(world: MockWorld, tool: ToolName, args: Record<string, unknown>): ToolResult {
  const fail = (status: 400 | 404 | 409, error: string): ToolResult => ({
    tool, args, status, ok: false, error, latencyMs: LATENCY[tool],
  });
  const ok = (data: Record<string, unknown>): ToolResult => ({
    tool, args, status: 200, ok: true, data, latencyMs: LATENCY[tool],
  });

  switch (tool) {
    case "resequence_node": {
      const { nodeId, day, time } = args;
      if (!str(nodeId) || typeof day !== "number" || !str(time) || !TIME_RE.test(time)) {
        return fail(400, "resequence_node requires nodeId, day (number), time (HH:MM)");
      }
      world.itineraryMoves[nodeId] = { day, time };
      return ok({ nodeId, day, time });
    }

    case "modify_dining_reservation": {
      const { bookingRef, newTime } = args;
      if (!str(bookingRef) || !str(newTime) || !TIME_RE.test(newTime)) {
        return fail(400, "modify_dining_reservation requires bookingRef and newTime (HH:MM)");
      }
      const r = world.reservations[bookingRef];
      if (!r) return fail(404, `Unknown booking ${bookingRef}`);
      if (r.time === newTime) return fail(409, "Reservation already at requested time");
      r.time = newTime;
      r.revision += 1;
      r.feeCents = 0; // modification inside policy window: no penalty
      return ok({ confirmation: `${bookingRef}-MOD`, time: newTime, table: r.table, feeCents: 0 });
    }

    case "flag_hotel_late_arrival": {
      const { reservation, etaTime } = args;
      if (!str(reservation) || !str(etaTime) || !TIME_RE.test(etaTime)) {
        return fail(400, "flag_hotel_late_arrival requires reservation and etaTime (HH:MM)");
      }
      const b = world.hotelBookings[reservation];
      if (!b) return fail(404, `Unknown reservation ${reservation}`);
      b.etaTime = etaTime;
      b.status = "late_flagged";
      b.mobileKeyDispatched = true;
      return ok({ reservation, etaTime, roomHeld: true, mobileKeyDispatched: true });
    }

    case "push_wallet_pass_sync": {
      const { passIds, reason } = args;
      if (!Array.isArray(passIds) || passIds.length === 0 || !passIds.every(str) || !str(reason)) {
        return fail(400, "push_wallet_pass_sync requires non-empty passIds[] and reason");
      }
      const unknown = passIds.filter((p) => !world.walletPasses[p]);
      if (unknown.length) return fail(404, `Unknown pass(es): ${unknown.join(", ")}`);
      for (const p of passIds) {
        world.walletPasses[p].revision += 1;
        world.walletPasses[p].lastReason = reason;
      }
      return ok({ updated: passIds, silent: true });
    }
  }
}
