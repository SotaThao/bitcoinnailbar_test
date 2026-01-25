# ⚡ QUICK TEST SCRIPT - PHASE 1

**Copy-paste script này vào Browser Console để test tất cả endpoints cùng lúc!**

---

## 🚀 **CÁCH SỬ DỤNG:**

### **BƯỚC 1: Thay thế thông tin của bạn**

```javascript
// ══════════════════════════════════════════════════
// ⚠️ THAY ĐỔI 2 DÒNG NÀY:
// ══════════════════════════════════════════════════
const PROJECT_ID = "YOUR_PROJECT_ID_HERE";  // VD: "abc123xyz"
const ANON_KEY = "YOUR_ANON_KEY_HERE";      // VD: "eyJhbGc..."
```

**Tìm thông tin ở đâu?**

1. **PROJECT_ID:**
   - Supabase Dashboard → Settings → API → Project URL
   - URL dạng: `https://abc123xyz.supabase.co` → PROJECT_ID = `abc123xyz`
   - Hoặc trong code: `/src/app/App.tsx` → `const projectId = "..."`

2. **ANON_KEY:**
   - Supabase Dashboard → Settings → API → **anon/public key**
   - Hoặc trong code: `/src/app/App.tsx` → `const publicAnonKey = "..."`

---

### **BƯỚC 2: Copy toàn bộ script sau**

```javascript
// ══════════════════════════════════════════════════
// ⚡ PHASE 1 QUICK TEST SCRIPT
// ══════════════════════════════════════════════════

// ⚠️ THAY ĐỔI 2 DÒNG NÀY:
const PROJECT_ID = "YOUR_PROJECT_ID_HERE";
const ANON_KEY = "YOUR_ANON_KEY_HERE";

// ══════════════════════════════════════════════════
// 🔧 AUTO-GENERATED URLS
// ══════════════════════════════════════════════════
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112`;

const ENDPOINTS = [
  {
    name: "1. Health Check",
    url: `${BASE_URL}/health`,
    needsAuth: false,
    description: "Test server status"
  },
  {
    name: "2. Debug Users",
    url: `${BASE_URL}/debug/users`,
    needsAuth: true,
    description: "Test kvAdmin + retry logic"
  },
  {
    name: "3. VLinkPay Settings",
    url: `${BASE_URL}/vlinkpay-settings`,
    needsAuth: true,
    description: "Test kvAdmin read"
  },
  {
    name: "4. Gallery",
    url: `${BASE_URL}/gallery`,
    needsAuth: false,
    description: "Test kvHomepage read"
  },
  {
    name: "5. Promotions",
    url: `${BASE_URL}/promotions`,
    needsAuth: false,
    description: "Test kvHomepage read"
  },
  {
    name: "6. Customers",
    url: `${BASE_URL}/customers`,
    needsAuth: true,
    description: "Test Postgres + new kv"
  }
];

// ══════════════════════════════════════════════════
// 🧪 TEST RUNNER
// ══════════════════════════════════════════════════

console.clear();
console.log("%c🚀 PHASE 1 REFACTOR TEST SUITE", "font-size: 20px; font-weight: bold; color: #00ff00;");
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #666;");
console.log(`📍 Project: ${PROJECT_ID}`);
console.log(`🔑 ANON_KEY: ${ANON_KEY.substring(0, 20)}...`);
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "color: #666;");

// Track results
const results = {
  passed: 0,
  failed: 0,
  total: ENDPOINTS.length
};

// Test each endpoint
async function runTests() {
  for (const endpoint of ENDPOINTS) {
    console.log(`%c▶ ${endpoint.name}`, "font-weight: bold; font-size: 14px;");
    console.log(`  ${endpoint.description}`);
    
    const startTime = Date.now();
    
    try {
      const headers = endpoint.needsAuth 
        ? { 'Authorization': `Bearer ${ANON_KEY}` }
        : {};
      
      const response = await fetch(endpoint.url, { headers });
      const duration = Date.now() - startTime;
      const data = await response.json();
      
      if (response.ok) {
        console.log(`%c  ✅ PASS (${duration}ms)`, "color: #00ff00; font-weight: bold;");
        console.log(`  Status: ${response.status}`);
        console.log(`  Response:`, data);
        results.passed++;
      } else {
        console.log(`%c  ❌ FAIL (${duration}ms)`, "color: #ff0000; font-weight: bold;");
        console.log(`  Status: ${response.status}`);
        console.log(`  Error:`, data);
        results.failed++;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`%c  ❌ ERROR (${duration}ms)`, "color: #ff0000; font-weight: bold;");
      console.error(`  Exception:`, error);
      results.failed++;
    }
    
    console.log(""); // Empty line
  }
  
  // Print summary
  console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #666;");
  console.log("%c📊 TEST SUMMARY", "font-size: 18px; font-weight: bold;");
  console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color: #666;");
  console.log(`Total Tests:  ${results.total}`);
  console.log(`%c✅ Passed:    ${results.passed}`, "color: #00ff00; font-weight: bold;");
  console.log(`%c❌ Failed:    ${results.failed}`, "color: #ff0000; font-weight: bold;");
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log("%c\n🎉 ALL TESTS PASSED! Phase 1 refactor successful!", "font-size: 16px; font-weight: bold; color: #00ff00; background: #003300; padding: 10px;");
    console.log("%c✅ Ready for Phase 2!", "font-size: 14px; color: #00ff00;");
  } else {
    console.log("%c\n⚠️ SOME TESTS FAILED", "font-size: 16px; font-weight: bold; color: #ff9900; background: #332200; padding: 10px;");
    console.log("%c📝 Check errors above and report to AI Assistant", "color: #ff9900;");
  }
  
  console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "color: #666;");
}

// Run tests
runTests();
```

---

### **BƯỚC 3: Paste vào Browser Console và chạy**

1. Mở app (localhost hoặc production)
2. Mở Chrome DevTools (F12)
3. Vào tab **Console**
4. Paste toàn bộ script đã chỉnh sửa
5. Nhấn Enter

---

## 📊 **ĐỌC KẾT QUẢ:**

### **✅ SUCCESS - Tất cả tests pass:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests:  6
✅ Passed:    6
❌ Failed:    0
Success Rate: 100.0%

🎉 ALL TESTS PASSED! Phase 1 refactor successful!
✅ Ready for Phase 2!
```

→ **Hành động:** Báo "OK" để tiếp tục Phase 2

---

### **❌ FAILURE - Có tests fail:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests:  6
✅ Passed:    4
❌ Failed:    2
Success Rate: 66.7%

⚠️ SOME TESTS FAILED
📝 Check errors above and report to AI Assistant
```

→ **Hành động:**
1. Scroll lên xem test nào fail
2. Copy error message
3. Paste vào chat và nói "Có lỗi: [paste error]"

---

## 🔍 **COMMON ERRORS & FIXES:**

### **Error: "Failed to fetch"**

**Nguyên nhân:** Sai PROJECT_ID hoặc function chưa deploy  
**Fix:**
- Verify PROJECT_ID đúng
- Check function đã deploy thành công chưa

---

### **Error: 401 Unauthorized**

**Nguyên nhân:** Sai ANON_KEY  
**Fix:**
- Re-copy ANON_KEY từ Supabase Dashboard
- Đảm bảo copy đầy đủ key (không bị cắt)

---

### **Error: "Module not found"**

**Nguyên nhân:** Deploy failed, imports không đúng  
**Fix:**
- Check deployment logs
- Verify tất cả imports dùng `_shared_` prefix

---

### **Error: Network timeout**

**Nguyên nhân:** Retry logic đang hoạt động (bình thường)  
**Action:** Đợi thêm 5-10s, nếu vẫn fail thì báo lỗi

---

## 📱 **ALTERNATIVE: Test từng endpoint riêng**

Nếu muốn test từng endpoint một:

```javascript
// Test Health Check
fetch('https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/health')
  .then(r => r.json())
  .then(d => console.log('✅', d))
  .catch(e => console.error('❌', e));

// Test Debug Users (cần ANON_KEY)
fetch('https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/debug/users', {
  headers: { 'Authorization': 'Bearer {ANON_KEY}' }
})
  .then(r => r.json())
  .then(d => console.log('✅', d))
  .catch(e => console.error('❌', e));
```

---

## 💡 **TIPS:**

1. **Clear cache trước khi test:**
   - Chrome: Ctrl+Shift+Delete → Clear cache
   - Hoặc hard reload: Ctrl+F5

2. **Test nhiều lần:**
   - Chạy script 2-3 lần để verify consistency
   - Mỗi lần chạy không quá 5s là OK

3. **Check Network tab:**
   - DevTools → Network
   - Filter: XHR/Fetch
   - Verify status codes và response times

---

**Ready to test?** Copy script, thay PROJECT_ID + ANON_KEY, paste vào console và chạy! 🚀
