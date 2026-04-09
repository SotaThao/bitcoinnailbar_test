# PM/Lead Documentation Rules

> Rules for **Project Managers and Tech Leads** — responsible for Master Doc, Tasks Doc, and workflow orchestration.

## Related Rules
- **Naming Conventions**: [doc-naming-conventions.md](./doc-naming-conventions.md)
- **Workflow**: [doc-workflow-rules.md](./doc-workflow-rules.md)
- **Product Designer**: [doc-product-designer-rules.md](./doc-product-designer-rules.md)
- **Engineer**: [doc-engineer-rules.md](./doc-engineer-rules.md)
- **QA Tester**: [doc-qa-tester-rules.md](./doc-qa-tester-rules.md)

---

## Rule 1: Master Document (MANDATORY — Create FIRST)

### 1.1 Location
```
Docs/00-master/<feature>-<ticket>_master_<yymmdd>_v<major>.<month>.<day>.md
```

### 1.2 Template
```markdown
# Master Document: [Feature Name]

## Metadata
- **Feature ID**: <ticket-number>
- **Branch Name**: feature/<id>_<feature-name>
- **File Naming Convention**: <feature>-<ticket>_<type>_<yymmdd>_v<major>.<month>.<day>.md
- **Created Date**: YYYY-MM-DD HH:mm
- **Last Updated**: YYYY-MM-DD HH:mm
- **Current Version**: v<major>.<month>.<day>
- **Author**: @name
- **Status**: Draft | Review | Approved
- **Approved By**: @name (YYYY-MM-DD)

## 1. Feature Overview
### Problem Statement
[What problem are we solving?]

### Business Context
[Why is this important for the business?]

### Goals & Objectives
- Goal 1
- Goal 2

## 2. Scope
### In-Scope
- Feature 1
- Feature 2

### Out-of-Scope
- Not including X
- Not including Y

## 3. Key Personas (Summary)
### Primary Users
- Persona 1: [Brief description]

### Secondary Users
- Persona 2: [Brief description]

## 4. Success Metrics (KPIs)
- Metric 1: [How to measure]
- Metric 2: [Target value]

## 5. High-Level Timeline
- **Phase 1**: [Description] - [Date range]
- **Phase 2**: [Description] - [Date range]

## 6. Stakeholders & Responsibilities
- **Product**: @name
- **Design**: @name
- **Development**: @name
- **QA**: @name
- **Project Manager**: @name

## 7. Related Documents
- **Product Doc**: `01-product/<filename>.md` [link]
- **Engineering Doc**: `02-engineering/<filename>.md` [link]
- **QA Doc**: `03-qa/<filename>.md` [link]
- **Tasks Doc**: `04-tasks/<filename>.md` [link]
- **GitHub Issue**: [URL]
- **Pull Request**: [URL]

## 8. Changelog
| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 10:30 | @dev-name | Initial draft | @lead | Approved |

## 9. Approval & Sign-off
- [ ] **Product Lead**: @name - Date: YYYY-MM-DD
- [ ] **Tech Lead**: @name - Date: YYYY-MM-DD
- [ ] **QA Lead**: @name - Date: YYYY-MM-DD
- [ ] **Project Manager**: @name - Date: YYYY-MM-DD

## 10. Notes & Assumptions
- Note 1
- Assumption 1
```

### 1.3 Master Doc Rules
- **MUST** be created BEFORE any detailed docs
- **MUST** be approved before implementation starts
- **MUST** have links to all child docs (update after they're created)
- **MUST** maintain changelog with HH:mm timestamps
- **MUST** have all stakeholder sign-offs before coding begins

---

## Rule 2: Tasks Document

### 2.1 Location
```
Docs/04-tasks/<feature>-<ticket>_tasks_<yymmdd>_v<major>.<month>.<day>.md
```

### 2.2 Template
```markdown
# Tasks: [Feature Name]

## Metadata
- **Master Doc**: [link to 00-master/]
- **Created**: YYYY-MM-DD HH:mm
- **Last Updated**: YYYY-MM-DD HH:mm

## Phase 1: Setup
- [ ] Task 1.1: [Description] - **Assignee**: @name - **Est**: Xh - **Issue**: [URL]
- [ ] Task 1.2: ...

## Phase 2: Implementation
- [ ] Task 2.1: ...

## Phase 3: Testing & QA
- [ ] Task 3.1: ...

## Phase 4: Deployment
- [ ] Task 4.1: ...

## Dependencies & Blockers
- Dependency 1
- Blocker 1 (if any)

## Changelog
| Version | Date | Time | Author | Changes |
|---------|------|------|--------|---------|
| v1.0.0 | 2026-04-04 | 10:30 | @pm | Initial task breakdown |
```

### 2.3 Task Breakdown Rules
- Break into **4 phases**: Setup → Implementation → Testing → Deployment
- Each task **MUST** have: description, assignee, estimate, GitHub issue link
- Identify **dependencies and blockers** explicitly
- Update task status (`[ ]` → `[x]`) as work progresses

---

## Rule 3: Workflow Orchestration

### 3.1 PM/Lead Responsibilities
1. **Parse branch name** → extract ticket ID + description
2. **Create Master Doc** → fill template → get approval
3. **Coordinate subagents** → assign Product Doc to Product-Designer, Engineering Doc to Engineer, QA Doc to QA-Tester
4. **Cross-link all docs** → update Master Doc "Related Documents" after all children created
5. **Create Tasks Doc** → break down work → assign → track
6. **Gate implementation** → ensure all docs approved before coding starts

### 3.2 Master Doc Distribution
```
Master Doc created → approved → triggers:
  ├── Product-Designer agent → creates Product Doc (01-product/)
  ├── Frontend-Developer agent → creates Engineering Doc FE section (02-engineering/)
  ├── Backend-Developer agent → creates Engineering Doc BE section (02-engineering/)
  ├── QA-Tester agent → creates QA Doc (03-qa/)
  └── PM/Lead → creates Tasks Doc (04-tasks/)
```

---

## Rule 4: Changelog & Version Tracking

### 4.1 Master Doc Updates
Every time a child doc is created or updated:
1. Update Master Doc "Related Documents" section
2. Add entry to Master Doc changelog
3. Increment version
4. Update "Last Updated" timestamp

### 4.2 Tasks Doc Updates
- Mark tasks complete as work progresses
- Add changelog entry for each status update
- Update blockers section if new blockers appear

---

## Rule 5: PM/Lead Checklist

### New Feature Setup
- [ ] Parse branch name: `feature/<id>_<feature-name>`
- [ ] Create `00-master/<feature>-<id>_master_<yymmdd>_v1.0.0.md`
- [ ] Fill complete Master Doc template
- [ ] Add metadata (version, date, time, author)
- [ ] Add empty changelog table
- [ ] Get stakeholder approval
- [ ] Assign subagents to create Product/Engineering/QA docs
- [ ] Create Tasks Doc with task breakdown
- [ ] Cross-link all docs
- [ ] Update Master Doc with all child links

### Ongoing Tracking
- [ ] Review task completion status
- [ ] Update Master Doc when child docs change
- [ ] Track version increments across all docs
- [ ] Ensure changelog timestamps are present (HH:mm)
- [ ] Confirm all approvals obtained before implementation
