import React from "react";
import Image from "next/image";

export type PassKind = "dinner" | "hotel" | "summit";
export type WalletBrand = "google" | "samsung";

const PASSES = {
  dinner: {
    photo: "/images/levant_nar_dining.jpg",
    label: "Dinner",
    title: "Levant & Nar",
    time: "21:15",
    note: "Moved from 20:00",
    rows: [["Table", "#14 · Terrace"], ["Guests", "2"], ["Fee", "None"]],
    ref: "SR-994182-MOD",
  },
  hotel: {
    photo: "/images/ic_rak_resort.jpg",
    label: "Room key",
    title: "InterContinental RAK",
    time: "19:35",
    note: "Late arrival noted",
    rows: [["Room", "Ocean Terrace Suite"], ["Key", "On your phone"], ["Nights", "1"]],
    ref: "IC-RAK-4089",
  },
  summit: {
    photo: "/images/jebel_jais_sunset.jpg",
    label: "Summit pass",
    title: "Jebel Jais Viewing Deck",
    time: "08:30",
    note: "Moved to Day 2",
    rows: [["Entry", "Morning Summit"], ["Party", "2"], ["Weather", "Clear"]],
    ref: "JJ-DECK-PASS",
  },
} as const;

/** Deterministic QR-style block so the same pass always renders the same code. */
function Code({ seed, dark }: { seed: string; dark: boolean }) {
  const n = 21;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: React.ReactNode[] = [];
  const finder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      let on = (h >> 16) & 1;
      if (finder(x, y)) {
        const fx = x >= n - 7 ? x - (n - 7) : x, fy = y >= n - 7 ? y - (n - 7) : y;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4) ? 1 : 0;
      }
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-24 w-24" fill={dark ? "#FFFBF3" : "#1C1230"} shapeRendering="crispEdges" aria-label={`Code ${seed}`}>
      {cells}
    </svg>
  );
}

export function WalletPass({ kind, brand }: { kind: PassKind; brand: WalletBrand }) {
  const p = PASSES[kind];
  const samsung = brand === "samsung";
  return (
    <article
      className={`relative w-[300px] overflow-hidden rounded-[22px] shadow-lift ${samsung ? "bg-[#14161C] text-paper" : "bg-white text-ink"}`}
      aria-label={`${p.label} pass, ${brand} wallet`}
    >
      <div className="relative h-36">
        <Image src={p.photo} alt="" fill sizes="300px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
        <div className="absolute left-4 right-4 top-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          <span>{samsung ? "Samsung Wallet" : "Google Wallet"}</span>
          <span>{p.label}</span>
        </div>
        <p className="absolute bottom-3 left-4 right-4 font-display text-2xl italic leading-none text-white">{p.title}</p>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-end justify-between">
          <p className="num text-5xl leading-none">{p.time}</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${samsung ? "bg-mint text-ink" : "bg-mint-pale text-ink"}`}>{p.note}</span>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-xs">
          {p.rows.map(([k, v]) => (
            <div key={k}>
              <dt className={`font-medium uppercase tracking-wider ${samsung ? "text-paper/55" : "text-ink-soft"}`}>{k}</dt>
              <dd className="mt-0.5 font-semibold leading-tight">{v}</dd>
            </div>
          ))}
        </dl>
        <div className={`flex items-center justify-between border-t-2 border-dashed pt-4 ${samsung ? "border-paper/20" : "border-ink/15"}`}>
          <p className="font-mono text-[11px] font-medium opacity-70">{p.ref}</p>
          <div className={`rounded-lg p-1.5 ${samsung ? "bg-transparent" : "bg-white"}`}>
            <Code seed={p.ref} dark={samsung} />
          </div>
        </div>
      </div>
    </article>
  );
}
