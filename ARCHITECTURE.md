# Bitcoin Nail Bar - Architecture Documentation

## 📋 Mục Lục
1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Kiến Trúc Tổng Thể](#kiến-trúc-tổng-thể)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Design System](#design-system)
5. [Component Architecture](#component-architecture)
6. [Routing & Navigation](#routing--navigation)
7. [State Management](#state-management)
8. [Backend Integration](#backend-integration)
9. [Styling Guidelines](#styling-guidelines)
10. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan Dự Án

### Thông Tin Cơ Bản
- **Tên Dự Án**: Bitcoin Nail Bar Website
- **Tech Stack**: React 18.3.1 + TypeScript + Tailwind CSS v4 + Vite 6.3.5
- **Design Pattern**: Atomic Design
- **Routing**: React Router DOM v7.11.0
- **Animation**: Motion (Framer Motion) v12.23.24
- **Backend**: Supabase (Auth, Storage, Edge Functions)
- **UI Philosophy**: Mobile-First, Component-Driven, Token-Based Styling

### Mục Đích
Website giới thiệu và quản lý dịch vụ nail salon cao cấp với đặc điểm:
- Chấp nhận thanh toán Bitcoin
- Hệ thống membership VIP
- Booking appointments
- E-Gift cards
- Admin dashboard cho quản lý

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
│   │   │   └── ...
│   │   ├── molecules/             # MOLECULES - Composed components
│   │   │   └── ...
│   │   ├── organisms/             # ORGANISMS - Section components
│   │   │   ├── HeroSection.tsx    # Homepage hero
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── MembershipSection.tsx
│   │   │   ├── PromotionsSection.tsx
│   │   │   ├── CareerSection.tsx
│   │   │   └── ...
│   │   ├── sections/              # Additional sections
│   │   │   └── EGiftCardSection.tsx
│   │   ├── pages/                 # PAGES - Route components
│   │   │   ├── HomePage.tsx       # Landing page
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── MembershipPage.tsx
│   │   │   ├── CareersPage.tsx
│   │   │   ├── GalleryPage.tsx
│   │   │   └── ...
│   │   ├── admin/                 # Admin dashboard components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── StaffPayroll.tsx
│   │   │   └── ...
│   │   ├── PublicLayout.tsx       # Public pages wrapper
│   │   ├── AdminLayout.tsx        # Admin pages wrapper
│   │   ├── BottomNav.tsx          # Mobile navigation
│   │   ├── LanguageSwitcher.tsx   # i18n switcher
│   │   ├── Chatbot.tsx            # AI chatbot
│   │   └── ...
│   ├── context/
│   │   └── LanguageContext.tsx    # i18n state management
│   ├── hooks/
│   │   └── ...                    # Custom React hooks
│   ├── lib/
│   │   └── ...                    # Utility functions
│   └── pages/
│       └── ComingSoon.tsx         # Coming soon pages
├── styles/
│   ├── index.css                  # Global styles
│   ├── theme.css                  # Design tokens (CSS variables)
│   ├── tailwind.css               # Tailwind config
│   └── fonts.css                  # Font imports
├── imports/                       # Figma assets
│   ├── figma:asset/...           # Images từ Figma
│   └── svg-*/...                 # SVG vectors
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx          # Hono server
│           └── kv_store.tsx       # Key-value storage
└── utils/
    └── supabase/
        └── info.tsx               # Supabase credentials
```

---

## 🎨 Design System

### Color Tokens (theme.css)

```css
:root {
  /* Primary Colors - Bitcoin Theme */
  --color-primary: #f7931a;           /* Bitcoin Orange */
  --color-primary-dark: #F57C00;      
  --color-secondary: #FF9800;         /* Warm Orange */
  
  /* Background Colors */
  --color-bg-dark: #0B0F19;           /* Dark Navy */
  --color-bg-gray: #111827;           /* Deep Gray */
  --color-bg-light: #FFFFFF;          /* White */
  
  /* Text Colors */
  --color-text-primary: #FFFFFF;      /* White text */
  --color-text-secondary: #9CA3AF;    /* Gray text */
  --color-text-dark: #1F2937;         /* Dark text */
  
  /* Accent Colors */
  --color-gold: #eab308;              /* Gold membership */
  --color-platinum: #FFFFFF;          /* Platinum membership */
  --color-silver: #C0C0C0;            /* Silver membership */
}
```

### Typography Scale

```css
/* Font Families */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-serif: Georgia, 'Times New Roman', serif;

/* Font Sizes - Mobile First */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-7xl: 4.5rem;    /* 72px */
```

### Spacing System

```css
/* Spacing - 4px base unit */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
```

### Breakpoints

```css
/* Mobile First Breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* Ultra wide screens */
```

---

## 🧩 Component Architecture

### 1. Atoms (ui/)

**Base components** - Không có business logic, chỉ UI thuần túy.

#### Button Component
```tsx
// /src/app/components/ui/button.tsx
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean; // Radix Slot pattern
}

// Usage
<Button variant="default" size="lg">
  Book Now
</Button>

<Button variant="outline" asChild>
  <Link to="/services">View Services</Link>
</Button>
```

#### Card Component
```tsx
// /src/app/components/ui/card.tsx
<Card>
  <CardHeader>
    <CardTitle>Membership Plans</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Select Plan</Button>
  </CardFooter>
</Card>
```

### 2. Organisms (organisms/)

**Section components** - Chứa business logic, data fetching, state.

#### HeroSection
```tsx
// /src/app/components/organisms/HeroSection.tsx

/**
 * HeroSection - Homepage hero with Bitcoin card
 * 
 * Features:
 * - Animated Bitcoin card design (3D transform)
 * - CTA buttons (Book Now, Design Card)
 * - Mobile-responsive (card size adjusts)
 * - Motion animations on scroll
 * 
 * Layout:
 * - Mobile: Stack vertically, card maxWidth 360px
 * - Desktop: Side-by-side, card floats on right
 */
export function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen bg-[#0B0F19]">
      {/* Background effects */}
      {/* Content grid */}
      {/* Bitcoin card with animations */}
    </section>
  );
}
```

#### MembershipSection
```tsx
// /src/app/components/organisms/MembershipSection.tsx

/**
 * MembershipSection - Displays 4 membership tiers
 * 
 * Plans:
 * 1. Silver ($99/year) - Entry level
 * 2. Gold ($479/year) - 20% savings
 * 3. Platinum ($539/year) - Most popular, 25% savings
 * 4. VIP Crypto ($624/year) - 35% savings, Bitcoin payments
 * 
 * Features:
 * - Animated cards with hover glow effects
 * - Platinum card elevated (popular badge)
 * - Responsive grid: 1 col mobile, 4 cols desktop
 * - Each card has icon, price, features list, CTA button
 */
export function MembershipSection() {
  const { t } = useLanguage();
  const memberships = [...]; // 4 plans data
  
  return (
    <section className="py-10 bg-[#111827]">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
        {memberships.map((plan) => (
          <MembershipCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
```

### 3. Pages (pages/)

**Route components** - Compose organisms into full pages.

#### HomePage Structure
```tsx
// /src/app/components/pages/HomePage.tsx

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. Hero with Bitcoin card */}
      <HeroSection />
      
      {/* 2. Why choose us */}
      <FeaturesSection />
      
      {/* 3. Bitcoin acceptance */}
      <BitcoinSection />
      
      {/* 4. Promotions (with ID for anchor nav) */}
      <div id="promotions">
        <PromotionsSection />
      </div>
      
      {/* 5. E-Gift cards */}
      <div id="egift">
        <EGiftCardSection />
      </div>
      
      {/* 6. Membership plans */}
      <div id="membership">
        <MembershipSection />
      </div>
      
      {/* 7. Hygiene & safety */}
      <HygieneSection />
      
      {/* 8. Services overview */}
      <ServicesSection />
      
      {/* 9. Detailed service menu */}
      <div id="services">
        <ServiceMenu />
      </div>
      
      {/* 10. Career opportunities */}
      <div id="careers">
        <CareerSection />
      </div>
      
      {/* 11. Photo gallery */}
      <div id="gallery">
        <GallerySection />
      </div>
      
      {/* 12. CTA section */}
      <CtaSection />
      
      {/* 13. Location map */}
      <MapSection />
    </PublicLayout>
  );
}
```

#### Page Template Pattern
```tsx
// Template cho mọi standalone page

import PublicLayout from '../PublicLayout';
import { SectionComponent } from '../organisms/SectionComponent';

export default function StandalonePage() {
  return (
    <PublicLayout>
      <div className="bg-[background-color]">
        {/* 
          ❌ KHÔNG thêm pt-20 hoặc pt-24 ở đây
          ✅ Section tự lo padding: py-10 (40px)
        */}
        <SectionComponent />
      </div>
    </PublicLayout>
  );
}
```

---

## 🛣️ Routing & Navigation

### Route Structure

```tsx
// /src/app/App.tsx

<Routes>
  {/* PUBLIC ROUTES */}
  <Route path="/" element={<HomePage />} />
  <Route path="/services" element={<ServicesPage />} />
  <Route path="/promotions" element={<PromotionsPage />} />
  <Route path="/membership" element={<MembershipPage />} />
  <Route path="/careers" element={<CareersPage />} />
  <Route path="/gallery" element={<GalleryPage />} />
  <Route path="/e-gift" element={<EGiftPage />} />
  <Route path="/booking" element={<BookingPage />} />
  <Route path="/locations" element={<LocationsPage />} />
  <Route path="/reviews" element={<ReviewsPage />} />
  <Route path="/vip" element={<VIPPage />} />
  <Route path="/checkin/:id" element={<CheckInPage />} />
  
  {/* ADMIN ROUTES - Lazy loaded */}
  <Route path="/admin/dashboard" element={
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  } />
  {/* ... more admin routes */}
  
  {/* 404 Fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Navigation Methods

#### 1. Header Navigation (Desktop)
```tsx
// /src/app/components/PublicLayout.tsx - Header
<nav>
  <Link to="/services">Services</Link>
  <Link to="/promotions">Promotions</Link>
  <Link to="/membership">Membership</Link>
  {/* ... */}
</nav>
```

#### 2. Bottom Navigation (Mobile)
```tsx
// /src/app/components/BottomNav.tsx
const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/services", icon: Scissors, label: "Services" },
  { to: "/booking", icon: Calendar, label: "Book" },
  { to: "/admin", icon: Settings, label: "Admin" },
];
```

#### 3. Anchor Navigation (Same-page)
```tsx
// Homepage sections có ID
<div id="promotions"><PromotionsSection /></div>
<div id="membership"><MembershipSection /></div>

// Navigate to anchor
<Link to="/#promotions">View Promotions</Link>
<a href="#membership">See Plans</a>
```

#### 4. Scroll Behavior
```tsx
// /src/app/components/ScrollToTop.tsx
// Automatically scroll to top on route change
useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}, [pathname]);
```

---

## 💾 State Management

### 1. Context API - Language (i18n)

```tsx
// /src/app/context/LanguageContext.tsx

interface LanguageContextType {
  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;
  t: (key: string) => any;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  
  const t = (key: string) => {
    // Get translation from translations object
    return translations[language][key];
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Usage in components
function MyComponent() {
  const { t, language } = useLanguage();
  
  return <h1>{t('home.hero.title')}</h1>;
}
```

### 2. Local State - useState

```tsx
// Component-level state for UI interactions
function MembershipSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  return (
    <div>
      {plans.map(plan => (
        <div 
          onClick={() => setSelectedPlan(plan.id)}
          className={selectedPlan === plan.id ? 'active' : ''}
        >
          {plan.name}
        </div>
      ))}
    </div>
  );
}
```

### 3. Form State - react-hook-form

```tsx
// /src/app/components/pages/BookingPage.tsx
import { useForm } from 'react-hook-form';

function BookingPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    // Send to backend
    await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>Name is required</span>}
      
      <button type="submit">Book Now</button>
    </form>
  );
}
```

---

## 🔌 Backend Integration

### Supabase Setup

```tsx
// /utils/supabase/info.tsx
export const projectId = process.env.SUPABASE_PROJECT_ID;
export const publicAnonKey = process.env.SUPABASE_ANON_KEY;
```

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

### Server Routes

```tsx
// /supabase/functions/server/index.tsx
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// Routes
app.get('/make-server-84f9c112/health', (c) => {
  return c.json({ status: 'ok' });
});

app.post('/make-server-84f9c112/bookings', async (c) => {
  const data = await c.req.json();
  await kv.set(`booking:${data.id}`, data);
  return c.json({ success: true });
});

Deno.serve(app.fetch);
```

### Frontend API Calls

```tsx
// Example: Booking submission
import { projectId, publicAnonKey } from '/utils/supabase/info';

async function submitBooking(bookingData) {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/bookings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(bookingData),
    }
  );
  
  if (!response.ok) {
    throw new Error('Booking failed');
  }
  
  return response.json();
}
```

### Key-Value Store Operations

```tsx
// /supabase/functions/server/kv_store.tsx

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

## 🎨 Styling Guidelines

### 1. Tailwind v4 Best Practices

#### ✅ DO - Use Tailwind Classes
```tsx
<div className="flex items-center gap-4 p-6 rounded-xl bg-white shadow-lg">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>
```

#### ❌ DON'T - Inline Styles
```tsx
<div style={{ display: 'flex', padding: '24px' }}> {/* ❌ */}
```

### 2. Mobile-First Approach

```tsx
{/* Mobile: stack vertically, Desktop: 2 columns */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Default styles = mobile */}
  <div className="text-base md:text-lg lg:text-xl">
    {/* text-base on mobile, text-lg on tablet, text-xl on desktop */}
  </div>
</div>
```

### 3. Design Tokens Usage

```tsx
{/* ✅ Use CSS variables from theme.css */}
<div className="bg-[var(--color-bg-dark)] text-[var(--color-text-primary)]">

{/* ✅ Or use Tailwind's built-in colors */}
<div className="bg-[#0B0F19] text-white">

{/* ❌ DON'T hardcode random colors */}
<div className="bg-[#123456] text-[#abcdef]"> {/* ❌ */}
```

### 4. Spacing Consistency

```tsx
{/* Use standard spacing scale */}
<section className="py-10">     {/* 40px padding - standard for all sections */}
<section className="py-20">     {/* 80px padding - for large sections */}
<div className="gap-4">         {/* 16px gap */}
<div className="gap-8">         {/* 32px gap */}
```

### 5. Animation with Motion

```tsx
import { motion } from 'motion/react';

{/* Fade in on scroll */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>

{/* Hover effect */}
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### 6. Responsive Image Handling

```tsx
import { ImageWithFallback } from '../figma/ImageWithFallback';

{/* For Figma imports - use figma:asset */}
import img from 'figma:asset/abc123.png';
<ImageWithFallback 
  src={img} 
  alt="Service Image"
  className="w-full h-auto object-cover"
/>

{/* For external images */}
<ImageWithFallback 
  src="https://images.unsplash.com/photo-..." 
  alt="Nail Art"
  className="w-full h-auto"
/>
```

---

## 📝 Best Practices

### 1. Component Creation Checklist

- [ ] Component tên rõ ràng (VD: `MembershipCard`, không phải `Card1`)
- [ ] Export default cho Pages, named export cho components
- [ ] TypeScript interface cho props
- [ ] JSDoc comment cho complex components
- [ ] Mobile-first responsive design
- [ ] Accessibility (aria-labels, keyboard navigation)
- [ ] Error boundaries cho error handling

### 2. File Organization

```tsx
// ✅ Good: Clear imports order
import React from 'react';                    // 1. React
import { Link } from 'react-router-dom';      // 2. Third-party
import { Button } from '@/components/ui/button'; // 3. Internal UI
import { useLanguage } from '@/context/LanguageContext'; // 4. Contexts
import type { ServiceType } from '@/types';   // 5. Types

// ❌ Bad: Mixed imports
import { Button } from '@/components/ui/button';
import React from 'react';
import type { ServiceType } from '@/types';
```

### 3. Naming Conventions

```tsx
// Components: PascalCase
export function MembershipCard() {}

// Functions: camelCase
function handleSubmit() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// CSS Classes: kebab-case (Tailwind)
className="bg-primary-500 text-white"

// Files:
// - Components: PascalCase.tsx (Button.tsx)
// - Utilities: camelCase.ts (formatDate.ts)
// - Pages: PascalCase.tsx (HomePage.tsx)
```

### 4. Performance Optimization

```tsx
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

// 4. Optimize images
<ImageWithFallback 
  src={img}
  loading="lazy"     // Lazy load images
  className="object-cover"
/>
```

### 5. Error Handling

```tsx
// API calls with try-catch
async function fetchBookings() {
  try {
    const response = await fetch('/api/bookings');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    toast.error('Could not load bookings. Please try again.');
    return [];
  }
}

// Form validation
const { register, formState: { errors } } = useForm();

<input {...register('email', { 
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address'
  }
})} />
{errors.email && <span className="text-red-500">{errors.email.message}</span>}
```

### 6. Accessibility

```tsx
// Semantic HTML
<nav>
  <Link to="/services">Services</Link>
</nav>

// ARIA labels
<button aria-label="Close dialog" onClick={onClose}>
  <X className="w-6 h-6" />
</button>

// Keyboard navigation
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  Interactive element
</div>

// Focus management
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} />
```

---

## 🚀 Implementation Guide

### Quick Start for New Developers

#### 1. Setup Project
```bash
# Clone repository
git clone [repo-url]
cd bitcoin-nail-bar

# Install dependencies
npm install

# Run development server
npm run dev
```

#### 2. Create New Page
```bash
# Create page file
touch src/app/components/pages/NewPage.tsx
```

```tsx
// /src/app/components/pages/NewPage.tsx
import PublicLayout from '../PublicLayout';

export default function NewPage() {
  return (
    <PublicLayout>
      <div className="bg-white">
        <section className="py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold">New Page</h1>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
```

```tsx
// Add route in /src/app/App.tsx
<Route path="/new-page" element={<NewPage />} />
```

#### 3. Create New Section
```bash
touch src/app/components/organisms/NewSection.tsx
```

```tsx
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';

export function NewSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-10 bg-[#0B0F19]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white">
            {t('section.title')}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
```

#### 4. Add Translation
```tsx
// In LanguageContext.tsx - translations object
const translations = {
  en: {
    section: {
      title: 'New Section Title'
    }
  },
  vi: {
    section: {
      title: 'Tiêu Đề Section Mới'
    }
  }
};
```

---

## 🔍 Debugging Guide

### Common Issues & Solutions

#### 1. "Cannot find module 'figma:asset/...'"
```tsx
// ❌ Wrong
import img from './imports/figma:asset/abc123.png';

// ✅ Correct
import img from 'figma:asset/abc123.png';
```

#### 2. Section không hiển thị đúng padding
```tsx
// ❌ Wrong - thừa padding từ wrapper
<PublicLayout>
  <div className="pt-20"> {/* ❌ Không cần */}
    <MySection />
  </div>
</PublicLayout>

// ✅ Correct - padding trong section
<PublicLayout>
  <div className="bg-white">
    <MySection /> {/* Section tự có py-10 */}
  </div>
</PublicLayout>
```

#### 3. Translation không hoạt động
```tsx
// ❌ Wrong
const title = t('home.title'); // undefined

// ✅ Correct - check translation key exists
const { t } = useLanguage();
const title = t('home.hero.title') || 'Fallback Title';
```

#### 4. API call fails
```tsx
// Add detailed error logging
try {
  const res = await fetch(url);
  console.log('Response status:', res.status);
  console.log('Response headers:', res.headers);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error(`API error: ${res.status} - ${errorText}`);
  }
} catch (error) {
  console.error('Fetch failed:', error);
}
```

---

## 📚 Key Dependencies

### Core
- **React** 18.3.1 - UI framework
- **React Router DOM** 7.11.0 - Routing
- **TypeScript** - Type safety
- **Vite** 6.3.5 - Build tool

### Styling
- **Tailwind CSS** 4.1.12 - Utility-first CSS
- **Motion** 12.23.24 - Animations
- **Lucide React** 0.487.0 - Icons

### UI Components
- **Radix UI** - Headless components (Dialog, Popover, etc.)
- **Sonner** 2.0.3 - Toast notifications
- **Recharts** 2.15.2 - Charts/graphs

### Backend
- **Supabase** 2.89.0 - Backend as a Service
- **React Hook Form** 7.55.0 - Form handling

### Admin
- **MUI Material** 7.3.5 - Admin dashboard components
- **date-fns** 3.6.0 - Date manipulation

---

## 🎓 Learning Resources

### For Junior Developers
1. **React Basics**: https://react.dev/learn
2. **Tailwind CSS**: https://tailwindcss.com/docs
3. **TypeScript**: https://www.typescriptlang.org/docs/

### For Middle Developers
1. **Atomic Design**: https://bradfrost.com/blog/post/atomic-web-design/
2. **React Router**: https://reactrouter.com/
3. **Motion (Framer Motion)**: https://www.framer.com/motion/

### For Senior Developers
1. **Supabase Docs**: https://supabase.com/docs
2. **Hono Framework**: https://hono.dev/
3. **Vite Config**: https://vitejs.dev/config/

---

## ✅ Code Review Checklist

Trước khi submit PR, kiểm tra:

- [ ] Code chạy không có error trong console
- [ ] Responsive trên mobile, tablet, desktop
- [ ] Translation (tiếng Anh & tiếng Việt) hoạt động
- [ ] Accessibility: semantic HTML, aria-labels, keyboard navigation
- [ ] Performance: lazy loading, memoization khi cần
- [ ] Naming conventions đúng chuẩn
- [ ] Comments cho logic phức tạp
- [ ] Error handling cho API calls
- [ ] TypeScript types đầy đủ (không dùng `any`)
- [ ] Tailwind classes thay vì inline styles
- [ ] Git commit messages rõ ràng

---

## 📞 Support & Contact

Nếu có thắc mắc hoặc cần hỗ trợ:

1. **Documentation**: Đọc file này trước
2. **Code Examples**: Tham khảo các components hiện có
3. **Team Lead**: Liên hệ khi cần clarification về requirements

---

**Last Updated**: January 15, 2026  
**Version**: 1.0  
**Maintained by**: Bitcoin Nail Bar Development Team
