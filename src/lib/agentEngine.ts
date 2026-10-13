import { ItineraryStop, AgentLogEntry, INITIAL_STOPS } from "./types";

export interface SimulationState {
  delayMinutes: number;
  stops: ItineraryStop[];
  logs: AgentLogEntry[];
  isHealing: boolean;
  isHealed: boolean;
  activeToolIndex: number | null;
  walletSynced: boolean;
  lastSyncTime: string | null;
  selectedDelayPreset: number | null;
}

// Calculate stop times based on delay minutes before shock absorber runs
export function calculateDelayedStops(delayMinutes: number): ItineraryStop[] {
  if (delayMinutes === 0) {
    return INITIAL_STOPS.map((s) => ({ ...s }));
  }

  // Base departure is 15:00 (900 minutes from 00:00)
  const baseMinutes = 15 * 60; // 900
  const departureMins = baseMinutes + delayMinutes;

  // Format minutes into HH:MM
  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const stops = JSON.parse(JSON.stringify(INITIAL_STOPS)) as ItineraryStop[];

  // Stop 1: Departure
  stops[0].currentTime = formatTime(departureMins);
  stops[0].status = delayMinutes > 0 ? "warning" : "normal";
  stops[0].statusMessage = `Running ${delayMinutes} min behind schedule`;
  stops[0].bufferText = `Departing ${formatTime(departureMins)}`;

  // Stop 2: Jebel Jais
  // Travel time 135 mins (2h 15m)
  const jaisArrival = departureMins + 135;
  stops[1].currentTime = formatTime(jaisArrival);
  // Sunset cutoff is 17:48
  const sunsetCutoff = 17 * 60 + 48;
  const jaisBuffer = sunsetCutoff - jaisArrival;

  if (jaisArrival > sunsetCutoff) {
    stops[1].status = "conflict";
    stops[1].bufferMinutes = jaisBuffer;
    stops[1].statusMessage = `Arriving after dark (${formatTime(jaisArrival)}). Sunset is at 5:48 PM.`;
    stops[1].bufferText = `Sunset missed`;
  } else if (jaisBuffer < 20) {
    stops[1].status = "warning";
    stops[1].bufferMinutes = jaisBuffer;
    stops[1].statusMessage = `Tight margin: only ${jaisBuffer}m before sunset`;
    stops[1].bufferText = `+${jaisBuffer}m margin`;
  } else {
    stops[1].status = "normal";
    stops[1].bufferMinutes = jaisBuffer;
    stops[1].bufferText = `+${jaisBuffer}m before sunset`;
  }

  // Stop 3: InterContinental RAK
  const icArrival = jaisArrival + 60 + 60;
  stops[2].currentTime = formatTime(icArrival);
  if (icArrival > 20 * 60) {
    stops[2].status = "warning";
    stops[2].statusMessage = `Arriving at ${formatTime(icArrival)}, risking your 8:00 PM dinner`;
    stops[2].bufferText = `Late check-in`;
  } else {
    stops[2].status = "normal";
    stops[2].statusMessage = "On schedule for check-in";
    stops[2].bufferText = `ETA ${formatTime(icArrival)}`;
  }

  // Stop 4: Levant & Nar Dinner
  const dinnerEarliest = icArrival + 45;
  stops[3].currentTime = formatTime(Math.max(20 * 60, dinnerEarliest));
  if (dinnerEarliest > 20 * 60 + 15) {
    stops[3].status = "conflict";
    stops[3].statusMessage = `Table forfeited. Restaurant holds tables for 15 minutes only.`;
    stops[3].bufferText = `Reservation lost`;
  } else {
    stops[3].status = "normal";
    stops[3].bufferText = `On time for dinner`;
  }

  return stops;
}

// Generate the autonomous healed itinerary
export function getHealedStops(delayMinutes: number): ItineraryStop[] {
  return [
    {
      id: "stop-1",
      order: 1,
      day: 1,
      originalTime: "15:00",
      currentTime: "16:15",
      title: "Depart Dubai Marina",
      location: "Dubai Marina, Dubai",
      type: "departure",
      tag: "Departed 4:15 PM",
      status: "healed",
      statusMessage: "Departed 75 minutes late. Route recalculated.",
      bufferMinutes: 0,
      bufferText: "Underway",
      constraint: {
        type: "flexible",
        description: "Direct highway route via E311",
      },
      durationMin: 0,
      driveTimeFromPrevMin: 0,
      iconName: "Compass",
    },
    {
      id: "stop-3",
      order: 2,
      day: 1,
      originalTime: "18:45",
      currentTime: "18:35",
      title: "InterContinental RAK",
      location: "Mina Al Arab, Ras Al Khaimah",
      type: "hotel",
      tag: "Direct Check-in",
      status: "healed",
      statusMessage: "Heading straight to hotel. Late arrival confirmed & digital key ready.",
      bufferMinutes: 85,
      bufferText: "Mobile key ready",
      constraint: {
        type: "flexible",
        description: "Hotel notified of late arrival. Room held.",
        cutoff: "Arrival confirmed for 18:35",
        referenceCode: "IC-RAK-4089",
        provider: "Cloudbeds",
      },
      durationMin: 60,
      driveTimeFromPrevMin: 140,
      iconName: "Building2",
      passDetails: {
        venue: "InterContinental RAK Mina Al Arab",
        code: "IC-4089-RES",
        badge: "Late Arrival Confirmed • Key Ready",
        time: "Arrival Window: 18:35",
      },
    },
    {
      id: "stop-4",
      order: 3,
      day: 1,
      originalTime: "20:00",
      currentTime: "21:15",
      title: "Levant & Nar Dinner",
      location: "InterContinental Promenade",
      type: "dining",
      tag: "Moved to 9:15 PM",
      status: "healed",
      statusMessage: "Dinner moved from 8:00 PM to 9:15 PM. Table #14 confirmed, 0 fees.",
      bufferMinutes: 45,
      bufferText: "Table saved",
      constraint: {
        type: "hard",
        description: "Rescheduled via SevenRooms with zero cancellation penalty",
        cutoff: "Kitchen open until 10:30 PM",
        referenceCode: "SR-994182-MOD",
        provider: "SevenRooms",
      },
      durationMin: 75,
      driveTimeFromPrevMin: 10,
      iconName: "UtensilsCrossed",
      isRescheduled: true,
      rescheduledLabel: "Shifted to 9:15 PM",
      passDetails: {
        venue: "Levant & Nar Promenade",
        code: "SR-994182-MOD",
        badge: "Pass Updated • Table #14",
        time: "9:15 PM Seating Confirmed",
      },
    },
    {
      id: "stop-2",
      order: 4,
      day: 2,
      originalTime: "17:15",
      currentTime: "Day 2 • 08:30",
      title: "Jebel Jais Viewing Deck",
      location: "Ras Al Khaimah Heights",
      type: "scenic",
      tag: "Moved to Tomorrow Morning",
      status: "healed",
      statusMessage: "Moved to tomorrow morning at 8:30 AM for clear mountain views.",
      bufferMinutes: 90,
      bufferText: "Morning sun",
      constraint: {
        type: "hard",
        description: "Shifted from night darkness to morning golden hour",
        cutoff: "Best visibility 8:30 AM",
      },
      durationMin: 90,
      driveTimeFromPrevMin: 55,
      iconName: "Sun",
      isRescheduled: true,
      rescheduledLabel: "Tomorrow 8:30 AM",
      passDetails: {
        venue: "Jebel Jais Viewing Deck Park",
        code: "JJ-DECK-PASS",
        badge: "Morning Summit Pass",
        time: "Day 2 • 8:30 AM",
      },
    },
  ];
}

export const HEALING_STEPS_TEMPLATE: Omit<AgentLogEntry, "id" | "timestamp">[] = [
  {
    type: "TRIGGER",
    agent: "Route Agent",
    message: "Detected 75-minute delay leaving Dubai Marina.",
  },
  {
    type: "PLANNER",
    agent: "Planner Agent",
    message: "Two conflicts found: sunset at Jebel Jais is missed; dinner reservation at Levant & Nar will be lost.",
  },
  {
    type: "TOOL_CALL",
    agent: "Mountain Agent",
    toolName: "reschedule_summit",
    toolArgs: {
      location: "Jebel Jais Viewing Deck",
      new_time: "Day 2 • 8:30 AM",
      reason: "Avoid dark mountain roads; preserve morning mountain views",
    },
    toolStatus: 200,
    message: "Mountain Agent moved Jebel Jais summit to tomorrow at 8:30 AM.",
    durationMs: 380,
  },
  {
    type: "TOOL_CALL",
    agent: "Dining Agent",
    toolName: "modify_reservation",
    toolArgs: {
      restaurant: "Levant & Nar",
      booking_id: "SR-994182",
      new_time: "9:15 PM",
      table: "Terrace #14",
    },
    toolStatus: 200,
    message: "Dining Agent moved Levant & Nar reservation to 9:15 PM via SevenRooms (table #14 saved).",
    durationMs: 520,
  },
  {
    type: "TOOL_CALL",
    agent: "Hotel Agent",
    toolName: "notify_late_arrival",
    toolArgs: {
      hotel: "InterContinental RAK",
      reservation: "IC-RAK-4089",
      arrival_time: "6:35 PM",
      digital_key: true,
    },
    toolStatus: 200,
    message: "Hotel Agent notified InterContinental RAK of late arrival and activated your mobile room key.",
    durationMs: 310,
  },
  {
    type: "TOOL_CALL",
    agent: "Wallet Agent",
    toolName: "sync_wallet_passes",
    toolArgs: {
      wallets: ["Apple Wallet", "Google Wallet", "Samsung Wallet"],
      event: "Levant & Nar (9:15 PM)",
    },
    toolStatus: 200,
    message: "Wallet Agent pushed updated reservation passes to Apple & Google Wallet.",
    durationMs: 250,
  },
  {
    type: "STATE",
    agent: "Glide Team",
    message: "Trip protected. All reservations confirmed. Zero phone calls made.",
  },
];
