---
name: engineering-doc
description: >
  Plan Part 2 — Engineering: solution vs codebase, technical design, To-Do list.
  PLAN flow and file rules: plan-workflow.mdc.
---

# Engineering doc (Part 2)

**Readable name:** engineering doc · **PLAN Part 2**

## When to Activate

- Implementation planning; keywords: technical plan, codebase, files to change, todo, dev tasks.

## Role

Map the product plan to **this repo**: paths, architecture, **To-Do**. Full test scenarios → **qa-doc**.

## Sections (order)

1. **Solution vs codebase**  
2. **Technical**  
3. **To-Do List**  

---

### Solution vs codebase

```markdown
## Solution vs codebase
### Existing behavior
- `src/...` — …
### Changes required
| Area | File / module | Change |
|------|----------------|--------|
### Dependencies
- …
```

### Technical

Use `src/services/` for APIs (no raw `fetch` in components per project rules).

For **any user-visible copy** (labels, errors, empty states): plan keys in `src/locales/en.json` and `src/locales/vi.json` (same structure) and `useLanguage().t` — do not leave hardcoded strings in components (see `.cursor/skills/frontend-code-standards/SKILL.md` §8).

**Refactor dần:** Không scope một task “rewrite toàn bộ i18n / LanguageContext”. Ghi To-Do theo **màn hoặc epic** (ví dụ “Reviews modal: bỏ hardcode + keys EN/VN”); migration context/global là **follow-up** khi đủ call site đã chuyển.

**GitHub issue (khi cần lấy nội dung từ API):** Chỉ dùng token từ **`GITHUB_TOKEN` hoặc `GH_TOKEN`** (env) — không hardcode, không yêu cầu user paste token trong chat. Chi tiết: `.cursor/skills/Review-clean-code/SKILL.md` (*GitHub API & token*).

Optional Mermaid architecture in its **own** fenced block.

```markdown
## Technical
### Architecture
…
### Data & contracts
- …
### Risks & mitigations
- …
```

### To-Do List

```markdown
## To-Do List
### Data layer
- [ ] …
### Components & i18n
- [ ] …
- [ ] New strings: keys added to `en.json` + `vi.json` (if UI-facing)
### Integration
- [ ] …
```

Do not replace **qa-doc** test cases with a thin checklist.

---

## Checklist (Part 2)

- [ ] Changes reference real paths or modules  
- [ ] To-Do items assignable / estimable  

## PLAN — trước / sau

Trước: **product-design-doc**. Sau: **qa-doc**. File & ticket: **`.cursor/rules/plan-workflow.mdc`**.
