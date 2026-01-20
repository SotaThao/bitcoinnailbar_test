# 🔒 Security Best Practices - Signed URLs & Logging

## ⚠️ Issue Report

**Date:** January 20, 2026  
**Severity:** MEDIUM  
**Component:** Supabase Storage Signed URLs  
**Status:** ✅ FIXED

---

## 🐛 Problem

Console logs were exposing **full signed URLs with tokens** for Supabase Storage files:

```
✅ Background image loaded successfully: https://pwmrmcipniefewufwjjy.supabase.co/storage/v1/object/sign/make-84f9c112-promotions/3/en/background.png?token=eyJraWQiOi...
```

### Security Risks:

1. **Long Token Expiry** (1 year)
   - Original: `exp: 1800407355` (expires Jan 2027)
   - Risk: If leaked, attacker can access files for 365 days
   
2. **Token Exposure in Logs**
   - Browser console accessible to anyone with physical/remote access
   - Browser extensions can read console
   - Screenshots/recordings can leak tokens

3. **Production Logging**
   - Sensitive URLs logged even in production mode

---

## ✅ Solutions Implemented

### 1. Reduced Token Expiry Time

**Changed from 1 year to 24 hours:**

```typescript
// ❌ BEFORE (1 year = 31,536,000 seconds)
.createSignedUrl(filename, 31536000);

// ✅ AFTER (24 hours = 86,400 seconds)
.createSignedUrl(filename, 86400);
```

**Files Updated:**
- `/supabase/functions/server/promotions.tsx` (line 109)
- `/supabase/functions/server/index.tsx` (lines 3129, 3146)

**Rationale:**
- 24 hours is sufficient for most use cases
- Tokens auto-expire daily, limiting exposure window
- Can be regenerated if needed

---

### 2. Created Security Logger Utility

**New file:** `/src/utils/securityLogger.ts`

**Features:**

#### A. URL Sanitization
```typescript
import { sanitizeSignedUrl } from '@/utils/securityLogger';

const url = 'https://...?token=eyJhbGc...';
console.log(sanitizeSignedUrl(url));
// Output: https://...?token=eyJhbGc...[REDACTED]
```

#### B. Safe URL Logging
```typescript
import { logUrlSafely } from '@/utils/securityLogger';

logUrlSafely('Image uploaded', signedUrl);
// Output: [SAFE] Image uploaded: https://...?token=eyJhbGc...[REDACTED]
```

#### C. Metadata-Only Logging
```typescript
import { logUploadSuccess } from '@/utils/securityLogger';

logUploadSuccess('background-image.png', 2048000, 'promotions');
// Output: ✅ File uploaded: background-image.png (2000.00KB) to promotions
```

#### D. Extract Metadata Without Logging Token
```typescript
import { extractUrlMetadata } from '@/utils/securityLogger';

const metadata = extractUrlMetadata(signedUrl);
console.log(metadata);
// {
//   path: '3/en/background.png',
//   bucket: 'make-84f9c112-promotions',
//   hasToken: true,
//   expiresIn: '23h'
// }
```

#### E. Safe API Response Logging
```typescript
import { logApiResponseSafely } from '@/utils/securityLogger';

logApiResponseSafely('Promotion created', response);
// Automatically sanitizes all URLs in nested objects
```

---

### 3. Production-Safe Logger

```typescript
import { safeLogger } from '@/utils/securityLogger';

// Only logs in development
safeLogger.log('Debug info');

// Always logs errors (even in production)
safeLogger.error('Critical error');

// URL-aware logging
safeLogger.url('Image URL', signedUrl);

// Upload success (metadata only)
safeLogger.upload('background.png', 2048000, 'promotions');

// API response (sanitized)
safeLogger.response('API result', data);
```

---

## 📝 Usage Guidelines

### DO ✅

**Use metadata logging:**
```typescript
// ✅ GOOD: Log file info without token
console.log('✅ Image uploaded:', {
  fileName: 'background.png',
  size: '2MB',
  bucket: 'promotions'
});
```

**Use safe logger utility:**
```typescript
// ✅ GOOD: Auto-sanitized
import { safeLogger } from '@/utils/securityLogger';
safeLogger.url('Uploaded to', signedUrl);
```

**Use short-lived tokens:**
```typescript
// ✅ GOOD: 1 hour expiry for immediate use
.createSignedUrl(path, 3600);

// ✅ GOOD: 24 hours for cached resources
.createSignedUrl(path, 86400);
```

### DON'T ❌

**Don't log full signed URLs:**
```typescript
// ❌ BAD: Exposes full token
console.log('Image URL:', signedUrl);
```

**Don't use long expiry times:**
```typescript
// ❌ BAD: 1 year expiry
.createSignedUrl(path, 31536000);
```

**Don't log in production unnecessarily:**
```typescript
// ❌ BAD: Always logs
console.log('Debug:', sensitiveData);

// ✅ GOOD: Only in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug:', sanitizedData);
}
```

---

## 🔍 Token Expiry Recommendations

| Use Case | Recommended Expiry | Seconds |
|----------|-------------------|---------|
| **Immediate use** (upload confirmation) | 5 minutes | 300 |
| **Short-term** (form submission) | 1 hour | 3,600 |
| **Daily cache** (promotion images) | 24 hours | 86,400 |
| **Weekly cache** (rarely changing assets) | 7 days | 604,800 |
| **Maximum** (avoid if possible) | 30 days | 2,592,000 |

**⚠️ Never use:**
- 1 year (31,536,000 seconds)
- Infinite expiry

---

## 🧪 Testing

### Test Token Expiry

1. Generate signed URL with 1-minute expiry:
```typescript
const { data } = await supabase.storage
  .from('bucket')
  .createSignedUrl('file.png', 60); // 1 minute
```

2. Wait 2 minutes

3. Try accessing URL → Should get `403 Forbidden`

### Test Sanitization

```typescript
import { sanitizeSignedUrl } from '@/utils/securityLogger';

const url = 'https://example.com/file?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJmaWxlLnBuZyIsImV4cCI6MTcwMH0.signature';

const sanitized = sanitizeSignedUrl(url);

// Should contain: token=eyJhbGciOiJIUzI1NiIsI...[REDACTED]
console.assert(sanitized.includes('[REDACTED]'));
console.assert(!sanitized.includes('.signature'));
```

---

## 🔒 Additional Security Measures

### 1. CORS Configuration
Ensure Supabase storage buckets have proper CORS:
```typescript
{
  "allowedOrigins": ["https://your-domain.com"],
  "allowedHeaders": ["authorization", "content-type"],
  "maxAgeSeconds": 3600
}
```

### 2. Rate Limiting
Implement rate limiting for signed URL generation:
```typescript
// Backend: Limit to 100 requests per hour per user
const rateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100
};
```

### 3. Audit Logging
Log signed URL generation (without tokens) for audit:
```typescript
console.log('[AUDIT] Signed URL generated:', {
  user: userId,
  bucket: bucketName,
  file: fileName,
  expiresIn: '24h',
  timestamp: new Date().toISOString()
});
```

---

## 📊 Impact Assessment

### Before Fix:
- ❌ Token valid for **365 days**
- ❌ Full tokens logged in console
- ❌ No sanitization utilities
- ❌ Risk level: **MEDIUM-HIGH**

### After Fix:
- ✅ Token valid for **24 hours** only
- ✅ Tokens sanitized in all logs
- ✅ Dedicated security utilities
- ✅ Risk level: **LOW**

---

## 🎯 Future Improvements

- [ ] Implement token refresh mechanism (frontend)
- [ ] Add automatic URL expiry monitoring
- [ ] Implement centralized audit logging service
- [ ] Add security headers (CSP, HSTS)
- [ ] Implement token revocation API
- [ ] Add anomaly detection for storage access

---

## 📚 References

- **Supabase Storage Security:** https://supabase.com/docs/guides/storage/security
- **Signed URL Best Practices:** https://cloud.google.com/storage/docs/access-control/signed-urls-v4
- **OWASP Logging Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

---

**Fixed By:** AI Assistant  
**Date:** January 20, 2026  
**Status:** ✅ Complete  
**Review:** Recommended for production
