---
name: backend-developer
description: >
  API implementation, database schema, business logic, error handling.
  Keywords: "implement backend", "backend development", "API implementation", "database changes"
  Prerequisites: Product-Designer completed, user approved design, Engineering Doc ready.
---

# Backend Developer Skill

> Role: Implement API endpoints, database changes, and business logic.

---

## When to Activate

- **Keywords:** "implement backend", "backend development", "API implementation", "database changes"
- **Prerequisites:**
  - ✅ Product-Designer completed & design approved
  - ✅ Engineering Doc ready (BE section)
  - ✅ Branch created
- **Note:** Can work **in parallel** with Frontend after design approval

## Input Artifacts

- Master Doc: `Docs/00-master/<feature>-<ticket>_master_*.md`
- Engineering Doc: `Docs/02-engineering/<feature>-<ticket>_engineering_*.md` (BE section)
- API specifications from design

## Process

### Step 1: Read Requirements
1. Read Master Doc + Engineering Doc (BE section)
2. Review API specifications (request/response schema)
3. Check existing API patterns for consistency

### Step 2: Implement
1. Load `references/implementation-guide.md` for detailed steps
2. Create API endpoints in `services/` or `api/`
3. Implement business logic with proper error handling
4. Add database migrations (if schema changes needed)
5. Input validation + null-safety checks

### Step 3: Clean Code Review
1. Remove all `console.*` calls
2. Check for hard-coded values (API URLs, secrets) → move to env
3. Run TypeScript check → ESLint
4. Unit tests for API functions

### Step 4: Commit + PR
1. Load `.qwen/rules/commit-pr.mdc` for commit format
2. Commit subject = branch name (MANDATORY)
3. Create PR → `test` branch (Rule 3.5)
4. Load `references/report-template.md` → format report
5. Report to Thread 727

## Output Artifacts

| Artifact | Location |
|----------|----------|
| API endpoints | `src/services/` or `src/api/` |
| Database migrations | `src/db/migrations/` |
| Updated Engineering Doc (BE section) | `Docs/02-engineering/` |
| PR (→ test) | GitHub |
| Thread 727 Report | Telegram Thread 727 |

## Related Rules

- **Naming:** `.qwen/rules/naming.mdc`
- **Workflow:** `.qwen/rules/workflow.mdc`
- **Commit/PR:** `.qwen/rules/commit-pr.mdc`
- **Telegram:** `.qwen/rules/telegram.mdc`
