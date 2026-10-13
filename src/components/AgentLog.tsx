"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Cpu,
  Terminal,
} from "lucide-react";
import { AgentLogEntry } from "@/lib/types";

interface AgentLogProps {
  logs: AgentLogEntry[];
  isHealing: boolean;
  isHealed: boolean;
}

export const AgentTerminal: React.FC<AgentLogProps> = ({
  logs,
  isHealing,
  isHealed,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showTechnical, setShowTechnical] = useState(false);

  const toolCalls = logs.filter((l) => l.type === "TOOL_CALL");

  if (logs.length === 0 && !isHealing) {
    return null;
  }

  const getAgentColor = (agentName?: string) => {
    switch (agentName) {
      case "Route Agent":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Mountain Agent":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Dining Agent":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Hotel Agent":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "Wallet Agent":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-white/10 text-zinc-300 border-white/10";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121624] overflow-hidden shadow-lg">
      {/* Header / Accordion trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4.5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cpu className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Multi-Agent Coordination
            </h3>
            <p className="text-xs text-zinc-300">
              {isHealing
                ? "Agents coordinating route & venue changes..."
                : `${toolCalls.length} actions executed · 0 calls made`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHealed && (
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Complete
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Expandable list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 divide-y divide-white/5"
          >
            <div className="p-4 space-y-3">
              {logs.map((log) => {
                const isTool = log.type === "TOOL_CALL";
                const isState = log.type === "STATE";
                return (
                  <div key={log.id} className="space-y-1.5">
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="mt-0.5 shrink-0">
                        {isState ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        ) : isTool ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-zinc-300">
                            <Terminal className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {log.agent && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getAgentColor(
                                log.agent
                              )}`}
                            >
                              {log.agent}
                            </span>
                          )}
                          <span className={`font-medium leading-relaxed ${isState ? "text-emerald-300 font-bold" : "text-zinc-200"}`}>
                            {log.message}
                          </span>
                        </div>

                        {showTechnical && log.toolArgs && (
                          <pre className="mt-1.5 p-2 rounded-lg bg-black/60 text-[10px] font-mono text-zinc-300 overflow-x-auto border border-white/10">
                            {JSON.stringify(log.toolArgs, null, 2)}
                          </pre>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toggle technical payload view */}
            <div className="px-4 py-2.5 bg-black/30 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Zero human intervention required</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTechnical(!showTechnical);
                }}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {showTechnical ? "Hide API details" : "View API details"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
