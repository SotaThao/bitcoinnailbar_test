# Documentation Workflow Rules

> **Shared rules for ALL roles** — defines the sequential order, cross-references, approval flow, and changelog.

## Related Rules
- **Naming Conventions**: [doc-naming-conventions.md](./doc-naming-conventions.md)
- **PM/Lead**: [doc-pm-lead-rules.md](./doc-pm-lead-rules.md)
- **Product Designer**: [doc-product-designer-rules.md](./doc-product-designer-rules.md)
- **Engineer**: [doc-engineer-rules.md](./doc-engineer-rules.md)
- **QA Tester**: [doc-qa-tester-rules.md](./doc-qa-tester-rules.md)

---

## Rule 1: Sequential Order (MANDATORY)

### 1.1 Document Creation Order
```
1. Master Doc (PM/Lead creates FIRST)
       ↓
2. Product Doc (Product Designer — Part 1: UX)
       ↓
3. Engineering Doc (Engineer — Part 2: Technical)
       ↓
4. QA Doc (QA Tester — Part 3: Testing)
       ↓
5. Tasks Doc (PM/Lead — Task breakdown)
       ↓
6. Implementation (Engineer codes)
       ↓
7. Continuous updates with changelog
```

### 1.2 Critical Gates
| Gate | Rule | Consequence |
|------|------|-------------|
| Gate 1 | ❌ **NEVER** create Product/Engineering/QA docs without Master Doc | Workflow violation |
| Gate 2 | ✅ Master Doc **MUST** be approved before detailed docs | Blocks Phase 2 |
| Gate 3 | ✅ All docs **MUST** be cross-linked before implementation | Blocks coding |
| Gate 4 | ✅ Implementation **MUST** follow approved docs | No scope creep |

### 1.3 Step-by-Step Workflow
```
Step 1: Parse branch name (see doc-naming-conventions.md Rule 2)
Step 2: Create Master Doc → Get user approval (MANDATORY)
Step 3: Create Product Doc (follow doc-product-designer-rules.md)
Step 4: Create Engineering Doc (follow doc-engineer-rules.md)
Step 5: Create QA Doc (follow doc-qa-tester-rules.md)
Step 6: Create Tasks Doc (follow doc-pm-lead-rules.md)
Step 7: Cross-link all docs (Rule 2 below)
Step 8: Update version on each change (see doc-naming-conventions.md Rule 4)
Step 9: Begin implementation (only after all docs approved)
```

---

## Rule 2: Cross-References & Links

### 2.1 Related Documents Section (Required in EVERY Doc)
Every document **MUST** have this section near the top:

```markdown
## Related Documents
- **Master Doc**: `00-master/<filename>.md` [link]
- **Product Doc**: `01-product/<filename>.md` [link] (if applicable)
- **Engineering Doc**: `02-engineering/<filename>.md` [link] (if applicable)
- **QA Doc**: `03-qa/<filename>.md` [link] (if applicable)
- **Tasks Doc**: `04-tasks/<filename>.md` [link] (if applicable)
- **GitHub Issue**: [URL]
- **Pull Request**: [URL] (during implementation)
```

### 2.2 Master Doc Must Link All Children
After creating all child docs, PM/Lead **MUST** update Master Doc's "Related Documents" section with actual links.

### 2.3 Child Docs Must Link Master
Every Product/Engineering/QA/Tasks doc **MUST** link back to its Master Doc.

### 2.4 Skill File References
When creating documentation, always reference the appropriate skill file:
- `.qwen/skills/product-design-doc/SKILL.md`
- `.qwen/skills/engineering-doc/SKILL.md`
- `.qwen/skills/qa-doc/SKILL.md`

---

## Rule 3: Approval Flow

### 3.1 Approval Matrix
| Document | Reviewed By | Sign-off Required |
|----------|-------------|-------------------|
| Master Doc | All stakeholders | Product Lead + Tech Lead + PM |
| Product Doc | Product Lead | ✅ |
| Engineering Doc | Tech Lead | ✅ |
| QA Doc | QA Lead | ✅ |
| Tasks Doc | Project Manager | ✅ |

### 3.2 Review Process
```
1. Draft → Author creates/updates content
2. Review → Reviewer approves or requests changes
3. Approved → Reviewer signs off
4. Update → If changes needed, increment version (Rule 4) and repeat
```

### 3.3 Sign-off Format
In each document's "Approval & Sign-off" section:
```markdown
- [ ] **Product Lead**: @name - Date: YYYY-MM-DD
- [ ] **Tech Lead**: @name - Date: YYYY-MM-DD
- [ ] **QA Lead**: @name - Date: YYYY-MM-DD
```

---

## Rule 4: Changelog Requirements

### 4.1 Every Doc MUST Have
- [ ] Changelog table at the end of the file
- [ ] Timestamp in `HH:mm` format (24-hour)
- [ ] Author name (`@mention`)
- [ ] Reviewer name (`@mention`)
- [ ] Brief description of changes
- [ ] Version number incremented

### 4.2 Changelog Table Format
```markdown
## Changelog
| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 10:30 | @dev-name | Initial draft | @lead | Approved |
| v1.0.1 | 2026-04-04 | 15:00 | @dev-name | Added API specs | @tech-lead | Review |
```

### 4.3 IMPORTANT
- Every update **MUST** include time (`HH:mm` format)
- Track all changes with version increments
- Get reviewer approval for each version

---

## Rule 5: Document Distribution to Roles

### 5.1 Responsibility Matrix
| Role | Doc Responsibility | Location | Purpose |
|------|-------------------|----------|---------|
| **Product-Designer** | Product Doc | `01-product/` | Design wireframes, mockups, UI specifications |
| **Frontend-Developer** | Engineering Doc (FE section) | `02-engineering/` | Implement UI components, styling, frontend logic |
| **Backend-Developer** | Engineering Doc (BE section) | `02-engineering/` | Implement APIs, database, backend logic |
| **QA-Tester** | QA Doc | `03-qa/` | Test cases, test results, bug reports |
| **PM/Lead** | Master Doc + Tasks Doc | `00-master/` + `04-tasks/` | Orchestration, task breakdown, tracking |

### 5.2 Engineering Doc Structure (FE + BE Split)
```markdown
# Engineering Document: [Feature Name]

## Frontend Section (Frontend-Developer chịu trách nhiệm)
### Components to Create
### UI Specifications (từ Product Doc)
### Implementation Details
### Changelog (Frontend updates)

## Backend Section (Backend-Developer chịu trách nhiệm)
### API Endpoints
### Database Schema
### Business Logic
### Changelog (Backend updates)

## Shared Section (Cả FE & BE cùng tham khảo)
### Architecture Overview
### Technical Decisions
### Security Considerations
### Performance Implications
```

---

## Rule 6: Version Control During Updates

### 6.1 When to Update Version
| Event | Action |
|-------|--------|
| Any content change in a doc | Increment `day` |
| New month begins | Reset `day = 0`, increment `month` |
| Major release | Reset `month = 0, day = 0`, increment `major` |

### 6.2 Update Flow
```
1. Make content changes in doc
2. Increment version (per doc-naming-conventions.md Rule 4)
3. Add entry to changelog table with HH:mm timestamp
4. Update "Last Updated" metadata
5. If Master Doc links changed, update it too
6. Request review from appropriate reviewer
```

---

## Rule 7: Quick Reference Checklist

### When Starting a New Feature
- [ ] **Step 1**: Parse branch name → extract ticket ID + description
- [ ] **Step 2**: Create Master Doc in `00-master/`
- [ ] **Step 3**: Get Master Doc approved
- [ ] **Step 4**: Create Product Doc in `01-product/`
- [ ] **Step 5**: Create Engineering Doc in `02-engineering/`
- [ ] **Step 6**: Create QA Doc in `03-qa/`
- [ ] **Step 7**: Create Tasks Doc in `04-tasks/`
- [ ] **Step 8**: Add "Related Documents" to every doc
- [ ] **Step 9**: Update Master Doc with all child links
- [ ] **Step 10**: Begin implementation

### When Updating an Existing Doc
- [ ] Increment version number
- [ ] Add changelog entry with HH:mm timestamp
- [ ] Update "Last Updated" metadata
- [ ] Request reviewer approval
