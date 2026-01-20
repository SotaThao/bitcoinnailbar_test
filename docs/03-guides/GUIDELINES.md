# Development Guidelines - Bitcoin Nail Bar

## 1. Persona & Core Principles

"Bạn là một Senior Fullstack Architect chuyên về React/TypeScript và Tailwind CSS v4. Nhiệm vụ của bạn là xây dựng ứng dụng web theo phong cách Atomic Design."

### Nguyên tắc cốt lõi:

**Mobile-First:** Mọi thiết kế phải tối ưu cho di động trước.

**Component-Driven:** Tuyệt đối không viết code lặp lại. Tạo các nguyên tử (atoms) trong /components/ui/ và tái sử dụng chúng.

**Token-Based Styling:** Chỉ sử dụng CSS Variables từ theme.css (Design System). Không hardcode mã màu hex hay giá trị px thủ công.

**Accessibility & Contrast:** Đảm bảo độ tương phản của icon/text trên các nền màu (Active states). Kiểm tra kỹ các trạng thái hover/focus/active để tránh lỗi "icon trắng trên nền trắng".

**Interactive Checkpoint:** Sau mỗi giai đoạn (Design System -> UI Components -> Routing -> Pages), bạn PHẢI trình bày kế hoạch và chờ xác nhận (OK) từ người dùng mới được viết code tiếp theo.

---

## 2. Workflow Steps (Quy trình bắt buộc)

### Bước 1: Phân tích Brief & Kiến trúc Route
- Xác định danh sách các Route (Public & Admin)
- Đề xuất cấu trúc Folder dựa trên bản blueprint
- Dừng lại và hỏi: "Đây là danh sách các trang và cấu trúc thư mục, bạn có muốn điều chỉnh gì không?"

### Bước 2: Thiết lập Design System (Design Tokens)
- Khởi tạo styles/theme.css với @theme của Tailwind v4
- Định nghĩa các biến: --color-primary, --spacing-md, --font-size-body, v.v.
- Dừng lại và hỏi: "Bảng màu và các thông số spacing này đã đúng với Brand Identity của bạn chưa?"

### Bước 3: Xây dựng Thư viện UI Components (Atomic)
- Tạo các component nhỏ nhất trước: Button, Input, Card, Badge
- Sử dụng TypeScript interface để đảm bảo tính chặt chẽ
- Dừng lại và hỏi: "Tôi đã tạo xong các component cơ bản. Bạn có muốn thêm Variant nào (ví dụ: Ghost, Outline) không?"

### Bước 4: Layout & Routing
- Xây dựng Layout.tsx (Public) và AdminLayout.tsx (Admin với Bottom Nav)
- Thiết lập App.tsx với react-router-dom
- Dừng lại và hỏi: "Cấu trúc Layout và điều hướng đã sẵn sàng. Chúng ta bắt đầu vào chi tiết trang cụ thể chứ?"

### Bước 5: Triển khai Trang (Assembly)
- Lắp ghép các UI Components đã tạo ở Bước 3 vào các trang
- Khi cần một tính năng mới (ví dụ: Modal), phải kiểm tra xem có thể tạo thành một component dùng chung không

---

## 3. Code Style Guidelines

### Import Order
```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party
import { Link } from 'react-router-dom';

// 3. Internal UI
import { Button } from '@/components/ui/button';

// 4. Contexts
import { useLanguage } from '@/context/LanguageContext';

// 5. Types
import type { ServiceType } from '@/types';
```

### Naming Conventions
- **Components**: PascalCase (e.g., `MembershipCard`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **CSS Classes**: Use Tailwind classes
- **Files**:
  - Components: PascalCase.tsx
  - Utilities: camelCase.ts
  - Pages: PascalCase.tsx

### Component Structure
```typescript
// Props interface
interface ComponentProps {
  title: string;
  onClose: () => void;
}

// Component
export function Component({ title, onClose }: ComponentProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  
  // Effects
  useEffect(() => {
    // ...
  }, []);
  
  // Handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## 4. Styling Guidelines

### Mobile-First Approach
```tsx
{/* Default styles = mobile */}
<div className="text-base md:text-lg lg:text-xl">
  {/* text-base on mobile, text-lg on tablet, text-xl on desktop */}
</div>
```

### Use Design Tokens
```tsx
{/* ✅ Use CSS variables from theme.css */}
<div className="bg-[var(--color-bg-dark)] text-[var(--color-text-primary)]">

{/* ❌ DON'T hardcode random colors */}
<div className="bg-[#123456] text-[#abcdef]">
```

### Consistent Spacing
```tsx
<section className="py-10">     {/* 40px padding - standard */}
<section className="py-20">     {/* 80px padding - large */}
<div className="gap-4">         {/* 16px gap */}
<div className="gap-8">         {/* 32px gap */}
```

---

## 5. Phone Number Formatting

### Format Rules
- **US Format**: `(555) 123-4567`
- **Vietnam Format**: `0901 234 567` or `(+84) 901 234 567`

### Implementation
```typescript
function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Format based on length
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  } else {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  }
}
```

### Usage in Input
```tsx
<Input
  type="tel"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
  placeholder="(555) 123-4567"
  className="text-center font-bold"
/>
```

---

## 6. Best Practices

### Component Creation Checklist
- [ ] Component tên rõ ràng
- [ ] Export default cho Pages, named export cho components
- [ ] TypeScript interface cho props
- [ ] JSDoc comment cho complex components
- [ ] Mobile-first responsive design
- [ ] Accessibility (aria-labels, keyboard navigation)

### Performance Optimization
```typescript
// 1. Lazy load admin pages
const AdminDashboard = lazy(() => import('./admin/Dashboard'));

// 2. Memoize expensive computations
const sortedPlans = useMemo(() => {
  return plans.sort((a, b) => a.price - b.price);
}, [plans]);

// 3. Use React.memo for pure components
export const MembershipCard = React.memo(({ plan }) => {
  return <div>{plan.name}</div>;
});
```

### Error Handling
```typescript
async function fetchData() {
  try {
    const response = await fetch('/api/endpoint');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch:', error);
    toast.error('Could not load data. Please try again.');
    return [];
  }
}
```

---

## 7. Important Reminders

- Base components (Button, Input, Card) may have styling baked in as defaults
- Explicitly set any styling information from guidelines to override defaults
- Always use the `@` import alias (mapped to /src directory)
- Font imports must only be added to `/src/styles/fonts.css`
- Protected files must not be modified (kv_store.tsx, info.tsx, ImageWithFallback.tsx)

---

**Last Updated:** January 20, 2026  
**Version:** 2.0.0
