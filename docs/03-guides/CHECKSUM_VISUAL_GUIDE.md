# CHECKSUM VISUAL GUIDE - HÌNH ẢNH MINH HỌA

**Date:** January 21, 2026  
**Purpose:** Visual explanations for non-technical users

---

## 🎨 CHECKSUM LÀ GÌ? (DÀNH CHO MỌI NGƯỜI)

### **Ví Dụ Đời Thường: Chữ Ký Trên Séc**

```
┌────────────────────────────────────────────────────────────┐
│                        SÉC NGÂN HÀNG                        │
├────────────────────────────────────────────────────────────┤
│  Trả cho:  Nguyễn Văn A                                    │
│  Số tiền:  10,000,000 VNĐ                                  │
│  Nội dung: Thanh toán hóa đơn                              │
│                                                            │
│  Chữ ký:  [Trần Văn B] ✍️                                 │
└────────────────────────────────────────────────────────────┘
```

**Nếu ai đó cố sửa số tiền:**

```
┌────────────────────────────────────────────────────────────┐
│                     SÉC BỊ GIẢ MẠO                         │
├────────────────────────────────────────────────────────────┤
│  Trả cho:  Nguyễn Văn A                                    │
│  Số tiền:  100,000,000 VNĐ  👈 SỬA TỪ 10 TRIỆU → 100 TRIỆU │
│  Nội dung: Thanh toán hóa đơn                              │
│                                                            │
│  Chữ ký:  [Trần Văn B] ✍️  👈 CHỮ KÝ VẪN CŨ                │
└────────────────────────────────────────────────────────────┘

❌ NGÂN HÀNG PHÁT HIỆN:
   - Số tiền đã thay đổi
   - Nhưng chữ ký không đổi
   - → Séc giả mạo → TỪ CHỐI!
```

**Checksum hoạt động tương tự:**

```
┌────────────────────────────────────────────────────────────┐
│                    PAYMENT REQUEST                          │
├────────────────────────────────────────────────────────────┤
│  Amount:  $99.50                                           │
│  Email:   john@email.com                                   │
│  Order:   ORDER-123                                        │
│                                                            │
│  Checksum: a1b2c3d4... ✍️ (Chữ ký số)                      │
└────────────────────────────────────────────────────────────┘

Nếu hacker sửa:

┌────────────────────────────────────────────────────────────┐
│                  TAMPERED REQUEST                           │
├────────────────────────────────────────────────────────────┤
│  Amount:  $0.01  👈 SỬA TỪ $99.50 → $0.01                  │
│  Email:   john@email.com                                   │
│  Order:   ORDER-123                                        │
│                                                            │
│  Checksum: a1b2c3d4... ✍️ (Chữ ký số VẪN CŨ)               │
└────────────────────────────────────────────────────────────┘

❌ SERVER PHÁT HIỆN:
   - Amount đã thay đổi
   - Checksum không match
   - → Request giả mạo → TỪ CHỐI!
```

---

## 🔄 PAYMENT FLOW VỚI CHECKSUM

### **Bước 1: User Chọn Membership**

```
┌──────────────────────────────────────┐
│       BITCOIN NAIL BAR APP            │
├──────────────────────────────────────┤
│                                      │
│  🥇 GOLD MEMBERSHIP                   │
│  ✓ Priority Booking                  │
│  ✓ 10% Discount                      │
│  ✓ Birthday Gift                     │
│                                      │
│  Price: $99.50 / 3 months            │
│                                      │
│  [ BUY NOW ] ← User clicks            │
│                                      │
└──────────────────────────────────────┘
```

---

### **Bước 2: Frontend → Backend**

```
┌──────────────────────────────────────┐
│          FRONTEND (Browser)           │
└──────────────────────────────────────┘
              ↓
       POST Request
       {
         tierName: "gold",
         amount: 99.5,
         duration: 3
       }
              ↓
┌──────────────────────────────────────┐
│       BACKEND (Server)                │
│  📍 /payment/create-link              │
└──────────────────────────────────────┘
```

---

### **Bước 3: Backend Tạo Checksum**

```
┌────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 1: Prepare Data                                      │
│  ┌──────────────────────────────────────┐                 │
│  │ amount = 99.50                       │                 │
│  │ order = ORDER-1737493928-A1B2        │                 │
│  │ email = {email} (placeholder)        │                 │
│  │ ref = BTCNAIL-MERCHANT-001           │                 │
│  │ timestamp = 1737493928000            │                 │
│  │ secret = "my_super_secret_key" 🔐    │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Step 2: Concatenate (Ghép chuỗi)                          │
│  ┌──────────────────────────────────────┐                 │
│  │ "99.50ORDER-1737493928-A1B2          │                 │
│  │  {email}BTCNAIL-MERCHANT-001         │                 │
│  │  1737493928000my_super_secret_key"   │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Step 3: MD5 Hash                                          │
│  ┌──────────────────────────────────────┐                 │
│  │ MD5(data) ────────────────────────→  │                 │
│  │                                      │                 │
│  │ checksum = "a7f3e8d9c2b1f0e4..."    │                 │
│  │            (32 characters)           │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### **Bước 4: Tạo Payment URL**

```
┌────────────────────────────────────────────────────────────┐
│                      PAYMENT URL                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  https://sandbox.vlinkpay.com/embedded/payment-init?       │
│    amount=99.50                                             │
│    &merchantOrderCode=ORDER-1737493928-A1B2                │
│    &email={email}                                           │
│    &merchantRefCode=BTCNAIL-MERCHANT-001                   │
│    &checksum=a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1 ✍️            │
│    &timestamp=1737493928000                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
              ↓
    Return to Frontend
```

---

### **Bước 5: User Nhập Email**

```
┌──────────────────────────────────────┐
│       PAYMENT MODAL                   │
├──────────────────────────────────────┤
│                                      │
│  Enter your email to continue:       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ john@example.com               │  │
│  └────────────────────────────────┘  │
│                                      │
│  [ Continue to Payment ]             │
│                                      │
└──────────────────────────────────────┘
              ↓
   Replace {email} in URL
              ↓
┌──────────────────────────────────────┐
│  ...&email=john@example.com&...      │
└──────────────────────────────────────┘
```

---

### **Bước 6: VLINKPAY Verify Checksum**

```
┌────────────────────────────────────────────────────────────┐
│                  VLINKPAY SERVER                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Received Request:                                         │
│  ┌──────────────────────────────────────┐                 │
│  │ amount = 99.50                       │                 │
│  │ order = ORDER-1737493928-A1B2        │                 │
│  │ email = john@example.com             │                 │
│  │ ref = BTCNAIL-MERCHANT-001           │                 │
│  │ checksum = a7f3e8d9c2b1f0e4...       │                 │
│  │ timestamp = 1737493928000            │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                            │
│  Recalculate Checksum:                                     │
│  ┌──────────────────────────────────────┐                 │
│  │ data = "99.50ORDER-1737493928-A1B2   │                 │
│  │         john@example.comBTCNAIL-     │                 │
│  │         MERCHANT-0011737493928000    │                 │
│  │         my_super_secret_key" 🔐       │                 │
│  │                                      │                 │
│  │ calculated = MD5(data)               │                 │
│  │            = "a7f3e8d9c2b1f0e4..."   │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                            │
│  Compare:                                                  │
│  ┌──────────────────────────────────────┐                 │
│  │ Received:   a7f3e8d9c2b1f0e4...      │                 │
│  │ Calculated: a7f3e8d9c2b1f0e4...      │                 │
│  │                                      │                 │
│  │ ✅ MATCH! → Process Payment          │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🚨 HACKER ATTACK SCENARIO

### **Scenario: Hacker Cố Sửa Amount**

```
┌────────────────────────────────────────────────────────────┐
│                 🎭 HACKER'S ATTEMPT                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 1: Hacker xem URL trong browser                      │
│  ┌──────────────────────────────────────┐                 │
│  │ ?amount=99.50                        │                 │
│  │ &checksum=a7f3e8d9c2b1f0e4...        │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Step 2: Hacker sửa amount                                 │
│  ┌──────────────────────────────────────┐                 │
│  │ ?amount=0.01 👈 SỬA!                  │                 │
│  │ &checksum=a7f3e8d9c2b1f0e4... 👈 CŨ  │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Step 3: Gửi request đến VLINKPAY                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────────────────────┐
│               🛡️ VLINKPAY DEFENSE                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Received Checksum:                                        │
│  ┌──────────────────────────────────────┐                 │
│  │ a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1      │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Recalculate với amount=0.01:                              │
│  ┌──────────────────────────────────────┐                 │
│  │ data = "0.01ORDER-..." 👈 SỬ DỤNG     │                 │
│  │                        AMOUNT MỚI    │                 │
│  │ calculated = MD5(data)               │                 │
│  │            = "z9y8x7w6v5u4t3s2..."   │                 │
│  │                 ↑↑↑↑↑↑↑↑↑            │                 │
│  │              KHÁC HOÀN TOÀN!          │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Compare:                                                  │
│  ┌──────────────────────────────────────┐                 │
│  │ Received:   a7f3e8d9... ✍️            │                 │
│  │ Calculated: z9y8x7w6... ✍️            │                 │
│  │                                      │                 │
│  │ ❌ NOT MATCH!                         │                 │
│  │                                      │                 │
│  │ → REJECT REQUEST                     │                 │
│  │ → LOG SECURITY INCIDENT              │                 │
│  │ → BLOCK IP (optional)                │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔐 SECRET KEY - CHÌA KHÓA BÍ MẬT

### **Tại Sao Cần Secret Key?**

```
┌────────────────────────────────────────────────────────────┐
│          KHÔNG CÓ SECRET KEY (KHÔNG AN TOÀN)               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Backend tạo checksum:                                     │
│  ┌──────────────────────────────────────┐                 │
│  │ data = "99.50ORDER-123john@email.com"│                 │
│  │ checksum = MD5(data)                 │                 │
│  │          = "abc123def..."            │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Hacker xem URL:                                           │
│  ┌──────────────────────────────────────┐                 │
│  │ ?amount=99.50&order=ORDER-123        │                 │
│  │ &email=john@email.com                │                 │
│  │ &checksum=abc123def                  │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Hacker biết format: MD5(amount + order + email)          │
│                                                            │
│  Hacker tạo checksum giả:                                  │
│  ┌──────────────────────────────────────┐                 │
│  │ data = "0.01ORDER-123john@email.com" │                 │
│  │ checksum = MD5(data)                 │                 │
│  │          = "xyz789ghi..."            │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Hacker gửi URL giả:                                       │
│  ┌──────────────────────────────────────┐                 │
│  │ ?amount=0.01&order=ORDER-123         │                 │
│  │ &email=john@email.com                │                 │
│  │ &checksum=xyz789ghi 👈 CHECKSUM GIẢ  │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Server verify:                                            │
│  ┌──────────────────────────────────────┐                 │
│  │ calculated = MD5("0.01ORDER-123...")  │                 │
│  │            = "xyz789ghi"             │                 │
│  │ received = "xyz789ghi"               │                 │
│  │                                      │                 │
│  │ ✅ MATCH → Accept ❌ (SECURITY HOLE!)│                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────┐
│            CÓ SECRET KEY (AN TOÀN)                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Backend tạo checksum:                                     │
│  ┌──────────────────────────────────────┐                 │
│  │ data = "99.50ORDER-123john@email.com"│                 │
│  │        + "SECRET_KEY_XYZ" 🔐          │                 │
│  │ checksum = MD5(data)                 │                 │
│  │          = "abc123def..."            │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Hacker xem URL:                                           │
│  ┌──────────────────────────────────────┐                 │
│  │ ?amount=99.50&order=ORDER-123        │                 │
│  │ &email=john@email.com                │                 │
│  │ &checksum=abc123def                  │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Hacker KHÔNG BIẾT secret key!                             │
│                                                            │
│  Hacker thử đoán:                                          │
│  ┌──────────────────────────────────────┐                 │
│  │ data = "0.01ORDER-123john@email.com" │                 │
│  │        + "???" 🤷 (Không biết key)     │                 │
│  │ checksum = MD5(data)                 │                 │
│  │          = "???" (Sai!)              │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Hacker gửi request với checksum cũ:                       │
│  ┌──────────────────────────────────────┐                 │
│  │ ?amount=0.01&checksum=abc123def      │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Server verify:                                            │
│  ┌──────────────────────────────────────┐                 │
│  │ calculated = MD5("0.01ORDER-123..." + │                 │
│  │                  "SECRET_KEY_XYZ")   │                 │
│  │            = "pqr456stu" (Khác!)     │                 │
│  │ received = "abc123def"               │                 │
│  │                                      │                 │
│  │ ❌ NOT MATCH → Reject ✅              │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### **Secret Key Phải Được Bảo Vệ:**

```
❌ NEVER:
  - Hardcode trong source code
  - Commit vào Git
  - Gửi cho frontend
  - Log trong console
  - Share qua email/Slack

✅ ALWAYS:
  - Lưu trong environment variables
  - Encrypt trong database
  - Chỉ backend biết
  - Rotate định kỳ (3-6 months)
  - Use strong, random keys
```

---

## 📊 MD5 HASH - MÃ HÓA MỘT CHIỀU

### **Đặc Điểm Của MD5**

```
┌────────────────────────────────────────────────────────────┐
│                    MD5 PROPERTIES                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. ONE-WAY (Một chiều)                                    │
│  ┌──────────────────────────────────────┐                 │
│  │ Input: "hello"                       │                 │
│  │   ↓ MD5                              │                 │
│  │ Output: "5d41402abc4b2a76..."        │                 │
│  │                                      │                 │
│  │ ❌ CANNOT reverse:                    │                 │
│  │ "5d41402abc4b2a76..." ↛ "hello"      │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  2. FIXED LENGTH (Độ dài cố định)                          │
│  ┌──────────────────────────────────────┐                 │
│  │ MD5("a") = "0cc175b9..." (32 chars)  │                 │
│  │ MD5("hello") = "5d41402a..." (32)    │                 │
│  │ MD5("very long...") = "abc123..." (32│                 │
│  │                                      │                 │
│  │ ✅ Luôn 32 ký tự hex (128 bits)       │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  3. DETERMINISTIC (Nhất quán)                              │
│  ┌──────────────────────────────────────┐                 │
│  │ MD5("hello") = "5d41402abc..."       │                 │
│  │ MD5("hello") = "5d41402abc..."       │                 │
│  │ MD5("hello") = "5d41402abc..."       │                 │
│  │                                      │                 │
│  │ ✅ Cùng input → cùng output           │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  4. AVALANCHE EFFECT (Hiệu ứng tuyết lở)                   │
│  ┌──────────────────────────────────────┐                 │
│  │ MD5("hello") = "5d41402abc..."       │                 │
│  │ MD5("Hello") = "8b1a9953c4..." (khác)│                 │
│  │ MD5("hello ") = "fcd6bcb56c..." (khác│                 │
│  │                                      │                 │
│  │ ✅ Thay đổi 1 ký tự → output hoàn     │                 │
│  │    toàn khác                         │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## ⏰ TIMESTAMP - NGĂN CHẶN REPLAY ATTACK

### **Replay Attack Là Gì?**

```
┌────────────────────────────────────────────────────────────┐
│               REPLAY ATTACK SCENARIO                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  10:00 AM - User thanh toán bình thường:                   │
│  ┌──────────────────────────────────────┐                 │
│  │ Request:                             │                 │
│  │ ?amount=99.50                        │                 │
│  │ &order=ORDER-123                     │                 │
│  │ &checksum=abc123def (VALID)          │                 │
│  │                                      │                 │
│  │ Server: ✅ Accept → Payment processed │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                            │
│  Hacker intercept (chặn) request và lưu lại               │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                            │
│  2:00 PM - Hacker replay (phát lại) request:               │
│  ┌──────────────────────────────────────┐                 │
│  │ Same Request (from 10:00 AM):        │                 │
│  │ ?amount=99.50                        │                 │
│  │ &order=ORDER-123                     │                 │
│  │ &checksum=abc123def (VALID)          │                 │
│  │                                      │                 │
│  │ Server: ✅ Accept again?              │                 │
│  │ → User charged TWICE! ❌              │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### **Solution: Timestamp Validation**

```
┌────────────────────────────────────────────────────────────┐
│            TIMESTAMP PREVENTS REPLAY ATTACK                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  10:00 AM (timestamp: 1737493928000)                       │
│  ┌──────────────────────────────────────┐                 │
│  │ Request:                             │                 │
│  │ ?amount=99.50                        │                 │
│  │ &timestamp=1737493928000 (10:00 AM)  │                 │
│  │ &checksum=abc123def                  │                 │
│  │                                      │                 │
│  │ Server check:                        │                 │
│  │ currentTime = 1737493950000 (10:00)  │                 │
│  │ diff = 22 seconds < 5 minutes        │                 │
│  │ → ✅ Accept (Fresh request)           │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                     │
│                                                            │
│  2:00 PM (timestamp: 1737507528000)                        │
│  ┌──────────────────────────────────────┐                 │
│  │ Hacker replays old request:          │                 │
│  │ ?amount=99.50                        │                 │
│  │ &timestamp=1737493928000 (10:00 AM!) │                 │
│  │ &checksum=abc123def                  │                 │
│  │                                      │                 │
│  │ Server check:                        │                 │
│  │ currentTime = 1737507528000 (2:00 PM)│                 │
│  │ requestTime = 1737493928000 (10:00)  │                 │
│  │ diff = 13600 seconds = 4 hours       │                 │
│  │ → ❌ REJECT (Expired!)                │                 │
│  │                                      │                 │
│  │ Log: "Possible replay attack         │                 │
│  │       detected from IP: XXX.XXX"     │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### **Timestamp Rules:**

```
┌────────────────────────────────────────┐
│     TIMESTAMP VALIDATION RULES         │
├────────────────────────────────────────┤
│                                        │
│  ✅ ACCEPT if:                          │
│     - Within 5 minutes of current time │
│     - Not in the future (+1 min tol.)  │
│                                        │
│  ❌ REJECT if:                          │
│     - Older than 5 minutes             │
│     - More than 1 minute in future     │
│     - Timestamp format invalid         │
│                                        │
└────────────────────────────────────────┘

Code:
const MAX_AGE = 5 * 60 * 1000; // 5 minutes
const FUTURE_TOLERANCE = 60 * 1000; // 1 minute

const timeDiff = Date.now() - timestamp;

if (timeDiff > MAX_AGE) {
  return "Request expired";
}

if (timestamp > Date.now() + FUTURE_TOLERANCE) {
  return "Invalid timestamp - in the future";
}
```

---

## 🎯 SUMMARY - TÓM TẮT

```
┌────────────────────────────────────────────────────────────┐
│                   CHECKSUM = BẢO VỆ                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🔐 Checksum = Chữ ký số                                   │
│     - Verify data không bị thay đổi                        │
│     - Authenticate nguồn gốc                               │
│     - Prevent tampering                                    │
│                                                            │
│  🔑 Secret Key = Chìa khóa bí mật                           │
│     - Chỉ backend biết                                     │
│     - Không leak ra frontend                               │
│     - Làm cho checksum không thể fake                      │
│                                                            │
│  🔨 MD5 = Thuật toán hash                                  │
│     - One-way (không reverse được)                         │
│     - Fixed length (32 chars)                              │
│     - Deterministic (cùng input → cùng output)             │
│     - Avalanche effect (thay đổi 1 char → khác hoàn toàn)  │
│                                                            │
│  ⏰ Timestamp = Thời gian                                  │
│     - Ngăn replay attacks                                  │
│     - Link tự động expire                                  │
│     - Window: 5 minutes                                    │
│                                                            │
│  💯 Format Consistency = .toFixed(2)                       │
│     - 10 → "10.00"                                         │
│     - 99.5 → "99.50"                                       │
│     - Đảm bảo checksum match giữa merchant & gateway       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🛡️ SECURITY LAYERS (CÁC LỚP BẢO MẬT)

```
┌────────────────────────────────────────────────────────────┐
│                  MULTI-LAYER SECURITY                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 1: HTTPS Encryption                                 │
│  ┌──────────────────────────────────────┐                 │
│  │ 🔒 Encrypt toàn bộ request/response  │                 │
│  │ → Ngăn Man-in-the-Middle attacks     │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Layer 2: Checksum Validation                              │
│  ┌──────────────────────────────────────┐                 │
│  │ ✍️ Verify data integrity              │                 │
│  │ → Ngăn data tampering                │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Layer 3: Timestamp Validation                             │
│  ┌──────────────────────────────────────┐                 │
│  │ ⏰ Check request freshness            │                 │
│  │ → Ngăn replay attacks                │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Layer 4: Order Code Uniqueness                            │
│  ┌──────────────────────────────────────┐                 │
│  │ 🆔 Track processed orders             │                 │
│  │ → Ngăn duplicate payments            │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
│  Layer 5: Rate Limiting (Future)                           │
│  ┌──────────────────────────────────────┐                 │
│  │ 🚦 Limit requests per IP              │                 │
│  │ → Ngăn brute force attacks           │                 │
│  └──────────────────────────────────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘

Tất cả layers phải PASS → Payment accepted ✅
Bất kỳ layer nào FAIL → Payment rejected ❌
```

---

**End of Visual Guide**
