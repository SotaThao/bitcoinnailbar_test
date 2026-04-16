# Product Designer Workflow

> Detailed workflow with branching logic. Load from SKILL.md when executing Steps 3-7.

---

## Step 0: Design System Audit (MANDATORY — BEFORE any design)

```
1. Activate ckm:design-system skill
   → Load: .qwen/skills/ux-ui/design-system/SKILL.md

2. Scan codebase for:
   - Existing CSS variables (var(--color-primary), etc.)
   - Hardcoded hex values (#2563EB, #f59e0b, etc.)
   - Token layer compliance: primitive → semantic → component

3. Decision point:
   ├── Tokens OK → Proceed to Step 1
   └── Tokens need update → Report to user → Get approval → Fix first → Then proceed
```

---

## Step 1-2: Requirements + Library Check

```
1. Read Master Doc → Understand scope, persona, scenario
2. Read Product Doc → UX principles, user flow, wireframe requirements
3. Read GitHub Issue → Context, discussion, additional requirements

4. Check component library:
   File: Docs/01-product/design-system/<project>-library.pencil

   ├── EXISTS → Import library → Reuse components → Only create new ones
   │   Components to check: Button, Input, Card, Modal, Navbar
   │
   └── NOT EXISTS → Create base components → Save library → Export specs
       Components to create: Button (3 variants), Input (4 states),
       Card (3 variants), Modal, Navbar
```

---

## ═══════════════════════════════════════════════════════
## STAGE 1: WIREFRAME (gpt-5.4-mini)
## ═══════════════════════════════════════════════════════

### Step 3: Create Wireframe

```
1. Run command from references/commands.md → Stage 1
   ccs codex -m "gpt-5.4-mini" --prompt "Create Pencil wireframe design for <feature-name> (Ticket: #<number>)..."

2. Design parameters:
   - Name: <feature-name>-<ticket-id>-wireframe
   - Import library components FIRST
   - Focus: Structure, layout, spacing, component hierarchy
   - Use GRAYSCALE only (no color polish)
   - No shadows, gradients, or visual effects

3. Opens in NEW Pencil tab in Cursor
```

### Step 4: Refine & Export

```
1. Arrange components per feature requirements
2. Ensure responsive breakpoints:
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: > 1024px
3. Export:
   - PNG → Docs/01-product/wireframes/<feature>/wireframe.png
   - Pencil → Docs/01-product/wireframes/<feature>/wireframe.pencil
```

### Step 5: ⏸️ WAIT FOR USER APPROVAL

```
1. Present wireframe to user
2. Show file path + PNG preview
3. Ask: "Approve wireframe? (Yes / Request changes)"

Decision point:
├── APPROVED → Proceed to STAGE 2
└── REJECTED → User provides feedback
    → Revise wireframe (still gpt-5.4-mini)
    → Export updated version
    → Present again
    → Repeat until approved
```

---

## ═══════════════════════════════════════════════════════
## STAGE 2: VISUAL UI DESIGN (gpt-5.4)
## ═══════════════════════════════════════════════════════
## ⚠️ ONLY begins AFTER wireframe approved
---

### Step 6: Visual UI Design

```
1. Load approved wireframe: Docs/01-product/wireframes/<feature>/wireframe.pencil
2. Run command from references/commands.md → Stage 2
   ccs codex -m "gpt-5.4" --prompt "Design visual UI from APPROVED wireframe..."

3. Design parameters:
   - Name: <feature-name>-<ticket-id>-visual
   - Apply color palette (design tokens: var(--color-primary), etc.)
   - Apply typography (font families, sizes, weights)
   - Add icons (Material Design or custom)
   - Add visual hierarchy (contrast, emphasis, whitespace)
   - Add effects (shadows, borders, gradients — if needed)
   - Maintain accessibility (contrast ratio >= 4.5:1)
```

### Step 7: Visual Polish

```
1. Refine spacing, alignment, visual balance
2. Add micro-interactions details:
   - Hover states
   - Active states
   - Transition details
3. Export:
   - PNG → Docs/01-product/mockups/<feature>/ui-mockup.png
   - Final → Docs/01-product/mockups/<feature>/final-mockup.png
   - Pencil → Docs/01-product/mockups/<feature>/ui-mockup.pencil

4. OPTIONAL: Gemini 3.1 Pro for complex visuals
```

---

## Step 8-10: Documentation & Report

```
1. Update Product Doc:
   - Add wireframe link (Stage 1, gpt-5.4-mini)
   - Add visual UI link (Stage 2, gpt-5.4)
   - Add Design System Audit results
   - Add Component Library status
   - Increment version + changelog (HH:mm timestamp)

2. Format report using references/report-template.md

3. Send to Thread 727:
   node scripts/send-dev-report.js --agent "product-designer" ... --thread "727"
```

---

## Blocking Conditions

| Condition | Action |
|-----------|--------|
| Master Doc not approved | Report to Thread 727 → ❌ Blocked → Wait |
| Design System Audit fails | Report to user → Get approval → Fix first |
| Wireframe rejected | Revise → Re-present → Wait for approval |
| Pencil extension not found | Must run in Cursor Terminal (not external) |
