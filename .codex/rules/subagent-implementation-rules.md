# Subagent Implementation Rules — Index

> **Master index** for all subagent rules. This file links to role-specific rule files.

---

## Overview

Subagent rules are organized by **role** to make each rule file self-contained. Each role file has cross-links to shared workflow rules.

### Architecture
```
subagent-implementation-rules.md (this file — index/overview)
├── subagent-workflow-rules.mdc          # SHARED: tool setup, roles, Telegram, communication
├── subagent-product-designer.mdc        # Product-Designer: UX/UI, Pencil MCP, Design Audit
├── subagent-frontend-developer.mdc      # Frontend-Developer: React/TSX, UI, i18n
├── subagent-backend-developer.mdc       # Backend-Developer: APIs, DB, business logic
└── subagent-qa-tester.mdc               # QA-Tester: testing, bug reporting, quality gates
```

---

## Quick Start: Which File Do I Read?

| Your Role | Start Here | Then Read |
|-----------|-----------|-----------|
| **Product-Designer** | [subagent-product-designer.mdc](./subagent-product-designer.mdc) | [subagent-workflow-rules.mdc](./subagent-workflow-rules.mdc) |
| **Frontend-Developer** | [subagent-frontend-developer.mdc](./subagent-frontend-developer.mdc) | [subagent-workflow-rules.mdc](./subagent-workflow-rules.mdc) |
| **Backend-Developer** | [subagent-backend-developer.mdc](./subagent-backend-developer.mdc) | [subagent-workflow-rules.mdc](./subagent-workflow-rules.mdc) |
| **QA-Tester** | [subagent-qa-tester.mdc](./subagent-qa-tester.mdc) | [subagent-workflow-rules.mdc](./subagent-workflow-rules.mdc) |

---

## Subagent List

| Subagent | Role | Doc Responsibility | Reports To | When Active |
|----------|------|-------------------|------------|-------------|
| `Product-Designer` | UX/UI Design, Wireframes | Product Doc (`01-product/`) | Thread 727 | Phase 1 |
| `Frontend-Developer` | Frontend (React/TSX) | Engineering Doc — FE section (`02-engineering/`) | Thread 727 | Phase 2 |
| `Backend-Developer` | Backend (APIs, DB) | Engineering Doc — BE section (`02-engineering/`) | Thread 727 | Phase 2 |
| `QA-Tester` | Testing, validation | QA Doc (`03-qa/`) | Thread 735 | Phase 3 |

---

## Telegram Thread Routing

| Thread | Who Reports | What |
|--------|------------|------|
| **718** | System (auto) | Changelog, Master Doc updates, releases |
| **727** | Product-Designer, Frontend-Developer, Backend-Developer | Design & implementation progress |
| **735** | QA-Tester **ONLY** | Test results, quality gates |

**CRITICAL:**
- ❌ QA-Tester **DOES NOT** report to 727
- ❌ Design/Devs **DO NOT** report to 735

---

## Workflow Overview

```
Phase 0: Plan Mode → Master Doc (feature/* only)
  ↓
Phase 1: Product-Designer → Thread 727
  ↓ [User approves design]
  ↓
Phase 2: Frontend + Backend (parallel) → Thread 727
  ↓ [Both complete, PRs → test]
  ↓
Phase 3: QA-Tester → Thread 735
  ↓
  QA PASS → Thread 718 → Merge
  QA FAIL → Report user → Wait
```

### Bugfix/Hotfix → Start at Phase 2 (skip design)

---

## Tool Requirements

| Tool | Purpose |
|------|---------|
| **Pencil MCP** | Wireframe & prototype design (Cursor extension) |
| **Codex CLI** | AI-assisted code generation |
| **QwenCLI** | Main code implementation |
| **GitHub CLI (`gh`)** | PR creation, issue management |
| **Telegram Bot** | Thread notifications |

---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| v1.0.0 | 2026-04-04 | Initial monolithic file (1356 lines) |
| v2.0.0 | 2026-04-04 | Split into role-specific .mdc files + index |
