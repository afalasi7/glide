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
- **Trip detail ticket** (`TripTicket`): one compact layout for hotel and dinner details, with a mono time/date, restrained place name, slim image, 1px rules, and a perforated status stub. It uses the existing surface, text, and violet tokens in light and dark modes.
- **Wallet pass**: photo header, big time, dashed tear line, QR block. Google and Samsung skins only.
- **Serpentine road** that draws itself with scroll, with pins for each stop.

## Solid Glass material
- The upstream stylesheet from `deeplethe/solid-glass` is vendored unchanged in `src/styles/solid-glass.css`, with its MIT license in `public/licenses/solid-glass-MIT.txt`.
- `src/styles/glide-glass.css` maps the material to Glide's cream, aubergine, and violet palette. Photography, the mascot, Bodoni Moda, and Jost remain the brand's visual identity.
- Shared panels, buttons, inputs, and tags in `src/components/ui/glass.tsx` use the upstream material classes and `data-slot` selectors. Panels have subtle rims, fine edges, and soft shadows; controls use the same material for focus, hover, and selection.
- The app and device previews follow the system light/dark preference. Dark surfaces use the upstream smoky material with a lighter violet accent. Reduced motion, reduced transparency, and browsers without backdrop blur have explicit fallbacks.
- The composer keeps 16px text, grows up to 120px, sends with Enter, and inserts a line break with Shift+Enter. IME composition does not trigger sending.

## Motion (scroll-led, Lenis smooth scroll)
The public landing uses one-time side reveals on its chat, itinerary, approval, and ticket illustrations. A short progress line draws through the three-part delay example as the reader scrolls. One compact hotel-stay ticket closes the story. The archived story components still contain the earlier photo parallax and pinned road; they are no longer mounted on the public landing. Reduced motion removes positional reveals and the scroll-drawn line.

## Pages
- `/` and `/how-it-works` share a concise WhatsApp-first story: split hero, three illustrated steps, trip types, scroll-led delay tickets, and a hotel-stay illustration. The header keeps only the mascot, Glide name, and theme switch. `/privacy` and `/terms` describe the prelaunch site and private test; `/previews` is the device gallery; `/app` is the illustrative onboarding and trip UI; `/landing` redirects to `/`.
