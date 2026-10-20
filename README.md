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
