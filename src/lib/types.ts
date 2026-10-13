export type StopStatus = "normal" | "warning" | "conflict" | "healed";

export type StopType = "departure" | "scenic" | "hotel" | "dining";

export interface ItineraryStop {
  id: string;
  order: number;
  originalTime: string;
  currentTime: string;
  title: string;
  location: string;
  type: StopType;
  tag: string;
  status: StopStatus;
  statusMessage?: string;
  bufferMinutes: number; // positive = healthy buffer, negative = delay/deficit
  bufferText: string;
  constraint: {
    type: "hard" | "flexible";
    description: string;
    cutoff?: string;
    referenceCode?: string;
    provider?: string;
  };
  durationMin: number;
  driveTimeFromPrevMin: number;
  iconName: string;
  isRescheduled?: boolean;
  rescheduledLabel?: string;
  day?: 1 | 2;
  passDetails?: {
    venue: string;
    code: string;
    badge: string;
    time: string;
  };
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  type: "TRIGGER" | "PLANNER" | "TOOL_CALL" | "STATE" | "INFO";
  agent?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolStatus?: number;
  message: string;
  durationMs?: number;
}

export const INITIAL_STOPS: ItineraryStop[] = [
  {
    id: "stop-1",
    order: 1,
    day: 1,
    originalTime: "15:00",
    currentTime: "15:00",
    title: "Depart Dubai Marina",
    location: "Dubai Marina, Dubai",
    type: "departure",
    tag: "Trip Origin",
    status: "normal",
    statusMessage: "On track",
    bufferMinutes: 0,
    bufferText: "Departure Hub",
    constraint: {
      type: "flexible",
      description: "Origin point",
    },
    durationMin: 0,
    driveTimeFromPrevMin: 0,
    iconName: "Compass",
  },
  {
    id: "stop-2",
    order: 2,
    day: 1,
    originalTime: "17:15",
    currentTime: "17:15",
    title: "Jebel Jais Viewing Deck",
    location: "Ras Al Khaimah Heights",
    type: "scenic",
    tag: "Sunset Golden Hour",
    status: "normal",
    statusMessage: "33m prior to sunset cutoff",
    bufferMinutes: 33,
    bufferText: "+33m buffer before sunset",
    constraint: {
      type: "hard",
      description: "Sunset hard constraint",
      cutoff: "17:48 cutoff (Sun sets behind Hajar mountains)",
    },
    durationMin: 60,
    driveTimeFromPrevMin: 135, // 2h 15m
    iconName: "Sun",
  },
  {
    id: "stop-3",
    order: 3,
    day: 1,
    originalTime: "18:45",
    currentTime: "18:45",
    title: "InterContinental RAK",
    location: "Mina Al Arab, Ras Al Khaimah",
    type: "hotel",
    tag: "Resort Check-in",
    status: "normal",
    statusMessage: "Flexible arrival window",
    bufferMinutes: 75,
    bufferText: "+75m arrival leeway",
    constraint: {
      type: "flexible",
      description: "Hotel check-in window",
      cutoff: "Flexible until 00:00 (Midnight)",
      referenceCode: "IC-RAK-4089",
      provider: "Cloudbeds PMS",
    },
    durationMin: 45,
    driveTimeFromPrevMin: 60,
    iconName: "Building2",
    passDetails: {
      venue: "InterContinental RAK Mina Al Arab",
      code: "IC-4089-RES",
      badge: "Ocean Terrace Suite",
      time: "Standard Check-in: 15:00 - 23:30",
    },
  },
  {
    id: "stop-4",
    order: 4,
    day: 1,
    originalTime: "20:00",
    currentTime: "20:00",
    title: "Levant & Nar (Dinner)",
    location: "InterContinental Promenade",
    type: "dining",
    tag: "Hard Reservation",
    status: "normal",
    statusMessage: "Confirmed table for 2",
    bufferMinutes: 30,
    bufferText: "+30m buffer to seating",
    constraint: {
      type: "hard",
      description: "Strict seating window (Kitchen closes 22:30)",
      cutoff: "15-min table hold policy",
      referenceCode: "SR-994182",
      provider: "SevenRooms VIP",
    },
    durationMin: 90,
    driveTimeFromPrevMin: 15,
    iconName: "UtensilsCrossed",
    passDetails: {
      venue: "Levant & Nar",
      code: "SR-994182",
      badge: "Confirmed Table #14",
      time: "20:00 (Original)",
    },
  },
];
