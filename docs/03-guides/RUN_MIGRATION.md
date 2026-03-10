# RUN CUSTOMER MIGRATION - QUICK GUIDE

## ✅ MIGRATION SCRIPT ĐÃ SẴN SÀNG!

Tôi đã tạo endpoint migration với các tính năng:

- ✅ **Dry-run mode** - Preview trước khi thực thi
- ✅ **3 merge strategies** - Chọn cách xử lý conflicts
- ✅ **Automatic backup** - Log tất cả thay đổi
- ✅ **Rollback safe** - Không xóa data cũ mặc định
- ✅ **Detailed logging** - Biết chính xác điều gì xảy ra

---

## 🎯 BƯỚC 1: GET ADMIN JWT TOKEN

Migration endpoint yêu cầu admin authentication. Lấy JWT token từ browser:

### **Cách 1: Từ Browser Console (FASTEST)**

1. Mở app: https://your-app-url.com
2. Login vào admin account
3. Press **F12** → Console tab
4. Paste và Enter:
   ```javascript
   JSON.parse(localStorage.getItem("admin_session")).token
   ```
5. Copy token (bỏ dấu ngoặc kép)

### **Cách 2: Từ Application Tab**

1. Login vào admin
2. F12 → Application tab
3. Expand Local Storage → your domain
4. Tìm key `admin_session`
5. Copy giá trị của `token` field

---

## 🎯 BƯỚC 2: DRY RUN (Preview Migration)

Copy và paste vào PowerShell:

```powershell
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# REPLACE THESE VALUES:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXJtY2lwbmllZmV1d3VmampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjQ2MDgsImV4cCI6MjA1MDQ0MDYwOH0.i8S8gaa2t3NNkq-BUz-608eRYxaStCqaWHVdoLi-iQk"

$JWT_TOKEN = "YOUR_ADMIN_JWT_TOKEN_HERE"  # ← Thay bằng token từ Bước 1
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Dry run migration
$body = @{
    dry_run = $true
    merge_strategy = "merge_max"
    delete_old_data = $false
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://pwmrmcipniefeuwufjjy.supabase.co/functions/v1/make-server-84f9c112/admin/migrate/customers-to-postgres" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $ANON_KEY"
        "X-Session-Token" = $JWT_TOKEN
        "Content-Type" = "application/json"
    } `
    -Body $body

# Display result
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## 📊 BƯỚC 3: REVIEW DRY RUN RESULTS

Kết quả sẽ cho bạn biết:

```json
{
  "success": true,
  "dry_run": true,
  "summary": {
    "kv_customers_found": 4,
    "postgres_existing": 2,
    "would_create": 4,
    "would_update": 0,
    "conflicts": 0
  },
  "details": {
    "to_create": [
      {"phone": "5555555555", "name": "...", "tier": "gold"},
      {"phone": "5555555554", "name": "...", "tier": "silver"},
      {"phone": "8888888888", "name": "...", "tier": "guest"},
      {"phone": "5555555550", "name": "...", "tier": "guest"}
    ],
    "to_update": [],
    "conflicts": []
  },
  "migration_log": [
    "✨ Create 5555555555 - New customer from kv_store_customers",
    "✨ Create 5555555554 - New customer from kv_store_customers",
    ...
  ],
  "next_steps": [
    "Review the summary and conflicts above",
    "If everything looks good, run again with {\"dry_run\": false}",
    "After migration, verify data with GET /debug/customer-audit"
  ]
}
```

### **Check Points:**

- ✅ `would_create` số match với số customers trong KV?
- ✅ `conflicts` có hợp lý không?
- ✅ `migration_log` có action nào lạ không?

**Nếu mọi thứ OK** → Tiếp tục Bước 4

**Nếu có vấn đề** → Gửi kết quả cho tôi review

---

## 🚀 BƯỚC 4: EXECUTE MIGRATION (Real Deal)

**⚠️ CRITICAL: Đọc kỹ trước khi chạy!**

```powershell
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXECUTE MIGRATION - CHANGES WILL BE MADE!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$body = @{
    dry_run = $false           # ← SET TO FALSE TO EXECUTE!
    merge_strategy = "merge_max"
    delete_old_data = $false   # ← Keep old data for safety
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://pwmrmcipniefeuwufjjy.supabase.co/functions/v1/make-server-84f9c112/admin/migrate/customers-to-postgres" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $ANON_KEY"
        "X-Session-Token" = $JWT_TOKEN
        "Content-Type" = "application/json"
    } `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Output:**
```json
{
  "success": true,
  "dry_run": false,
  "summary": {
    "kv_customers_found": 4,
    "postgres_existing": 2,
    "would_create": 4,
    "would_update": 0,
    "conflicts": 0
  },
  "execution_results": {
    "created": [
      {...}, {...}, {...}, {...}
    ],
    "updated": []
  },
  "next_steps": [
    "Migration complete!",
    "Verify data with GET /debug/customer-audit",
    "Test CustomerManagementTab in frontend"
  ]
}
```

---

## ✅ BƯỚC 5: VERIFY MIGRATION

### **5A. Run Audit Again:**

```powershell
$response = Invoke-WebRequest `
    -Uri "https://pwmrmcipniefeuwufjjy.supabase.co/functions/v1/make-server-84f9c112/debug/customer-audit" `
    -Headers @{"Authorization" = "Bearer $ANON_KEY"}

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected:**
```json
{
  "summary": {
    "total_records": 6,
    "postgres_records": 6,  // ← Was 2, now 6!
    "kv_customers_records": 4,  // ← Still there (not deleted)
    "data_fragmented": true  // ← Still true because we didn't delete old data
  },
  "status": "HEALTHY" or "ACTION_REQUIRED"
}
```

### **5B. Test Frontend:**

1. Open app → Admin → Customer Management
2. ✅ Should see **6 customers** now (was 2 before)
3. ✅ Membership badges should display correctly
4. ✅ Stats (visits, spend) should be accurate

---

## 🧹 BƯỚC 6: CLEANUP (Optional)

**Chỉ chạy SAU KHI confirm Postgres data 100% đúng!**

```powershell
# ⚠️ WARNING: This will DELETE old KV data!
# Only run after verifying Postgres has all data correctly

$body = @{
    dry_run = $false
    merge_strategy = "postgres_priority"
    delete_old_data = $true  # ← SET TO TRUE TO DELETE OLD DATA
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://pwmrmcipniefeuwufjjy.supabase.co/functions/v1/make-server-84f9c112/admin/migrate/customers-to-postgres" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $ANON_KEY"
        "X-Session-Token" = $JWT_TOKEN
        "Content-Type" = "application/json"
    } `
    -Body $body

$response.Content
```

**Sau khi cleanup, run audit lần cuối:**

```powershell
# Should show:
# postgres_records: 6
# kv_customers_records: 0
# status: "HEALTHY"
```

---

## 🔧 MERGE STRATEGIES EXPLAINED

### **postgres_priority** (Default for conflicts)
- Nếu customer đã có trong Postgres → Giữ nguyên Postgres, bỏ qua KV
- **Use when:** Postgres data mới nhất, đáng tin cậy hơn

### **kv_priority**
- Nếu customer đã có trong Postgres → Overwrite bằng KV data
- **Use when:** KV data mới nhất (ví dụ: vừa redeem membership)

### **merge_max** (Recommended)
- Merge data từ cả 2 nguồn:
  - `total_visits` = max(postgres, kv)
  - `lifetime_spend` = max(postgres, kv)
  - `tier` = higher tier wins
  - Non-null values preferred
- **Use when:** Muốn giữ data đầy đủ nhất

---

## 🆘 TROUBLESHOOTING

### **Error: "Missing authorization header"**
→ Bạn chưa set `JWT_TOKEN`. Quay lại Bước 1.

### **Error: "Permission denied"**
→ JWT token không có quyền admin. Login bằng owner account.

### **Error: "Customer already exists"**
→ Normal nếu dùng `postgres_priority`. Check migration_log để xem detail.

### **Migration success nhưng frontend vẫn empty**
→ Check browser console (F12) để xem có lỗi API không.

### **Data bị duplicate**
→ Run cleanup (Bước 6) để xóa old KV data.

---

## 📞 NEXT STEPS AFTER MIGRATION

1. ✅ Test full workflow: Redeem code → Check Customer Management
2. ✅ Update redeem flow để write trực tiếp vào Postgres (không qua KV)
3. ✅ Monitor Postgres table để đảm bảo data consistency
4. ✅ Document migration date cho team
5. ✅ Setup backup schedule cho Postgres

---

## 🎯 TÓM TẮT COMMANDS

```powershell
# 1. Get JWT token from browser console
JSON.parse(localStorage.getItem("admin_session")).token

# 2. Dry run
$JWT_TOKEN = "YOUR_TOKEN_HERE"
# ... (run dry run script above)

# 3. Execute
# ... (run execute script above)

# 4. Verify
# ... (run audit script above)

# 5. Cleanup (optional)
# ... (run cleanup script above)
```

---

**Author:** Senior Fullstack Architect  
**Date:** 2025-01-26  
**Status:** Ready to Execute  
**Estimated Time:** 10 minutes