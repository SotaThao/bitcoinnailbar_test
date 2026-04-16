---
name: frontend-developer
description: >
  React/TSX implementation, UI components, styling, i18n.
  Keywords: "implement frontend", "code UI", "frontend development", "after design approval"
  Prerequisites: Product-Designer completed, user approved design, Engineering Doc ready.
---

# Frontend Developer Skill

> Role: Implement frontend components following design specifications.

---

## When to Activate

- **Keywords:** "implement frontend", "code UI", "frontend development", "after design approval"
- **Prerequisites:**
  - ✅ Product-Designer completed & design approved
  - ✅ Engineering Doc ready (FE section)
  - ✅ Branch created

## Input Artifacts

- Master Doc: `Docs/00-master/<feature>-<ticket>_master_*.md`
- Engineering Doc: `Docs/02-engineering/<feature>-<ticket>_engineering_*.md` (FE section)
- Design Mockups: `Docs/01-product/mockups/<feature>/`

## Process

### Step 1: Read Requirements & Design
1. Read Master Doc + Engineering Doc (FE section)
2. Review design mockups → understand component structure
3. Check existing codebase for patterns

### Step 2: Plan Implementation
1. Task breakdown → identify components to create/modify
2. Check existing component library for reuse
3. Plan state management (Z Zustand) + data fetching (TanStack Query)

### Step 3: Implement Components
1. Load `references/implementation-guide.md` for detailed steps
2. Import order: React → third-party → `@/` → relative
3. Component structure: Interface → hooks → handlers → JSX
4. API via `services/` only — no raw fetch in UI
5. TypeScript types required — no `any`
6. Tailwind + `cn()` for styling
7. i18n: all text via `t()` — NO hardcoded strings

### Step 4: Clean Code Review (Before Commit)
1. Remove all `console.*` calls
2. Check for hard-coded values → move to env/constants
3. Verify import order
4. Run TypeScript check → ESLint → Build

### Step 5: Commit + PR
1. Load `.qwen/rules/commit-pr.mdc` for commit format
2. Commit subject = branch name (MANDATORY)
3. Create PR → `test` branch (Rule 3.5)
4. Load `references/report-template.md` → format report
5. Report to Thread 727

## Output Artifacts

| Artifact | Location |
|----------|----------|
| Frontend components | `src/` |
| Updated Engineering Doc (FE section) | `Docs/02-engineering/` |
| PR (→ test) | GitHub |
| Thread 727 Report | Telegram Thread 727 |

## Related Rules

- **Naming:** `.qwen/rules/naming.mdc`
- **Workflow:** `.qwen/rules/workflow.mdc`
- **Commit/PR:** `.qwen/rules/commit-pr.mdc`
- **Telegram:** `.qwen/rules/telegram.mdc`
