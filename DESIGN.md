# DESIGN.md — Glide Design System
*Direction: Distilled, Ultra-Simple Mobbin-Grade Autonomous Travel Shock Absorber*

## Visual Philosophy
Glide draws directly from top-tier Mobbin apps (Flighty, Linear Mobile, Apple Wallet, Arc). Following Impeccable's `distill` methodology, it strips away visual noise, sidebars, dense multi-column grids, and nested containers in favor of a focused, calm single-column experience.

## Principles
1. **Single Focused Column**: Max width 576px (`max-w-xl`), centered, generous negative space.
2. **Zero Nested Cards**: Flat hierarchy where spacing and typography establish structure.
3. **Progressive Disclosure**: Agent tool execution details and payloads stay quiet until requested.
4. **Ruthless Simplicity**: ONE primary goal per screen — observe route, inject delay, and trigger autonomous healing.

## Color Palette
- **Canvas / Root Background**: `#07080B` (Pitch Obsidian)
- **Surfaces**: `#0E1017`
- **Borders**: `rgba(255, 255, 255, 0.08)` (Subtle hairline)
- **Primary Text**: `#FFFFFF`
- **Secondary Text**: `#A1A1AA` (Muted Zinc)
- **Accents**:
  - Emerald (`#10B981`): Autonomous resolution
  - Amber (`#F59E0B`): Delay warnings
  - Rose (`#F43F5E`): Constraint conflicts

## Components
1. **Trip Summary**: Clear route header with immediate plain-language status.
2. **Delay Injector**: 4-preset segmented strip (`On Time`, `+15m`, `+45m`, `+75m Late`) + high-contrast action button.
3. **Vertical Timeline**: 4 stops displaying time, location, and clear status pill without clutter.
4. **Autonomous Actions**: Progressive disclosure list of tool executions.
5. **Live Pass**: Dynamic Island / Apple Wallet sync notification.
