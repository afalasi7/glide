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
  stops[0].statusMessage = `Departing +${delayMinutes}m behind planned schedule`;
  stops[0].bufferText = `Late Start: +${delayMinutes}m`;

  // Stop 2: Jebel Jais
  // Travel time 135 mins (2h 15m)
  const jaisArrival = departureMins + 135;
  stops[1].currentTime = formatTime(jaisArrival);
  // Sunset cutoff is 17:48 = 17 * 60 + 48 = 1068 mins
  const sunsetCutoff = 17 * 60 + 48;
  const jaisBuffer = sunsetCutoff - jaisArrival;

  if (jaisArrival > sunsetCutoff) {
    stops[1].status = "conflict";
    stops[1].bufferMinutes = jaisBuffer;
    stops[1].statusMessage = `Violates sunset cutoff (17:48)! Sun already set by ${formatTime(jaisArrival)}`;
    stops[1].bufferText = `Critical Deficit: ${jaisBuffer}m past sunset`;
  } else if (jaisBuffer < 20) {
    stops[1].status = "warning";
    stops[1].bufferMinutes = jaisBuffer;
    stops[1].statusMessage = `Tight window: only ${jaisBuffer}m before sunset cutoff`;
    stops[1].bufferText = `Warning: +${jaisBuffer}m buffer`;
  } else {
    stops[1].status = "normal";
    stops[1].bufferMinutes = jaisBuffer;
    stops[1].bufferText = `+${jaisBuffer}m buffer before sunset`;
  }

  // Stop 3: InterContinental RAK
  // If doing Jebel Jais (60 min stay) + 60 min drive to IC
  const icArrival = jaisArrival + 60 + 60;
  stops[2].currentTime = formatTime(icArrival);
  // Hotel check-in is flexible until 00:00, but dinner was 20:00
  // If arrival at hotel is late, dinner at 20:00 will be missed!
  if (icArrival > 20 * 60) {
    stops[2].status = "warning";
    stops[2].statusMessage = `Arrival at ${formatTime(icArrival)} exceeds original 20:00 dinner slot`;
    stops[2].bufferText = `Delayed Check-in: ${formatTime(icArrival)}`;
  } else {
    stops[2].status = "normal";
    stops[2].statusMessage = "Within check-in window";
    stops[2].bufferText = `ETA ${formatTime(icArrival)}`;
  }

  // Stop 4: Levant & Nar Dinner
  // Original is 20:00. Kitchen closes 22:30.
  // Earliest realistic dinner if check-in at icArrival (needs 30m refresh + 15m transfer)
  const dinnerEarliest = icArrival + 45;
  stops[3].currentTime = formatTime(Math.max(20 * 60, dinnerEarliest));
  if (dinnerEarliest > 20 * 60 + 15) {
    // past 15 min hold policy
    stops[3].status = "conflict";
    const lateMinutes = dinnerEarliest - 20 * 60;
    stops[3].statusMessage = `Reservation void risk! ETA ${formatTime(dinnerEarliest)} is +${lateMinutes}m past 20:00 hold policy`;
    stops[3].bufferText = `Forfeit Risk: +${lateMinutes}m overdue`;
  } else {
    stops[3].status = "normal";
    stops[3].bufferText = `On time for 20:00 slot`;
  }

  return stops;
}

// Generate the autonomous healed itinerary
export function getHealedStops(delayMinutes: number): ItineraryStop[] {
  // If +75m delay:
  // Depart Marina: 16:15
  // Hotel Check-in: 18:30 (Drive straight to RAK 135 mins or ~2h15m, arrival ~18:30 / 19:45)
  // Jebel Jais moved to Day 2 - 08:30 AM
  // Dinner shifted to 21:15 (SevenRooms modified)
  // Hotel check-in flagged for 20:00 guaranteed arrival window
  return [
    {
      id: "stop-1",
      order: 1,
      originalTime: "15:00",
      currentTime: "16:15",
      title: "Depart Dubai Marina",
      location: "Dubai Marina, Dubai",
      type: "departure",
      tag: "Delayed Origin (Healed)",
      status: "healed",
      statusMessage: "Shock absorber absorbed +75m delay at origin",
      bufferMinutes: 0,
      bufferText: "Stabilized departure at 16:15",
      constraint: {
        type: "flexible",
        description: "Direct highway routing applied via E311/E611",
      },
      durationMin: 0,
      driveTimeFromPrevMin: 0,
      iconName: "Compass",
    },
    {
      id: "stop-3",
      order: 2,
      originalTime: "18:45",
      currentTime: "18:35",
      title: "InterContinental RAK",
      location: "Mina Al Arab, Ras Al Khaimah",
      type: "hotel",
      tag: "Resort Check-in (Prioritized)",
      status: "healed",
      statusMessage: "Promoted to Stop #2 to eliminate highway backtracking",
      bufferMinutes: 85,
      bufferText: "Guaranteed check-in & 85m suite refresh window",
      constraint: {
        type: "flexible",
        description: "Cloudbeds PMS updated with late arrival flag & VIP room hold",
        cutoff: "Arrival confirmed for 18:35 - 20:00",
        referenceCode: "IC-RAK-4089",
        provider: "Cloudbeds PMS",
      },
      durationMin: 60,
      driveTimeFromPrevMin: 140,
      iconName: "Building2",
      passDetails: {
        venue: "InterContinental RAK Mina Al Arab",
        code: "IC-4089-RES",
        badge: "Late Arrival Flagged • Key Ready",
        time: "Guaranteed Window: 18:35 - 20:00",
      },
    },
    {
      id: "stop-4",
      order: 3,
      originalTime: "20:00",
      currentTime: "21:15",
      title: "Levant & Nar (Dinner)",
      location: "InterContinental Promenade",
      type: "dining",
      tag: "Rescheduled VIP Table",
      status: "healed",
      statusMessage: "SevenRooms autonomous slot rebooked to 21:15 (Seating secured)",
      bufferMinutes: 45,
      bufferText: "+75m kitchen buffer (Kitchen open until 22:30)",
      constraint: {
        type: "hard",
        description: "Modified via SevenRooms API without cancellation penalty",
        cutoff: "Kitchen closes 22:30 • 75m dining window",
        referenceCode: "SR-994182-MOD",
        provider: "SevenRooms VIP",
      },
      durationMin: 75,
      driveTimeFromPrevMin: 10,
      iconName: "UtensilsCrossed",
      isRescheduled: true,
      rescheduledLabel: "Shifted +75m to 21:15",
      passDetails: {
        venue: "Levant & Nar Promenade",
        code: "SR-994182-MOD",
        badge: "Barcode Updated • Table #14",
        time: "21:15 Seating Confirmed",
      },
    },
    {
      id: "stop-2",
      order: 4,
      originalTime: "17:15",
      currentTime: "Day 2 • 08:30",
      title: "Jebel Jais Viewing Deck",
      location: "Ras Al Khaimah Heights",
      type: "scenic",
      tag: "Day 2 Morning Viewpoint",
      status: "healed",
      statusMessage: "Resequenced to Day 2: Optimal crisp morning visibility & zero haze",
      bufferMinutes: 90,
      bufferText: "+90m unconstrained morning slot",
      constraint: {
        type: "hard",
        description: "Transformed from broken sunset slot to premier morning summit slot",
        cutoff: "Summit road quietest between 08:00 - 10:30",
      },
      durationMin: 90,
      driveTimeFromPrevMin: 55,
      iconName: "Sun",
      isRescheduled: true,
      rescheduledLabel: "Resequenced to Day 2 08:30 AM",
      passDetails: {
        venue: "Jebel Jais Viewing Deck Park",
        code: "JJ-DECK-PASS",
        badge: "Morning Summit Pass",
        time: "Day 2 • 08:30 AM",
      },
    },
  ];
}

export const HEALING_STEPS_TEMPLATE: Omit<AgentLogEntry, "id" | "timestamp">[] = [
  {
    type: "TRIGGER",
    message: "Detected departure delay delta: +75m from planned Dubai Marina launch (T_delay = 75m).",
  },
  {
    type: "PLANNER",
    message: "Graph Solver analyzing topological dependencies... Sunset hard cutoff at 17:48 is fatally violated by projected ETA 18:30 (+42m past dark).",
  },
  {
    type: "TOOL_CALL",
    toolName: "resequence_node",
    toolArgs: {
      node_id: "jebel_jais_deck",
      action: "DEFER_TO_NEXT_DAY",
      new_time: "Day 2, 08:30 AM",
      slot_quality: "OPTIMAL_MORNING_LIGHT",
    },
    toolStatus: 200,
    message: "resequence_node({ node: 'Jebel Jais', new_time: 'Day 2, 08:30' }) → Status: 200 OK",
    durationMs: 410,
  },
  {
    type: "TOOL_CALL",
    toolName: "modify_dining_reservation",
    toolArgs: {
      provider: "SevenRooms",
      venue_id: "levant_and_nar_rak",
      booking_ref: "SR-994182",
      party_size: 2,
      requested_time: "21:15",
      table_preference: "Outdoor Terrace #14",
    },
    toolStatus: 200,
    message: "modify_dining_reservation({ provider: 'SevenRooms', id: 'SR-994182', time: '21:15' }) → Status: 200 OK",
    durationMs: 580,
  },
  {
    type: "TOOL_CALL",
    toolName: "flag_hotel_late_arrival",
    toolArgs: {
      pms: "Cloudbeds",
      property: "InterContinental RAK Mina Al Arab",
      reservation_id: "IC-RAK-4089",
      guaranteed_arrival: "18:35 - 20:00",
      mobile_key_dispatch: true,
    },
    toolStatus: 200,
    message: "flag_hotel_late_arrival({ pms: 'Cloudbeds', arrival: '20:00' }) → Status: 200 OK",
    durationMs: 340,
  },
  {
    type: "TOOL_CALL",
    toolName: "push_wallet_pass_sync",
    toolArgs: {
      target_devices: ["apple_wallet", "google_wallet"],
      pass_type: "event_and_boarding",
      payload: {
        dining_time: "21:15",
        room_key: "MOBILE_KEY_ISSUED",
        resequenced_count: 3,
      },
    },
    toolStatus: 200,
    message: "push_wallet_pass_sync({ device_id: 'apple_wallet' }) → Status: 200 OK",
    durationMs: 290,
  },
  {
    type: "STATE",
    message: "Itinerary graph healed successfully! 0 forfeited bookings, 0 missed meals, 100% scenic experiences preserved.",
  },
];
