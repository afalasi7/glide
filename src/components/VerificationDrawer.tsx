"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Sun,
  Key,
  Smartphone,
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
        return <UtensilsCrossed className="h-4 w-4 text-neutral-800" />;
      case "summit":
        return <Sun className="h-4 w-4 text-amber-600" />;
      case "hotel":
        return <Key className="h-4 w-4 text-emerald-700" />;
      case "transit":
        return <Smartphone className="h-4 w-4 text-blue-700" />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm transition-all">
      <div className="relative max-h-[85%] w-full overflow-hidden rounded-t-[32px] border-t border-neutral-200 bg-white p-5 shadow-2xl flex flex-col">
        {/* iOS Drag Handle */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-300 mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Autonomous Verification Links
              </h4>
              <p className="text-[10px] text-neutral-500">
                4/4 Authenticated Provider Links Verified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-200"
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
                className={`cursor-pointer rounded-2xl border p-3 transition ${
                  isExpanded
                    ? "border-neutral-300 bg-neutral-50"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        Link #{index + 1}: {item.linkTitle}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {item.referenceId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      VERIFIED
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-neutral-700 font-medium">
                  {item.actionSummary}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-neutral-200 space-y-2 text-[10px]">
                    <p className="text-neutral-600 leading-relaxed">
                      {item.details}
                    </p>
                    <div className="flex items-center justify-between font-mono text-neutral-600 rounded-lg bg-neutral-100 p-2 border border-neutral-200">
                      <span className="flex items-center gap-1 text-neutral-500">
                        <Lock className="h-3 w-3 text-neutral-700" />
                        Auth Token: {item.secureToken}
                      </span>
                      <span className="text-emerald-800 font-bold">
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
