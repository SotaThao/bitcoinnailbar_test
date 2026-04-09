# Frontend Developer Workflow

> Load from SKILL.md when executing Steps 2-4.

---

## Step 1: Requirements Analysis

```
1. Read Engineering Doc (FE section) → understand technical approach
2. Read design mockups → understand visual requirements
3. Map components to create:
   ├── Reuse existing components (check src/components/)
   ├── Modify existing components (note changes)
   └── Create new components (plan structure)
```

---

## Step 2: Implementation

### Component Structure (MANDATORY)
```tsx
// 1. Imports (in order)
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { fetchUserData } from '@/services/user';
import { useTranslation } from '@/hooks/useTranslation';

// 2. TypeScript interface
interface MyComponentProps {
  userId: string;
  variant?: 'default' | 'compact';
}

// 3. Component definition
export function MyComponent({ userId, variant = 'default' }: MyComponentProps) {
  // 4. Hooks
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserData(userId),
  });

  // 5. Event handlers
  const handleClick = useCallback(() => {
    // handler logic
  }, []);

  // 6. Loading/error states
  if (isLoading) return <div>{t('common.loading')}</div>;
  if (error) return <div>{t('common.error')}</div>;

  // 7. JSX return
  return (
    <div className="flex flex-col gap-4">
      {/* i18n: all text via t() */}
      <h2 className="text-xl font-semibold">{t('user.title')}</h2>
      <Button onClick={handleClick}>{t('user.action')}</Button>
    </div>
  );
}
```

### File Naming
```
Components:    PascalCase — UserCard.tsx, NavBar.tsx
Hooks:         camelCase + use prefix — useTranslation.ts, useAuth.ts
Services:      camelCase — user.ts, auth.ts
Utils:         camelCase — formatDate.ts, validators.ts
Styles:        kebab-case (if separate) — user-card.css
```

---

## Step 3: Code Quality (Pre-Commit)

### Mandatory Checks
```bash
# 1. Remove console logs
rg "console\.(log|error|warn|debug|info)\(" -n --glob "*.ts" --glob "*.tsx"

# 2. TypeScript check
pnpm exec tsc --noEmit

# 3. ESLint
pnpm lint

# 4. Build
pnpm build

# 5. No hardcoded strings — verify all use t()
rg "\"[^\"]{5,}\"" --glob "*.tsx" -n  # Find strings > 5 chars
```

### Common Issues to Fix
| Issue | Fix |
|-------|-----|
| `console.log()` found | Remove or use proper logging service |
| Hardcoded `#2563EB` | Use `var(--color-primary)` or Tailwind |
| Hardcoded `"Submit"` | Use `t('form.submit')` |
| `any` type | Define proper TypeScript interface |
| Wrong import order | Reorder: React → third-party → @/ → relative |
| Raw `fetch()` in component | Move to `services/` folder |

---

## Step 4: Commit + PR

```bash
# Follow .qwen/rules/commit-pr.mdc exactly

# 1. Commit (subject = branch name)
git commit -m "$(git branch --show-current)" -m "<enriched_body>"

# 2. Push
git push origin $(git branch --show-current)

# 3. Create PR → test branch
# Use --body-file, NOT --body
node scripts/generate-pr-body.js
gh pr create --body-file scripts/pr-body.md --base test

# 4. Auto-assign
PR_NUMBER=$(gh pr view --json number -q .number)
gh pr edit $PR_NUMBER --add-assignee PersonalProjectJob
```
