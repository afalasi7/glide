import { Redis } from "@upstash/redis";
import type { BookingConfirmation } from "@/lib/planning/types";
import type { CompactTripSelection } from "./selection";

export type BookingRecordStatus = "pending" | "booked" | "failed" | "refunded";

/** Pending claim TTL — backstop if a worker dies mid-fulfillment. */
export const PENDING_CLAIM_TTL_SECONDS = 10 * 60;

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
  /** ISO time when a pending claim was taken (expiry backstop). */
  claimedAt?: string;
  /** Stripe refund id when a permanent failure triggered a full refund. */
  refundId?: string;
}

/**
 * Durable booking store keyed by Checkout session id.
 * Stripe path only — demo mode stays fully client-stateless.
 */
export interface BookingStore {
  /**
   * SET NX — true if this call created the key.
   * Pending claims should expire after {@link PENDING_CLAIM_TTL_SECONDS}.
   */
  claim(sessionId: string, record: BookingRecord): Promise<boolean>;
  get(sessionId: string): Promise<BookingRecord | null>;
  set(sessionId: string, record: BookingRecord): Promise<void>;
  /** Remove the claim so Stripe can retry after a transient failure. */
  delete(sessionId: string): Promise<void>;
}

const KEY = (sessionId: string) => `booking:${sessionId}`;

function isPendingExpired(record: BookingRecord, nowMs = Date.now()): boolean {
  if (record.status !== "pending" || !record.claimedAt) return false;
  const claimed = Date.parse(record.claimedAt);
  if (!Number.isFinite(claimed)) return false;
  return nowMs - claimed > PENDING_CLAIM_TTL_SECONDS * 1000;
}

/** In-memory fake for unit tests (simulates Upstash SET NX + TTL). */
export class MemoryBookingStore implements BookingStore {
  private readonly data = new Map<string, BookingRecord>();

  async claim(sessionId: string, record: BookingRecord): Promise<boolean> {
    const k = KEY(sessionId);
    const current = this.data.get(k);
    if (current && !isPendingExpired(current)) return false;
    // Expired pending (or missing) may be claimed.
    this.data.set(k, structuredClone({ ...record, claimedAt: record.claimedAt ?? new Date().toISOString() }));
    return true;
  }

  async get(sessionId: string): Promise<BookingRecord | null> {
    const k = KEY(sessionId);
    const v = this.data.get(k);
    if (!v) return null;
    if (isPendingExpired(v)) {
      this.data.delete(k);
      return null;
    }
    return structuredClone(v);
  }

  async set(sessionId: string, record: BookingRecord): Promise<void> {
    this.data.set(KEY(sessionId), structuredClone(record));
  }

  async delete(sessionId: string): Promise<void> {
    this.data.delete(KEY(sessionId));
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
      const withClaim = {
        ...record,
        claimedAt: record.claimedAt ?? new Date().toISOString(),
      };
      // NX + EX: pending claims auto-expire if a worker dies mid-flight.
      const result = await redis.set(KEY(sessionId), withClaim, {
        nx: true,
        ex: PENDING_CLAIM_TTL_SECONDS,
      });
      return result === "OK";
    },
    async get(sessionId) {
      const v = await redis.get<BookingRecord>(KEY(sessionId));
      return v ?? null;
    },
    async set(sessionId, record) {
      // Booked/failed records should not inherit the short pending TTL.
      if (record.status === "pending") {
        await redis.set(KEY(sessionId), record, { ex: PENDING_CLAIM_TTL_SECONDS });
      } else {
        await redis.set(KEY(sessionId), record);
      }
    },
    async delete(sessionId) {
      await redis.del(KEY(sessionId));
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
