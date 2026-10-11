"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Key,
  UtensilsCrossed,
  Sun,
  Smartphone,
  Lock,
} from "lucide-react";
import { VERIFICATION_LINKS, MobileVerificationItem } from "@/lib/verifications";

interface VerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isHealed: boolean;
}

export const VerificationDrawer: React.FC<VerificationDrawerProps> = ({
  isOpen,
  onClose,
  isHealed,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>("verif-1");

  if (!isOpen) return null;

  const getCategoryIcon = (category: MobileVerificationItem["category"]) => {
    switch (category) {
      case "dining":
        return <UtensilsCrossed className="h-4 w-4 text-cyan-400" />;
      case "summit":
        return <Sun className="h-4 w-4 text-amber-400" />;
      case "hotel":
        return <Key className="h-4 w-4 text-emerald-400" />;
      case "transit":
        return <Smartphone className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="relative max-h-[85%] w-full overflow-hidden rounded-t-[32px] border-t border-cyan-500/30 bg-[#0B101D] p-5 shadow-2xl flex flex-col">
        {/* Drag handle */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-700/80 mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Autonomous Verification Links
              </h4>
              <p className="text-[10px] text-slate-400">
                4/4 Authenticated Provider Links Verified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
          >
            Done
          </button>
        </div>

        {/* 4 Verification Links list */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
          {VERIFICATION_LINKS.map((item, index) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                  isExpanded
                    ? "border-cyan-500/40 bg-cyan-950/20"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Link #{index + 1}: {item.linkTitle}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.referenceId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      VERIFIED
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-300 font-medium">
                  {item.actionSummary}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2 text-[10px]">
                    <p className="text-slate-400 leading-relaxed">
                      {item.details}
                    </p>
                    <div className="flex items-center justify-between font-mono text-slate-400 rounded-lg bg-slate-950/80 p-2 border border-slate-800">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Lock className="h-3 w-3 text-cyan-400" />
                        Auth Token: {item.secureToken}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {item.verifiedAt}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
