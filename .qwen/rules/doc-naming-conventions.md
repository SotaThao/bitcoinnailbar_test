# Documentation Naming Conventions

> **Shared rules for ALL roles** — Product Designer, Engineer, QA, PM/Lead must follow these.

## Related Rules
- **Workflow**: [doc-workflow-rules.md](./doc-workflow-rules.md)
- **PM/Lead**: [doc-pm-lead-rules.md](./doc-pm-lead-rules.md)
- **Product Designer**: [doc-product-designer-rules.md](./doc-product-designer-rules.md)
- **Engineer**: [doc-engineer-rules.md](./doc-engineer-rules.md)
- **QA Tester**: [doc-qa-tester-rules.md](./doc-qa-tester-rules.md)

---

## Rule 1: Documentation Location

### 1.1 Location
- **All DOCS files** from new features or plan mode **MUST** be stored in the `Docs/` folder
- This folder is the **single source of truth** for all roles
- Files outside `Docs/` are NOT considered official documentation

### 1.2 Folder Structure
```
Docs/
├── 00-master/              # Master documents (PM/Lead creates FIRST)
├── 01-product/             # Product Designer writes
│   ├── design-system/      # Component library (.pencil files)
│   └── wireframes/         # Feature wireframes
├── 02-engineering/         # Engineers write (FE + BE sections)
├── 03-qa/                  # QA Tester writes
├── 04-tasks/               # PM/Lead writes (task breakdown)
└── 05-changelog/           # Optional: separate changelog
```

---

## Rule 2: Branch Name Parsing

### 2.1 Branch Format
```
feature/<ticket-id>_<feature-description>
```

### 2.2 Extraction
| Part | Example: `feature/1_push-code` | Extracted |
|------|-------------------------------|-----------|
| Type | `feature` | N/A |
| Ticket ID | `1` | Used in filename |
| Description | `push-code` | Used in filename (kebab-case) |

### 2.3 Supported Patterns
| Pattern | Example | Ticket ID | Description |
|---------|---------|-----------|-------------|
| `*/{number}_*` | `feature/1_push-code` | `1` | `push-code` |
| `*/{number}-*` | `feature/125-add-search` | `125` | `add-search` |
| `*/*-{prefix}{number}*` | `fix/ABC-456-fix-bug` | `456` | `fix-bug` |
| `*/issue-{number}*` | `fix/issue-789-update` | `789` | `update` |

---

## Rule 3: File Naming Format

### 3.1 Format
```
<feature-description>-<ticket-id>_<type>_<yymmdd>_v<major>.<month>.<day>.md
```

### 3.2 Components
| Component | Source | Example |
|-----------|--------|---------|
| `<feature-description>` | Branch name (kebab-case) | `push-code` |
| `<ticket-id>` | Branch name | `1` |
| `<type>` | Document type | `master`, `product`, `engineering`, `qa`, `tasks`, `changelog` |
| `<yymmdd>` | Creation date (2-digit year + month + day) | `260404` |
| `<major>` | Current system major version | `1` |
| `<month>` | Month of update (01-12) | `04` |
| `<day>` | Day of update (01-31) | `04` |

### 3.3 Type Mapping
| Doc Type | Role | Folder | Example Filename |
|----------|------|--------|-----------------|
| `master` | PM/Lead | `00-master/` | `push-code-1_master_260404_v1.0.0.md` |
| `product` | Product Designer | `01-product/` | `push-code-1_product_260404_v1.0.0.md` |
| `engineering` | Engineer | `02-engineering/` | `push-code-1_engineering_260404_v1.0.0.md` |
| `qa` | QA Tester | `03-qa/` | `push-code-1_qa_260404_v1.0.0.md` |
| `tasks` | PM/Lead | `04-tasks/` | `push-code-1_tasks_260404_v1.0.0.md` |
| `changelog` | Any | `05-changelog/` | `push-code-1_changelog_260404_v1.0.0.md` |

### 3.4 Naming Rules
- Use **kebab-case** only: `push-code-1_product.md`
- **No spaces**, no special characters
- Always include **version** and **date** suffix
- File extension: `.md`

---

## Rule 4: Versioning Scheme

### 4.1 Format
```
v<major>.<month>.<day>
```

### 4.2 Increment Rules
| Event | Action | Example |
|-------|--------|---------|
| Every content change | Increment `day` | `v1.0.4` → `v1.0.5` |
| New month | Reset `day = 0`, increment `month` | `v1.4.9` → `v1.5.0` |
| Major release | Reset `month = 0, day = 0`, increment `major` | `v1.12.9` → `v2.0.0` |

### 4.3 Version Examples
| Version | Meaning |
|---------|---------|
| `v1.0.0` | Initial release (major 1) |
| `v1.4.4` | Update on April 4 |
| `v1.4.5` | Update on April 5 |
| `v1.5.0` | Update on May 1 (month incremented, day reset) |
| `v2.0.0` | Major release 2 (all reset) |

---

## Rule 5: Naming Checklist

- [ ] Branch name parsed correctly (ticket ID + description extracted)
- [ ] Filename follows `<feature>-<ticket>_<type>_<yymmdd>_v<major>.<month>.<day>.md`
- [ ] File placed in correct `Docs/` subfolder
- [ ] Version starts at `v1.0.0` for new feature
- [ ] Date reflects actual creation/update date (yymmdd format)
- [ ] No spaces or special characters in filename
- [ ] File extension is `.md`

---

## Quick Reference

### Complete File Structure Example
**Branch:** `feature/1_push-code` | **Date:** April 4, 2026 | **Version:** `v1.0.0`

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
