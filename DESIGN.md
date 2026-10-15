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

## Shapes
- **Arch window** for chapter photography (round top, soft base).
- **Ticket strip** (side notches + dashed perforation) for each agent tool call.
- **Wallet pass**: photo header, big time, dashed tear line, QR block. Google and Samsung skins only.
- **Serpentine road** that draws itself with scroll, with pins for each stop.

## Solid Glass material
- The upstream stylesheet from `deeplethe/solid-glass` is vendored unchanged in `src/styles/solid-glass.css`, with its MIT license in `public/licenses/solid-glass-MIT.txt`.
- `src/styles/glide-glass.css` maps the material to Glide's cream, aubergine, and violet palette. Photography, the mascot, Bodoni Moda, and Jost remain the brand's visual identity.
- Shared panels, buttons, inputs, and tags in `src/components/ui/glass.tsx` use the upstream material classes and `data-slot` selectors. Panels have subtle rims, fine edges, and soft shadows; controls use the same material for focus, hover, and selection.
- The app and device previews follow the system light/dark preference. Dark surfaces use the upstream smoky material with a lighter violet accent. Reduced motion, reduced transparency, and browsers without backdrop blur have explicit fallbacks.
- The composer keeps 16px text, grows up to 120px, sends with Enter, and inserts a line break with Shift+Enter. IME composition does not trigger sending.

## Motion (scroll-led, Lenis smooth scroll)
Hero photo parallax and text lift · pinned four-chapter day (road draws, arch photo wipes in, clock changes) · tickets slide in from alternating sides · wallet passes fan out from a stack · device renders drift at different speeds · finale photo parallax. Reduced motion disables Lenis and animation durations.

## Pages
- `/` the story (hero, day, three moves, wallet, finale), with only the mascot and Glide name in the header. `/how-it-works` explains the personal travel agent flow followed by the full trip story. `/previews` device gallery. `/app` onboarding and trip UI. `/landing` redirects to `/`.
