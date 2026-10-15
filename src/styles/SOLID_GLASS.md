# Solid Glass integration

The unmodified upstream stylesheet is vendored from
https://deeplethe.github.io/solid-glass/r/solid-glass.json
(source: https://github.com/deeplethe/solid-glass).

Retrieved 2026-10-13. SHA-256: `f871d741bf92014d271b5fcea75108bbff687950c4e5a5b9b9332971758efc38`.
The MIT license is preserved in `public/licenses/solid-glass-MIT.txt`.

`glide-glass.css` adapts the material tokens to Glide. Shared controls in
`src/components/ui/glass.tsx` use upstream classes and data-slot selectors.
No shadcn initialization or additional runtime dependency is required.

To update, replace only `solid-glass.css` from the official registry, retain
the license, then check the landing header, account inputs, chat composer,
trip navigation, light/dark appearance, and reduced-transparency fallback.
