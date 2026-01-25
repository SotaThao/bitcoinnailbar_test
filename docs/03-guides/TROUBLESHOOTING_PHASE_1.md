# 🔧 TROUBLESHOOTING GUIDE - PHASE 1

**Các lỗi thường gặp khi test Phase 1 và cách fix**

---

## ❌ **ERROR 1: "Module not found"**

### **Full Error:**
```
Module not found "file:///tmp/.../shared/constants.tsx"
```

### **Nguyên nhân:**
Imports không đúng, vẫn trỏ tới subfolder `shared/`

### **Fix:**

**Step 1:** Check file `/supabase/functions/server/index.tsx` lines 12-15

**Phải là:**
```typescript
import { JWT_SECRET } from './_shared_constants.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { retry } from './_shared_retry.tsx';
import { kvAdmin as kv } from './_shared_kv.tsx';
```

**KHÔNG ĐƯỢC là:**
```typescript
import { JWT_SECRET } from './shared/constants.tsx'; ❌
```

**Step 2:** Verify files tồn tại:
```
/supabase/functions/server/
  ├── _shared_constants.tsx       ✅
  ├── _shared_supabase_client.tsx ✅
  ├── _shared_retry.tsx           ✅
  ├── _shared_kv.tsx              ✅
  └── _shared_cloudinary.tsx      ✅
```

**Step 3:** Re-deploy
```bash
# Nếu dùng Supabase CLI:
supabase functions deploy make-server-84f9c112
```

---

## ❌ **ERROR 2: "401 Unauthorized"**

### **Full Error:**
```
{
  "error": "Unauthorized",
  "status": 401
}
```

### **Nguyên nhân:**
- Thiếu Authorization header
- Sai ANON_KEY
- ANON_KEY bị cắt (không copy đủ)

### **Fix:**

**Step 1:** Re-copy ANON_KEY từ Supabase Dashboard
1. Settings → API
2. Copy **anon/public** key (toàn bộ key, ~400 chars)

**Step 2:** Verify key trong request
```javascript
// Console DevTools
fetch('...', {
  headers: {
    'Authorization': 'Bearer YOUR_FULL_KEY_HERE'
  }
})
```

**Step 3:** Check key không có spaces/newlines
```javascript
// Bad:
const key = "eyJ... \n ...abc"; ❌

// Good:
const key = "eyJ...abc"; ✅
```

---

## ❌ **ERROR 3: "Failed to fetch" / Network Error**

### **Full Error:**
```
TypeError: Failed to fetch
```

### **Nguyên nhân:**
- Sai PROJECT_ID
- Function chưa deploy
- Network/CORS issues

### **Fix:**

**Step 1:** Verify PROJECT_ID đúng
```
URL format: https://{PROJECT_ID}.supabase.co/functions/v1/...
            
VD: https://abc123xyz.supabase.co/functions/v1/make-server-84f9c112/health
```

**Step 2:** Check function đã deploy chưa
1. Supabase Dashboard → Edge Functions
2. Verify function `make-server-84f9c112` có status "Active"

**Step 3:** Test từ browser trực tiếp
- Paste URL vào address bar
- Nếu hiện "Page not found" → Function chưa deploy
- Nếu hiện JSON → Function OK, lỗi ở client code

**Step 4:** Check CORS
- Supabase Edge Functions tự động có CORS
- Nếu vẫn lỗi CORS → Check custom domain/proxy settings

---

## ❌ **ERROR 4: "Connection timeout" / Request quá lâu**

### **Symptoms:**
- Request pending > 10s
- Spinner xoay mãi không dừng
- Console: "Request timeout"

### **Nguyên nhân:**
- Retry logic đang hoạt động (bình thường nếu < 5s)
- Database connection issues
- Infinite loop trong code

### **Fix:**

**Step 1:** Check server logs
```
Supabase Dashboard → Edge Functions → Logs

Tìm:
⚠️ [RETRY] Request failed, retrying... (3 left)
⚠️ [RETRY] Request failed, retrying... (2 left)
⚠️ [RETRY] Request failed, retrying... (1 left)
```

**Nếu thấy retry logs:**
- ✅ Normal: Retry 1-2 lần rồi thành công
- ❌ Problem: Retry 3 lần rồi fail

**Step 2:** Check database
1. Supabase Dashboard → Database → Tables
2. Verify `kv_store_89edbd69` và `kv_store_84f9c112` tồn tại

**Step 3:** Test với health check trước
```
https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/health
```
- Nếu health check OK → Database issue
- Nếu health check timeout → Server issue

---

## ❌ **ERROR 5: "KV GET/SET failed"**

### **Full Error:**
```
[KV GET] Error: relation "kv_store_89edbd69" does not exist
```

### **Nguyên nhân:**
Table không tồn tại trong database

### **Fix:**

**Step 1:** Check tables
```sql
-- Supabase Dashboard → SQL Editor
SELECT * FROM kv_store_89edbd69 LIMIT 1;
SELECT * FROM kv_store_84f9c112 LIMIT 1;
```

**Step 2:** Nếu table không tồn tại → Tạo table
```sql
-- Chỉ chạy nếu table chưa tồn tại
CREATE TABLE IF NOT EXISTS kv_store_89edbd69 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kv_store_84f9c112 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ❌ **ERROR 6: "Supabase client not initialized"**

### **Full Error:**
```
❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables
```

### **Nguyên nhân:**
Environment variables chưa được set trong Supabase

### **Fix:**

**Step 1:** Set environment variables
1. Supabase Dashboard → Settings → Edge Functions
2. Click **"Environment Variables"**
3. Add:
   - `SUPABASE_URL`: Copy từ Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Copy từ Settings → API → service_role key

**Step 2:** Re-deploy function
```bash
supabase functions deploy make-server-84f9c112
```

---

## ❌ **ERROR 7: Console Errors trong Frontend**

### **Example Errors:**
```
Uncaught TypeError: Cannot read property '...' of undefined
Failed to load resource: net::ERR_CONNECTION_REFUSED
CORS error: ...
```

### **Fix theo loại:**

**TypeError: Cannot read property:**
- Check data structure trong response
- Add null checks: `data?.property`
- Verify API response format

**ERR_CONNECTION_REFUSED:**
- Backend không chạy
- Sai URL
- Port bị block

**CORS error:**
- Check server có cors middleware
- Verify headers trong request
- Test từ browser trực tiếp (no CORS)

---

## 🔍 **DEBUGGING WORKFLOW**

### **Step 1: Identify Layer**
```
User → Frontend → API → Backend → Database
       ↓         ↓      ↓         ↓
       React     Fetch  Hono      Supabase
```

**Tìm lỗi ở đâu?**
- Console error → Frontend
- Network 4xx → API/Auth
- Network 5xx → Backend
- Timeout → Database/Network

---

### **Step 2: Check Each Layer**

**Frontend (React):**
- DevTools → Console
- Check component rendering
- Verify state updates

**API (Fetch):**
- DevTools → Network tab
- Check request headers
- Verify endpoint URL

**Backend (Hono):**
- Supabase → Edge Functions → Logs
- Check function deploy status
- Verify environment variables

**Database (Supabase):**
- SQL Editor → Test queries
- Table Editor → Check data
- API → Check connection strings

---

### **Step 3: Isolate Issue**

**Test từ đơn giản đến phức tạp:**

1. ✅ Health check (no auth, no DB)
   ```
   GET /health
   ```

2. ✅ Test với auth (có auth, no DB)
   ```
   GET /debug/settings
   Headers: Authorization: Bearer {key}
   ```

3. ✅ Test DB read (có auth, có DB)
   ```
   GET /debug/users
   Headers: Authorization: Bearer {key}
   ```

4. ✅ Test DB write (có auth, có DB, có write)
   ```
   POST /customers
   Headers: Authorization: Bearer {key}
   Body: {...}
   ```

**Lỗi ở step nào → Layer đó có vấn đề**

---

## 📊 **COMMON PATTERNS**

### **Pattern 1: "Works locally, fails on deploy"**

**Causes:**
- Environment variables missing
- Import paths wrong (subfolder issue)
- Dependencies not installed

**Fix:**
- Set env vars in Supabase Dashboard
- Use flat imports (no subfolders)
- Check `deno.json` for dependencies

---

### **Pattern 2: "Works first time, fails on subsequent calls"**

**Causes:**
- Race condition
- Cache issues
- Connection pool exhausted

**Fix:**
- Add delays between calls
- Clear cache (hard reload)
- Use singleton pattern (already done in Phase 1)

---

### **Pattern 3: "Works for some endpoints, fails for others"**

**Causes:**
- Auth middleware inconsistent
- KV table mismatch (admin vs homepage)
- CORS whitelist incomplete

**Fix:**
- Standardize auth checks
- Use `kvAdmin` for backend, `kvHomepage` for public
- Enable CORS for all origins (already done)

---

## 🆘 **GETTING HELP**

### **Information to provide:**

1. **Error message** (full text)
2. **Server logs** (last 20 lines)
3. **Request details:**
   - URL
   - Method (GET/POST/etc.)
   - Headers
   - Body (if POST/PUT)
4. **Response:**
   - Status code
   - Response body
5. **Environment:**
   - Local / Production
   - Browser
   - OS

### **Format:**
```
ISSUE: [Short description]

ERROR:
[Paste full error message]

LOGS:
[Paste relevant server logs]

REQUEST:
URL: https://...
Method: GET
Headers: {Authorization: "Bearer eyJ..."}

RESPONSE:
Status: 500
Body: {"error": "..."}

ENVIRONMENT:
- Local dev (localhost:5173)
- Chrome 120
- Windows 11
```

---

## ✅ **PREVENTION CHECKLIST**

**Before deploy:**
- [ ] All imports use `_shared_` prefix (no subfolders)
- [ ] Environment variables set in Supabase
- [ ] Tables exist in database
- [ ] Dependencies installed
- [ ] Test script passes locally

**After deploy:**
- [ ] Check deployment logs for errors
- [ ] Test health check endpoint
- [ ] Verify server logs
- [ ] Run full test suite
- [ ] Check frontend console

---

**Still stuck?** Paste error + logs into chat and I'll help debug! 🚑
