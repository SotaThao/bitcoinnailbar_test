# Bug Report Guide

> Load from SKILL.md when Step 6 finds bugs (QA FAIL workflow).

---

## Severity Classification

| Severity | Definition | Response Time | Example |
|----------|-----------|---------------|---------|
| **Critical** | Blocks core functionality, no workaround | Immediate | App crashes on login |
| **High** | Major feature broken, workaround exists | Same day | Search returns wrong results |
| **Medium** | Minor feature issue, doesn't block workflow | Next sprint | Button color wrong on hover |
| **Low** | Cosmetic, documentation, nice-to-have | Backlog | Typo in error message |

---

## Bug Report Template (GitHub Issue)

```markdown
## Bug: <short title>

### Severity
Critical / High / Medium / Low

### Description
<1-2 sentence description of the bug>

### Steps to Reproduce
1. Go to '<page>'
2. Click on '<button>'
3. Enter '<data>'
4. Observe error

### Expected Behavior
<what should happen>

### Actual Behavior
<what actually happens>

### Environment
- **Browser:** Chrome 120 / Firefox 121 / Safari 17
- **Device:** Desktop / Mobile
- **Branch:** <branch-name>
- **PR:** <PR-URL>

### Screenshots/Logs
<attach if available>

### Root Cause (if known)
<file path, function, suspected cause>
```

---

## Decision Matrix

| Bugs Found | Severity Count | Recommendation |
|------------|---------------|----------------|
| 0 | — | ✅ PASS — Ready for production |
| 1-2 | Medium/Low only | 🟡 PASS WITH CAVEATS — Fix before next release |
| 1+ | High severity | 🔴 FAIL — Fix & re-test before deploy |
| 1+ | Critical severity | 🔴 FAIL — Fix & re-test, consider rollback |

---

## User Report Format

```markdown
⚠️ QA found bugs — need your decision:

**Bugs found:** <count>
- Critical: <count>
- High: <count>
- Medium: <count>
- Low: <count>

**GitHub Issues created:**
- #<number>: <title> (Critical)
- #<number>: <title> (High)

**Options:**
1. 🔧 Fix bugs → QA re-tests → Deploy after pass
2. 🚢 Deploy with known issues (list them)
3. ↩️ Rollback to previous version

What would you like to do?
```
