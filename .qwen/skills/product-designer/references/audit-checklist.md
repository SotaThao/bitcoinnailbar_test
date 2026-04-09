# Design System Audit Checklist

> Load from SKILL.md when executing Step 0 (before any design work).

---

## Pre-Audit: Scan Codebase

### 1. CSS Variable Inventory
```
Scan: src/**/*.css, src/**/*.tsx
Find: All var(--*) usage
Catalog: Primitive → Semantic → Component token layers
```

### 2. Hardcoded Value Detection
```
Scan for: Hex colors (#2563EB, #f59e0b, etc.)
Scan for: Magic numbers (spacing: 16px, font-size: 14px)
Record: File path + line number + value found
```

---

## Audit Checklist

### Token Architecture

| Check | Status | Notes |
|-------|--------|-------|
| Primitive tokens exist (`--color-blue-500`, `--spacing-4`) | ✅/❌ | |
| Semantic tokens exist (`--color-primary`, `--text-heading`) | ✅/❌ | |
| Component tokens exist (`--btn-primary-bg`, `--card-shadow`) | ✅/❌ | |
| Token layers follow: primitive → semantic → component | ✅/❌ | |

### Hardcoded Values Found

| File | Value | Suggested Token | Severity |
|------|-------|----------------|----------|
| `src/components/Button.css` | `background: #2563EB` | `var(--color-primary)` | High |
| ... | ... | ... | ... |

### Component Compliance

| Component | Exists | Uses Tokens | States Complete |
|-----------|--------|-------------|-----------------|
| Button | ✅/❌ | ✅/❌ | Default, Hover, Active, Disabled |
| Input | ✅/❌ | ✅/❌ | Default, Focus, Error, Disabled |
| Card | ✅/❌ | ✅/❌ | Default, Elevated, Outlined |

---

## Decision Point

### If Audit PASSES (no issues):
```
Status: ✅ Pass
Action: Proceed to Step 1 (Requirements)
Report: Document in Product Doc under "Design System Audit" section
```

### If Audit FINDS ISSUES:
```
Status: ⚠️ Updates Needed
Action:
1. List all hardcoded values with file paths
2. Suggest token replacements
3. Report to user → Get approval
4. Update CSS variables FIRST
5. Then proceed to Step 1
```

---

## Report Format (for Product Doc)

```markdown
## Design System Audit
### Audit Date: YYYY-MM-DD HH:mm
### Status: ✅ Pass / ⚠️ Updates Needed

### Token Compliance Check
- **Primitive Tokens:** ✅ Present / ❌ Missing
- **Semantic Tokens:** ✅ Present / ❌ Missing
- **Component Tokens:** ✅ Present / ❌ Missing
- **Hardcoded Values Found:** <count> (list them)

### Recommendations
1. ...
2. ...

### Approval
- **Auditor:** Product-Designer Agent
- **Approved By:** @user (if updates needed)
```
