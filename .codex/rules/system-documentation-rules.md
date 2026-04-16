# System Documentation Rules — Index

> **Master index** for all documentation rules. This file links to role-specific rule files.

---

## Overview

Documentation rules are organized by **role** to make each rule file self-contained and easy to follow. Each role file has cross-links to all others.

### Architecture
```
system-documentation-rules.md (this file — index/overview)
├── doc-naming-conventions.md      # SHARED: naming, versioning, folder structure
├── doc-workflow-rules.md          # SHARED: sequential workflow, approvals, changelog
├── doc-pm-lead-rules.md           # PM/Lead: Master Doc, Tasks Doc
├── doc-product-designer-rules.md  # Product Designer: Product Doc, wireframes
├── doc-engineer-rules.md          # Engineer: Engineering Doc (FE + BE)
└── doc-qa-tester-rules.md         # QA Tester: QA Doc, test cases
```

---

## Quick Start: Which File Do I Read?

| Your Role | Start Here | Then Read |
|-----------|-----------|-----------|
| **PM / Tech Lead** | [doc-pm-lead-rules.md](./doc-pm-lead-rules.md) | [doc-workflow-rules.md](./doc-workflow-rules.md), [doc-naming-conventions.md](./doc-naming-conventions.md) |
| **Product Designer** | [doc-product-designer-rules.md](./doc-product-designer-rules.md) | [doc-naming-conventions.md](./doc-naming-conventions.md), [doc-workflow-rules.md](./doc-workflow-rules.md) |
| **Frontend Developer** | [doc-engineer-rules.md](./doc-engineer-rules.md) → Frontend Section | [doc-product-designer-rules.md](./doc-product-designer-rules.md) (for wireframes), [doc-naming-conventions.md](./doc-naming-conventions.md) |
| **Backend Developer** | [doc-engineer-rules.md](./doc-engineer-rules.md) → Backend Section | [doc-naming-conventions.md](./doc-naming-conventions.md), [doc-workflow-rules.md](./doc-workflow-rules.md) |
| **QA Tester** | [doc-qa-tester-rules.md](./doc-qa-tester-rules.md) | [doc-engineer-rules.md](./doc-engineer-rules.md) (for API specs), [doc-naming-conventions.md](./doc-naming-conventions.md) |

---

## Shared Rules (ALL Roles Must Follow)

### 1. Naming Conventions
📄 **[doc-naming-conventions.md](./doc-naming-conventions.md)**

Covers:
- `Docs/` folder structure and location rules
- Branch name parsing (`feature/<id>_<description>`)
- File naming format (`<feature>-<ticket>_<type>_<yymmdd>_v<major>.<month>.<day>.md`)
- Versioning scheme (`v<major>.<month>.<day>`)

### 2. Workflow Rules
📄 **[doc-workflow-rules.md](./doc-workflow-rules.md)**

Covers:
- Sequential order (Master → Product → Engineering → QA → Tasks)
- Cross-references & links between docs
- Approval flow (who reviews what)
- Changelog requirements (HH:mm timestamps)
- Role responsibility matrix
- Version control during updates

---

## Role-Specific Rules

### 3. PM/Lead
📄 **[doc-pm-lead-rules.md](./doc-pm-lead-rules.md)**

| Responsibility | Doc | Location |
|---------------|-----|----------|
| Master Doc template | `00-master/<feature>-<ticket>_master_*.md` | `Docs/00-master/` |
| Tasks Doc template | `04-tasks/<feature>-<ticket>_tasks_*.md` | `Docs/04-tasks/` |
| Workflow orchestration | — | — |
| Stakeholder sign-off | — | — |

**Key duties:**
- Create Master Doc FIRST (before any other docs)
- Coordinate subagents (Product Designer, Engineer, QA)
- Cross-link all docs in Master Doc
- Create Tasks Doc with task breakdown
- Gate implementation (all docs must be approved before coding)

### 4. Product Designer
📄 **[doc-product-designer-rules.md](./doc-product-designer-rules.md)**

| Responsibility | Doc | Location |
|---------------|-----|----------|
| Product Doc | `01-product/<feature>-<ticket>_product_*.md` | `Docs/01-product/` |
| Design System Audit | Embedded in Product Doc | `Docs/01-product/` |
| Wireframes | Embedded in Product Doc | `Docs/01-product/wireframes/` |
| Component Library | `.pencil` files | `Docs/01-product/design-system/` |

**Key duties:**
- Design System Audit (token compliance check)
- User Flow (Mermaid diagram required)
- Wireframe with responsive breakpoints
- Component inventory (reuse vs. new)

### 5. Engineer (Frontend + Backend)
📄 **[doc-engineer-rules.md](./doc-engineer-rules.md)**

| Responsibility | Doc | Location |
|---------------|-----|----------|
| Engineering Doc | `02-engineering/<feature>-<ticket>_engineering_*.md` | `Docs/02-engineering/` |
| Frontend section | Components, UI specs, implementation | Same file |
| Backend section | APIs, DB schema, business logic | Same file |

**Key duties:**
- Document architecture and technical decisions
- List all new/modified files with details
- Specify API endpoints (request/response schema)
- Address security considerations
- Assess performance implications

### 6. QA Tester
📄 **[doc-qa-tester-rules.md](./doc-qa-tester-rules.md)**

| Responsibility | Doc | Location |
|---------------|-----|----------|
| QA Doc | `03-qa/<feature>-<ticket>_qa_*.md` | `Docs/03-qa/` |
| Test cases | Embedded in QA Doc | Same file |
| Bug reports | Embedded in QA Doc or GitHub Issues | Same file / GitHub |

**Key duties:**
- Write test cases (happy path + edge cases)
- Define Acceptance Criteria (Definition of Done)
- Set performance benchmarks
- Document security tests (if applicable)
- Report bugs with reproduction steps

---

## Workflow Overview

```
1. PM/Lead: Create Master Doc → Get approval
       ↓
2. Product Designer: Create Product Doc (UX)
       ↓
3. Engineer: Create Engineering Doc (Technical)
       ↓
4. QA Tester: Create QA Doc (Testing)
       ↓
5. PM/Lead: Create Tasks Doc → Cross-link all docs
       ↓
6. ALL: Get approvals → Begin implementation
       ↓
7. Continuous: Update docs with changelog
```

**CRITICAL RULES:**
- ❌ **NEVER** create Product/Engineering/QA docs without Master Doc
- ✅ Master Doc **MUST** be approved before detailed docs
- ✅ Every doc **MUST** have "Related Documents" section with links
- ✅ Every update **MUST** increment version and log in changelog

---

## Complete Example: "Push Code" Feature

### Branch Info
- **Branch**: `feature/1_push-code`
- **Date**: April 4, 2026
- **System Version**: 1.x.x

### File Structure
```
Docs/
├── 00-master/
│   └── push-code-1_master_260404_v1.0.0.md
├── 01-product/
│   └── push-code-1_product_260404_v1.0.0.md
├── 02-engineering/
│   └── push-code-1_engineering_260404_v1.0.0.md
├── 03-qa/
│   └── push-code-1_qa_260404_v1.0.0.md
├── 04-tasks/
│   └── push-code-1_tasks_260404_v1.0.0.md
└── 05-changelog/
    └── push-code-1_changelog_260404_v1.0.0.md
```

---

## References

### Skill Files
- `.qwen/skills/product-design-doc/SKILL.md`
- `.qwen/skills/engineering-doc/SKILL.md`
- `.qwen/skills/qa-doc/SKILL.md`

### Other Rules
- `.qwen/rules/commit-and-pr-rules.md`
- `.qwen/rules/frontend-code-standards.mdc`
- `.qwen/rules/frontend-ui-ux-design.mdc`
- `.qwen/rules/plan-workflow.mdc`

---

## Changelog

| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 10:30 | @dev | Initial system-documentation-rules.md (monolithic) | @lead | Approved |
| v2.0.0 | 2026-04-04 | 16:30 | @dev | Split into role-specific rule files (major restructure) | TBD | Review |
