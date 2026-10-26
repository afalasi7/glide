"use client";

import { useState } from "react";
import Image from "next/image";

type Field = { label: string; value?: string | null };

type TripTicketProps = {
  kind: string;
  place?: string | null;
  time?: string | null;
  date?: string | null;
  image?: string | null;
  fields?: readonly Field[];
  reference?: string | null;
  status?: string | null;
  state?: "ready" | "loading" | "error";
  compact?: boolean;
  className?: string;
};

export function TripTicket({ kind, place, time, date, image, fields = [], reference, status, state = "ready", compact = false, className = "" }: TripTicketProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const visibleFields = fields.filter(({ value }) => Boolean(value?.trim()));

  if (state === "loading") {
    return (
      <div className={`trip-ticket p-4 ${className}`} role="status" aria-label={`Loading ${kind} details`} aria-busy="true">
        <div className="h-14 rounded-sm bg-current/10 motion-safe:animate-pulse" />
        <div className="mt-4 h-8 w-1/2 rounded-sm bg-current/10 motion-safe:animate-pulse" />
        <div className="mt-3 h-4 w-3/4 rounded-sm bg-current/10 motion-safe:animate-pulse" />
        <div className="mt-5 h-px bg-current/15" />
        <div className="mt-4 h-4 w-2/3 rounded-sm bg-current/10 motion-safe:animate-pulse" />
      </div>
    );
  }

  if (state === "error" || (!place?.trim() && !time?.trim() && !date?.trim())) {
    return <div className={`trip-ticket p-5 ${className}`} role="alert">{kind} details are unavailable. Try again later.</div>;
  }

  return (
    <article className={`trip-ticket ${className}`} aria-label={`${kind} details${place ? ` for ${place}` : ""}`}>
      <div className={`trip-ticket-photo relative overflow-hidden border-b ${compact ? "h-10" : "h-16"}`}>
        {image?.trim() && failedImage !== image ? (
          <Image src={image} alt="" fill sizes="(min-width: 1024px) 430px, 90vw" className="object-cover" onError={() => setFailedImage(image)} />
        ) : (
          <span className="flex h-full items-center px-4 text-xs trip-ticket-muted">Image unavailable</span>
        )}
      </div>
      <div className={compact ? "px-3 pb-2 pt-2" : "px-4 pb-4 pt-3 sm:px-5"}>
        <p className="text-xs trip-ticket-muted">{kind}</p>
        {(time?.trim() || date?.trim()) && (
          <div className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 ${compact ? "mt-1" : "mt-2"}`}>
            {time?.trim() && <p className={`font-mono font-semibold leading-none tabular-nums tracking-[-0.06em] text-violet ${compact ? "text-2xl" : "text-[clamp(1.9rem,6vw,2.5rem)]"}`}>{time}</p>}
            {date?.trim() && <p className="font-mono text-sm tabular-nums trip-ticket-muted">{date}</p>}
          </div>
        )}
        {place?.trim() && <p className="mt-2 break-words font-sans text-base font-semibold leading-snug">{place}</p>}
        {visibleFields.length > 0 && (
          <dl className={`trip-ticket-rule grid grid-cols-2 gap-x-4 border-t ${compact ? "mt-2 gap-y-1 pt-2" : "mt-4 gap-y-3 pt-3"}`}>
            {visibleFields.map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs trip-ticket-muted">{label}</dt>
                <dd className="mt-0.5 break-words text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {(reference?.trim() || status?.trim()) && (
        <div className={`trip-ticket-stub trip-ticket-rule relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-dotted text-xs ${compact ? "px-3 py-1.5" : "px-4 py-2.5 sm:px-5"}`}>
          {reference?.trim() && <span className="font-mono tabular-nums">Ref {reference}</span>}
          {status?.trim() && <span className="trip-ticket-muted">{status}</span>}
        </div>
      )}
    </article>
  );
}
