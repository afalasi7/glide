/**
 * @deprecated The Stripe path no longer uses an in-memory trip store.
 * Paid/booked state lives in `src/lib/booking` (Upstash Redis) keyed by session id.
 * Demo mode is fully client-stateless.
 *
 * This module is kept empty of Stripe booking logic so old imports fail loudly
 * during the migration; planning helpers do not persist server-side.
 */

export function resetTripStore(): void {
  // no-op — retained for older tests that still call it
}
