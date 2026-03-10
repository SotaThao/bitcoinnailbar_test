# KE HOACH DIEU CHINH & CHECKLIST CONG VIEC
# Bitcoin Nail Bar - Adjustment Plan & Task Checklist

**Date**: March 3, 2026  
**Author**: AI Senior Fullstack Architect  
**Status**: Planning Phase

---

## PHAN 1: KIEM TRA DU LIEU (DATA AUDIT)

### Dashboard Data Source Verification

| Component | Source | Status | Notes |
|-----------|--------|--------|-------|
| Stats Grid (Revenue) | KV Store `appointment:` + `service:` | OK - From DB | Calculated from completed appointments |
| Stats Grid (Active Tickets) | KV Store `appointment:` | OK - From DB | Filtered by pending/confirmed today |
| Stats Grid (Technicians) | KV Store `staff:` + `appointment:` | OK - From DB | Available vs busy calculation |
| Stats Grid (Waitlist) | KV Store `appointment:` | OK - From DB | Pending appointments count |
| Recent Activity | KV Store `appointment:` join `staff:`, `service:` | OK - From DB | Last 10 completed |
| Staff Status | KV Store `staff:` + `appointment:` | OK - From DB | Real-time busy/available |

**Backend endpoint**: `GET /dashboard/stats` in `payroll.tsx:174-334`  
**Frontend hook**: `useDashboard.ts` via React Query (30s auto-refresh)

**Ket luan**: Tat ca du lieu Dashboard deu lay tu database (KV Store), KHONG co hardcode.

---

## PHAN 2: SECURITY FIX PLAN (15 Findings)

### Phase A: CRITICAL (Uu tien cao nhat - Tuan 1)

| # | Finding | File(s) | Fix Description | Effort | Status |
|---|---------|---------|-----------------|--------|--------|
| 1 | JWT_SECRET Hardcoded Fallback | `helpers.tsx`, `_shared_constants.tsx` | Tao env var `JWT_SECRET` voi random string 64+ chars. Xoa fallback string | 30 min | [ ] Pending |
| 2 | Debug Endpoints No Auth (30+ routes) | `debug-*.tsx` (7 files) | Option A: Xoa tat ca debug routes. Option B: Them `requireAuth` + `requireOwner` middleware | 2-3 hrs | [ ] Pending |
| 3 | VLinkPay Settings No Auth | `vlinkpay-settings.tsx` | Them `requireAuth` + `requireOwner` cho GET/POST/test-connection | 1 hr | [ ] Pending |
| 4 | Payment Endpoints No Auth | `payment.tsx` | Them auth cho `create-link`, `complete-order`, `cleanup-expired`. Giu public cho `status/:code` | 1-2 hrs | [ ] Pending |
| 5 | `requireOwner` Not Enforced | `ProtectedAdminRoute.tsx` | Implement logic kiem tra `session.user.role === 'owner'` khi `requireOwner=true` | 1 hr | [ ] Pending |

### Phase B: HIGH (Tuan 2)

| # | Finding | File(s) | Fix Description | Effort | Status |
|---|---------|---------|-----------------|--------|--------|
| 6 | SHA-256 Password Hashing | `helpers.tsx`, `setup.tsx` | Migrate sang bcrypt (cost 12+) voi per-user salt. Can migration script cho existing passwords | 3-4 hrs | [ ] Pending |
| 7 | No Rate Limiting on Login | `auth.tsx` | Implement rate limit: max 5 attempts/IP/15min, lockout sau 10 fails | 2-3 hrs | [ ] Pending |
| 8 | CORS Wildcard Origin | `index.tsx` | Restrict origin: `['https://bitcoinnailbar.com', 'https://*.figma.site']` | 30 min | [ ] Pending |
| 9 | Admin Token Key Inconsistency | `RedeemCodesTab.tsx` | Replace `localStorage.getItem("admin_token")` voi `getAuthToken()` from `/utils/auth.ts` | 30 min | [ ] Pending |

### Phase C: MEDIUM (Tuan 3)

| # | Finding | File(s) | Fix Description | Effort | Status |
|---|---------|---------|-----------------|--------|--------|
| 10 | Duplicate Supabase Clients (5+) | `vlinkpay-settings.tsx`, `payment.tsx`, `redeem.tsx`, `promotions.tsx`, `helpers.tsx` | Replace tat ca local `createClient()` bang `getSupabaseClient()` from `_shared_supabase_client.tsx` | 1-2 hrs | [ ] Pending |
| 11 | JWT 7-Day Expiry No Refresh | `helpers.tsx`, `auth.tsx` | Giam JWT expiry xuong 2h, implement refresh token rotation, token blacklist | 4-6 hrs | [ ] Pending |
| 12 | Excessive Backend Logging | Multiple backend files | Implement structured logging voi PII redaction. Remove sensitive data from logs | 2-3 hrs | [ ] Pending |
| 13 | Test/Debug Files in Production | Root files + frontend routes | Xoa: `test-debug.html`, `inspect_data.js`, `test-resend.ts`, `fix-react-router.sh`, `fix-router-imports.js`. Xoa routes: `/admin/debug-auth`, `/admin/test-setup`, `/admin/test-jwt`, `/admin/test-migration` | 1-2 hrs | [ ] Pending |

### Phase D: LOW (Tuan 4 - Optional)

| # | Finding | File(s) | Fix Description | Effort | Status |
|---|---------|---------|-----------------|--------|--------|
| 14 | JWT in localStorage | `utils/auth.ts` | Implement CSP headers. Consider httpOnly cookie (lon hon scope hien tai) | 2-4 hrs | [ ] Acknowledged |
| 15 | Hardcoded Project Credentials | `utils/supabase/config.tsx` | Move projectId va publicAnonKey sang env vars | 30 min | [ ] Acknowledged |

---

## PHAN 3: TONG KET TIEN DO HIEN TAI

### Da hoan thanh (Completed)

- [x] Phase 2 Backend Refactor: 57 routes -> 10 modules
- [x] Centralized membership tier config
- [x] Drag-and-drop membership tiers editor
- [x] Migrate membership data tu KV sang `customer_profiles` table
- [x] Customer & Booking Integration
- [x] Redeem codes voi VLinkPay API
- [x] PaymentModal
- [x] Staff System
- [x] Gallery UI
- [x] WYSIWYG Editor cho Promotions
- [x] Dynamic service menu navigation
- [x] SEO infrastructure
- [x] Grand Opening feature (Mar 27-28, 2026 CST)
- [x] Security Audit Report (15 findings documented)
- [x] UI fixes: button color, date update, remove Admin Portal from footer
- [x] Dashboard data verification (all from DB, no hardcode)

### Chua hoan thanh (Pending)

- [ ] Security fixes: 5 Critical, 4 High, 4 Medium, 2 Low
- [ ] Production deployment preparation
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] E2E testing

---

## PHAN 4: THU TU THUC HIEN DE XUAT

```
Tuan 1 (Critical):
  Day 1: #1 JWT_SECRET env var + #5 requireOwner fix
  Day 2: #2 Debug endpoints cleanup
  Day 3: #3 VLinkPay auth + #4 Payment auth

Tuan 2 (High):
  Day 1: #9 Admin token key fix + #8 CORS restrict
  Day 2-3: #7 Rate limiting
  Day 4-5: #6 bcrypt migration

Tuan 3 (Medium):
  Day 1: #10 Supabase client dedup + #13 Remove test files
  Day 2: #12 Logging cleanup
  Day 3-5: #11 JWT refresh token system

Tuan 4 (Polish):
  Day 1-2: #14 CSP headers (optional)
  Day 3: #15 Env var credentials (optional)
  Day 4-5: Final testing & deployment prep
```

---

## GHI CHU QUAN TRONG

1. **Backup truoc khi fix**: Luon backup KV data truoc khi thay doi backend logic
2. **Test tung fix**: Moi security fix can duoc test rieng le truoc khi merge
3. **Khong break existing features**: Moi thay doi phai backward compatible
4. **Uu tien #1 (JWT_SECRET)**: Day la lo hong nghiem trong nhat, can fix NGAY LAP TUC
5. **KV Store tables**: Nho phan biet 2 tables: `kv_store_84f9c112` (homepage) vs `kv_store_89edbd69` (admin)
