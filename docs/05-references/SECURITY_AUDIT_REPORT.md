# SECURITY AUDIT REPORT - Bitcoin Nail Bar

**Date**: February 19, 2026  
**Auditor**: AI Senior Fullstack Architect  
**Scope**: Full codebase infrastructure, backend endpoints, frontend auth, data storage  
**Status**: Initial Audit - Findings Documented

---

## EXECUTIVE SUMMARY

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 5 | Pending Fix |
| HIGH | 4 | Pending Fix |
| MEDIUM | 4 | Pending Fix |
| LOW | 2 | Acknowledged |

---

## CRITICAL FINDINGS (Must Fix Immediately)

### 1. JWT_SECRET Using Hardcoded Fallback

- **Files**: `helpers.tsx:6`, `_shared_constants.tsx:12`
- **Risk**: AUTHENTICATION BYPASS
- **Detail**: 
  ```typescript
  export const JWT_SECRET = new TextEncoder().encode(
    Deno.env.get('JWT_SECRET') || 'bitcoin-nail-bar-secret-key-change-in-production'
  );
  ```
  `JWT_SECRET` is NOT in the configured environment variables. The system is currently using the hardcoded fallback string visible in source code. **Anyone with code access can forge JWT tokens and gain full admin access.**
- **Impact**: Complete authentication bypass, unauthorized admin access
- **Fix**: Create `JWT_SECRET` environment variable with a strong random string (min 64 chars)
- **Priority**: IMMEDIATE

### 2. Debug Endpoints Exposed Without Authentication

- **Files**: `debug-consolidated.tsx`, `debug-users.tsx`, `debug-check-user.tsx`, `debug-customers.tsx`, `debug-postgres-customers.tsx`, `debug-customer-audit.tsx`, `debug-settings.tsx`
- **Risk**: DATA EXPOSURE, DATA MANIPULATION
- **Exposed Routes** (ALL unauthenticated):
  | Route | Risk |
  |-------|------|
  | `/debug/users` | Lists ALL users with emails, roles, IDs |
  | `/debug/sessions` | Lists ALL active sessions |
  | `/debug/get-hash` | Password hashing oracle (brute force tool) |
  | `/debug/vlinkpay-settings` | Exposes VLinkPay API key preview |
  | `/test-email` | Exposes Resend API key preview & email config |
  | `/test-resend-direct` | Send arbitrary emails via system's Resend account |
  | `/debug/create-test-member` | Create fake members in database |
  | `/debug/test-customer-write` | Write arbitrary test data |
  | `/debug/clean-appointments` | Delete appointment data |
  | `/debug/clean-staff` | Delete staff data |
  | `/debug/cleanup-duplicates` | Trigger data cleanup |
  | `/debug/data-check` | Enumerate all data counts |
- **Impact**: Full data enumeration, data injection, email abuse, password cracking
- **Fix**: Add `requireAuth` middleware to ALL debug routes, or disable them entirely in production
- **Priority**: IMMEDIATE

### 3. VLinkPay Settings Endpoints Have No Authentication

- **File**: `vlinkpay-settings.tsx`
- **Risk**: PAYMENT SYSTEM COMPROMISE
- **Exposed Routes**:
  - `GET /vlinkpay/settings` - Read payment configuration
  - `POST /vlinkpay/settings` - Overwrite payment credentials
  - `POST /vlinkpay/test-connection` - Test connection
- **Impact**: Attacker can read merchant credentials, redirect payments, or disable payment system
- **Fix**: Add `requireAuth` + owner role check to all VLinkPay routes
- **Priority**: IMMEDIATE

### 4. Payment Endpoints Have No Authentication

- **File**: `payment.tsx`
- **Risk**: PAYMENT FRAUD, DATA MANIPULATION
- **Exposed Routes**:
  | Route | Risk |
  |-------|------|
  | `POST /payment/create-link` | Anyone can create payment links |
  | `POST /payment/complete-order` | Anyone can mark orders as completed |
  | `GET /payment/status/:code` | Anyone can check redeem code status |
  | `DELETE /payment/cleanup-expired` | Anyone can delete order data |
- **Impact**: Fraudulent payment links, order manipulation, data deletion
- **Fix**: Add appropriate authentication. `create-link` and `complete-order` may need public access but should have CSRF protection and rate limiting. `cleanup-expired` MUST require owner auth.
- **Priority**: IMMEDIATE

### 5. `requireOwner` Prop Not Enforced in ProtectedAdminRoute

- **File**: `src/app/components/ProtectedAdminRoute.tsx:17`
- **Risk**: PRIVILEGE ESCALATION
- **Detail**:
  ```typescript
  // BUG: requireOwner is destructured away and NEVER used
  export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  // Should be: { children, requireOwner }
  ```
- **Affected Pages** (all accessible by any staff/admin):
  - `/admin/role-permissions` - Manage roles & permissions
  - `/admin/vlinkpay-settings` - VLinkPay payment config
  - `/admin/redeem-codes` - Manage redeem codes
  - `/admin/system-settings` - System configuration
- **Impact**: Any authenticated user (staff/admin) can access owner-only pages
- **Fix**: Implement `requireOwner` check - verify `session.user.role === 'owner'`
- **Priority**: IMMEDIATE

---

## HIGH SEVERITY FINDINGS

### 6. SHA-256 Password Hashing (Insecure)

- **Files**: `helpers.tsx:122-134`, `setup.tsx:66-70`
- **Risk**: PASSWORD CRACKING
- **Detail**: Using plain SHA-256 without salt for password hashing. SHA-256 is a fast hash function, making it vulnerable to:
  - Rainbow table attacks
  - GPU-accelerated brute force
  - Precomputed hash attacks
- **Impact**: If database is compromised, all passwords can be cracked quickly
- **Fix**: Migrate to bcrypt (cost factor 12+), scrypt, or argon2id with per-user salt
- **Priority**: HIGH (requires password re-hashing migration)

### 7. No Rate Limiting on Login Endpoint

- **File**: `auth.tsx:18`
- **Risk**: BRUTE FORCE ATTACK
- **Detail**: `/auth/login` accepts unlimited login attempts with no throttling, lockout, or CAPTCHA
- **Impact**: Automated password guessing attacks
- **Fix**: Implement:
  - Max 5 attempts per IP per 15 minutes
  - Account lockout after 10 failed attempts
  - CAPTCHA after 3 failed attempts
- **Priority**: HIGH

### 8. CORS Wildcard Origin

- **File**: `index.tsx:85-89`
- **Risk**: CROSS-SITE REQUEST FORGERY
- **Detail**:
  ```typescript
  app.use('*', cors({
    origin: '*',  // Allows ANY website to call the API
    ...
  }));
  ```
- **Impact**: Any malicious website can make authenticated requests to the API on behalf of users
- **Fix**: Restrict to production domains:
  ```typescript
  origin: ['https://bitcoinnailbar.com', 'https://admin.bitcoinnailbar.com', 'https://*.figma.site']
  ```
- **Priority**: HIGH

### 9. Admin Token Key Inconsistency

- **File**: `src/app/components/admin/RedeemCodesTab.tsx:57,135,170`
- **Risk**: FUNCTIONALITY FAILURE
- **Detail**: 
  - RedeemCodesTab reads: `localStorage.getItem("admin_token")`
  - Auth system stores: `localStorage.setItem("admin_session", JSON.stringify({token, user, expiresAt}))`
  - These are **different keys** - RedeemCodesTab will ALWAYS get `null`
- **Impact**: Redeem code management may fail silently for authenticated admins
- **Fix**: Use `getAuthToken()` from `/utils/auth.ts` instead of direct localStorage access
- **Priority**: HIGH

---

## MEDIUM SEVERITY FINDINGS

### 10. Duplicate Supabase Clients (5+ Instances)

- **Files**: `vlinkpay-settings.tsx`, `payment.tsx`, `redeem.tsx`, `promotions.tsx`, `helpers.tsx`
- **Risk**: RESOURCE EXHAUSTION
- **Detail**: Each file creates its own `createClient()` with `SUPABASE_SERVICE_ROLE_KEY` instead of using the singleton from `_shared_supabase_client.tsx`
- **Impact**: Connection pool exhaustion, "connection reset" errors under load
- **Fix**: Replace all local clients with `getSupabaseClient()` from `_shared_supabase_client.tsx`
- **Priority**: MEDIUM

### 11. JWT 7-Day Expiry Without Refresh or Revocation

- **Detail**: 
  - JWT tokens expire after 7 days (`helpers.tsx:174`)
  - No refresh token mechanism
  - Logout only deletes KV session (`auth.tsx:191`) but JWT remains valid
  - JWT cache in memory (`helpers.tsx:138`) means even after "logout", cached tokens work for 5 minutes
- **Impact**: Stolen tokens remain valid for up to 7 days with no way to revoke
- **Fix**: 
  - Implement token blacklist (check JWT `jti` claim against revoked list)
  - Add refresh token rotation
  - Reduce JWT expiry to 1-2 hours with refresh
- **Priority**: MEDIUM

### 12. Excessive Backend Logging

- **Detail**: Backend logs sensitive information to Supabase Edge Function logs:
  - Email addresses in login flow
  - User IDs and roles
  - Payment order details with amounts
  - VLinkPay decryption success/failure
  - Redeem code values
- **Impact**: Log aggregation services or Supabase dashboard access could expose PII
- **Fix**: Implement structured logging with PII redaction for production
- **Priority**: MEDIUM

### 13. Test/Debug Files and Routes in Production

- **Root files**: `test-debug.html`, `inspect_data.js`, `test-resend.ts`, `fix-react-router.sh`, `fix-router-imports.js`
- **Frontend routes** (no additional auth):
  - `/admin/debug-auth` → `DebugAuth.tsx`
  - `/admin/test-setup` → `TestSetup.tsx`  
  - `/admin/test-jwt` → `TestJWT.tsx`
  - `/admin/test-migration` → `TestMigration.tsx`
- **Impact**: Information disclosure, attack surface expansion
- **Fix**: Remove all test files and routes from production build
- **Priority**: MEDIUM

---

## LOW SEVERITY FINDINGS

### 14. JWT Stored in localStorage

- **File**: `utils/auth.ts`
- **Risk**: XSS token theft
- **Detail**: JWT stored in `localStorage` which is accessible to any JavaScript running on the page
- **Mitigation**: Implement Content Security Policy (CSP) headers, consider httpOnly cookie storage
- **Priority**: LOW (mitigated by proper XSS prevention)

### 15. Hardcoded Project Credentials

- **File**: `utils/supabase/config.tsx`
- **Detail**: Production `projectId` and `publicAnonKey` hardcoded in source. While `anonKey` is designed to be public, hardcoding makes rotation difficult.
- **Fix**: Move to environment variables for easier rotation
- **Priority**: LOW

---

## INFRASTRUCTURE STATUS MATRIX

| Component | Technology | Files | Status | Notes |
|-----------|-----------|-------|--------|-------|
| Backend Server | Hono on Deno | 48 modules | Modularized | Phase 2 refactor complete |
| Authentication | Custom JWT (jose) | helpers.tsx, auth.tsx | VULNERABLE | Hardcoded secret |
| Password Hashing | SHA-256 | helpers.tsx | INSECURE | Needs bcrypt migration |
| KV Store | 2 tables (admin/homepage) | _shared_kv.tsx | Correct | Proper separation |
| Supabase Client | Singleton pattern | _shared_supabase_client.tsx | Partially adopted | 5+ duplicates remain |
| Frontend Auth Guard | ProtectedAdminRoute | ProtectedAdminRoute.tsx | BROKEN | requireOwner not enforced |
| API Client | Unified apiClient | api-client.ts | Correct | Consistent pattern |
| Console Logging | disableConsoleLogs | disableConsoleLogs.ts | Frontend only | Backend still logs |
| Security Logger | URL sanitization | securityLogger.ts | Good | Covers signed URLs |
| Debug Endpoints | 7 modules, ~30 routes | debug-*.tsx | EXPOSED | No authentication |
| CORS | Wildcard | index.tsx | TOO PERMISSIVE | origin: '*' |
| Encryption | AES-256-GCM | vlinkpay-settings.tsx | Good | VLinkPay keys encrypted |
| Rate Limiting | None | - | MISSING | No rate limiting anywhere |

---

## RECOMMENDED FIX PRIORITY

| # | Action | Effort | Impact | Status |
|---|--------|--------|--------|--------|
| 1 | Create JWT_SECRET env var | 1 min | CRITICAL | TODO |
| 2 | Fix requireOwner in ProtectedAdminRoute | 5 min | CRITICAL | TODO |
| 3 | Add requireAuth to VLinkPay/Payment endpoints | 15 min | CRITICAL | TODO |
| 4 | Disable/protect debug endpoints | 10 min | CRITICAL | TODO |
| 5 | Fix admin token inconsistency (RedeemCodesTab) | 5 min | HIGH | TODO |
| 6 | Restrict CORS origins | 5 min | HIGH | TODO |
| 7 | Add rate limiting to login | 30 min | HIGH | TODO |
| 8 | Migrate to bcrypt password hashing | 2 hrs | HIGH | TODO |
| 9 | Consolidate Supabase clients to singleton | 30 min | MEDIUM | TODO |
| 10 | Remove test/debug files and routes | 15 min | MEDIUM | TODO |
| 11 | Implement token revocation/blacklist | 1 hr | MEDIUM | TODO |
| 12 | Add production log redaction | 30 min | MEDIUM | TODO |

---

## CHANGELOG

- **2026-02-19**: Initial security audit completed. 15 findings documented.
