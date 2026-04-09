# QA-Tester Report Template (Thread 735)

> Load from SKILL.md when executing Step 7 (final report).

---

```markdown
🧪 **QA-Tester Report**

**Feature:** <feature-name>
**Branch:** <branch-name>
**Frontend PR:** <FE-PR-URL>
**Backend PR:** <BE-PR-URL>

## Test Results
### Pre-Commit Tests
✅ Quality Gate: PASS/FAIL
✅ Security Coverage: PASS/FAIL

### Automated Tests
✅ Unit Tests: <pass>/<total> passed
✅ Integration Tests: <pass>/<total> passed
✅ E2E Tests: <pass>/<total> passed

### Manual Tests
✅ Happy Path: PASS/FAIL
✅ Edge Cases: PASS/FAIL
✅ Error Scenarios: PASS/FAIL
✅ Responsive Design: PASS/FAIL
✅ Cross-Browser: PASS/FAIL
✅ Accessibility: PASS/FAIL

## Bugs Found
### Critical (<count>)
- #<number>: <title> (or "None")

### High (<count>)
- #<number>: <title> (or "None")

### Medium (<count>)
- #<number>: <title> (or "None")

### Low (<count>)
- #<number>: <title> (or "None")

## Recommendation
🟢 **PASS** — Ready for production
🟡 **PASS WITH CAVEATS** — Fix medium/low bugs before deploy
🔴 **FAIL** — Critical/high bugs found, needs rework

## Next Steps
<depends on recommendation>

## Timestamp
📅 Date: YYYY-MM-DD
⏰ Time: HH:mm
👤 Tester: QA-Tester Agent
```
