# CUSTOMER DATA AUDIT & MIGRATION GUIDE

## 🎯 OVERVIEW

Hướng dẫn này giúp bạn kiểm tra và consolidate customer data từ nhiều nguồn vào một Postgres table duy nhất (`customer_profiles`).

---

## 📊 BƯỚC 1: KIỂM TRA HIỆN TRẠNG DATA

### **Endpoint: GET /debug/customer-audit**

**URL:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/debug/customer-audit
```

**Headers:**
```
Authorization: Bearer YOUR_ANON_KEY
```

**Response sẽ cho bạn biết:**

1. **Số lượng customer** trong mỗi storage location:
   - `postgres_records`: Customer trong `customer_profiles` table (✅ Primary source)
   - `kv_old_records`: Customer trong `kv_store_84f9c112` (❌ Old, cần migrate)
   - `kv_customers_records`: Customer trong `kv_store_customers` (❌ Deprecated, cần migrate)

2. **Statistics:**
   - Tổng customers
   - Active vs Suspended
   - Membership tiers breakdown
   - Sample records (5 records đầu tiên)

3. **Recommendations:**
   - Severity: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
   - Actions cần thực hiện

**Example Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-01-26T10:00:00Z",
    "summary": {
      "total_records": 150,
      "postgres_records": 100,
      "kv_old_records": 30,
      "kv_customers_records": 20,
      "data_fragmented": true
    },
    "postgres": {
      "total": 100,
      "active": 95,
      "suspended": 5,
      "with_membership": 45,
      "tiers": {
        "guest": 55,
        "bronze": 10,
        "silver": 15,
        "gold": 12,
        "platinum": 6,
        "diamond": 2
      },
      "sample_records": [...]
    },
    "recommendations": [
      {
        "severity": "HIGH",
        "issue": "Found 30 customer records in OLD KV store",
        "action": "These should be migrated to Postgres"
      }
    ],
    "status": "ACTION_REQUIRED"
  }
}
```

---

## 🔍 BƯỚC 2: SO SÁNH CUSTOMER CỤ THỂ

### **Endpoint: GET /debug/customer-compare/:phone**

Kiểm tra một customer cụ thể có tồn tại ở bao nhiêu nơi.

**URL:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/debug/customer-compare/5551234567
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phone": "5551234567",
    "found_in": {
      "postgres": true,
      "kv_old": false,
      "kv_customers": true
    },
    "data": {
      "postgres": {
        "id": "uuid-123",
        "phone": "5551234567",
        "full_name": "John Doe",
        "tier": "gold",
        "total_visits": 25,
        "lifetime_spend": 1500
      },
      "kv_old": null,
      "kv_customers": {
        "id": "customer_us:5551234567",
        "phone": "5551234567",
        "full_name": "John Doe",
        "total_visits": 20,
        "total_spent": 1200
      }
    },
    "conflicts": [
      {
        "severity": "HIGH",
        "issue": "Customer exists in 2 different storage locations",
        "locations": ["postgres", "kv_customers"]
      }
    ]
  }
}
```

**⚠️ Nếu thấy conflicts:** Data bị duplicate, cần quyết định:
- Merge data (lấy giá trị lớn nhất cho visits/spend)
- Ưu tiên Postgres (bỏ qua KV data)
- Manual review

---

## 🎯 BƯỚC 3: XỬ LÝ DỰA TRÊN KẾT QUẢ AUDIT

### **Scenario A: Tất cả data đã trong Postgres** ✅

```json
{
  "summary": {
    "postgres_records": 150,
    "kv_old_records": 0,
    "kv_customers_records": 0,
    "data_fragmented": false
  },
  "status": "HEALTHY"
}
```

**Action:** ✅ **KHÔNG CẦN LÀM GÌ!** 

Hệ thống đã hoàn toàn migrate sang Postgres. Bạn chỉ cần test CustomerManagementTab để đảm bảo hiển thị đúng.

---

### **Scenario B: Data bị phân tán** ⚠️

```json
{
  "summary": {
    "postgres_records": 50,
    "kv_old_records": 30,
    "kv_customers_records": 20,
    "data_fragmented": true
  },
  "status": "ACTION_REQUIRED"
}
```

**Action:** Cần MIGRATE data từ KV stores vào Postgres.

**2 Options:**

#### **Option 1: Automatic Migration Script** (Recommended)

Tôi sẽ tạo migration script để:
1. Load tất cả customers từ KV stores
2. Transform sang Postgres schema
3. Upsert vào `customer_profiles`
4. Handle conflicts (merge data)
5. Backup old data trước khi xóa

**Ưu điểm:**
- ✅ Fast (1-2 phút)
- ✅ Automated conflict resolution
- ✅ Rollback được nếu có lỗi

**Nhược điểm:**
- ⚠️ Cần downtime 5-10 phút
- ⚠️ Phải trust script logic

#### **Option 2: Manual Migration**

1. Export KV data ra CSV
2. Review thủ công
3. Import vào Postgres qua Supabase Dashboard

**Ưu điểm:**
- ✅ Full control
- ✅ No risk

**Nhược điểm:**
- ⚠️ Tốn thời gian (30-60 phút)
- ⚠️ Dễ miss records

---

### **Scenario C: Postgres RỖNG, data chỉ trong KV** 🚨

```json
{
  "summary": {
    "postgres_records": 0,
    "kv_old_records": 100,
    "kv_customers_records": 50,
    "data_fragmented": true
  },
  "status": "ACTION_REQUIRED",
  "recommendations": [
    {
      "severity": "CRITICAL",
      "issue": "Postgres customer_profiles table is EMPTY but data exists in KV stores!",
      "action": "IMMEDIATE MIGRATION REQUIRED"
    }
  ]
}
```

**Action:** 🚨 **URGENT - IMMEDIATE MIGRATION!**

Hệ thống hiện tại không thể hoạt động vì:
- Frontend gọi `/customers` → Query Postgres
- Postgres trống → Return empty list
- Data thực sự nằm trong KV stores

**Phải chạy migration script NGAY.**

---

## 🛠️ BƯỚC 4: CHẠY MIGRATION (Nếu cần)

### **Chuẩn bị:**

1. ✅ Đã chạy `/debug/customer-audit` để confirm cần migrate
2. ✅ Đã backup database (Supabase Dashboard → Database → Backups)
3. ✅ Thông báo team: Downtime 5-10 phút
4. ✅ Test môi trường đã sẵn sàng

### **Chạy Migration:**

Tôi sẽ tạo endpoint:

```
POST /make-server-84f9c112/admin/migrate/customers-to-postgres
```

**Request Body:**
```json
{
  "dry_run": true,  // ← Set false để thực thi thật
  "merge_strategy": "postgres_priority",  // postgres_priority | kv_priority | merge_max
  "delete_old_data": false  // ← Set true để xóa KV data sau khi migrate
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dry_run": true,
    "summary": {
      "kv_old_found": 30,
      "kv_customers_found": 20,
      "postgres_existing": 50,
      "conflicts": 10,
      "would_create": 20,
      "would_update": 30
    },
    "conflicts": [
      {
        "phone": "5551234567",
        "postgres_data": {...},
        "kv_data": {...},
        "resolution": "Keep Postgres (higher visits count)"
      }
    ]
  }
}
```

**Steps:**

1. **Dry run trước:**
   ```bash
   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84f9c112/admin/migrate/customers-to-postgres \
     -H "Authorization: Bearer ANON_KEY" \
     -H "X-Session-Token: ADMIN_JWT" \
     -H "Content-Type: application/json" \
     -d '{"dry_run": true}'
   ```

2. **Review conflicts**

3. **Chạy thật:**
   ```bash
   curl -X POST ... -d '{"dry_run": false, "delete_old_data": false}'
   ```

4. **Verify:**
   ```bash
   curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84f9c112/debug/customer-audit
   ```

5. **Cleanup (Optional):**
   Sau khi confirm Postgres đã có đủ data, set `delete_old_data: true` để xóa KV data cũ.

---

## ✅ BƯỚC 5: VERIFY

Sau khi migrate (hoặc nếu không cần migrate), test các endpoint:

### **1. List Customers:**
```bash
GET /make-server-84f9c112/customers?page=1&limit=20
```

**Expected:** Trả về list customers với membership data

### **2. Customer Detail:**
```bash
GET /make-server-84f9c112/customers/{customer_id}
```

**Expected:** Trả về customer detail với format:
```json
{
  "id": "uuid",
  "phone": "5551234567",
  "phone_display": "(555) 123-4567",
  "full_name": "John Doe",
  "total_visits": 25,
  "total_spent": 1500,
  "membership": {
    "tier": "gold",
    "status": "active",
    "expires_at": "2026-01-26T00:00:00Z"
  }
}
```

### **3. Frontend Test:**

Vào Admin → Customer Management:
- ✅ Hiển thị danh sách customers
- ✅ Membership badges hiển thị đúng
- ✅ Stats (visits, spent) chính xác
- ✅ Pagination hoạt động

---

## 🆘 TROUBLESHOOTING

### **Problem 1: Audit endpoint trả về 500 Error**

**Cause:** Table `customer_profiles` chưa được tạo

**Solution:**
```sql
-- Chạy trong Supabase SQL Editor
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  notes TEXT,
  tier TEXT DEFAULT 'guest',
  status TEXT DEFAULT 'active',
  membership_start_date TIMESTAMPTZ,
  membership_end_date TIMESTAMPTZ,
  membership_amount NUMERIC,
  total_visits INTEGER DEFAULT 0,
  lifetime_spend NUMERIC DEFAULT 0,
  last_visit_date TIMESTAMPTZ,
  loyalty_points INTEGER DEFAULT 0,
  marketing_opt_in BOOLEAN DEFAULT true,
  sms_opt_in BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_profiles_updated_at
BEFORE UPDATE ON customer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### **Problem 2: CustomerManagementTab hiển thị rỗng**

**Các bước debug:**

1. **Check browser console:**
   ```
   F12 → Console → Search for "GET CUSTOMERS" errors
   ```

2. **Check network:**
   ```
   F12 → Network → Filter "customers" → Check response
   ```

3. **Verify Postgres có data:**
   ```bash
   curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84f9c112/debug/customer-audit
   ```

4. **Check transform logic:**
   Backend log sẽ show nếu transform có lỗi

### **Problem 3: Membership không hiển thị dù có tier**

**Cause:** Transform logic check sai điều kiện

**Check:** Customer có `tier != 'guest'` VÀ có `membership_end_date`?

**Fix:** Đã sửa trong `customers_postgres.tsx` line 60-67

---

## 📞 NEXT STEPS

Sau khi hoàn thành audit & migration:

1. ✅ Update frontend Interface nếu cần (remove `region` field)
2. ✅ Test full workflow: Redeem → Check Customer Management
3. ✅ Document data schema cho team
4. ✅ Setup monitoring cho Postgres table
5. ✅ Cleanup old KV data (sau khi confirm 100% migrate xong)

---

## 🎯 TÓM TẮT

```
1. Chạy audit: GET /debug/customer-audit
   ↓
2. Kiểm tra kết quả:
   - HEALTHY? → Skip to step 5
   - ACTION_REQUIRED? → Continue
   ↓
3. Dry run migration: POST /admin/migrate/customers-to-postgres
   ↓
4. Execute migration & verify
   ↓
5. Test frontend CustomerManagementTab
   ↓
6. Done! 🎉
```

---

**Author:** Senior Fullstack Architect  
**Date:** 2025-01-26  
**Status:** Ready for Testing
