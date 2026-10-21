import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { planTrip } from "@/lib/planning";
import {
  fulfillCheckoutSession,
  MemoryBookingStore,
  selectionFromTrip,
  selectionToMetadata,
  setBookingStoreForTests,
  tripFromSelection,
} from "./index";
import { assertStripeCheckoutReady } from "@/lib/stripe/checkout";

describe("compact selection metadata", () => {
  test("round-trips through metadata and rebuilds the same catalog lines", () => {
    const trip = planTrip({
      destination: "ras-al-khaimah",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const sel = selectionFromTrip(trip);
    const meta = selectionToMetadata(sel);
    for (const v of Object.values(meta)) {
      expect(v.length).toBeLessThanOrEqual(500);
    }
    expect(Object.keys(meta).length).toBeLessThanOrEqual(50);
    const rebuilt = tripFromSelection(sel);
    expect(rebuilt.travel.catalogId).toBe(trip.travel.catalogId);
    expect(rebuilt.hotel.catalogId).toBe(trip.hotel.catalogId);
    expect(rebuilt.totalCostAED).toBe(trip.totalCostAED);
    expect(rebuilt.facts.highlight?.copy).toBe(trip.facts.highlight?.copy);
  });
});

describe("idempotent fulfillCheckoutSession", () => {
  const store = new MemoryBookingStore();

  beforeEach(() => {
    store.clear();
    setBookingStoreForTests(store);
  });

  afterEach(() => {
    setBookingStoreForTests(undefined);
  });

  test("webhook delivered twice books once and returns the same confirmations", async () => {
    const trip = planTrip({
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const metadata = selectionToMetadata(selectionFromTrip(trip));
    const sessionId = "cs_test_idempotent_1";

    const first = await fulfillCheckoutSession({ sessionId, metadata, store });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.created).toBe(true);
    expect(first.record.status).toBe("booked");
    expect(first.record.confirmations!.length).toBeGreaterThan(0);

    const second = await fulfillCheckoutSession({ sessionId, metadata, store });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.created).toBe(false);
    expect(second.record.confirmations).toEqual(first.record.confirmations);
  });

  test("cold instance: empty store + metadata only still books", async () => {
    const trip = planTrip({
      destination: "hatta",
      startDate: "2026-10-23",
      endDate: "2026-10-25",
      budgetAED: 3000,
    });
    const metadata = selectionToMetadata(selectionFromTrip(trip));
    // Fresh store simulates another serverless isolate with no prior memory.
    const cold = new MemoryBookingStore();
    const result = await fulfillCheckoutSession({
      sessionId: "cs_test_cold_1",
      metadata,
      store: cold,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.confirmations!.some((c) => c.walletPass)).toBe(true);
    expect(result.record.confirmations![0].confirmationCode).toMatch(/^GLD-/);
  });

  test("missing metadata returns soft failure (webhook should 200)", async () => {
    const result = await fulfillCheckoutSession({
      sessionId: "cs_test_nometa",
      metadata: {},
      store,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("missing_metadata");
  });

  test("invalid metadata returns soft failure", async () => {
    const result = await fulfillCheckoutSession({
      sessionId: "cs_test_badmeta",
      metadata: { v: "1", dest: "ras-al-khaimah" },
      store,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invalid_metadata");
  });
});

describe("checkout readiness", () => {
  const prevStripe = process.env.STRIPE_SECRET_KEY;
  const prevUrl = process.env.UPSTASH_REDIS_REST_URL;
  const prevToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const prevKvUrl = process.env.KV_REST_API_URL;
  const prevKvToken = process.env.KV_REST_API_TOKEN;

  afterEach(() => {
    setBookingStoreForTests(undefined);
    process.env.STRIPE_SECRET_KEY = prevStripe;
    process.env.UPSTASH_REDIS_REST_URL = prevUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = prevToken;
    process.env.KV_REST_API_URL = prevKvUrl;
    process.env.KV_REST_API_TOKEN = prevKvToken;
  });

  test("Stripe keys without durable storage → STORAGE_NOT_CONFIGURED", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    setBookingStoreForTests(undefined);
    const ready = assertStripeCheckoutReady();
    expect(ready.ok).toBe(false);
    if (ready.ok) return;
    expect(ready.code).toBe("STORAGE_NOT_CONFIGURED");
  });

  test("no Stripe key → STRIPE_NOT_CONFIGURED (demo path)", () => {
    delete process.env.STRIPE_SECRET_KEY;
    const ready = assertStripeCheckoutReady();
    expect(ready.ok).toBe(false);
    if (ready.ok) return;
    expect(ready.code).toBe("STRIPE_NOT_CONFIGURED");
  });
});
