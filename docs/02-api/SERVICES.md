# 🔍 Services Management - Architecture Analysis

## 📊 Tổng Quan

Bitcoin Nail Bar Services management system được xây dựng theo **Atomic Design Pattern** với full CRUD capabilities cho service categories và services.

---

## 🏗️ Architecture

### Current Structure (After Refactor)

```
Services.tsx (~200 lines) ← Orchestration
├── useServiceCategories() → Category management
├── useServiceMenu() → Service menu management
├── service-menu-utils.ts → Data transformation
├── service-constants.ts → Static constants
├── <ServiceCategorySidebar> → Category navigation
├── <ServicesTable> → Service list display
├── <ServiceFormSheet> → Create/Edit form
├── <CategoryFormSheet> → Category management
├── <LoadingSpinner> → Loading state
└── <EmptyState> → No data state
```

---

## 📦 Data Flow

```
Admin Panel (Services.tsx)
    ↓
  saves to
    ↓
settings:service-menu (KV Store)
    ↓
  read by
    ↓
Public Pages & Chatbot
    ↓
  renders
    ↓
Customer sees updated services
```

---

## 🛠️ Key Features

### 1. Service Categories
- Dynamic categories from backend
- CRUD operations
- Cascade delete (deletes all services in category)
- Icon assignment per category
- Enable/disable toggle

### 2. Services Management
- Nested structure: Category > Group > Service
- Price tiers: Regular & Member pricing
- Service types: Regular & Addon
- Add-on compatibility system
- Duration tracking
- Rich descriptions

### 3. Price Formats Supported
- Single price: `"45"`
- Range: `"40-50"`
- Starting from: `"40+"`
- Free/TBD: `""`

---

## 🔄 Refactor History

### Phase 1: Foundation
- Created `service-constants.ts` (40 lines)
- Created `service-menu-utils.ts` (80 lines)
- Created `useServiceMenu.ts` hook (100 lines)

### Phase 2: UI Components
- Created `ServiceCategorySidebar.tsx` (50 lines)
- Created `ServiceTableRow.tsx` (60 lines)
- Created `ServicesTable.tsx` (100 lines)
- Created `ServiceFormSheet.tsx` (140 lines)

### Phase 3: Main Component Refactor
- **Before:** 547 lines
- **After:** ~200 lines
- **Improvement:** -63% LOC

---

## ✅ Benefits After Refactor

### Code Quality:
- ✅ **63% LOC reduction** in main file
- ✅ **100% type-safe** (no `any` types)
- ✅ **Single Responsibility** - each file has one job
- ✅ **DRY** - no code duplication

### Maintainability:
- ✅ **Easy to debug** - isolated components
- ✅ **Easy to test** - each piece testable
- ✅ **Easy to extend** - add features without touching main file

### Reusability:
- ✅ `<ServicesTable>` can be reused in other admin pages
- ✅ `<ServiceFormSheet>` can be adapted for other forms
- ✅ `<ServiceCategorySidebar>` reusable for any category nav

---

## 🎯 API Integration

### Endpoints Used:
- `GET /settings/categories` - Fetch categories
- `PUT /settings/categories` - Update categories
- `GET /settings/service-menu` - Fetch services
- `PUT /settings/service-menu` - Update services
- `DELETE /settings/categories/:id` - Delete category (cascade)

### Custom Hooks:
```typescript
// Category management
const { categories, loading, createCategory, updateCategory, deleteCategory } = useServiceCategories();

// Service menu management
const { services, rawData, loading, saveService, deleteService } = useServiceMenu();
```

---

## 📝 Technical Details

### Data Transformation
Services are stored in nested structure but flattened for display:

**Storage Format:**
```typescript
{
  "Manicure": {
    groups: [
      {
        id: "manicure-gel-x",
        name: "Gel-X",
        services: [...]
      }
    ]
  }
}
```

**Display Format:**
```typescript
[
  {
    id: "manicure-gel-x-service-1",
    name: "Full Set",
    category: "Manicure",
    group: "Gel-X",
    price: "65",
    memberPrice: "60"
  }
]
```

---

## 🚀 Performance Optimizations

1. **Lazy Loading** - Admin components lazy loaded
2. **Memoization** - Expensive computations cached
3. **Debounced Search** - Search input debounced
4. **Optimistic Updates** - UI updates immediately, syncs later

---

## 🐛 Known Issues & Solutions

### Issue: Hardcoded Categories
**Status:** ✅ Resolved  
**Solution:** Migration tool created to move hardcoded categories to backend

### Issue: Complex Price Resolution
**Status:** ✅ Resolved  
**Solution:** Created `service-price-resolver.ts` utility

### Issue: Duplicate Fetch Logic
**Status:** ✅ Resolved  
**Solution:** Created `api-client.ts` centralized wrapper

---

**Last Updated:** January 20, 2026  
**Version:** 2.0.0 (Post-Refactor)
