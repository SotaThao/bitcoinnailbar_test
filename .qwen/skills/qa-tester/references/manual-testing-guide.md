# Manual Testing Guide

> Load from SKILL.md when executing Step 5 (manual testing).

---

## 1. Happy Path Testing

```
Test the primary user flow end-to-end:
1. User can complete the main task without errors
2. UI matches design mockups
3. All interactions work (clicks, forms, navigation)
4. Data persists correctly
5. API responses are handled properly
```

## 2. Edge Cases

| Test Case | Expected |
|-----------|----------|
| Empty state (no data) | Shows placeholder, not broken UI |
| Very long text | Wraps correctly, no overflow |
| Special characters in input | Sanitized, no injection |
| Network timeout | Shows error message, retry option |
| Offline mode | Graceful degradation |
| Concurrent users | No data corruption |

## 3. Error Scenarios

| Scenario | Expected |
|----------|----------|
| Invalid form submission | Clear error messages, fields highlighted |
| API returns 500 | User-friendly error page, retry option |
| API returns 401 | Redirect to login |
| API returns 403 | Show "access denied" message |
| Malformed response | Parse error handled gracefully |

## 4. Responsive Design

| Breakpoint | Test |
|------------|------|
| Mobile (375px) | Touch targets >= 44px, readable text, no horizontal scroll |
| Tablet (768px) | Layout adapts, no overflow |
| Desktop (1024px+) | Full layout, proper spacing |

## 5. Cross-Browser

| Browser | Version | Test |
|---------|---------|------|
| Chrome | Latest | Full functionality |
| Firefox | Latest | Full functionality |
| Safari | Latest | Full functionality (macOS/iOS) |
| Edge | Latest | Full functionality |

## 6. Performance Benchmarks

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Total Bundle Size | < 250KB (gzipped) |
| API Response Time | < 500ms (p95) |

## 7. Accessibility

| Check | Target |
|-------|--------|
| Keyboard navigation | All interactive elements reachable via Tab |
| Focus indicators | Visible focus ring on all elements |
| Alt text | All images have descriptive alt text |
| Color contrast | >= 4.5:1 for normal text, >= 3:1 for large text |
| ARIA labels | Custom components have proper ARIA attributes |
| Screen reader | Content announced in logical order |
