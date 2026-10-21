# Glide

Glide is an interactive travel-agent demo for the Dubai Chamber Create AI Agents Championship. Its sample trip runs from Dubai Marina to Ras Al Khaimah. A 75-minute departure delay triggers a deterministic itinerary repair shown in the story and app.

## Run locally

Requires Bun 1.3.14 and a supported Node.js runtime for Next.js 16.

```bash
bun install
bun run dev --port 3456
```

Open `http://127.0.0.1:3456/`. The default `bun run dev` port is 3000.

## Pages

- `/` and `/how-it-works`: travel-agent guide and sample trip story
- `/app`: interactive onboarding and trip demo
- `/previews`: phone and foldable presentation
- `/privacy` and `/terms`: demo policies

The iOS and Android Capacitor shells load `/app` from the local Next.js server. See [capacitor.config.ts](capacitor.config.ts) for the host setting.

## Checks

```bash
bun run test
bunx eslint src next.config.ts capacitor.config.ts eslint.config.mjs
bun run build
```

The solver lives in `src/lib/agent/`. Its provider tools use an in-memory mock world. Account screens are a guided demo: they do not create accounts or verify credentials. The Google button is a demo shortcut. No live calendar, booking, hotel, or wallet provider is connected. See [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md) for product and visual context.

## Plan a new trip (server logic)

Pure planning helpers live in `src/lib/planning/`:

- `planTrip(request?)` — curated Ras Al Khaimah (default), Muscat, or Hatta. Defaults: next Friday→Sunday, 2 adults, budget AED 3,000 (presets 1,500 / 3,000 / 6,000). Returns a `Trip` with travel, hotel, 2–3 plans per day, solver `graph`, and computed `facts` (`withinBudget`, `totalAED`, `overBudgetByAED`, destination `highlight`, optional `cheaperHotel`).
- `swapOptions` / `applySwap` — alternatives plus `timingsHold` and `lateItems` (past 22:00).
- Bookings are confirmed only after payment: Stripe webhook `checkout.session.completed`, or demo `confirmDemoCheckout` when Stripe is unset. Pay-button tap alone never books.

### Stripe Checkout (server only)

| Variable | Where | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Server only | `sk_test_…`. Never `NEXT_PUBLIC_`. |
| `STRIPE_WEBHOOK_SECRET` | Server only | Signature verification for `/api/stripe/webhook`. |
| `NEXT_PUBLIC_APP_URL` | Public | Base URL for success/cancel returns to `/app`. |

Copy `.env.example` to `.env.local`. Checkout uses `mode=payment`, currency AED, one line item per payable booking. No `setup_future_usage`, no Customers, no saved payment methods. Paid state is stored in an in-memory map (`src/lib/planning/store.ts`) for the process lifetime.

- `POST /api/checkout` → `{ url }` (or **503** if the secret key is missing).
- `GET /api/checkout/status?session_id=` → `paid` \| `pending` \| `failed`.
- `POST /api/checkout/cancel` — mark failed while keeping the plan (cancel URL includes `trip_id`).
- Client: `startCheckout(trip)` from `src/lib/checkout/startCheckout.ts`. Trust copy for the /app pay step: `PAYMENT_TRUST_LINE` (not shown on the landing page in test mode).
