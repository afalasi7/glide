import { StopStatus, StopType } from "./types";

export interface MobileVerificationItem {
  id: string;
  linkTitle: string;
  provider: string;
  referenceId: string;
  actionSummary: string;
  targetTime: string;
  status: "verified" | "pending" | "processing";
  verifiedAt: string;
  category: "dining" | "summit" | "hotel" | "transit";
  details: string;
  secureToken: string;
}

export const VERIFICATION_LINKS: MobileVerificationItem[] = [
  {
    id: "verif-1",
    linkTitle: "SevenRooms VIP Dining Link",
    provider: "SevenRooms API v4",
    referenceId: "#SR-994182-MOD",
    actionSummary: "Levant & Nar table shifted to 21:15 (Outdoor Terrace #14)",
    targetTime: "21:15 Confirmed",
    status: "verified",
    verifiedAt: "13:28:44 GST",
    category: "dining",
    details: "Zero cancellation penalty applied. Kitchen buffer verified (+75m before 22:30 kitchen cutoff).",
    secureToken: "7R-SEC-A994B",
  },
  {
    id: "verif-2",
    linkTitle: "Jebel Jais Summit Pass Link",
    provider: "RAK Tourism Board & Toroverde",
    referenceId: "#JJ-SUMMIT-0830",
    actionSummary: "Resequenced to Day 2 • 08:30 AM (Morning Viewpoint)",
    targetTime: "Day 2 • 08:30 AM",
    status: "verified",
    verifiedAt: "13:28:45 GST",
    category: "summit",
    details: "Sunset violation bypassed. Reissued for clear morning peak light with zero mountain haze.",
    secureToken: "JJ-TORO-8821C",
  },
  {
    id: "verif-3",
    linkTitle: "InterContinental RAK PMS Link",
    provider: "Cloudbeds PMS Enterprise",
    referenceId: "#IC-RAK-4089-VIP",
    actionSummary: "Guaranteed Late Arrival Window flagged (20:00 Window)",
    targetTime: "18:35 - 20:00 Window",
    status: "verified",
    verifiedAt: "13:28:46 GST",
    category: "hotel",
    details: "Mobile Digital Room Key pre-dispatched. Ocean Terrace Suite hold secured past standard 18:00 cutoff.",
    secureToken: "IHG-CB-4089X",
  },
  {
    id: "verif-4",
    linkTitle: "Apple & Google Wallet Sync Link",
    provider: "Apple PassKit & Google Pay",
    referenceId: "#WLT-DXB-99120",
    actionSummary: "Live passes updated silently on Dynamic Island & Lock Screen",
    targetTime: "Synced Across Devices",
    status: "verified",
    verifiedAt: "13:28:47 GST",
    category: "transit",
    details: "Push notifications suppressed in driving focus mode; haptic confirmation delivered to smartwatch.",
    secureToken: "APL-PK-SYNC0",
  },
];
