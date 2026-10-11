"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { AgentLogEntry } from "@/lib/types";

interface AgentTerminalProps {
  logs: AgentLogEntry[];
  isHealing: boolean;
  isHealed: boolean;
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({
  logs,
  isHealing,
  isHealed,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AgentLogEntry | null>(null);

  const getLogBadge = (type: AgentLogEntry["type"]) => {
    switch (type) {
      case "TRIGGER":
        return (
          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/30">
            [TRIGGER]
          </span>
        );
      case "PLANNER":
        return (
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
            [PLANNER]
          </span>
        );
      case "TOOL_CALL":
        return (
          <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
            [TOOL CALL]
          </span>
        );
      case "STATE":
        return (
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
            [STATE]
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
            [INFO]
          </span>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-950/60 bg-[#070b13] shadow-2xl transition-all">
      {/* Console Drawer Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 select-none hover:bg-slate-900/60 transition"
      >
        <div className="flex items-center gap-3">
          {/* Terminal Dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-2 pl-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              Agentic Reasoning & Tool Execution Terminal
            </span>
          </div>

          {/* Active status pulse */}
          {isHealing ? (
            <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300 animate-pulse">
              <Zap className="h-3 w-3 animate-spin" />
              RUNNING_SOLVER
            </span>
          ) : isHealed ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              CONVERGED_200_OK
            </span>
          ) : (
            <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-400">
              IDLE_LISTENER
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500">
            {logs.length} events logged
          </span>
          <button className="text-slate-400 hover:text-white">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4"
          >
            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                &gt; Awaiting delay injection... Trigger the simulator above to observe
                autonomous graph solving and API tool calls.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 font-mono text-xs scrollbar-thin">
                {logs.map((log) => {
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group rounded-xl border p-3 transition ${
                        log.type === "TOOL_CALL"
                          ? "border-cyan-900/40 bg-cyan-950/20 hover:border-cyan-700/60"
                          : log.type === "TRIGGER"
                          ? "border-rose-900/40 bg-rose-950/20 hover:border-rose-700/60"
                          : log.type === "PLANNER"
                          ? "border-amber-900/40 bg-amber-950/20 hover:border-amber-700/60"
                          : "border-emerald-900/40 bg-emerald-950/20 hover:border-emerald-700/60"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">
                            {log.timestamp}
                          </span>
                          {getLogBadge(log.type)}
                          {log.toolName && (
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                              `{log.toolName}()`
                            </span>
                          )}
                        </div>

                        {log.toolStatus && (
                          <div className="flex items-center gap-2">
                            {log.durationMs && (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.durationMs}ms
                              </span>
                            )}
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              HTTP {log.toolStatus} OK
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-slate-300 font-sans text-xs leading-relaxed">
                        {log.message}
                      </p>

                      {/* Tool Call Payload Preview */}
                      {log.toolArgs && (
                        <div className="mt-2 rounded-lg bg-slate-950/90 p-2.5 border border-slate-900 font-mono text-[11px] text-cyan-300/90 overflow-x-auto">
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                            Dispatched JSON Payload:
                          </div>
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.toolArgs, null, 2)}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
