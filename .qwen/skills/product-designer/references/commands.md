# CCS Codex Commands — Product Designer

> Load from SKILL.md when executing Step 3 (wireframe) or Step 6 (visual UI).

---

## Stage 1: Wireframe Creation

### Create Wireframe
```bash
ccs codex -m "gpt-5.4-mini" \
  --prompt "Create Pencil wireframe design for <feature-name> (Ticket: #<number>).

  REQUIREMENTS:
  - Use existing component library: Docs/01-product/design-system/<project>-library.pencil
  - Reuse components: Button, Input, Card, Modal, Navbar
  - Design name: <feature-name>-<ticket-id>-wireframe
  - Open in new Pencil tab in Cursor

  FOCUS (Structure & Layout ONLY):
  - Component hierarchy and layout structure
  - Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
  - Spacing and alignment
  - User flow and navigation

  CONSTRAINTS:
  - Use GRAYSCALE colors only (no color polish)
  - No shadows, gradients, or visual effects
  - Focus on structure, not visual design
  - Keep it simple and clear"
```

### Export Wireframe
```bash
ccs codex -m "gpt-5.4-mini" \
  --prompt "Export wireframe to:
  - PNG: Docs/01-product/wireframes/<feature>/wireframe.png
  - Pencil: Docs/01-product/wireframes/<feature>/wireframe.pencil"
```

---

## Stage 2: Visual UI Design (AFTER wireframe approval)

### Create Visual UI
```bash
ccs codex -m "gpt-5.4" \
  --prompt "Design visual UI from APPROVED wireframe.

  INPUT:
  - Approved wireframe: Docs/01-product/wireframes/<feature>/wireframe.pencil
  - Feature: <feature-name> (Ticket: #<number>)
  - Design name: <feature-name>-<ticket-id>-visual

  VISUAL DESIGN FOCUS:
  - Color palette: Use design tokens (var(--color-primary), var(--color-secondary))
  - Typography: Font families, sizes, weights, line-height
  - Icons: Material Design icons or custom icons
  - Visual hierarchy: Contrast, emphasis, whitespace
  - Effects: Shadows, borders, gradients (if needed)

  DESIGN SYSTEM:
  - Use existing tokens from Docs/01-product/design-system/
  - Follow component variants (primary, secondary, danger buttons)
  - Maintain accessibility (contrast ratio >= 4.5:1)

  OUTPUT:
  - Save to: Docs/01-product/mockups/<feature>/ui-mockup.pencil
  - Export PNG: Docs/01-product/mockups/<feature>/ui-mockup.png"
```

### Visual Polish
```bash
ccs codex -m "gpt-5.4" \
  --prompt "Polish visual design:
  - Refine spacing, alignment, visual balance
  - Add hover states and transition details
  - Optimize visual hierarchy
  - Export final: Docs/01-product/mockups/<feature>/final-mockup.png"
```

---

## Component Library Management

### Check Library Exists
```bash
if [ -f "Docs/01-product/design-system/<project>-library.pencil" ]; then
  echo "✅ Library exists — reuse components"
  ccs codex -m "gpt-5.4-mini" \
    --prompt "Import from library and reuse existing components..."
else
  echo "🆕 First feature — create base library"
  ccs codex -m "gpt-5.4-mini" \
    --prompt "Create component library with base components:
    Button (primary, secondary, danger), Input (text, password, search),
    Card (default, elevated, outlined), Modal, Navbar.
    Save to: Docs/01-product/design-system/<project>-library.pencil"
fi
```

---

## Important Notes

- **MUST run in Cursor Terminal** — not external terminal (CMD, PowerShell)
- **Model matters:** gpt-5.4-mini for wireframe, gpt-5.4 for visual UI
- **Never use gpt-5.4 for wireframe** — wastes tokens, unnecessary polish
- **Never use gpt-5.4-mini for visual UI** — lacks polish capability
