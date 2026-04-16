---
name: frontend-code-standards
description: >
  Frontend code formatting and conventions for CryptoMap360.
  Enforces consistent file naming, import ordering, component structure,
  TypeScript patterns, Tailwind/CSS, i18n (en/vi locale files), UTF-8/mojibake avoidance, API layer,
  and state management. Acts as the project's ESLint+Prettier since no formatter is configured.
argument-hint: "Optional: 'review' to run checklist on current file, or 'template' to scaffold a new component"
metadata:
  author: CryptoMap360 Team
  version: 1.0.0
---

# Frontend Code Standards — CryptoMap360

## When to Activate

- Writing, reviewing, or refactoring `.ts`, `.tsx`, or `.css` files under `src/`
- Creating new components, pages, hooks, services, or stores
- Code review or PR preparation
- Triggered by terms: "format", "conventions", "code style", "clean up imports", "component template"

## Project Stack

| Layer | Tech | Version |
|-------|------|---------|
| UI Framework | React | 18.3.1 |
| Build | Vite | 6.3.5 |
| Styling | Tailwind CSS (v4, Vite plugin) | 4.1.12 |
| Components | shadcn/ui + Radix UI + CVA | latest |
| Server State | TanStack Query | 5.90 |
| Client State | Zustand | 5.0 |
| Routing | React Router | 7.13 |
| Forms | React Hook Form + Zod | 7.55 / 4.3 |
| Icons | Lucide React | 0.487 |
| Path Alias | `@/` → `src/` | — |

## 1. File and Folder Naming

```
src/
├── app/
│   ├── pages/              # PascalCase: MapPage.tsx, MarketPage.tsx
│   ├── components/
│   │   ├── ui/             # lowercase shadcn: button.tsx, card.tsx, input.tsx
│   │   ├── map/            # PascalCase feature: MerchantMarker.tsx
│   │   ├── landing/        # PascalCase feature: GlobeMarkerVisual.tsx
│   │   ├── market/         # PascalCase feature: CryptoTable.tsx
│   │   └── forms/          # PascalCase feature: SubmitLocationForm.tsx
│   └── hooks/              # camelCase: useSubmitLocation.ts
├── components/layout/      # PascalCase shared: ResponsivePage.tsx
├── config/                 # camelCase: api.ts, responsiveClasses.ts
├── contexts/               # PascalCase: LanguageContext.tsx
├── hooks/                  # camelCase with use-prefix: useMerchants.ts
├── lib/                    # camelCase: queryClient.ts, httpClient.ts
├── models/                 # camelCase: location.ts, business.ts, market.ts
├── services/               # camelCase+Service: vlinkpayService.ts, BaseService.ts
├── stores/                 # camelCase: useMerchantsStore.ts, auth.store.ts
├── utils/                  # camelCase: logger.ts, formatPrice.ts
└── styles/                 # lowercase: globals.css, tailwind.css, fonts.css
```

**Rules:**
- Components and Pages: `PascalCase.tsx`
- shadcn/ui primitives in `src/app/components/ui/`: `lowercase.tsx`
- Hooks: `use<Name>.ts` (camelCase)
- Services: `<name>Service.ts` (camelCase)
- Models: `<domain>.ts` (camelCase) — one file per domain
- Stores: `use<Domain>Store.ts` or `<domain>.store.ts`
- Tests: co-located, suffix `.test.ts` — `auth-service.test.ts`

## 2. Import Ordering

Imports must be grouped with a blank line between each group:

```typescript
// 1. React core
import React, { useState, useEffect, useMemo } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { motion } from 'motion/react';
import { MapPin, Star } from 'lucide-react';

// 3. Internal — by layer (config → lib → services → stores → hooks → contexts → models → components → utils)
import { API_ENDPOINTS } from '@/config/api';
import { queryClient } from '@/lib/queryClient';
import { vlinkpayService } from '@/services/vlinkpayService';
import { useMerchantsStore } from '@/stores/useMerchantsStore';
import { useMerchants } from '@/hooks/useMerchants';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { formatPrice } from '@/utils/formatPrice';

// 4. Relative imports
import { ChildComponent } from './ChildComponent';

// 5. Type-only imports
import type { Business } from '@/models/business';
import type { CountryOption } from '@/models/location';

// 6. Styles (rare in components — usually only in App.tsx)
import '@/styles/index.css';
```

## 3. Component Structure Template

```typescript
// --- Imports (ordered per section 2) ---
import React, { useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import type { Business } from '@/models/business';

// --- Props Interface ---
interface MerchantCardProps {
  merchant: Business;
  isSelected?: boolean;
  onSelect: (id: string) => void;
}

// --- Main Component ---
export function MerchantCard({ merchant, isSelected = false, onSelect }: MerchantCardProps) {
  // 1. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. Derived values
  const displayName = merchant.name || 'Unknown Merchant';
  const hasLocation = Boolean(merchant.latitude && merchant.longitude);

  // 3. Event handlers
  const handleClick = useCallback(() => {
    onSelect(merchant.id);
  }, [merchant.id, onSelect]);

  // 4. Return JSX
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--spacing-sm)]',
        isSelected && 'border-[var(--color-primary)]'
      )}
      onClick={handleClick}
    >
      <h3 className="text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)]">
        {displayName}
      </h3>
      {hasLocation && (
        <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
          <MapPin className="h-4 w-4" />
          {merchant.address}
        </span>
      )}
    </div>
  );
}
```

**Canonical example in repo:** `src/app/components/ui/button.tsx` — CVA variants + cn() + typed props.

## 4. TypeScript Conventions

**Interfaces for data shapes — defined in `src/models/`:**
```typescript
// src/models/location.ts
export interface CountryOption {
  code: string;
  name: string;
  latitude: string;
  longitude: string;
}
```

**Component props — defined above the component:**
```typescript
interface Props {
  title: string;
  items: Business[];
  onItemClick: (id: string) => void;
}
```

**API generics — in service methods:**
```typescript
class MerchantService extends BaseService {
  async getMerchants(): Promise<Business[]> {
    return this.get<Business[]>(API_ENDPOINTS.MERCHANTS);
  }
}
```

**Rules:**
- `interface` for object shapes, `type` only for unions/intersections/mapped types
- `import type { ... }` for type-only imports (helps tree-shaking)
- No `any` — use `unknown` + type narrowing
- No inline `as` type assertions unless unavoidable (e.g., DOM refs)

## 5. Tailwind / CSS Conventions

**Use `cn()` for conditional classes:**
```typescript
// GOOD
<div className={cn('p-4 rounded-lg', isActive && 'bg-[var(--color-primary)]')} />

// BAD — manual concatenation
<div className={`p-4 rounded-lg ${isActive ? 'bg-yellow-500' : ''}`} />
```

**Use design tokens from `src/styles/globals.css` `@theme`:**
```typescript
// GOOD — references project tokens
'bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-[var(--radius-md)]'

// ACCEPTABLE — standard Tailwind utilities for generic spacing
'p-4 mt-2 flex items-center gap-2'

// BAD — hardcoded colors that bypass the design system
'bg-[#1e2329] text-[#eaecef]'
```

**Key tokens (from `globals.css`):**
- Colors: `--color-primary`, `--color-surface`, `--color-text-primary`, `--color-border`
- Spacing: `--spacing-xs` (8px) through `--spacing-6xl` (128px)
- Radius: `--radius-sm` (4px) through `--radius-full` (9999px)
- Shadows: `--shadow-sm` through `--shadow-xl`, `--shadow-glow-yellow`
- Typography: `--font-size-xs` (10px) through `--font-size-4xl` (36px)
- Z-index: `--z-dropdown` (1000) through `--z-tooltip` (1600)

**Rules:**
- No inline `style={{ }}` except for truly dynamic computed values
- No `@apply` in CSS files — Tailwind v4 discourages it
- Icons: `lucide-react` only, no emoji as UI icons
- Use `prefers-reduced-motion` for custom animations

## 6. API Layer Conventions

**Always go through `src/services/` — never raw `fetch` in components:**
```typescript
// GOOD — service layer
import { vlinkpayService } from '@/services/vlinkpayService';

const data = await vlinkpayService.getMerchants();

// BAD — raw fetch in component
const res = await fetch('https://api.cryptomap360.com/merchants');
```

**Creating a new service:**
```typescript
// src/services/newFeatureService.ts
import { BaseService } from './BaseService';
import { API_BASE, API_ENDPOINTS } from '@/config/api';
import type { NewFeature } from '@/models/newFeature';

class NewFeatureService extends BaseService {
  constructor() {
    super(API_BASE);
  }

  async getAll(): Promise<NewFeature[]> {
    return this.get<NewFeature[]>(API_ENDPOINTS.NEW_FEATURE);
  }

  async getById(id: string): Promise<NewFeature> {
    return this.get<NewFeature>(`${API_ENDPOINTS.NEW_FEATURE}/${id}`);
  }
}

export const newFeatureService = new NewFeatureService();
```

**Using with TanStack Query in components:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { newFeatureService } from '@/services/newFeatureService';

function useNewFeatures() {
  return useQuery({
    queryKey: ['newFeatures'],
    queryFn: () => newFeatureService.getAll(),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
```

## 7. Reusable static assets & external URLs

**Goal:** Any URL or static asset used in more than one place (or likely to be) lives in **one module** so updates stay consistent.

| Kind | Where to put it |
|------|-----------------|
| API base + paths | `@/config/api` — `API_BASE`, `API_ENDPOINTS` (already the pattern) |
| Env-only values | `.env` + `import.meta.env` / small helpers in `src/config/` |
| Brand logos, partner logos, third-party raster/SVG URLs | `src/config/brandAssets.ts` (or `externalUrls.ts`) **or** a single exported map in the owning UI file (e.g. `CRYPTO_ICON_URLS` in `CryptoIcon.tsx`) — **import** from there, do not copy-paste the string |
| UI chrome icons | `lucide-react` — not remote URLs |

**Rules:**
- Do **not** embed the same long `https://…` in multiple components; extract `const PARTNER_LOGO_URL = '…'` in config or a shared constants file and reuse.
- When adding a **new** remote logo/icon URL, check if a similar constant already exists before introducing a second string.
- Prefer **named exports** (`export const BRAND_LOGO_URL`, `export const CRYPTO_ICON_URLS`) so grep and refactors stay easy.

**Example — centralized brand asset:**
```typescript
// src/config/brandAssets.ts
export const VLINKPAY_LOGO_URL =
  'https://staging-web-app.vlinkpay.com/assets/images/logoVlink.png' as const;
```

```typescript
// SomeModal.tsx
import { VLINKPAY_LOGO_URL } from '@/config/brandAssets';
```

## 8. Internationalization (i18n)

**Principle:** User-visible copy is **data**, not literals in TSX. Centralize in locale files so EN/VN stay in sync and product can edit strings without hunting through components.

| Item | Convention |
|------|------------|
| **Locale files (this repo)** | `src/locales/en.json` and `src/locales/vi.json` — **single source of truth** per language. |
| **Future / alternate layout** | If you introduce `en.ts` / `vi.ts` (or `locales/en/*.ts`) for type-safe keys or feature splits, still **merge** into one pipeline — do not scatter strings in components. |
| **Runtime API** | `useLanguage()` from `@/contexts/LanguageContext` → `t('key')` (supports legacy flat keys + nested paths wired in context). |
| **Adding strings** | Every new key must exist in **both** `en.json` and `vi.json` under the **same path** (e.g. `reviews.submit_button`). Same PR as the UI change when possible. |
| **Zod / validation** | Prefer `t('errors.xyz')` for messages shown to users; avoid English-only strings inside `z.string().min(1, '...')` unless you immediately add locale keys. |

**Do not hardcode in JSX / UI logic:**
- Button labels, headings, placeholders, empty states, toasts, modal titles
- User-facing error messages (network, validation)

**Exceptions (OK to keep in code):**
- `aria-label` / technical identifiers if they must stay English for AT (still prefer `t()` when copy is visible to users)
- Console / dev-only strings
- Test fixtures
- Dynamic data from API (`business.name`), formatting-only (numbers, dates via formatter)

**Workflow tip (efficiency):**
1. Add/edit nested section in `en.json` (e.g. `featureX: { title: "...", save: "..." }`).
2. Mirror structure in `vi.json`.
3. Wire `t('featureX.title')` in component — or use legacy mapping in `LanguageContext` only when extending old screens.

**Anti-pattern:**
```tsx
// BAD — copy lives in component
<Button>Submit review</Button>

// GOOD
<Button>{t('reviews.submit')}</Button>
```

### Gradual refactor (legacy i18n — làm từng bước)

`LanguageContext` hiện có **map dài** (flat legacy keys → JSON). Không xóa/rewrite hết trong một lần; tối ưu công việc theo **từng PR / từng vùng code**:

| Ưu tiên | Hành động |
|---------|-----------|
| **Màn hình / feature mới** | Chỉ dùng key **nested** trong `en.json` / `vi.json` (ví dụ `reviews.modal.title`). Thêm wiring trong context **chỉ khi** `t()` chưa resolve được path — ưu tiên mở rộng resolver nested thay vì nhân bản flat key. |
| **Khi chạm file cũ** (bugfix, redesign) | Trong cùng PR: gỡ chuỗi hardcode còn sót → đưa vào locale; bổ sung **cả EN và VN**; nếu đang dùng flat legacy, có thể giữ key cũ cho đến khi toàn bộ call site chuyển xong. |
| **Không làm** | Một PR chỉ để “dọn context” hàng nghìn dòng mà không đổi hành vi — dễ conflict và khó review. |
| **Sau khi không còn reference** | Grep key legacy; khi không component nào gọi, mới xóa entry trong context map (PR nhỏ riêng nếu cần). |

**Checklist khi refactor một component:**

1. Có literal tiếng Anh/Việt trong JSX? → thay bằng `t('…')`.
2. Key mới có trong **cả** `en.json` và `vi.json`?
3. Ưu tiên namespace theo feature (`map.colocated.*`, `reviews.*`) thay vì key phẳng mới (`btn_xyz_2`).
4. Form validation / toast: dùng cùng namespace `errors.*` hoặc `feature.*` để tái sử dụng.

### Encoding & mojibake (AI phải tránh)

**Mojibake** = chuỗi bị “vỡ” do UTF-8 bị đọc sai (copy từ PDF/Word, double-encoding, editor không UTF-8). AI dễ tạo hoặc sao chép nhầm các ký tự lạ kiểu `â€"`, `Ã©`, `âœ…`, `âš ï¸` (thay cho `—`, `é`, `✅`, `⚠️`).

| Làm gì | Chi tiết |
|--------|----------|
| **Encoding nguồn** | Giữ toàn bộ `src/**/*.ts(x)`, `*.json`, `*.css` là **UTF-8** (chuẩn mặc định VS Code/Cursor). Không lưu file dạng “UTF-8 with BOM” trừ khi repo đã quy định. |
| **Không paste mù** | Không dán chuỗi từ trang web/PDF nếu thấy ký tự nghi ngờ; gõ lại hoặc dán qua editor đã hiển thị đúng tiếng Việt / emoji. |
| **Emoji / ký tự đặc biệt trong code** | Cực kỳ cẩn thận: emoji trong `logger` / comment dễ thành mojibake khi merge hoặc tool sai encoding. **Ưu tiên ASCII** cho prefix log: `[WARN]`, `[ERROR]`, `[OK]` thay vì ⚠️❌✅ trong string. |
| **Locale JSON** | `en.json` / `vi.json`: mọi giá trị phải là **Unicode đúng** (tiếng Việt đầy đủ dấu). Sau khi sửa, **rà mắt** trong IDE — nếu thấy chuỗi kiểu `ChÆ°a` thay vì `Chưa` thì đang lỗi encoding. |
| **Khi review diff** | Nếu diff hiện chuỗi lạ (nhiều `â`/`Ã`/`ï`) — **không merge**; sửa lại bằng UTF-8 đúng hoặc thay bằng ASCII. |
| **Comment** | Dùng tiếng Anh ASCII cho ghi chú kỹ thuật (`// URL -> state`) thay vì ký tự đặc biệt dễ hỏng (`—`, `→`) nếu không cần thiết. |

**Tín hiệu nhận biết nhanh (grep / mắt):** các pattern như `â€`, `Ã `, `âš`, `âœ`, `ðŸ` trong file `.ts` / `.tsx` thường là mojibake — cần làm sạch trong lần chỉnh sửa (task riêng hoặc cùng PR đang chạm file).

## 9. State Management Conventions

**Server state = TanStack Query (data from API):**
```typescript
// Fetching + caching
const { data, isLoading } = useQuery({
  queryKey: ['merchants', filters],
  queryFn: () => vlinkpayService.getMerchants(filters),
});

// Mutations
const mutation = useMutation({
  mutationFn: (data: NewMerchant) => vlinkpayService.createMerchant(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] }),
});
```

**Client state = Zustand (UI state, filters, preferences):**
```typescript
// src/stores/useMerchantsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MerchantsState {
  searchQuery: string;
  selectedCategories: BusinessCategory[];
  setSearchQuery: (q: string) => void;
  toggleCategory: (cat: BusinessCategory) => void;
}

export const useMerchantsStore = create<MerchantsState>()(
  persist(
    (set) => ({
      searchQuery: '',
      selectedCategories: [],
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleCategory: (cat) => set((state) => ({
        selectedCategories: state.selectedCategories.includes(cat)
          ? state.selectedCategories.filter((c) => c !== cat)
          : [...state.selectedCategories, cat],
      })),
    }),
    { name: 'merchants-store' }
  )
);
```

**Rules:**
- Never duplicate API data into Zustand — Query cache is the source of truth
- Store naming: `use<Domain>Store`
- Keep store flat — avoid deeply nested state
- Use selectors to avoid unnecessary re-renders: `useMerchantsStore((s) => s.searchQuery)`

## 10. Form Conventions

Use **locale keys for validation messages** when they are user-visible (section 8). Build the Zod schema inside the component with `useMemo` so `t` is stable per language:

```typescript
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';

function MyForm() {
  const { t } = useLanguage();
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('errors.required')),
        email: z.string().email(t('errors.invalid_email')),
        amount: z.number().positive(),
      }),
    [t],
  );

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => { /* ... */ };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span className="text-[var(--color-error)]">{errors.name.message}</span>}
    </form>
  );
}
```

## 11. Pre-Commit Review Checklist

Before considering code complete, verify:

1. **Imports ordered** per section 2? No unused imports?
2. **Props interface** defined above component? No `any`?
3. **`cn()`** used for all conditional Tailwind classes?
4. **Design tokens** used instead of hardcoded hex colors?
5. **API calls** through services, not raw fetch/axios?
6. **Server state** in TanStack Query, **client state** in Zustand?
7. **No duplicate state** — data lives in one place only?
8. **Reusable URLs / logos / remote icons** — imported from `@/config` or a shared constant (section 7), not copy-pasted?
9. **i18n** — new UI strings in `en.json` + `vi.json` (section 8), not hardcoded; refactors follow **gradual** rules in §8 (no big-bang context rewrite)?
10. **Encoding** — no mojibake: strings/logs/comments are valid UTF-8 or ASCII; no suspicious `â€`/`Ã`/`ðŸ` sequences (see §8 *Encoding & mojibake*)?
11. **Accessibility**: interactive elements have labels, focus states, aria attrs?
12. **No inline `style={{}}`** except for dynamic computed values?
13. **File named correctly** per naming conventions?

## Delegation to Other Skills

This skill covers **code formatting and conventions** only. For deeper topics, delegate to:

- **i18n copy & `LanguageContext`** — strings live in `src/locales/en.json` + `vi.json`; section 8 above. Large legacy key maps live in `LanguageContext.tsx` — prefer nested JSON for new features.
- **UTF-8 / mojibake** — section 8 *Encoding & mojibake*; avoid broken sequences (`â€`, `Ã`, emoji pasted wrong) in source and locale JSON.
- **React performance** (memoization, waterfalls, bundle size): `.github/skills/vercel-react-best-practices/SKILL.md`
- **Component composition** (compound components, provider pattern): `.github/skills/vercel-composition-patterns/SKILL.md`
- **UI/UX design** (design process, visual checklist): `.cursor/skills/ui-ux-pro-max/SKILL.md`
- **Styling implementation** (shadcn usage, dark mode, responsive): `.cursor/skills/ux-ui/ui-styling/SKILL.md`
- **Design tokens** (token architecture, CSS variables): `.cursor/skills/ux-ui/design-system/SKILL.md`
