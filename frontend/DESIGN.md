# Design System: Precision Analytics — Ethereal Zen

## 1. Overview & Creative North Star: "The Signal Layer"
This design system is a departure from the high-stimulation patterns of typical developer dashboards. Our Creative North Star is **"The Signal Layer."** We are evolving the rigid, data-dense structures of traditional analytics into something that feels architectural yet breathable — Quiet Precision meets Editorial Clarity.

To break the "template" look, we abandon the rigid grid in favor of **Intentional Asymmetry**. Large-scale typography should overlap subtle surface transitions, and metric cards should feel like they are floating in a pressurized, ethereal space. The goal is to make the operator feel like they are reading signal, not processing noise.

---

## 2. Colors & Surface Philosophy
The palette is rooted in high-contrast light mode, utilizing a sophisticated range of off-whites and warm grays to prevent eye strain while maintaining a premium, editorial feel.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts.
- A section transition occurs when moving from `surface` (#f9f9f9) to `surface-container-low` (#f2f4f4).
- Structure is born from tone, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers, like stacked sheets of fine vellum.
- **Base Layer:** `surface` (#f9f9f9) — page backgrounds.
- **Sub-Sectioning:** `surface-container-low` (#f2f4f4) — sidebar, secondary panels.
- **Interactive Elements:** `surface-container-lowest` (#ffffff) — cards, inputs in focus, lifted elements.
- **High-Priority Modals:** `surface-bright` (#f9f9f9) with a `backdrop-blur`.

### The "Glass & Gradient" Rule
To achieve the "Ethereal" quality, use **Glassmorphism** for floating cards and navigation bars.
- **Glass Token:** `surface-container-lowest` at 70% opacity with a `24px backdrop-blur`.
- **Signature Textures:** For primary CTAs or hero moments, apply a subtle linear gradient from `primary` (#5f5e5e) to `primary_dim` (#535252). This adds a metallic, silken "soul" to the interface.

---

## 3. Typography: Architectural Narrative
We use **Manrope** for its geometric clarity and architectural "bones." Varied weights create a "narrative flow" that guides operators from headline metric to granular detail.

- **Display (L/M/S):** Light (300) weight. Generous letter-spacing (-0.02em). Acts as the "sculpture" — used for large hero numbers.
- **Headlines (L/M/S):** Semibold (600). Structural anchor for page titles and section headers.
- **Titles (L/M/S):** Medium (500). Clear, confident labeling for cards and panels.
- **Body (L/M/S):** Regular (400). Optimized for readability with slightly increased line-height (1.6).
- **Labels:** Bold (700) and All-Caps for metadata (event counts, latency, token totals). High-End Editorial contrast against softer body text.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to represent distance; we use light.

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f2f4f4) section. The delta in brightness creates a soft, natural lift.

### Ambient Shadows
When an element must float (e.g., a stat card or modal):
- **Shadow:** Use the `on-surface` color (#2d3435) at 4% opacity with a 40px blur.
- **Focus States:** A focused input should not have a blue ring. It should have a soft, internal glow using `secondary_container` (#ffdcc4) with a 15px outer blur — a **"glowing ember"** that signals attention without alarm.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use a **Ghost Border**: `outline-variant` (#adb3b4) at 15% opacity. Never use a 100% opaque border.

---

## 5. Components

### Buttons: The "Soft Tactile" Approach
- **Primary:** Gradient from `primary` (#5f5e5e) to `primary_dim` (#535252). Corner radius: `md` (6px).
- **Secondary:** `surface-container-highest` (#dde4e5) with `on-surface` text.
- **Interaction:** On hover, shift the gradient subtly toward `primary_container` (#e5e2e1).

### Cards & Lists: The "No-Divider" Rule
Forbid the use of divider lines. Separate items using:
- **Vertical White Space:** Use `2rem` (32px) between list items.
- **Subtle Tonal Shifts:** Alternate backgrounds between `surface` and `surface-container-low` for large data arrays.

### Input Fields
- **Default State:** `surface-container-low` fill, no border.
- **Focus State:** Background shifts to `surface-container-lowest`; outer glow of `secondary_container` (#ffdcc4) appears.
- **Labels:** Always `label-md` (Bold, All-Caps) positioned 8px above the field.

### Metric Indicators
Instead of color-coded severity badges, use tonal weight shifts. A high-latency event should stand out through **typography weight** (semibold vs regular) and `secondary` (#8f4f14) amber accent — not a red alert color.

---

## 6. Do's and Don'ts

### Do:
- **Embrace White Space:** If you think there is enough padding, add 20% more.
- **Use Intentional Asymmetry:** Align primary metrics left; place secondary context on a slightly offset grid.
- **Layer Tones:** Use the full spectrum of `surface-container` tokens to create a sense of physical depth.

### Don't:
- **Don't use pure black:** Use `on-surface` (#2d3435) for all high-contrast text.
- **Don't use hard corners:** Stick to `md` (6px) and `lg` (8px) corner radius.
- **Don't use blue:** Stick to the earth tones — `secondary` (amber #8f4f14) and `primary` (warm gray #5f5e5e) — to keep the interface grounded and readable under long analytical sessions.
