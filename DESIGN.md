# DESIGN.md — Glide Design System
*World: "Sunset Luxe". An editorial travel story: warm sand canvas, aubergine ink, real photography, a high-contrast serif.*

## Type
- Display: **Bodoni Moda** (500, italic for the one emphasised phrase per headline), tracking -0.025em, max 8rem.
- Body/UI: **Jost**. Mono (tool names, references): Geist Mono. Clock numerals use Bodoni lining tabular figures (`.num`).

## Colour (globals.css tokens)
cream `#FFF3DF` canvas · paper `#FFFBF3` · ink `#1C1230` · ink-soft `#5E5470` · violet `#5B3DF5` accent/CTA · sun `#FFB400` highlight · coral `#FF5A36` · mint `#2FD6A1`. Photography carries most of the colour.

## Imagery (all real, in /public)
- Photos: jebel_jais_sunset, dubai_traffic_gridlock, ic_rak_resort, levant_nar_dining. Each chapter of the day uses its own.
- Logo: images/glide_logo.jpg, clipped to a squircle (`GlideLogo`). Never redrawn.
- Devices: the B&W renders in /renders, shown sharp-cornered, no frames drawn in code.

## Shapes (no rounded-rectangle cards)
- **Arch window** for chapter photography (round top, soft base).
- **Ticket strip** (side notches + dashed perforation) for each agent tool call.
- **Wallet pass**: photo header, big time, dashed tear line, QR block. Google and Samsung skins only.
- **Serpentine road** that draws itself with scroll, with pins for each stop.

## Motion (scroll-led, Lenis smooth scroll)
Hero photo parallax and text lift · pinned four-chapter day (road draws, arch photo wipes in, clock changes) · tickets slide in from alternating sides · wallet passes fan out from a stack · device renders drift at different speeds · finale photo parallax. Reduced motion disables Lenis and animation durations.

## Pages
- `/` the story (hero, day, four moves, wallet, devices, finale). `/previews` device gallery. `/landing` redirects to `/`.
