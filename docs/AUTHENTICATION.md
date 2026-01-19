# Admin Authentication System

## Overview
Hệ thống authentication cho admin panel với session management lưu trữ trong 7 ngày.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser   │ ──── │    Server    │ ──── │  KV Store    │
│ (LocalStore)│      │ (Hono/Deno)  │      │  (Supabase)  │
└─────────────┘      └──────────────┘      └──────────────┘
```

## Components

### 1. Backend Endpoints

#### `POST /auth/login`
- Verify email & password
- Generate session token (UUID)
- Save session to KV: `session:{token}`
- Expires: 7 days from login
- Returns: `{ token, expires_at, user }`

#### `GET /auth/verify`
- Check session validity
- Verify expiry timestamp
- Returns: `{ user, expires_at }`

#### `POST /auth/logout`
- Delete session from KV store
- Returns: `{ success: true }`

### 2. Frontend Components

#### `/utils/auth.ts`
Session management utilities:
- `saveSession(token, user, expiresAt)` - Save to localStorage
- `getSession()` - Retrieve with expiry check
- `clearSession()` - Remove from localStorage
- `isAuthenticated()` - Quick check
- `getAuthToken()` - Get token for API calls
- `getCurrentUser()` - Get user info

#### `LoginPage.tsx`
- Email + password form
- Mobile-first design
- Error handling
- Session saved for 7 days

#### `ProtectedAdminRoute.tsx`
Protection flow:
1. Check if owner exists in system
2. If no owner → redirect to `/admin/setup-owner`
3. If on login/setup → allow access
4. Check localStorage for session
5. Verify session with backend
6. If invalid/expired → redirect to `/admin/login`

#### `AdminLayout.tsx`
- Display current user info (name, role)
- Logout button (desktop + mobile)
- Calls `/auth/logout` then clears localStorage

## User Flow

### First Time Setup
```
1. User visits /admin → No owner exists
2. Redirect to /admin/setup-owner
3. Create owner account
4. Redirect to /admin/dashboard → No session
5. Redirect to /admin/login
6. Login with credentials
7. Session saved for 7 days
```

### Normal Login
```
1. User visits /admin → Owner exists, no session
2. Redirect to /admin/login
3. Enter credentials
4. Backend verifies & creates session
5. Token saved to localStorage (7 days)
6. Redirect to /admin/dashboard
7. Access granted
```

### Session Check
```
1. User visits protected route
2. ProtectedAdminRoute checks localStorage
3. If session exists → verify with backend
4. If valid → allow access
5. If expired/invalid → clear & redirect to login
```

### Logout
```
1. User clicks "Sign Out"
2. Call backend /auth/logout (delete session from KV)
3. Clear localStorage
4. Redirect to /admin/login
```

## Session Storage

### LocalStorage Keys
- `admin_session` - Session data (token, user, expiresAt)
- `admin_session_expiry` - ISO timestamp for quick check

### KV Store Keys
- `session:{token}` - Session record with expiry

### Session Structure
```typescript
interface Session {
  token: string;           // UUID
  user_id: string;         // User ID
  created_at: string;      // ISO timestamp
  expires_at: string;      // ISO timestamp (created_at + 7 days)
}
```

## Security Notes

1. **Password Hashing**: SHA-256 (via Web Crypto API)
2. **Session Token**: Random UUID
3. **Token Storage**: localStorage (client) + KV (server)
4. **Session Expiry**: 7 days from login
5. **Auto-cleanup**: Expired sessions deleted on verify
6. **Protected Routes**: All admin routes require authentication

## Routes

### Public Routes (No Auth)
- `/admin/login` - Login page
- `/admin/setup-owner` - First-time owner setup

### Protected Routes (Auth Required)
- `/admin/dashboard`
- `/admin/appointments`
- `/admin/services`
- `/admin/staff-payroll`
- `/admin/reviews`
- `/admin/analytics`
- `/admin/settings`
- `/admin/check-in`

## Testing

### Test Owner Setup
1. Visit `/admin`
2. Should redirect to `/admin/setup-owner`
3. Fill form and create owner
4. Should redirect to `/admin/login`

### Test Login
1. Visit `/admin/login`
2. Enter credentials
3. Should save session and redirect to dashboard
4. Refresh page → should stay logged in

### Test Session Expiry
1. Login successfully
2. Manually set `admin_session_expiry` to past date in localStorage
3. Refresh page
4. Should clear session and redirect to login

### Test Logout
1. Login successfully
2. Click "Sign Out"
3. Should redirect to login
4. Try accessing `/admin/dashboard`
5. Should redirect to login

## Troubleshooting

### "No session found" on refresh
- Check localStorage has `admin_session` key
- Verify session hasn't expired
- Check browser console for errors

### "Session invalid or expired"
- Session may have expired (7 days)
- Backend session might have been deleted
- Login again to create new session

### Redirect loop
- Check ProtectedAdminRoute logic
- Verify owner exists in system
- Check session validation flow

## Future Enhancements

- [ ] Remember me checkbox (extend session)
- [ ] Session renewal on activity
- [ ] Multi-device session management
- [ ] Admin role-based permissions
- [ ] Password reset flow
- [ ] Two-factor authentication
