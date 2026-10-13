import {
  applyDelay, at, evaluate, fmt, resequenceToNextDay, retimeReservation,
  type Evaluation, type Minutes, type TripGraph, type Violation,
} from "./dag";
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
    if (node.kind !== "hotel" || node.bookedArriveAt === undefined || !node.bookingRef) continue;
    const eta = ev.timings[node.id].arriveAt;
    if (eta - node.bookedArriveAt >= GRID_MIN) {
      const args = { reservation: node.bookingRef, etaTime: hhmm(eta) };
      const result = executeTool(world, "flag_hotel_late_arrival", args);
      toolResults.push(result);
      changed = true;
      log({
        type: "TOOL_CALL", agent: "Hotel Agent", toolName: "flag_hotel_late_arrival",
        toolArgs: args, toolStatus: result.status, durationMs: result.latencyMs,
        message: `Notified ${node.label} of ${hhmm(eta)} arrival; mobile key pre-dispatched.`,
      });
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
