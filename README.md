This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Bodoni Moda, Jost, and Geist Mono.

## Glide UI

The story landing page is at `/`, the trip flow at `/app`, the how-it-works guide followed by the full traffic and itinerary story at `/how-it-works`, and device previews at `/previews`.
Glide uses Bodoni Moda and Jost, with the upstream [Solid Glass](https://github.com/deeplethe/solid-glass) stylesheet for its controls and panels.
See [integration notes](src/styles/SOLID_GLASS.md) and [DESIGN.md](DESIGN.md) for the material tokens, shared components, and update procedure. The upstream MIT license is preserved in `public/licenses/solid-glass-MIT.txt`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
