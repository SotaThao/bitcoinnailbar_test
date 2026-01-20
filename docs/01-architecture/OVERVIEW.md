# Bitcoin Nail Bar - System Architecture Overview

## 📋 Mục Lục
1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Kiến Trúc Tổng Thể](#kiến-trúc-tổng-thể)
3. [Tech Stack](#tech-stack)
4. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
5. [Component Architecture](#component-architecture)
6. [Routing & Navigation](#routing--navigation)
7. [State Management](#state-management)
8. [Backend Integration](#backend-integration)

---

## 🎯 Tổng Quan Dự Án

### Thông Tin Cơ Bản
- **Tên Dự Án**: Bitcoin Nail Bar Website & Management System
- **Tech Stack**: React 18.3.1 + TypeScript + Tailwind CSS v4 + Vite 6.3.5
- **Design Pattern**: Atomic Design
- **Routing**: React Router DOM v7.11.0
- **Animation**: Motion (Framer Motion) v12.23.24
- **Backend**: Supabase (Auth, Storage, Edge Functions)
- **UI Philosophy**: Mobile-First, Component-Driven, Token-Based Styling

### Mục Đích
Website giới thiệu và quản lý dịch vụ nail salon cao cấp với đặc điểm:
- 💰 Chấp nhận thanh toán Bitcoin
- 💎 Hệ thống membership VIP (4 tiers)
- 📅 Booking appointments system
- 🎁 E-Gift cards
- 👔 Admin dashboard cho quản lý
- 📱 Kiosk check-in với QR code
- 🤖 AI Chatbot hỗ trợ khách hàng

---

## 🏗️ Kiến Trúc Tổng Thể

### Architecture Pattern
```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Pages     │  │  Organisms   │  │  Molecules │ │
│  │  (Routes)   │──│  (Sections)  │──│  (Groups)  │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│         │                  │                │        │
│         └──────────────────┴────────────────┘       │
│                         │                            │
└─────────────────────────┼────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────┐
│                   BUSINESS LAYER                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Contexts   │  │    Hooks     │  │   Utils    │ │
│  │  (State)    │  │  (Logic)     │  │  (Helpers) │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────┼────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────┐
│                    DATA LAYER                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Supabase   │  │  Edge Funcs  │  │  Storage   │ │
│  │   (DB)      │  │  (Server)    │  │  (Assets)  │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Component Hierarchy (Atomic Design)

```
Atoms (ui/)
  └─ Button, Input, Badge, Card, Dialog...
     │
     ├─> Molecules (molecules/)
     │     └─ FormField, SearchBar, NavLink...
     │
     ├─> Organisms (organisms/)
     │     └─ HeroSection, Header, Footer...
     │
     └─> Pages (pages/)
           └─ HomePage, ServicesPage, AdminDashboard...
```

---

## 💻 Tech Stack

### Frontend
- **React 18.3.1** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS v4** - Styling (Token-Based)
- **Motion** - Animations
- **React Router DOM v7** - Client-Side Routing
- **Vite 6.3.5** - Build Tool
- **Sonner** - Toast Notifications
- **React Hook Form** - Form Management
- **Recharts** - Analytics Charts
- **QRCode.react** - QR Code Generation
- **html5-qrcode** - QR Scanner

### Backend
- **Supabase** - BaaS Platform
- **Hono** - Edge Functions Web Framework
- **Deno** - Runtime for Edge Functions
- **KV Store** - Key-Value Database
- **Supabase Auth** - Authentication
- **Supabase Storage** - File Storage
- **DeepSeek API** - AI Chatbot

### Development
- **ESLint** - Code Linting
- **PostCSS** - CSS Processing
- **npm** - Package Management

---

## 📂 Cấu Trúc Thư Mục

```
/src
├── app/
│   ├── App.tsx                    # Root component với routing
│   ├── components/
│   │   ├── ui/                    # ATOMS - Base components
│   │   │   ├── button.tsx         # Button variants
│   │   │   ├── input.tsx          # Input fields
│   │   │   ├── card.tsx           # Card container
│   │   │   ├── dialog.tsx         # Modal dialogs
│   │   │   ├── badge.tsx          # Status badges
│   │   │   ├── sonner.tsx         # Toast notifications
│   │   │   └── ...
│   │   ├── atoms/                 # Custom atomic components
│   │   ├── molecules/             # MOLECULES - Composed components
│   │   ├── organisms/             # ORGANISMS - Section components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── MembershipSection.tsx
│   │   │   ├── PromotionsSection.tsx
│   │   │   └── ...
│   │   ├── sections/              # Additional sections
│   │   │   └── EGiftCardSection.tsx
│   │   ├── pages/                 # PAGES - Route components
│   │   │   ├── HomePage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── CheckInPage.tsx
│   │   │   └── ...
│   │   ├── admin/                 # Admin dashboard components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── atoms/             # Admin-specific atoms
│   │   │   ├── molecules/         # Admin-specific molecules
│   │   │   └── organisms/         # Admin-specific organisms
│   │   ├── PublicLayout.tsx       # Public pages wrapper
│   │   ├── AdminLayout.tsx        # Admin pages wrapper
│   │   ├── BottomNav.tsx          # Mobile navigation
│   │   ├── LanguageSwitcher.tsx   # i18n switcher
│   │   └── Chatbot.tsx            # AI chatbot
│   ├── context/
│   │   ├── LanguageContext.tsx    # i18n state
│   │   ├── AuthContext.tsx        # Auth state
│   │   └── LoadingContext.tsx     # Loading state
│   ├── hooks/
│   │   ├── useDashboard.ts
│   │   ├── useAppointments.ts
│   │   ├── useServices.ts
│   │   ├── useServiceCategories.ts
│   │   ├── useServiceMenu.ts
│   │   ├── useStaff.ts
│   │   ├── useAnalytics.ts
│   │   └── useMembershipTiers.ts
│   ├── lib/
│   │   ├── admin-types.ts         # TypeScript types
│   │   ├── api-client.ts          # API wrapper
│   │   ├── service-constants.ts
│   │   ├── service-menu-utils.ts
│   │   ├── service-price-resolver.ts
│   │   └── types.ts
│   ├── pages/                     # Page components
│   │   ├── CheckInPage.tsx
│   │   ├── ComingSoon.tsx
│   │   └── admin/
│   │       ├── LoginPage.tsx
│   │       ├── SetupOwnerPage.tsx
│   │       ├── RolesPage.tsx
│   │       └── ...
│   └── utils/
│       ├── logger.ts              # Logging utility
│       ├── disableConsoleLogs.ts  # Production logging
│       └── translations.ts        # i18n data
├── styles/
│   ├── index.css                  # Global styles
│   ├── theme.css                  # Design tokens (CSS variables)
│   ├── tailwind.css               # Tailwind config
│   └── fonts.css                  # Font imports
├── imports/                       # Figma assets
│   ├── figma:asset/...           # Images từ Figma
│   └── svg-*/...                 # SVG vectors
├── lib/
│   ├── supabase-client.ts
│   └── supabase.ts
├── contexts/
│   └── AuthContext.tsx
├── types/
│   └── index.ts
└── utils/
    ├── debugStorage.ts
    └── supabase/
        └── info.tsx               # Supabase credentials

/supabase
└── functions/
    └── server/
        ├── index.tsx              # Hono server (main)
        ├── kv_store.tsx           # KV utilities (PROTECTED)
        ├── auth.tsx               # Auth routes
        ├── customers.tsx          # Customer management
        ├── email.tsx              # Email service
        ├── helpers.tsx            # Utilities
        ├── membership.tsx         # Membership routes
        ├── promotions.tsx         # Promotions routes
        ├── roles.tsx              # RBAC routes
        └── initial_services.ts    # Default services data

/utils
├── auth.ts                        # Frontend auth utilities
└── supabase/
    └── info.tsx                   # Supabase config

/docs                              # Documentation
├── 01-architecture/
├── 02-api/
├── 03-guides/
├── 04-changelogs/
└── 05-references/
```

---

## 🧩 Component Architecture

### 1. Atoms (ui/)

**Base components** - Không có business logic, chỉ UI thuần túy.

Examples:
- `<Button>` - Variants: default, outline, ghost, destructive
- `<Input>` - Text input với validation states
- `<Card>` - Container với header, content, footer
- `<Badge>` - Status badges
- `<Dialog>` - Modal overlays
- `<Tabs>` - Tab navigation
- `<Select>` - Dropdown selection

### 2. Molecules (molecules/)

**Composed components** - Kết hợp atoms, có logic nhẹ.

Examples:
- `<MembershipCard>` - Card hiển thị membership plan
- `<FeatureCard>` - Feature item với icon + text
- `<PromotionCard>` - Promotion display
- `<AppointmentCard>` - Appointment details
- `<ServiceFormSheet>` - Service create/edit form

### 3. Organisms (organisms/)

**Section components** - Chứa business logic, data fetching, state.

Examples:
- `<HeroSection>` - Homepage hero với Bitcoin card
- `<MembershipSection>` - 4 membership tiers display
- `<PromotionsSection>` - Carousel of promotions
- `<ServicesTable>` - Admin services management table
- `<ServicesSection>` - Public services overview

### 4. Pages (pages/)

**Route components** - Compose organisms into full pages.

Examples:
- `<HomePage>` - Landing page (13 sections)
- `<ServicesPage>` - Services listing
- `<BookingPage>` - Appointment booking
- `<CheckInPage>` - Kiosk check-in
- Admin pages: Dashboard, Appointments, Services, etc.

---

## 🛣️ Routing & Navigation

### Route Structure

```typescript
// Public Routes
/                    → HomePage
/services            → ServicesPage
/menu               → MenuPage (service menu with pagination)
/promotions         → PromotionsPage
/membership         → MembershipPage
/careers            → CareersPage
/gallery            → GalleryPage
/e-gift             → EGiftPage
/booking            → BookingPage
/locations          → LocationsPage
/reviews            → ReviewsPage
/vip                → VIPPage
/checkin/:id        → CheckInPage (kiosk)

// Admin Routes (Protected)
/admin/login        → LoginPage
/admin/setup-owner  → SetupOwnerPage (first-time setup)
/admin/dashboard    → AdminDashboard
/admin/appointments → Appointments
/admin/services     → Services
/admin/staff-payroll → StaffPayroll
/admin/reviews      → Reviews
/admin/analytics    → Analytics
/admin/settings     → Settings
/admin/check-in     → CheckInPage (admin kiosk)
/admin/roles        → RolesPage (RBAC)
/admin/permissions  → PermissionsPage
/admin/users        → UsersPage
```

### Navigation Methods

#### 1. Desktop Header Navigation
```tsx
<nav>
  <Link to="/services">Services</Link>
  <Link to="/promotions">Promotions</Link>
  <Link to="/membership">Membership</Link>
</nav>
```

#### 2. Mobile Bottom Navigation
```tsx
const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/services", icon: Scissors, label: "Services" },
  { to: "/booking", icon: Calendar, label: "Book" },
  { to: "/admin", icon: Settings, label: "Admin" },
];
```

#### 3. Anchor Navigation (Same-page)
```tsx
<div id="promotions"><PromotionsSection /></div>
<Link to="/#promotions">View Promotions</Link>
```

---

## 💾 State Management

### 1. Context API - Global State

**LanguageContext** - i18n
```typescript
interface LanguageContextType {
  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;
  t: (key: string) => any;
}
```

**AuthContext** - Authentication
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email, password) => Promise<void>;
  logout: () => void;
}
```

### 2. Custom Hooks - Data Management

- `useDashboard()` - Dashboard stats
- `useAppointments()` - Appointments CRUD
- `useServices()` - Services data
- `useServiceCategories()` - Service categories
- `useServiceMenu()` - Service menu management
- `useStaff()` - Staff data
- `useAnalytics()` - Analytics data
- `useMembershipTiers()` - Membership tiers

### 3. Local State - useState

Used for UI-specific state:
- Form inputs
- Modal open/close
- Tab selection
- Search queries

### 4. Form State - react-hook-form

```typescript
const { register, handleSubmit, formState: { errors } } = useForm();
```

---

## 🔌 Backend Integration

### Architecture: Frontend → Server → Database

```
┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│   Frontend   │─────▶│  Edge Function  │─────▶│   Supabase   │
│  (React)     │      │  (Hono Server)  │      │   (Postgres) │
└──────────────┘      └─────────────────┘      └──────────────┘
                              │
                              ▼
                      ┌─────────────────┐
                      │   kv_store.tsx  │
                      │  (Key-Value DB) │
                      └─────────────────┘
```

### API Client Pattern

```typescript
import { apiClient } from '@/lib/api-client';

// Example usage
const appointments = await apiClient.appointments.getAll();
const appointment = await apiClient.appointments.getById(id);
await apiClient.appointments.update(id, data);
```

### Key-Value Store Operations

```typescript
// Set a value
await kv.set('user:123', { name: 'John', email: 'john@example.com' });

// Get a value
const user = await kv.get('user:123');

// Get multiple values
const users = await kv.mget(['user:123', 'user:456']);

// Get by prefix (all users)
const allUsers = await kv.getByPrefix('user:');

// Delete a value
await kv.del('user:123');
```

---

## 🎨 Design System

### Color Tokens
```css
:root {
  /* Primary - Bitcoin Theme */
  --color-primary: #f7931a;
  --color-primary-dark: #F57C00;
  --color-secondary: #FF9800;
  
  /* Background */
  --color-bg-dark: #0B0F19;
  --color-bg-gray: #111827;
  --color-bg-light: #FFFFFF;
  
  /* Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #9CA3AF;
  --color-text-dark: #1F2937;
  
  /* Accent */
  --color-gold: #eab308;
  --color-platinum: #FFFFFF;
  --color-silver: #C0C0C0;
}
```

### Breakpoints
```css
/* Mobile First */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* Ultra wide screens */
```

---

## 📝 Best Practices

### 1. Component Creation Checklist
- [ ] Component tên rõ ràng (VD: `MembershipCard`)
- [ ] Export default cho Pages, named export cho components
- [ ] TypeScript interface cho props
- [ ] JSDoc comment cho complex components
- [ ] Mobile-first responsive design
- [ ] Accessibility (aria-labels, keyboard navigation)

### 2. File Organization
```typescript
// Import order:
// 1. React
// 2. Third-party
// 3. Internal UI
// 4. Contexts
// 5. Types
```

### 3. Naming Conventions
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: kebab-case (Tailwind)
- **Files**: 
  - Components: PascalCase.tsx
  - Utilities: camelCase.ts
  - Pages: PascalCase.tsx

---

## 🚀 Performance Optimization

### 1. Code Splitting
```typescript
// Lazy load admin pages
const AdminDashboard = lazy(() => import('./admin/Dashboard'));
```

### 2. Memoization
```typescript
const sortedPlans = useMemo(() => {
  return plans.sort((a, b) => a.price - b.price);
}, [plans]);
```

### 3. Image Optimization
```typescript
<ImageWithFallback 
  src={img}
  loading="lazy"
  className="object-cover"
/>
```

### 4. Production Logging
- Centralized logger utility (`/src/utils/logger.ts`)
- Auto-disable console.log in production (`/src/utils/disableConsoleLogs.ts`)
- 100+ console.log statements disabled automatically

---

## 🔒 Security

### 1. Authentication
- JWT-based authentication
- Session management with 7-day expiry
- Protected routes via `<ProtectedAdminRoute>`
- Role-Based Access Control (RBAC)

### 2. Authorization
- Owner: Full access
- Admin: Customizable permissions
- Manager: Limited permissions
- Staff: View-only permissions

### 3. Data Protection
- Environment variables for secrets
- No sensitive data in localStorage
- HTTPS only (Supabase)
- Input validation on all forms

---

**Last Updated:** January 20, 2026  
**Version:** 2.0.0  
**Status:** Production Ready ✅
