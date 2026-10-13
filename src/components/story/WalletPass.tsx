import React from "react";
import Image from "next/image";

export type WalletBrand = "apple" | "google" | "samsung";

const PASS = {
  photo: "/images/hd/levant_nar_dining.jpg",
  title: "Levant & Nar",
  time: "21:15",
  note: "Moved from 20:00",
  rows: [["Table", "#14 · Terrace"], ["Guests", "2"], ["Fee", "None"]],
  ref: "SR-994182-MOD",
} as const;

export const BRAND_LABEL: Record<WalletBrand, string> = { apple: "Apple Wallet", google: "Google Wallet", samsung: "Samsung Wallet" };


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

export function WalletPass({ brand }: { brand: WalletBrand }) {
  const p = PASS;
  const dark = brand !== "google";
  const skin = { apple: "bg-[#F5F2EC] text-ink", google: "bg-white text-ink", samsung: "bg-[#14161C] text-paper" }[brand];
  const radius = brand === "apple" ? "rounded-[18px]" : brand === "google" ? "rounded-[26px]" : "rounded-[30px]";
  return (
    <article className={`relative w-[290px] overflow-hidden shadow-lift ${radius} ${skin}`} aria-label={`Dinner pass in ${BRAND_LABEL[brand]}`}>
      <div className="relative h-32">
        <Image src={p.photo} alt="" fill sizes="300px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />
        <div className="absolute left-4 right-4 top-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          <span>{BRAND_LABEL[brand]}</span>
          <span>Dinner</span>
        </div>
        <p className="absolute bottom-3 left-4 right-4 font-display text-2xl italic leading-none text-white">{p.title}</p>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-end justify-between">
          <p className="num text-5xl leading-none">{p.time}</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${brand === "samsung" ? "bg-mint text-ink" : "bg-mint-pale text-ink"}`}>{p.note}</span>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-xs">
          {p.rows.map(([k, v]) => (
            <div key={k}>
              <dt className={`font-medium uppercase tracking-wider ${brand === "samsung" ? "text-paper/55" : "text-ink-soft"}`}>{k}</dt>
              <dd className="mt-0.5 font-semibold leading-tight">{v}</dd>
            </div>
          ))}
        </dl>
        <div className={`flex items-center justify-between border-t-2 border-dashed pt-4 ${brand === "samsung" ? "border-paper/20" : "border-ink/15"}`}>
          <p className="font-mono text-[11px] font-medium opacity-70">{p.ref}</p>
          <div className={`rounded-lg p-1.5 ${brand === "samsung" ? "" : "bg-white"}`}>
            <Code seed={p.ref} dark={dark && brand === "samsung"} />
          </div>
        </div>
      </div>
    </article>
  );
}
