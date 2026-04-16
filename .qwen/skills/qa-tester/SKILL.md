---
name: qa-tester
description: >
  Test execution, bug reporting, quality gates, Telegram reporting to Thread 735.
  Keywords: "run tests", "QA testing", "validation", "after implementation"
  Prerequisites: Frontend + Backend completed with PRs → test branch.
---

# QA Tester Skill

> Role: Execute tests, report bugs, enforce quality gates.

---

## When to Activate

- **Keywords:** "run tests", "QA testing", "validation", "after implementation"
- **Prerequisites:**
  - ✅ Frontend-Developer completed & PR created (→ test)
  - ✅ Backend-Developer completed & PR created (→ test)
  - ✅ QA Doc ready

## Input Artifacts

- Master Doc: `Docs/00-master/<feature>-<ticket>_master_*.md`
- QA Doc: `Docs/03-qa/<feature>-<ticket>_qa_*.md`
- PR URLs from Frontend & Backend

## Process

### Step 1: Read Requirements & Test Cases
1. Read Master Doc + QA Doc + PR URLs
2. Understand test cases from QA Doc (happy path + edge cases)

### Step 2: Environment Setup
1. Pull latest from `test` branch
2. Install dependencies
3. Run migrations (if any)

### Step 3: Pre-Commit Test Suite → Thread 735
1. Run: `node test-pre-commit.js --telegram --thread "735"`
2. Report results to Thread 735 ONLY

### Step 4: Automated Testing → Thread 735
1. Unit tests → Integration tests → E2E tests
2. Report pass/fail per suite

### Step 5: Manual Testing → Thread 735
1. Load `references/manual-testing-guide.md` for detailed steps
2. Test: Happy path → Edge cases → Error scenarios
3. Test: Responsive design → Cross-browser → Performance

### Step 6: Decision Point
```
If QA PASS:
  1. Update QA Doc + changelog
  2. Report to Thread 718 (changelog)
  3. Ready for production

If QA FAIL:
  1. Load references/bug-report-guide.md
  2. Log bugs with severity (Critical/High/Medium/Low)
  3. Create GitHub issues
  4. Report to USER with options:
     - Fix & re-test
     - Deploy with known issues
     - Rollback
  5. WAIT for user decision — do NOT proceed
```

### Step 7: Report
1. Load `references/report-template.md` → format report
2. Send to Thread 735 (test results ONLY)

## Output Artifacts

| Artifact | Location |
|----------|----------|
| Test results | Thread 735 |
| Bug reports | GitHub Issues |
| Updated QA Doc | `Docs/03-qa/` |
| Thread 735 Report | Telegram Thread 735 |

## Related Rules

- **Naming:** `.qwen/rules/naming.mdc`
- **Workflow:** `.qwen/rules/workflow.mdc`
- **Telegram:** `.qwen/rules/telegram.mdc`
- **QA Doc Skill:** `.qwen/skills/qa-doc/SKILL.md`
