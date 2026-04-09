# 🧬 Atomic Skill Architecture

> How Job360 organizes AI agent skills using Atomic Design principles for maximum clarity, minimal context load, and easy maintenance.

---

## 1. The Problem We Solve

### Before (Monolithic)
```
.qwen/
├── rules/                          # 24 files, 3,296 lines total
│   ├── subagent-product-designer.mdc     # 197 lines
│   ├── doc-product-designer-rules.md     # 191 lines
│   ├── subagent-workflow-rules.mdc       # 187 lines
│   └── ... 21 more files, many overlapping
│
└── skills/                         # 14 files, 3,040 lines total
    ├── ux-ui/ui-ux-pro-max/SKILL.md        # 531 lines (over 500 limit!)
    ├── senior-qa-automation/SKILL.md       # 433 lines
    └── product-design-doc/SKILL.md         # 81 lines (but incomplete — logic in rules/)
```

**Problems:**
- ❌ Agent phải đọc 2-3 files cho 1 role (product-designer rules + doc rules + skill)
- ❌ Nội dung trùng lặp giữa `subagent-*.mdc` và `doc-*-rules.md`
- ❌ Context window bị overload khi agent load nhiều files cùng lúc
- ❌ Không rõ khi nào cần load file nào
- ❌ Update 1 rule → phải update nhiều nơi

### After (Atomic)
```
.qwen/
├── rules/                          # 4 files, ~240 lines — SHARED ATOMS ONLY
│   ├── naming.mdc                  # 80 lines: branch parsing, versioning
│   ├── workflow.mdc                # 60 lines: doc sequence, approvals
│   ├── commit-pr.mdc               # 60 lines: commit format, PR rules
│   └── telegram.mdc                # 40 lines: thread routing only
│
├── skills/                         # Role skills — SELF-CONTAINED
│   ├── product-designer/           # 80-line SKILL.md + references
│   │   ├── SKILL.md                # 80 lines: process orchestration
│   │   └── references/
│   │       ├── workflow.md         # 120 lines: 2-stage design process
│   │       ├── commands.md         # 60 lines: ccs codex command reference
│   │       ├── audit-checklist.md  # 80 lines: design system audit guide
│   │       └── report-template.md  # 60 lines: Thread 727 report format
│   │
│   ├── frontend-developer/         # Same structure
│   ├── backend-developer/          # Same structure
│   └── qa-tester/                  # Same structure
```

---

## 2. Atomic Design Model Applied

### Level 1: ATOMS — Single, indivisible concepts

**What:** One rule, one purpose. No dependencies on other files.

**Where:** `.qwen/rules/*.mdc`

| Atom File | Purpose | Lines |
|-----------|---------|-------|
| `naming.mdc` | Branch parsing, file naming, versioning | ~80 |
| `workflow.mdc` | Doc sequence (Master → Product → Eng → QA → Tasks) | ~60 |
| `commit-pr.mdc` | Commit message format, PR creation rules | ~60 |
| `telegram.mdc` | Thread routing (718/727/735) | ~40 |

**Why atoms:** These rules apply to ALL agents. By keeping them separate and short, every agent can reference them without loading unnecessary context.

**Example atom (`telegram.mdc`):**
```markdown
# Telegram Thread Routing

## Rules
- Thread 718: Changelog & releases (system only)
- Thread 727: Product-Designer, Frontend, Backend
- Thread 735: QA-Tester ONLY

## CRITICAL
- ❌ Design/Devs DO NOT report to 735
- ❌ QA DOES NOT report to 727
```
→ 40 lines. One concept. No fluff.

---

### Level 2: MOLECULES — Combinations of atoms

**What:** A group of related commands, checklists, or formats that work together.

**Where:** `skills/*/references/*.md`

| Molecule | Example Content | Lines |
|----------|----------------|-------|
| `commands.md` | All `ccs codex` commands for a role | 60 |
| `audit-checklist.md` | Step-by-step audit questions | 80 |
| `bug-report-guide.md` | How to log bugs with severity | 50 |

**Why molecules:** Agents can load these on-demand when they reach a specific step. They combine atom-level concepts (like naming rules) with role-specific execution.

**Example molecule (`commands.md` for product-designer):**
```markdown
# CCS Codex Commands — Product Designer

## Wireframe (Stage 1)
```bash
ccs codex -m "gpt-5.4-mini" --prompt "Create Pencil wireframe..."
```

## Visual UI (Stage 2 — AFTER wireframe approval)
```bash
ccs codex -m "gpt-5.4" --prompt "Design visual UI from approved wireframe..."
```
```
→ 60 lines. Copy-paste ready. No theory.

---

### Level 3: ORGANISMS — Complex workflows

**What:** Multi-step processes with decision points and branching logic.

**Where:** `skills/*/references/workflow.md`

| Organism | Example Content | Lines |
|----------|----------------|-------|
| `workflow.md` | Complete role workflow with decision points | 100-150 |
| `decision-tree.md` | If/then/else for error handling | 80 |

**Why organisms:** Workflows are complex enough to need their own file but should be separate from the orchestration logic in SKILL.md.

**Example organism (product-designer `workflow.md` excerpt):**
```markdown
# Product Designer Workflow

## Step 0: Design System Audit (MANDATORY)
1. Run ckm:design-system skill
2. Check for hardcoded hex values
3. If found → report to user → get approval → fix first
4. If clean → proceed to Step 1

## Step 1-2: Read Requirements + Check Library
...

## STAGE 1: Wireframe (gpt-5.4-mini)
1. Create wireframe layout
2. Export PNG + .pencil
3. ⏸️ WAIT FOR USER APPROVAL
4. If rejected → revise → repeat
5. If approved → proceed to STAGE 2

## STAGE 2: Visual UI (gpt-5.4)
...
```
→ 120 lines. Full workflow. Branching logic included.

---

### Level 4: TEMPLATES — Output skeletons

**What:** Exact format for reports, docs, changelogs that agents must produce.

**Where:** `skills/*/references/report-template.md`

| Template | Example Content | Lines |
|----------|----------------|-------|
| `report-template.md` | Thread 727/735 report format | 60 |
| `changelog.md` | Changelog table format | 30 |

**Why templates:** Agents need exact output formats. By separating templates from process, SKILL.md stays clean and templates are easy to update.

**Example template:**
```markdown
# Product-Designer Report (Thread 727)

**Feature:** <feature-name>
**Branch:** <branch-name>
**Issue:** #<issue-number>

## Completed Tasks
✅ Design system audit completed
✅ Component library checked
✅ STAGE 1: Wireframe created (gpt-5.4-mini)
⏸️  WAITING for user approval on wireframe

## Stage 1: Wireframe
📁 File: `Docs/01-product/wireframes/<feature>/wireframe.pencil`
- Model: gpt-5.4-mini
- Approval Status: ⏸️ Pending / ✅ Approved / ❌ Needs Revision

## Stage 2: Visual UI
📁 File: `Docs/01-product/mockups/<feature>/ui-mockup.pencil`
- Model: gpt-5.4
- Status: ⏳ Not started / ✅ Completed

## Timestamp
📅 Date: YYYY-MM-DD
⏰ Time: HH:mm
👤 Designer: Product-Designer Agent
```
→ 60 lines. Exact format. No ambiguity.

---

### Level 5: PAGES — SKILL.md (the orchestrator)

**What:** The master file that ties everything together. Contains ONLY process steps and conditional loading instructions.

**Where:** `skills/*/SKILL.md`

**What goes IN SKILL.md:**
- ✅ YAML frontmatter (name, description, trigger keywords)
- ✅ When to activate (keywords, prerequisites)
- ✅ Numbered process steps (what to do, in order)
- ✅ Explicit instructions: "Load references/X.md when doing Y"
- ✅ Output specification (where to save, what format)

**What stays OUT of SKILL.md:**
- ❌ Detailed command examples → `references/commands.md`
- ❌ Full workflow explanation → `references/workflow.md`
- ❌ Report templates → `references/report-template.md`
- ❌ Audit guidelines → `references/audit-checklist.md`

**SKILL.md structure (40-100 lines target):**
```yaml
---
name: product-designer
description: >
  UX/UI design, wireframes via Pencil MCP, Design System Audit.
  Keywords: "thiết kế UI/UX", "product design", "wireframe", "mockup"
---
```

```markdown
# Product Designer Skill

## When to Activate
- Keywords: "thiết kế UI/UX", "product design", "wireframe", "mockup"
- Prerequisites: Master Doc created & approved

## Process

### Step 0: Design System Audit
1. Load `references/audit-checklist.md`
2. Run ckm:design-system skill
3. Report results in Product Doc

### Step 1-2: Read Requirements
1. Read Master Doc + Product Doc + GitHub Issue
2. Check component library exists

### Step 3-5: Wireframe (Stage 1)
1. Load `references/commands.md` → use Stage 1 command
2. Load `references/workflow.md` → follow Stage 1 steps
3. ⏸️ WAIT for user approval

### Step 6-7: Visual UI (Stage 2)
1. Load `references/commands.md` → use Stage 2 command
2. Load `references/workflow.md` → follow Stage 2 steps
3. Only AFTER wireframe approved

### Step 8-10: Document & Report
1. Update Product Doc with design links + audit results
2. Load `references/report-template.md` → format report
3. Report to Thread 727

## Output Artifacts
- Wireframes → `Docs/01-product/wireframes/<feature>/`
- Mockups → `Docs/01-product/mockups/`
- Updated Product Doc
- Thread 727 report
```

→ **80 lines**. Clear steps. References loaded on demand.

---

## 3. How an Agent Reads (Execution Flow)

```
Agent receives: "Thiết kế UI cho feature push-code"
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 1. Match keyword → activate product-designer│
│    (from SKILL.md frontmatter description)  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 2. Read SKILL.md only (80 lines)            │
│    → Learn: what to do, in what order       │
│    → See: "Load references/audit-checklist  │
│       when doing Step 0"                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 3. Execute Step 0 → Load audit-checklist.md │
│    (80 lines, read once, then discard)       │
│    → Run audit → Report results             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 4. Execute Step 3 → Load commands.md        │
│    (60 lines, copy command, run it)          │
│    → Generate wireframe                      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 5. Execute Step 8 → Load report-template.md │
│    (60 lines, fill in, send to Thread 727)  │
└─────────────────────────────────────────────┘
```

**Key insight:** Agent never loads all references at once. It loads ONE reference per step, uses it, then moves to the next step. This keeps context window ~80-160 lines at any time, vs 600+ lines if everything was in SKILL.md.

---

## 4. Comparison Table

| Aspect | Monolithic (Before) | Atomic (After) |
|--------|-------------------|----------------|
| **Files per role** | 2-3 (scattered) | 1 SKILL.md + refs in one folder |
| **SKILL.md size** | N/A (no skill for roles) | 40-100 lines |
| **Total lines per role** | 300-400 (duplicated) | 300-350 (organized, no dupes) |
| **Context window at peak** | 600+ lines (all files) | 80-160 lines (SKILL.md + 1 ref) |
| **Update frequency** | Update 3 files per change | Update 1 file per change |
| **Agent comprehension** | Must infer relationships | Explicit loading instructions |
| **Cross-role consistency** | Each role structured differently | Same pattern for all roles |

---

## 5. Naming Conventions

### Reference files
| Pattern | Purpose | Example |
|---------|---------|---------|
| `workflow.md` | Process flow with branching | `skills/product-designer/references/workflow.md` |
| `commands.md` | Command reference | `skills/product-designer/references/commands.md` |
| `audit-checklist.md` | Audit/verification guide | `skills/product-designer/references/audit-checklist.md` |
| `report-template.md` | Output format | `skills/product-designer/references/report-template.md` |
| `*-guide.md` | How-to for specific task | `skills/qa-tester/references/bug-report-guide.md` |

### Rule files (atoms)
| Pattern | Purpose | Example |
|---------|---------|---------|
| `naming.mdc` | Naming conventions | `rules/naming.mdc` |
| `workflow.mdc` | Shared workflow | `rules/workflow.mdc` |
| `commit-pr.mdc` | Commit & PR rules | `rules/commit-pr.mdc` |
| `telegram.mdc` | Telegram routing | `rules/telegram.mdc` |

---

## 6. Migration Strategy

### Phase 1: Create new structure (this document)
- [x] Define atomic architecture
- [x] Create atom rules (4 files)
- [ ] Create role skills (SKILL.md + references/)

### Phase 2: Migrate content
- [ ] Extract product-designer content → `skills/product-designer/`
- [ ] Extract frontend-developer content → `skills/frontend-developer/`
- [ ] Extract backend-developer content → `skills/backend-developer/`
- [ ] Extract qa-tester content → `skills/qa-tester/`

### Phase 3: Deprecate old files
- [ ] Move old rule files to `.qwen/rules/deprecated/`
- [ ] Update all cross-references
- [ ] Verify all agent workflows still work

---

**Last updated:** 2026-04-07
**Version:** 1.0.0
**Status:** Implementation in progress
