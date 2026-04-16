# QA Tester Documentation Rules

> Rules for **QA Testers** — responsible for QA Doc (Part 3: Testing strategy), test cases, and acceptance criteria.

## Related Rules
- **Naming Conventions**: [doc-naming-conventions.md](./doc-naming-conventions.md)
- **Workflow**: [doc-workflow-rules.md](./doc-workflow-rules.md)
- **PM/Lead**: [doc-pm-lead-rules.md](./doc-pm-lead-rules.md)
- **Product Designer**: [doc-product-designer-rules.md](./doc-product-designer-rules.md)
- **Engineer**: [doc-engineer-rules.md](./doc-engineer-rules.md)

---

## Rule 1: QA Document (Part 3 — Testing)

### 1.1 Location
```
Docs/03-qa/<feature>-<ticket>_qa_<yymmdd>_v<major>.<month>.<day>.md
```

### 1.2 When to Create
- **AFTER** Engineering Doc is created (need component + API specs)
- **BEFORE** implementation starts (test strategy defined early)
- Reference: `.qwen/skills/qa-doc/SKILL.md`

### 1.3 Required Sections (MANDATORY)
- [ ] **Test Strategy** — Scope, testing levels, test environment
- [ ] **Test Cases** — Happy path + edge cases (see Rule 2)
- [ ] **Acceptance Criteria** — Definition of Done (see Rule 3)
- [ ] **Performance Benchmarks** — Targets (if applicable)
- [ ] **Security Tests** — If feature handles user data or auth
- [ ] **Test Data Requirements** — Mock data, fixtures
- [ ] **Environment Setup** — Commands to run tests
- [ ] **Changelog** — With HH:mm timestamps

---

## Rule 2: Test Cases

### 2.1 Format
Each test case **MUST** follow this format:

```markdown
### TC-<number>: <Test Case Name>
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low) |
| **Type** | Happy path / Edge case / Error handling / Performance |
| **Precondition** | What must be true before test |

**Steps**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
- ✅ Result 1
- ✅ Result 2
- ✅ Result 3
```

### 2.2 Priority Definitions
| Priority | Definition | Examples |
|----------|-----------|----------|
| **P0 (Critical)** | Must pass for release — blocks shipping if failed | Component renders, no console errors, build succeeds, i18n works |
| **P1 (High)** | Should pass — degraded UX if failed | Responsive design, animations smooth, carousel behavior |
| **P2 (Medium)** | Nice to have — workaround exists | Edge case handling, accessibility, loading states |
| **P3 (Low)** | Cosmetic — no functional impact | Font sizes, spacing, color accuracy |

### 2.3 Test Case Categories (Cover ALL)

#### Happy Path Tests
- Component renders without errors
- Data displays correctly
- User interactions work as expected
- Navigation flows correctly

#### Edge Cases
- Empty state (no data)
- Very long text (overflow handling)
- Rapid interactions (double-clicks, fast scrolling)
- Missing props or undefined values
- Network errors (if API calls)

#### Error Handling
- Invalid input validation
- API failure responses
- Graceful degradation
- Error messages displayed to user

#### Performance Tests
- Render time < Xms
- No layout shifts (CLS < 0.1)
- Smooth animations (60fps, no jank)
- Bundle size impact < XKB

#### Accessibility Tests
- ARIA labels present
- Keyboard navigation works
- Screen reader compatibility
- Color contrast ratios meet WCAG AA

---

## Rule 3: Acceptance Criteria (Definition of Done)

### 3.1 Format
```markdown
## Acceptance Criteria (Definition of Done)

- [ ] All P0 test cases pass
- [ ] All P1 test cases pass
- [ ] No console errors in development or production build
- [ ] `npm run build` completes successfully
- [ ] Component renders in all supported locales
- [ ] Responsive design verified on mobile, tablet, desktop
- [ ] Code follows existing patterns
- [ ] No hardcoded values — all text from i18n translations
- [ ] Master Doc, Product Doc, Engineering Doc, QA Doc all created and linked
```

### 3.2 Rules
- Criteria **MUST** be binary (pass/fail, no "partially")
- P0 criteria **MUST** all pass before merge
- P1 criteria **SHOULD** all pass (document exceptions)
- P2/P3 can be deferred to future tickets

---

## Rule 4: Performance Benchmarks

### 4.1 Format
```markdown
## Performance Benchmarks

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Lighthouse Performance** | > 90 | Lighthouse audit on production build |
| **First Contentful Paint** | < 1.5s | Lighthouse report |
| **Cumulative Layout Shift** | < 0.1 | Lighthouse report |
| **Time to Interactive** | < 3.5s | Lighthouse report |
| **Bundle Size Increase** | < XKB gzipped | Compare `dist/` size before/after |
```

### 4.2 Rules
- Only include metrics **relevant to the feature**
- Set **realistic targets** (check current baseline first)
- Document **how to measure** (command, tool, conditions)

---

## Rule 5: Security Tests

### 5.1 When Required
- Feature handles **user input** (forms, file uploads)
- Feature involves **authentication/authorization**
- Feature accesses **sensitive data** (PII, tokens)
- Feature makes **API calls** with credentials

### 5.2 Format
```markdown
## Security Tests

| Test | Steps | Expected |
|------|-------|----------|
| XSS Prevention | Inject `<script>alert('xss')</script>` in input | Script not executed, input sanitized |
| Auth bypass | Call API without valid token | 401 Unauthorized returned |
| Data exposure | Inspect network response | No sensitive data leaked |
| CSRF | Submit request from different origin | Request rejected |
```

---

## Rule 6: Test Data Requirements

### 6.1 Format
```markdown
## Test Data Requirements

| Data | Source | Purpose |
|------|--------|---------|
| User account A (admin) | Supabase dev DB | Test admin features |
| User account B (regular) | Supabase dev DB | Test user features |
| Sample CV file | `test/fixtures/sample-cv.pdf` | Test CV upload |
| Mock API response | `test/fixtures/mock-jd.json` | Test JD analysis |
```

### 6.2 Rules
- All test data **MUST** be in `test/fixtures/` or documented
- No real user data in test fixtures
- Document how to seed test data

---

## Rule 7: Environment Setup

### 7.1 Format
```markdown
## Environment Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### 7.2 Rules
- Commands **MUST** work on fresh clone
- Document any manual setup steps
- Note environment variables needed

---

## Rule 8: QA Tester Checklist

### Before Writing Test Cases
- [ ] Master Doc exists and is approved
- [ ] Engineering Doc exists (need component + API specs)
- [ ] Product Doc reviewed (understand UX expectations)
- [ ] Feature scope understood (in-scope vs. out-of-scope clear)

### After Creating QA Doc
- [ ] Test strategy defined
- [ ] At least 5 test cases covering happy path
- [ ] At least 2 edge case tests
- [ ] Acceptance criteria defined (DoD)
- [ ] Performance benchmarks set (if applicable)
- [ ] Security tests included (if applicable)
- [ ] Test data requirements documented
- [ ] Environment setup commands provided
- [ ] "Related Documents" section includes links to Master + Engineering docs
- [ ] Changelog table with HH:mm timestamps
- [ ] Version number follows naming convention

### During Testing
- [ ] Execute each test case step by step
- [ ] Document actual results vs. expected
- [ ] Log bugs with steps to reproduce
- [ ] Retest after bug fixes
- [ ] Update test cases if scope changes

### After Testing
- [ ] All P0 tests passed (or documented exceptions)
- [ ] All P1 tests passed (or documented exceptions)
- [ ] Test report summarized
- [ ] Known issues listed
- [ ] Sign-off given (or rejected with reasons)

---

## Rule 9: Bug Reporting Format

When a test fails, report the bug in this format:

```markdown
### Bug #<number>: <Brief Title>
| Property | Value |
|----------|-------|
| **Severity** | Critical / Major / Minor |
| **Test Case** | TC-<number> |
| **Status** | Open / In Progress / Fixed / Won't Fix |

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected**: What should happen
**Actual**: What actually happens

**Environment**: Browser, OS, viewport
**Screenshot**: [if applicable]
```
