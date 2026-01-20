# 📱💻 Mobile vs Desktop Fix Patterns

## Overview

This document catalogs platform-specific fixes needed when building responsive web apps. Often, a feature works perfectly on desktop but breaks on mobile (or vice versa) due to different event models, browser behaviors, and user interaction patterns.

---

## 🔍 Common Mobile vs Desktop Differences

| Aspect | Desktop | Mobile | Impact |
|--------|---------|--------|--------|
| **Events** | Mouse (click, hover) | Touch (touchstart, touchend) | High |
| **Hover** | Available | Not available | Medium |
| **Viewport** | Large, fixed | Small, rotation | High |
| **Performance** | High CPU/RAM | Limited resources | Medium |
| **Network** | Usually fast | Variable (3G-5G) | Medium |
| **Input** | Precise (mouse) | Imprecise (finger) | High |
| **Context** | Multitasking common | Single-focus | Low |

---

## 📖 Case Study: Flipbook Previous Button

### Problem

**Desktop:** Previous button works smoothly ✅  
**Mobile:** Previous button broken/laggy ❌

### Root Cause

```typescript
// HTMLFlipBook settings
<HTMLFlipBook
  useMouseEvents={!isMobile}  // Desktop: true, Mobile: false
  disableFlipByClick={isMobile}  // Desktop: false, Mobile: true
  ...
/>
```

**Desktop behavior:**
- Uses mouse events
- `flipPrev()` API works directly with mouse handlers

**Mobile behavior:**
- Uses touch events
- Touch event propagation different from mouse
- `flipPrev()` may fire before touch event completes
- Event race condition causes flip to fail

### Solution: Platform-Specific Logic

```typescript
const prevPage = () => {
  if (currentPage > 0) {
    const targetPage = currentPage - 1;
    
    if (flipBookRef.current) {
      const pageFlip = flipBookRef.current.pageFlip();
      
      if (isMobile) {
        // Mobile: Direct flip with delay for touch event completion
        setTimeout(() => {
          pageFlip.flip(targetPage);
        }, 50);
      } else {
        // Desktop: Native API for smooth animation
        pageFlip.flipPrev();
      }
    }
    
    setCurrentPage(targetPage);
  }
};
```

**Why this works:**
- **Desktop:** Uses `flipPrev()` for natural backward animation
- **Mobile:** Uses `flip(targetPage)` after 50ms delay to avoid touch event race
- **Both:** Update React state consistently

---

## 🛠️ Common Fix Patterns

### 1. Event Handler Delays

**Problem:** Events fire too quickly on mobile  
**Solution:** Add setTimeout for touch events

```typescript
// ❌ BAD: Immediate execution on mobile
onClick={() => handleAction()}

// ✅ GOOD: Delayed for mobile touch events
onClick={() => {
  if (isMobile) {
    setTimeout(() => handleAction(), 50);
  } else {
    handleAction();
  }
}}
```

---

### 2. Conditional Event Listeners

**Problem:** Wrong events for platform  
**Solution:** Platform-specific listeners

```typescript
// ❌ BAD: Only mouse events
element.addEventListener('click', handler);

// ✅ GOOD: Platform-appropriate events
if (isMobile) {
  element.addEventListener('touchstart', handler);
} else {
  element.addEventListener('mousedown', handler);
}
```

---

### 3. Viewport-Based Sizing

**Problem:** Fixed sizes break on mobile  
**Solution:** Responsive calculations

```typescript
// ❌ BAD: Fixed desktop size
const width = 800;
const height = 600;

// ✅ GOOD: Viewport-relative
const calculateDimensions = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isDesktop = vw >= 1024;
  
  const maxHeightRatio = isDesktop ? 0.8 : 0.92;
  const height = vh * maxHeightRatio;
  const width = height * aspectRatio;
  
  return { width, height };
};
```

---

### 4. Touch Action Management

**Problem:** Browser default touch behaviors interfere  
**Solution:** Explicit touch-action CSS

```typescript
// ✅ GOOD: Prevent default touch behaviors
<button
  style={{
    touchAction: 'manipulation', // Disables double-tap zoom
  }}
  onClick={handleClick}
>
  Click Me
</button>
```

**Common touch-action values:**
- `manipulation` - Enable panning and pinch zoom, disable double-tap
- `none` - Disable all gestures
- `pan-y` - Only vertical panning
- `pan-x` - Only horizontal panning

---

### 5. Pointer Events Fallback

**Problem:** Overlays block mobile interactions  
**Solution:** Explicit pointer-events

```typescript
// ✅ GOOD: Ensure mobile can interact
<div
  style={{
    pointerEvents: 'auto', // Explicitly enable touch
    opacity: isMobile ? (visible ? 1 : 0) : 1,
  }}
>
  <button>Mobile Button</button>
</div>
```

---

### 6. API Method Selection

**Problem:** Library APIs work differently on mobile vs desktop  
**Solution:** Platform-specific API calls

```typescript
const navigate = (direction: 'next' | 'prev') => {
  const api = getLibraryAPI();
  
  if (isMobile) {
    // Mobile: Use basic API
    api.goTo(targetPage);
  } else {
    // Desktop: Use advanced API
    direction === 'next' ? api.next() : api.prev();
  }
};
```

---

## 🧪 Testing Checklist

When fixing mobile vs desktop issues:

### Desktop Testing:
- [ ] Chrome DevTools Desktop mode
- [ ] Mouse events work correctly
- [ ] Hover states visible
- [ ] Animations smooth (60fps)
- [ ] Keyboard navigation works

### Mobile Testing:
- [ ] Chrome DevTools Mobile mode
- [ ] Touch events work correctly
- [ ] No accidental taps
- [ ] Swipe gestures smooth
- [ ] Buttons large enough (min 44px)
- [ ] Auto-zoom disabled (viewport meta)

### Cross-Platform:
- [ ] Both platforms have same core functionality
- [ ] UX feels natural on both
- [ ] No platform-specific bugs
- [ ] Performance acceptable on both

---

## 🎯 Best Practices

### 1. Detect Platform Early

```typescript
// ✅ GOOD: Detect once, use everywhere
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 1024);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

### 2. Centralize Platform Logic

```typescript
// ✅ GOOD: Reusable utility
const usePlatform = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};
```

### 3. Document Platform Differences

```typescript
// ✅ GOOD: Clear comments
const handleNavigation = () => {
  if (isMobile) {
    // Mobile: Use setTimeout to avoid touch event race condition
    // See: /docs/05-references/MOBILE_VS_DESKTOP_FIXES.md
    setTimeout(() => flip(), 50);
  } else {
    // Desktop: Direct API call works fine
    flip();
  }
};
```

### 4. Test on Real Devices

**Why?**
- DevTools mobile mode ≠ real device
- Touch events behave differently
- Performance gaps not visible in DevTools
- Real network conditions matter

**Recommended:**
- iPhone (Safari)
- Android phone (Chrome)
- iPad (Safari)
- Slow 3G throttling

---

## 📊 Performance Considerations

### Mobile Optimization Priorities:

1. **Reduce JavaScript Bundle**
   - Code splitting
   - Lazy loading
   - Tree shaking

2. **Optimize Images**
   - WebP format
   - Responsive images (srcset)
   - Lazy loading

3. **Minimize Re-renders**
   - Memoization
   - Virtual lists
   - Debounced events

4. **Touch-Optimized Interactions**
   - Passive event listeners
   - Touch-action CSS
   - Reduced animations

---

## 🔗 Related Documents

- `/docs/04-changelogs/FLIPBOOK_PREVIOUS_FIX.md` - Real-world mobile fix example
- `/docs/02-api/MENU_MANAGEMENT.md` - Menu system with mobile considerations
- `/DOCUMENTATION.md` - Master index

---

## 🚀 Quick Reference

### Mobile Detection

```typescript
const isMobile = window.innerWidth < 1024;
const isTouchDevice = 'ontouchstart' in window;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
```

### Event Delays

```typescript
const MOBILE_TOUCH_DELAY = 50; // ms
const MOBILE_ANIMATION_DELAY = 100; // ms
const MOBILE_DEBOUNCE_DELAY = 300; // ms
```

### Breakpoints (Tailwind v4)

```typescript
const BREAKPOINTS = {
  sm: 640,   // Small devices
  md: 768,   // Medium devices
  lg: 1024,  // Large devices (mobile cutoff)
  xl: 1280,  // Extra large
  '2xl': 1536 // 2X Extra large
};
```

---

**Last Updated:** January 20, 2026  
**Maintainer:** AI Assistant  
**Status:** Living Document
