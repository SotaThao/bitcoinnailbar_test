# Design System — Bitcoin Nail Bar

## Product Context
- **What this is:** A premium nail salon marketing and booking platform that accepts cryptocurrency.
- **Who it's for:** Women who appreciate high-end beauty services, lived-in luxury, and modern convenience.
- **Space/industry:** Luxury Spa & Beauty / Tech-forward Lifestyle.
- **Project type:** Marketing site & web app (Booking).

## Aesthetic Direction
- **Direction:** Dual-Mode Hybrid (Quiet Wealth / Lived-in Luxury)
- **Decoration level:** Minimal — Typography and high-quality materials/photography do the work. No bloated shadows or gradients.
- **Mood:** Private, elegant, warm, exclusive. A beauty salon that feels like a discreet members' lounge.

## Typography
- **Display/Hero:** `Canela` (or `PP Editorial New`) — Elegant, feminine, expensive.
- **Body:** `Suisse Works` (or `Inter Tight`) — Soft editorial confidence.
- **UI/Labels:** `Berkeley Mono` (or `Söhne Mono`) — Used for booking metadata, prices, and crypto details to provide "wallet-lounge" exactness.
- **Scale:** 
  - `h1`: 4rem (desktop) / 2.5rem (mobile)
  - `h2`: 2.5rem (desktop) / 2rem (mobile)
  - `body`: 1rem

## Color (Dark / Light Mode)
- **Approach:** Restrained, leveraging high contrast and material tones.

**Light Mode (Quiet Wealth)**
- **Background:** `#F7F1E8` (Cashmere / Ivory)
- **Surface:** `#F2DFC0` (Champagne)
- **Text Primary:** `#050504` (Lacquer Black)
- **Text Muted:** `#A79D91`
- **Accent:** `#D8B56D` (Soft Gold)

**Dark Mode (Obsidian Vault / Lounge)**
- **Background:** `#070708` (Abyss / Near Pitch Black)
- **Surface:** `#15120E` (Gunmetal / Smoked Glass)
- **Text Primary:** `#F0EDE4` (Off-white)
- **Text Muted:** `#66666E`
- **Accent:** `#C5BFA5` (Brushed Platinum)

## Spacing
- **Base unit:** 8px
- **Density:** Spacious. The layout must breathe heavily.
- **Scale:** `sm(8)` `md(16)` `lg(24)` `xl(32)` `2xl(48)` `3xl(64)`

## Layout
- **Approach:** Editorial Asymmetry.
- **Hero Viewport:** Treated as a poster, not a document. Large imagery dominating the viewport with offset copy.
- **Border radius:** Exaggerated squircle radii for main cards (e.g., `2rem`), but sharp hairlines (`1px` borders) for grid structures.

## Imagery & Tone
- **Focus:** "Lived-in Luxury". Beautiful hands holding champagne glasses, interacting with premium leather, or resting on black glass. 
- **Anti-patterns:** No stock spa photos (bamboo, stones, flower props). No purple crypto gradients, 3D coins, or neon chains. Crypto is treated as etiquette (e.g., "BTC/ETH Accepted"), not spectacle.

## Motion
- **Approach:** Intentional and choreographed.
- **Easing:** Custom `cubic-bezier` transitions. No `linear` or `ease-in-out`.
- **Entrance:** Staggered reveals on scroll. No element appears statically.
