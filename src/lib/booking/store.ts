import { Redis } from "@upstash/redis";
import type { BookingConfirmation } from "@/lib/planning/types";
import type { CompactTripSelection } from "./selection";

export type BookingRecordStatus = "pending" | "booked" | "failed";

export interface BookingRecord {
  sessionId: string;
  status: BookingRecordStatus;
  /** Present when metadata was valid; may be absent on early failures. */
  selection?: CompactTripSelection;
  tripId: string;
  totalAED?: number;
  confirmations?: BookingConfirmation[];
  paidAt?: string;
  bookedAt?: string;
}

/**
 * Durable booking store keyed by Checkout session id.
 * Stripe path only — demo mode stays fully client-stateless.
 */
export interface BookingStore {
  /** SET NX — true if this call created the key. */
  claim(sessionId: string, record: BookingRecord): Promise<boolean>;
  get(sessionId: string): Promise<BookingRecord | null>;
  set(sessionId: string, record: BookingRecord): Promise<void>;
}

const KEY = (sessionId: string) => `booking:${sessionId}`;

/** In-memory fake for unit tests (simulates Upstash SET NX). */
export class MemoryBookingStore implements BookingStore {
  private readonly data = new Map<string, BookingRecord>();

  async claim(sessionId: string, record: BookingRecord): Promise<boolean> {
    const k = KEY(sessionId);
    if (this.data.has(k)) return false;
    this.data.set(k, structuredClone(record));
    return true;
  }

  async get(sessionId: string): Promise<BookingRecord | null> {
    const v = this.data.get(KEY(sessionId));
    return v ? structuredClone(v) : null;
  }

  async set(sessionId: string, record: BookingRecord): Promise<void> {
    this.data.set(KEY(sessionId), structuredClone(record));
  }

  clear(): void {
    this.data.clear();
  }
}

export function readUpstashEnv(): { url: string; token: string } | undefined {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() || process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || process.env.KV_REST_API_TOKEN?.trim();
  if (url && token) return { url, token };
  return undefined;
}

let cachedUpstash: BookingStore | undefined;
let testOverride: BookingStore | undefined;

export function hasDurableBookingStore(): boolean {
  if (testOverride) return true;
  return Boolean(readUpstashEnv());
}

/** Test hook — inject a MemoryBookingStore without Redis. */
export function setBookingStoreForTests(store: BookingStore | undefined): void {
  testOverride = store;
  if (!store) cachedUpstash = undefined;
}

function buildUpstashStore(env: { url: string; token: string }): BookingStore {
  const redis = new Redis({ url: env.url, token: env.token });
  return {
    async claim(sessionId, record) {
      const result = await redis.set(KEY(sessionId), record, { nx: true });
      return result === "OK";
    },
    async get(sessionId) {
      const v = await redis.get<BookingRecord>(KEY(sessionId));
      return v ?? null;
    },
    async set(sessionId, record) {
      await redis.set(KEY(sessionId), record);
    },
  };
}

export function getBookingStore(): BookingStore {
  if (testOverride) return testOverride;
  if (cachedUpstash) return cachedUpstash;

  const env = readUpstashEnv();
  if (!env) {
    throw new Error("Durable booking store is not configured");
  }
  cachedUpstash = buildUpstashStore(env);
  return cachedUpstash;
}
