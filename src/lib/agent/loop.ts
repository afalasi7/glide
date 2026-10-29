import {
  applyDelay, at, evaluate, fmt, resequenceToNextDay, retimeReservation,
  type Evaluation, type Minutes, type TripGraph, type Violation,
} from "./dag";
import { SCENARIO_IDS } from "./scenario";
import { createMockWorld, executeTool, type MockWorld, type ToolName, type ToolResult } from "./tools";
import type { AgentLogEntry } from "../types";

/** Same shape the UI already consumes (id/timestamp are added at render time). */
export type AgentEvent = Omit<AgentLogEntry, "id" | "timestamp">;

/** What the planner wants done. An LLM may later phrase/format these; the solver decides them. */
export interface ToolCallProposal {
  agent: string;
  tool: ToolName;
  args: Record<string, unknown>;
  rationale: string;
  /** Pure graph transform applied only if the tool call succeeds. */
  apply: (g: TripGraph) => TripGraph | null;
}

export interface ShockAbsorberResult {
  delayMin: number;
  /** Plan after the delay, before any repair (what the traveller would experience unaided). */
  broken: Evaluation & { graph: TripGraph };
  /** Plan after the loop. */
  healed: Evaluation & { graph: TripGraph };
  unresolved: Violation[];
  toolResults: ToolResult[];
  events: AgentEvent[];
  world: MockWorld;
}

const MAX_ITERATIONS = 8;
const GRID_MIN = 15;
const hhmm = (t: Minutes) => fmt(t).replace(/^Day \d+ • /, "");

function proposeRepair(g: TripGraph, v: Violation, ev: Evaluation): ToolCallProposal | null {
  const node = g.nodes[v.nodeId];

  if (v.kind === "arrive_before" && node.movableToNextDayAt !== undefined) {
    const slot = hhmm(at(0, node.movableToNextDayAt, 2));
    return {
      agent: "Mountain Agent",
      tool: "resequence_node",
      args: { nodeId: node.id, day: 2, time: slot },
      rationale: `${node.label} cannot be reached before its cutoff; moving it to Day 2 ${slot}.`,
      apply: (graph) => resequenceToNextDay(graph, node.id),
    };
  }

  const hold = node.constraints.find((k) => k.kind === "reservation_hold");
  if ((v.kind === "reservation_hold" || v.kind === "min_gap_after") && hold?.kind === "reservation_hold") {
    const arrive = ev.timings[node.id].arriveAt;
    // Earliest seating that satisfies the table hold and every settle-in rule.
    let earliest = arrive;
    for (const k of node.constraints) {
      if (k.kind === "min_gap_after") {
        earliest = Math.max(earliest, ev.timings[k.afterNodeId].arriveAt + k.gapMin);
      }
    }
    const newTime = Math.ceil(earliest / GRID_MIN) * GRID_MIN;
    if (newTime > hold.lastSeatAt) return null;
    return {
      agent: "Dining Agent",
      tool: "modify_dining_reservation",
      args: { bookingRef: hold.bookingRef, newTime: hhmm(newTime) },
      rationale: `${node.label} moved to ${hhmm(newTime)}: earliest seating after arrival and the hotel settle-in buffer.`,
      apply: (graph) => retimeReservation(graph, node.id, newTime),
    };
  }

  // If the dinner node has a reservation_hold but an empty bookingRef, mint a real reference.
  if (v.kind === "reservation_hold" && hold?.kind === "reservation_hold" && !hold.bookingRef) {
    const arrive = ev.timings[node.id].arriveAt;
    let earliest = arrive;
    for (const k of node.constraints) {
      if (k.kind === "min_gap_after") {
        earliest = Math.max(earliest, ev.timings[k.afterNodeId].arriveAt + k.gapMin);
      }
    }
    const newTime = Math.ceil(earliest / GRID_MIN) * GRID_MIN;
    if (newTime > hold.lastSeatAt) return null;
    const reference = node.bookingRef || SCENARIO_IDS.dinnerBooking;
    return {
      agent: "Booking Agent",
      tool: "create_booking",
      args: {
        type: "dining",
        reference,
        details: { time: hhmm(newTime), party: "2", table: "Standard" },
      },
      rationale: `${node.label}: creating new dining reservation for ${hhmm(newTime)} party of 2.`,
      apply: (graph) => {
        const n = graph.nodes[node.id];
        if (!n) return graph;
        return {
          ...graph,
          nodes: {
            ...graph.nodes,
            [node.id]: {
              ...n,
              bookingRef: reference,
              constraints: n.constraints.map((c) =>
                c.kind === "reservation_hold" ? { ...c, bookingRef: reference } : c,
              ),
            },
          },
        };
      },
    };
  }

  // Hotel missing a bookingRef — create one with a valid ETA (minutes since day-1 midnight).
  if (v.kind === "arrive_before" && node.kind === "hotel" && !node.bookingRef) {
    const reference = SCENARIO_IDS.hotelBooking;
    // Was `?? 1800` which is Day 2 06:00, not 18:00. Default to 18:00 wall clock.
    const eta = hhmm(node.bookedArriveAt ?? at(18));
    return {
      agent: "Booking Agent",
      tool: "create_booking",
      args: { type: "hotel", reference, details: { etaTime: eta } },
      rationale: `${node.label}: creating hotel booking with expected arrival time.`,
      apply: (graph) => {
        const n = graph.nodes[node.id];
        if (!n) return graph;
        return {
          ...graph,
          nodes: {
            ...graph.nodes,
            [node.id]: { ...n, bookingRef: reference },
          },
        };
      },
    };
  }

  // If a dining reservation is causing an unresolvable conflict, cancel it
  if (v.kind === "reservation_hold" && node.bookingRef && hold?.kind !== "reservation_hold") {
    return {
      agent: "Booking Agent",
      tool: "cancel_booking",
      args: { bookingRef: node.bookingRef },
      rationale: `${node.label}: cancelling existing booking due to unresolvable conflict.`,
      apply: (_graph) => _graph,
    };
  }

  return null;
}

export function runShockAbsorber(
  base: TripGraph,
  delayMin: number,
  world: MockWorld = createMockWorld(),
): ShockAbsorberResult {
  const events: AgentEvent[] = [];
  const toolResults: ToolResult[] = [];
  const log = (e: AgentEvent) => events.push(e);

  let graph = applyDelay(base, delayMin);
  const brokenEval = evaluate(graph);
  const broken = { ...brokenEval, graph };
  let ev = brokenEval;

  if (delayMin > 0) {
    log({
      type: "TRIGGER",
      agent: "Route Agent",
      message: `Detected ${delayMin}-minute delay leaving ${base.nodes[base.rootId].label.replace("Depart ", "")}.`,
    });
  }

  const skipped = new Set<string>();
  const initialViolations = ev.violations;
  if (initialViolations.length) {
    log({
      type: "PLANNER",
      agent: "Planner Agent",
      message: `${initialViolations.length} conflict(s) found: ${initialViolations.map((v) => v.message).join("; ")}`,
    });
  }

  let changed = false;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const v = ev.violations.find((x) => !skipped.has(x.constraintId));
    if (!v) break;
    const proposal = proposeRepair(graph, v, ev);
    if (!proposal) {
      skipped.add(v.constraintId);
      log({ type: "INFO", agent: "Planner Agent", message: `No automatic repair for: ${v.message}` });
      continue;
    }
    const result = executeTool(world, proposal.tool, proposal.args);
    toolResults.push(result);
    log({
      type: "TOOL_CALL",
      agent: proposal.agent,
      toolName: proposal.tool,
      toolArgs: proposal.args,
      toolStatus: result.status,
      durationMs: result.latencyMs,
      message: result.ok ? proposal.rationale : `${proposal.tool} failed: ${result.error}`,
    });
    const nextGraph = result.ok ? proposal.apply(graph) : null;
    if (!nextGraph) {
      skipped.add(v.constraintId);
      continue;
    }
    graph = nextGraph;
    changed = true;
    const before = new Set(ev.violations.map((x) => x.constraintId));
    ev = evaluate(graph);
    const now = new Set(ev.violations.map((x) => x.constraintId));
    const cascaded = [...before].filter((id) => id !== v.constraintId && !now.has(id));
    if (cascaded.length) {
      log({
        type: "INFO",
        agent: "Planner Agent",
        message: `Downstream conflict(s) cleared by this change: ${cascaded.join(", ")}.`,
      });
    }
  }

  // Provider notifications derived from the final plan.
  for (const node of Object.values(graph.nodes)) {
    if (node.kind !== "hotel" || node.bookedArriveAt === undefined) continue;
    const eta = ev.timings[node.id].arriveAt;

    // Hotel present in the graph but missing a provider booking — mint one before flagging.
    if (!node.bookingRef) {
      const reference = SCENARIO_IDS.hotelBooking;
      const args = { type: "hotel", reference, details: { etaTime: hhmm(eta) } };
      const result = executeTool(world, "create_booking", args);
      toolResults.push(result);
      if (result.ok) {
        graph = {
          ...graph,
          nodes: {
            ...graph.nodes,
            [node.id]: { ...node, bookingRef: reference },
          },
        };
        changed = true;
        log({
          type: "TOOL_CALL", agent: "Booking Agent", toolName: "create_booking",
          toolArgs: args, toolStatus: result.status, durationMs: result.latencyMs,
          message: `Created hotel booking for ${node.label} with ${hhmm(eta)} ETA.`,
        });
      }
    }

    const booked = graph.nodes[node.id];
    if (!booked?.bookingRef || booked.bookedArriveAt === undefined) continue;
    if (eta - booked.bookedArriveAt >= GRID_MIN) {
      const args = { reservation: booked.bookingRef, etaTime: hhmm(eta) };
      const result = executeTool(world, "flag_hotel_late_arrival", args);
      toolResults.push(result);
      changed = true;
      log({
        type: "TOOL_CALL", agent: "Hotel Agent", toolName: "flag_hotel_late_arrival",
        toolArgs: args, toolStatus: result.status, durationMs: result.latencyMs,
        message: `Notified ${booked.label} of ${hhmm(eta)} arrival; mobile key pre-dispatched.`,
      });
    }
  }

  // Handle dining reservation creation or cancellation based on final state
  const diningNode = Object.values(graph.nodes).find((n) => n.kind === "dining");
  if (diningNode && diningNode.bookingRef) {
    const res = world.reservations[diningNode.bookingRef];
    // If reservation time is violated beyond repair, cancel it
    if (res && diningNode.earliestStart) {
      const eta = ev.timings[diningNode.id].arriveAt;
      if (eta - diningNode.earliestStart > 30) {
        const cancelArgs = { bookingRef: diningNode.bookingRef };
        const result = executeTool(world, "cancel_booking", cancelArgs);
        toolResults.push(result);
        changed = true;
        log({
          type: "TOOL_CALL", agent: "Booking Agent", toolName: "cancel_booking",
          toolArgs: cancelArgs, toolStatus: result.status, durationMs: result.latencyMs,
          message: `Cancelled dining reservation ${diningNode.bookingRef} due to schedule conflict.`,
        });
      }
    }
  }

  if (changed) {
    const args = {
      passIds: Object.keys(world.walletPasses),
      reason: "Itinerary re-planned after departure delay",
    };
    const result = executeTool(world, "push_wallet_pass_sync", args);
    toolResults.push(result);
    log({
      type: "TOOL_CALL", agent: "Wallet Agent", toolName: "push_wallet_pass_sync",
      toolArgs: args, toolStatus: result.status, durationMs: result.latencyMs,
      message: "Pushed updated passes to Apple Wallet.",
    });
  }

  log({
    type: "STATE",
    agent: "Glide Team",
    message: ev.violations.length
      ? `${ev.violations.length} conflict(s) still need the traveller.`
      : changed ? "Trip protected. All constraints satisfied. Zero phone calls made." : "On track. No action needed.",
  });

  return {
    delayMin,
    broken,
    healed: { ...ev, graph },
    unresolved: ev.violations,
    toolResults,
    events,
    world,
  };
}
