---
name: product-designer
description: >
  UX/UI design, wireframes via Pencil MCP, Design System Audit, component library.
  Keywords: "thiết kế UI/UX", "product design", "wireframe", "mockup", "design phase"
  Prerequisites: Master Doc created & approved, Product Doc exists.
---

# Product Designer Skill

> Role: UX/UI design, wireframes, Design System Audit, component library management.

---

## When to Activate

- **Keywords:** "thiết kế UI/UX", "product design", "wireframe", "mockup", "design phase"
- **Prerequisites:**
  - ✅ Master Doc created & approved
  - ✅ Product Doc exists in `Docs/01-product/`
  - ✅ GitHub Issue available

## Input Artifacts

- Master Doc: `Docs/00-master/<feature>-<ticket>_master_*.md`
- Product Doc: `Docs/01-product/<feature>-<ticket>_product_*.md`
- GitHub Issue: `https://github.com/PersonalProjectJob/Job360/issues/<number>`

## Process

### Step 0: Design System Audit (MANDATORY)
1. Load `references/audit-checklist.md`
2. Run `ckm:design-system` skill (`.qwen/skills/ux-ui/design-system/SKILL.md`)
3. Scan CSS for hardcoded hex values → suggest `var()` replacements
4. If tokens need update → report to user → get approval → fix FIRST
5. Document audit results in Product Doc

### Step 1-2: Read Requirements + Check Library
1. Read Master Doc + Product Doc + GitHub Issue
2. Check component library: `Docs/01-product/design-system/<project>-library.pencil`
   - **If EXISTS:** Import → reuse → only create new components
   - **If NOT EXISTS:** Create component library (first feature)

### Step 3-5: Wireframe — Stage 1 (gpt-5.4-mini)
1. Load `references/commands.md` → use Stage 1 command
2. Load `references/workflow.md` → follow Stage 1 steps
3. Export PNG + `.pencil` to `Docs/01-product/wireframes/<feature>/`
4. ⏸️ **WAIT FOR USER APPROVAL** — do NOT proceed without it
5. If rejected → revise → repeat Stage 1

### Step 6-7: Visual UI — Stage 2 (gpt-5.4)
1. **ONLY after wireframe approved**
2. Load `references/commands.md` → use Stage 2 command
3. Load `references/workflow.md` → follow Stage 2 steps
4. Export to `Docs/01-product/mockups/<feature>/`

### Step 8-10: Document & Report
1. Update Product Doc with: design links, audit results, component library status
2. Load `references/report-template.md` → format Thread 727 report
3. Send report to Thread 727

## Output Artifacts

| Artifact | Location |
|----------|----------|
| Design System Audit Report | Embedded in Product Doc |
| Component Library | `Docs/01-product/design-system/<project>-library.pencil` |
| Wireframes | `Docs/01-product/wireframes/<feature>/` |
| UI Mockups | `Docs/01-product/mockups/<feature>/` |
| Updated Product Doc | `Docs/01-product/<feature>-<ticket>_product_*.md` |
| Thread 727 Report | Telegram Thread 727 |

## Related Rules

- **Naming:** `.qwen/rules/naming.mdc`
- **Workflow:** `.qwen/rules/workflow.mdc`
- **Telegram:** `.qwen/rules/telegram.mdc`
