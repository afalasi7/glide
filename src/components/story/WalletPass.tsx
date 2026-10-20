import React from "react";
import Image from "next/image";

export type WalletBrand = "apple" | "google" | "samsung";

const PASS = {
  photo: "/images/hd/levant_nar_dining.jpg",
  title: "Levant & Nar",
  time: "21:15",
  date: "Fri 13 Nov",
  note: "Moved from 20:00",
  rows: [
    ["Table", "#14 · Terrace"],
    ["Guests", "2"],
    ["Fee", "None"],
  ],
  ref: "SR-994182-MOD",
} as const;

export const BRAND_LABEL: Record<WalletBrand, string> = {
  apple: "Apple Wallet",
  google: "Google Wallet",
  samsung: "Samsung Wallet",
};

/** Deterministic QR-style block so the same pass always renders the same code. */
function Code({ seed, light }: { seed: string; light: boolean }) {
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
        const fx = x >= n - 7 ? x - (n - 7) : x;
        const fy = y >= n - 7 ? y - (n - 7) : y;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4) ? 1 : 0;
      }
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-20 w-20" fill={light ? "#FFFBF3" : "#1C1230"} shapeRendering="crispEdges" aria-label={`Code ${seed}`}>
      {cells}
    </svg>
  );
}

/** Pass cards styled like Apple / Google / Samsung Wallet templates. */
export function WalletPass({ brand }: { brand: WalletBrand }) {
  const p = PASS;

  if (brand === "apple") {
    return (
      <article className="glide-wallet-pass relative w-[290px] overflow-hidden rounded-[14px] bg-[#1c1c1e] text-white shadow-lift" aria-label={`Dinner pass in ${BRAND_LABEL.apple}`}>
        <div className="relative h-[132px]">
          <Image src={p.photo} alt="" fill sizes="300px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-[#1c1c1e]/35 to-transparent" aria-hidden />
          <div className="absolute left-4 right-4 top-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
            <span>Apple Wallet</span>
            <span>Dinner</span>
          </div>
          <p className="absolute bottom-3 left-4 font-display text-[22px] italic leading-none text-white">{p.title}</p>
        </div>
        <div className="space-y-4 px-4 pb-4 pt-1">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">Time</p>
              <p className="num text-[42px] leading-none tracking-tight">{p.time}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">Date</p>
              <p className="text-sm font-semibold">{p.date}</p>
              <p className="mt-1 rounded-full bg-[#30d158] px-2.5 py-0.5 text-[10px] font-semibold text-[#04210d]">{p.note}</p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2 border-t border-white/15 pt-3 text-[11px]">
            {p.rows.map(([k, v]) => (
              <div key={k}>
                <dt className="font-medium uppercase tracking-[0.14em] text-white/50">{k}</dt>
                <dd className="mt-0.5 font-semibold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between rounded-xl bg-black/35 px-3 py-2.5">
            <p className="font-mono text-[10px] text-white/65">{p.ref}</p>
            <div className="rounded-md bg-white p-1">
              <Code seed={p.ref} light={false} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (brand === "google") {
    return (
      <article className="glide-wallet-pass relative w-[290px] overflow-hidden rounded-[28px] bg-white text-[#1f1f1f] shadow-lift" aria-label={`Dinner pass in ${BRAND_LABEL.google}`}>
        <div className="relative h-[124px]">
          <Image src={p.photo} alt="" fill sizes="300px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
          <div className="absolute left-4 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#1f1f1f]">
            Google Wallet
          </div>
          <p className="absolute bottom-3 left-4 font-display text-[22px] italic leading-none text-white">{p.title}</p>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-[#5f6368]">Dinner</p>
              <p className="num text-[40px] leading-none tracking-tight">{p.time}</p>
            </div>
            <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-[11px] font-semibold text-[#137333]">{p.note}</span>
          </div>
          <dl className="grid grid-cols-3 gap-2 border-t border-[#e8eaed] pt-3 text-[11px]">
            {p.rows.map(([k, v]) => (
              <div key={k}>
                <dt className="font-medium text-[#5f6368]">{k}</dt>
                <dd className="mt-0.5 font-semibold leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between rounded-2xl bg-[#f1f3f4] px-3 py-2.5">
            <p className="font-mono text-[10px] text-[#5f6368]">{p.ref}</p>
            <div className="rounded-lg bg-white p-1 shadow-sm">
              <Code seed={p.ref} light={false} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="glide-wallet-pass relative w-[290px] overflow-hidden rounded-[30px] bg-[#0f1115] text-[#f5f5f7] shadow-lift" aria-label={`Dinner pass in ${BRAND_LABEL.samsung}`}>
      <div className="relative h-[128px]">
        <Image src={p.photo} alt="" fill sizes="300px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/40 to-transparent" aria-hidden />
        <div className="absolute left-4 right-4 top-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
          <span>Samsung Wallet</span>
          <span>Dinner</span>
        </div>
        <p className="absolute bottom-3 left-4 font-display text-[22px] italic leading-none text-white">{p.title}</p>
      </div>
      <div className="space-y-4 px-4 pb-4 pt-1">
        <div className="flex items-end justify-between">
          <p className="num text-[42px] leading-none">{p.time}</p>
          <span className="rounded-full bg-mint px-3 py-1 text-[11px] font-semibold text-ink">{p.note}</span>
        </div>
        <dl className="grid grid-cols-3 gap-2 border-t border-white/15 pt-3 text-[11px]">
          {p.rows.map(([k, v]) => (
            <div key={k}>
              <dt className="font-medium uppercase tracking-[0.14em] text-white/50">{k}</dt>
              <dd className="mt-0.5 font-semibold leading-tight">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="font-mono text-[10px] text-white/65">{p.ref}</p>
          <Code seed={p.ref} light />
        </div>
      </div>
    </article>
  );
}
