---
name: product-design-doc
description: >
  Plan Part 1 — Product / UX: root cause, Persona, Scenario, Audit, product Solution,
  User Flow (Mermaid), Wireframe. Follow plan-workflow.mdc for PLAN flow and file rules.
models:
  wireframe: chatgpt-5-4-mini-extra-high
  visual-ui: chatgpt-5-4-extra-high
---

# Product-design doc (Part 1 — Product / UX)

**Readable name:** product-design doc · **PLAN Part 1**

## When to Activate

- Plan mode before engineering detail; keywords: product design, UX, Persona, Scenario, wireframe, user flow, root cause.

## Role

**Why / who / what’s wrong / product-level solution / user journey (diagram) / UI structure (wireframe).** Not file-by-file implementation (that is **engineering-doc**).

## Sections (order)

1. **Persona**  
2. **Scenario**  
3. **Audit** (problem + **root cause** when known)  
4. **Solution (Product & UX)** — goals, scope, metrics; not repo file lists  
5. **User Flow** — **Mermaid required**  
6. **Wireframe**  

---

### Persona

```markdown
## Persona
### Primary Users
- …
### Secondary Users
- …
```

### Scenario

```markdown
## Scenario
### Current State
…
### Desired State
…
### Business Impact
- …
```

### Audit

High-level areas only; deep mapping → **engineering-doc**.

```markdown
## Audit
### Problem / root cause
- …
### Codebase review (high level)
- **Areas touched**: …
### Gaps identified
1. …
```

### Solution (Product & UX)

```markdown
## Solution (Product & UX)
### Product goals
- …
### UX principles
- …
### In scope / Out of scope
- …
```

### User Flow

**Must** include Mermaid (`flowchart`, `sequenceDiagram`, or `journey`). No prose-only substitute.

- Node IDs: no spaces; complex labels: follow Mermaid quoting rules; no HTML entities in labels.

### Wireframe

```markdown
## Wireframe
### Component layout
…
### Responsive breakpoints
- …
```

---

## Checklist (Part 1)

- [ ] Root cause clear where relevant  
- [ ] Solution stays product/UX (no eng task list)  
- [ ] User Flow = valid Mermaid  
- [ ] Wireframe matches scenario + flow  

## PLAN — bước tiếp theo

Sau Phần 1: **engineering-doc** → **qa-doc**. Quy ước `docs/06-tasks/`, issue URL, changelog: **`.cursor/rules/plan-workflow.mdc`**.
