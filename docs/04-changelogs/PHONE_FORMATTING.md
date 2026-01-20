# Phone Number Formatting System

## 📱 Overview

Bitcoin Nail Bar sử dụng phone number formatting system để normalize và validate phone numbers across the application, đặc biệt trong Check-In và Customer Management modules.

---

## 🎯 Use Cases

### 1. Check-In Page (`/admin/check-in`)
- Kiosk self-service check-in
- QR code scanning fallback to manual phone entry
- Auto-formatting để improve UX
- Format: `(555) 123-4567` (US style)

### 2. Customer Management
- Admin CRUD operations
- Customer search by phone
- Phone validation before save
- Normalized storage format: `0901234567` (no formatting)

### 3. Booking Page
- Customer phone input during booking
- Auto-format for better readability
- Validation before submission

---

## 🔧 Implementation

### Format Function

```typescript
/**
 * Format phone number to (555) 123-4567 format
 * @param value - Raw phone input
 * @returns Formatted phone string
 */
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

### Normalize Function (Backend)

```typescript
/**
 * Normalize phone to storage format (digits only)
 * @param phone - Formatted phone like "(555) 123-4567"
 * @returns Normalized phone like "5551234567"
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
```

### Validation Function (Backend)

```typescript
/**
 * Validate phone number format
 * @param phone - Phone to validate
 * @returns True if valid format
 */
function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  
  // Must be 10 digits for US phone
  // Or 11 digits starting with 0 for Vietnam phone
  return (
    (normalized.length === 10 && !normalized.startsWith('0')) ||
    (normalized.length === 11 && normalized.startsWith('0'))
  );
}
```

---

## 💻 Usage Examples

### Example 1: CheckInPage.tsx

```typescript
import { useState } from 'react';
import { Input } from '../components/ui/input';

export default function CheckInPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };
  
  return (
    <Input
      type="tel"
      value={phoneNumber}
      onChange={handlePhoneChange}
      placeholder="(555) 123-4567"
      className="h-16 text-2xl text-center font-bold tracking-widest"
      autoFocus
    />
  );
}
```

### Example 2: Backend Customer Creation

```typescript
// Backend: /supabase/functions/server/customers.tsx

app.post('/make-server-84f9c112/customers', async (c) => {
  const { phone, full_name, email } = await c.req.json();
  
  // Normalize phone before storage
  const normalizedPhone = normalizePhone(phone);
  
  // Validate
  if (!isValidPhone(normalizedPhone)) {
    return c.json({ 
      error: 'Invalid phone number format' 
    }, 400);
  }
  
  // Check uniqueness
  const existingCustomer = await kv.get(`customer_phone:${normalizedPhone}`);
  if (existingCustomer) {
    return c.json({ 
      error: 'Phone number already registered' 
    }, 400);
  }
  
  // Save customer
  const customer = {
    id: `customer_${crypto.randomUUID()}`,
    phone: normalizedPhone,  // Stored without formatting
    full_name,
    email,
    created_at: new Date().toISOString()
  };
  
  await kv.set(`customer:${customer.id}`, customer);
  await kv.set(`customer_phone:${normalizedPhone}`, customer.id);
  
  return c.json({ success: true, data: customer });
});
```

---

## 🌍 Format Variants

### US Format (Current Default)
- **Display:** `(555) 123-4567`
- **Storage:** `5551234567` (10 digits)
- **Validation:** Must be 10 digits, cannot start with 0

### Vietnam Format (Alternative)
- **Display:** `0901 234 567` or `(+84) 901 234 567`
- **Storage:** `0901234567` (10 digits starting with 0)
- **Validation:** Must be 10-11 digits, starts with 0

---

## 🎨 UI/UX Considerations

### Input Styling (CheckInPage)

```typescript
<Input
  type="tel"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
  placeholder="(555) 123-4567"
  className="
    h-16 
    text-2xl 
    text-center 
    font-bold 
    tracking-widest 
    bg-gray-50 
    border-transparent 
    focus:bg-white 
    focus:border-primary/50 
    rounded-2xl 
    transition-all 
    shadow-inner 
    placeholder:text-gray-400
  "
  autoFocus
/>
```

### Key UX Features:
- ✅ **Auto-formatting** - User types numbers, formatting applied automatically
- ✅ **Large text** - Easy to read (text-2xl = 24px)
- ✅ **Center alignment** - Better for kiosk UI
- ✅ **Bold & wide tracking** - Improved readability
- ✅ **Visual feedback** - Border color change on focus
- ✅ **Auto-focus** - Cursor ready immediately

---

## 🔍 Search & Lookup

### Frontend Search
```typescript
// Search by partial phone match
const searchCustomers = async (query: string) => {
  const response = await fetch('/customers/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  
  return response.json();
};

// Usage
searchCustomers('090')  // Finds "0901234567", "0909876543", etc.
```

### Backend Implementation
```typescript
// Fuzzy phone search
app.post('/make-server-84f9c112/customers/search', async (c) => {
  const { query } = await c.req.json();
  const normalizedQuery = normalizePhone(query);
  
  // Get all customers
  const allCustomers = await kv.getByPrefix('customer:');
  
  // Filter by phone match
  const matches = allCustomers.filter((customer: any) => 
    customer.phone.includes(normalizedQuery) ||
    customer.full_name.toLowerCase().includes(query.toLowerCase())
  );
  
  return c.json({ success: true, data: matches });
});
```

---

## 📝 Best Practices

### DO ✅
- Always normalize before storing in database
- Format for display only (UI layer)
- Validate on both frontend and backend
- Use consistent format across application
- Handle paste events (strip formatting)
- Support keyboard input only (block non-numeric)

### DON'T ❌
- Store formatted phone numbers in database
- Mix formats (US and Vietnam) without clear logic
- Allow invalid characters in input
- Skip validation on backend
- Hardcode phone format in multiple places
- Forget to handle edge cases (empty, too short, too long)

---

## 🧪 Testing

### Test Cases

```typescript
describe('Phone Formatting', () => {
  test('formats 10 digits correctly', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });
  
  test('handles partial input', () => {
    expect(formatPhoneNumber('555')).toBe('555');
    expect(formatPhoneNumber('5551')).toBe('(555) 1');
    expect(formatPhoneNumber('5551234')).toBe('(555) 123-4');
  });
  
  test('strips non-numeric characters', () => {
    expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
  });
  
  test('validates US phone', () => {
    expect(isValidPhone('5551234567')).toBe(true);
    expect(isValidPhone('555123456')).toBe(false);   // Too short
    expect(isValidPhone('55512345678')).toBe(false);  // Too long
  });
  
  test('validates Vietnam phone', () => {
    expect(isValidPhone('0901234567')).toBe(true);
    expect(isValidPhone('090123456')).toBe(false);   // Too short
  });
});
```

---

## 🔗 Related Files

### Frontend:
- `/src/app/pages/CheckInPage.tsx` - Kiosk check-in with phone input
- `/src/app/components/pages/BookingPage.tsx` - Booking form with phone
- `/src/app/components/admin/molecules/CustomerFormSheet.tsx` - Customer CRUD

### Backend:
- `/supabase/functions/server/customers.tsx` - Customer management API
- `/supabase/functions/server/helpers.tsx` - Phone utility functions

---

## 🚀 Future Enhancements

- [ ] International phone format support (+84, +1, etc.)
- [ ] Phone number picker with country code dropdown
- [ ] SMS verification for phone numbers
- [ ] Duplicate phone detection with better UX
- [ ] Phone history tracking (previous numbers)

---

**Last Updated:** January 20, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
