# CHECKSUM EXPLAINED - BẢO MẬT THANH TOÁN

**Date:** January 21, 2026  
**Author:** System  
**Audience:** Developers & Technical Team

---

## 📚 MỤC LỤC

1. [Checksum Là Gì?](#checksum-là-gì)
2. [Tại Sao Cần Checksum?](#tại-sao-cần-checksum)
3. [MD5 Hash Là Gì?](#md5-hash-là-gì)
4. [Checksum Trong Payment Flow](#checksum-trong-payment-flow)
5. [Security Deep Dive](#security-deep-dive)
6. [Examples Chi Tiết](#examples-chi-tiết)
7. [Common Attacks Prevented](#common-attacks-prevented)
8. [Best Practices](#best-practices)

---

## 🔍 CHECKSUM LÀ GÌ?

### **Định Nghĩa Đơn Giản**

**Checksum** (hay **chữ ký số**) là một chuỗi ký tự được tạo ra từ dữ liệu để:
1. **Verify integrity** - Xác minh dữ liệu không bị thay đổi
2. **Authenticate sender** - Xác thực người gửi
3. **Prevent tampering** - Ngăn chặn giả mạo

### **Ví Dụ Đời Thường**

Giống như **chữ ký** trên giấy tờ:
- Bạn ký tên vào hợp đồng → Người khác không thể sửa nội dung hợp đồng mà chữ ký vẫn hợp lệ
- Nếu ai đó sửa hợp đồng → Chữ ký không còn match → Phát hiện gian lận

**Trong thanh toán online:**
```
Original Data: "amount=10.00&email=user@email.com"
Checksum:      "a1b2c3d4e5f6..." (Chữ ký số)

Nếu ai đó sửa:
Modified Data: "amount=1000.00&email=user@email.com"
Checksum:      "a1b2c3d4e5f6..." (Chữ ký vẫn cũ)

→ Server check: Data không match với checksum → REJECT ❌
```

---

## ⚠️ TẠI SAO CẦN CHECKSUM?

### **Scenario 1: Không Có Checksum**

**Hacker có thể làm gì:**

```javascript
// URL gốc từ server
https://payment.com/pay?amount=10.00&email=user@email.com

// Hacker sửa trong browser hoặc intercept request
https://payment.com/pay?amount=0.01&email=user@email.com
                              ↑↑↑↑
                        Sửa từ 10.00 → 0.01

// Server nhận được
amount = 0.01  // Hacker chỉ trả $0.01 thay vì $10.00 ❌
email = user@email.com

// Kết quả:
- Hacker mua membership $10 chỉ với $0.01
- Business mất tiền
- Không có cách nào phát hiện
```

---

### **Scenario 2: Có Checksum (MD5)**

**Hacker KHÔNG THỂ làm gì:**

```javascript
// URL gốc từ server (có checksum)
https://payment.com/pay?amount=10.00&email=user@email.com&checksum=abc123def

// Server tạo checksum như thế nào:
checksum = MD5("10.00" + "user@email.com" + "SECRET_KEY")
         = "abc123def"

// Hacker cố gắng sửa
https://payment.com/pay?amount=0.01&email=user@email.com&checksum=abc123def
                              ↑↑↑↑
                        Sửa từ 10.00 → 0.01

// Server verify
receivedChecksum = "abc123def"
calculatedChecksum = MD5("0.01" + "user@email.com" + "SECRET_KEY")
                   = "xyz789ghi"  // KHÁC!

// So sánh
"abc123def" ≠ "xyz789ghi"

// Kết quả:
→ Server REJECT payment ✅
→ Log security alert
→ Hacker bị chặn
```

---

## 🔐 MD5 HASH LÀ GÌ?

### **MD5 = Message Digest Algorithm 5**

**Đặc điểm:**
- ✅ **One-way function** - Không thể reverse (decrypt)
- ✅ **Fixed length** - Luôn ra 32 ký tự (128 bits)
- ✅ **Deterministic** - Cùng input → cùng output
- ✅ **Avalanche effect** - Thay đổi 1 ký tự → output hoàn toàn khác

### **Examples:**

```javascript
MD5("hello") = "5d41402abc4b2a76b9719d911017c592"
MD5("Hello") = "8b1a9953c4611296a827abf8c47804d7"  // Khác hoàn toàn!
MD5("hello ") = "fcd6bcb56c1689fcef28b57c22475bad" // Thêm space → khác!

// Bất kể input dài bao nhiêu → luôn 32 ký tự
MD5("a") = "0cc175b9c0f1b6a831c399e269772661"
MD5("a very long string with many characters and numbers 123456789...") 
         = "1234567890abcdef1234567890abcdef"  // Vẫn 32 ký tự
```

### **Tại Sao Dùng MD5 Cho Checksum?**

| Feature | Benefit |
|---------|---------|
| **Fast** | Tính toán nhanh, không ảnh hưởng performance |
| **Fixed length** | Dễ validate, không phụ thuộc độ dài data |
| **Deterministic** | Cùng input luôn cho cùng output |
| **Irreversible** | Không thể decrypt để lấy SECRET_KEY |
| **Collision resistant** | Khó tìm 2 inputs cho cùng output |

---

## 💳 CHECKSUM TRONG PAYMENT FLOW

### **Complete Payment Flow với Checksum**

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER CHỌN MEMBERSHIP                       │
│  User clicks: "Buy Gold Membership - $99.50 for 3 months"       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              2. FRONTEND GỬI REQUEST ĐẾN BACKEND                 │
│  POST /payment/create-link                                       │
│  Body: {                                                         │
│    "tierName": "gold",                                           │
│    "amount": 99.5,                                               │
│    "duration": 3                                                 │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                3. BACKEND TẠO CHECKSUM (MD5)                     │
│                                                                  │
│  // Step 3.1: Format data                                       │
│  amount = 99.50  (formatted with .toFixed(2))                   │
│  merchantOrderCode = "ORDER-1737493928-A1B2C3D4"                │
│  email = "{email}"  (placeholder)                               │
│  merchantRefCode = "BTCNAIL-MERCHANT-001"                       │
│  timestamp = 1737493928000                                      │
│  secretKey = "my_super_secret_key_12345"  (from env)            │
│                                                                  │
│  // Step 3.2: Concatenate                                       │
│  dataString = "99.50" +                                          │
│               "ORDER-1737493928-A1B2C3D4" +                     │
│               "{email}" +                                        │
│               "BTCNAIL-MERCHANT-001" +                          │
│               "1737493928000" +                                 │
│               "my_super_secret_key_12345"                       │
│                                                                  │
│  // Step 3.3: Calculate MD5                                     │
│  checksum = MD5(dataString)                                     │
│           = "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1"                  │
│                                                                  │
│  console.log('🔐 [CHECKSUM] Amount format: 99.50')              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                4. BACKEND TẠO PAYMENT URL                        │
│                                                                  │
│  paymentUrl =                                                    │
│    "https://sandbox.vlinkpay.com/embedded/payment-init?" +      │
│    "amount=99.50" +                                              │
│    "&merchantOrderCode=ORDER-1737493928-A1B2C3D4" +             │
│    "&email={email}" +                                            │
│    "&merchantRefCode=BTCNAIL-MERCHANT-001" +                    │
│    "&checksum=a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1" +               │
│    "&timestamp=1737493928000" +                                 │
│    "&orderRedirectUrl=https://myapp.com/success"                │
│                                                                  │
│  // Return to frontend                                          │
│  return { paymentUrl, redeemCode: "BTCNAIL-XYZ12-ABC34" }       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               5. USER NHẬP EMAIL VÀ SUBMIT                       │
│  User enters: "john@example.com"                                │
│  Frontend replaces {email} in URL                               │
│                                                                  │
│  finalUrl = paymentUrl.replace('{email}', 'john@example.com')  │
│           = "...&email=john@example.com&checksum=..."           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            6. IFRAME LOAD → GỬI REQUEST ĐẾN VLINKPAY            │
│  Browser loads iframe with URL                                  │
│  VLINKPAY receives:                                             │
│    amount = "99.50"                                              │
│    merchantOrderCode = "ORDER-1737493928-A1B2C3D4"              │
│    email = "john@example.com"                                   │
│    merchantRefCode = "BTCNAIL-MERCHANT-001"                     │
│    checksum = "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1"                │
│    timestamp = "1737493928000"                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              7. VLINKPAY VERIFY CHECKSUM                         │
│                                                                  │
│  // VLINKPAY tính lại checksum với SECRET_KEY của họ            │
│  receivedChecksum = "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1"          │
│                                                                  │
│  calculatedChecksum = MD5(                                      │
│    "99.50" +                                                     │
│    "ORDER-1737493928-A1B2C3D4" +                                │
│    "john@example.com" +          // Email đã được replace        │
│    "BTCNAIL-MERCHANT-001" +                                     │
│    "1737493928000" +                                            │
│    "my_super_secret_key_12345"   // Same secret key             │
│  )                                                              │
│  = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"                           │
│                                                                  │
│  // Compare                                                     │
│  if (receivedChecksum === calculatedChecksum) {                 │
│    // ✅ VALID - Process payment                                │
│    processPayment()                                             │
│  } else {                                                       │
│    // ❌ INVALID - Reject                                       │
│    return "Invalid checksum - possible tampering detected"      │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    8. PAYMENT SUCCESS/FAIL                       │
│  If checksum valid:                                             │
│    → User completes payment via VLINKPAY                        │
│    → VLINKPAY redirects to orderRedirectUrl                     │
│    → Backend updates redeem code status to "paid"               │
│                                                                  │
│  If checksum invalid:                                           │
│    → Payment rejected                                           │
│    → Error message shown                                        │
│    → Security log created                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ SECURITY DEEP DIVE

### **1. Tại Sao SECRET_KEY Quan Trọng?**

**Checksum WITHOUT Secret Key:**
```javascript
// BAD EXAMPLE - Không dùng secret key ❌
checksum = MD5("99.50ORDER-123john@email.com")
         = "abc123def"

// Hacker có thể:
1. Xem URL trong browser
2. Biết format checksum: MD5(amount + order + email)
3. Tính checksum mới cho data giả mạo:
   newChecksum = MD5("0.01ORDER-123john@email.com")
               = "xyz789ghi"
4. Tạo URL giả:
   ?amount=0.01&checksum=xyz789ghi
5. Server verify: checksum match → Accept ❌
```

**Checksum WITH Secret Key:**
```javascript
// GOOD EXAMPLE - Có secret key ✅
checksum = MD5("99.50ORDER-123john@email.comSECRET_KEY")
         = "abc123def"

// Hacker cố gắng:
1. Xem URL trong browser
2. Biết format nhưng KHÔNG BIẾT SECRET_KEY
3. Thử tính checksum:
   newChecksum = MD5("0.01ORDER-123john@email.com???")
               = "???" // Không biết secret key → Không tính được!
4. Thử random guess:
   ?amount=0.01&checksum=random123
5. Server verify: checksum KHÔNG match → Reject ✅
```

**Secret Key phải:**
- ✅ Random và khó đoán
- ✅ Lưu trong environment variables (KHÔNG commit vào code)
- ✅ Chỉ backend biết (KHÔNG gửi cho frontend)
- ✅ Same key ở cả merchant và payment gateway
- ✅ Rotate định kỳ (thay đổi mỗi 3-6 tháng)

---

### **2. Order of Concatenation**

**Quan trọng:** Thứ tự concatenate PHẢI GIỐNG NHAU giữa merchant và payment gateway!

**Example:**

```javascript
// Merchant (Backend)
dataString = amount + order + email + ref + timestamp + secret
checksum = MD5(dataString)

// Payment Gateway (VLINKPAY)
// ❌ WRONG ORDER - Sẽ không match!
dataString = email + amount + order + ref + timestamp + secret
checksum = MD5(dataString)  // Khác với merchant!

// ✅ CORRECT ORDER - Must match merchant
dataString = amount + order + email + ref + timestamp + secret
checksum = MD5(dataString)  // Match!
```

**Test:**
```javascript
MD5("10.00ORDER-123john@email.comSECRET") 
  ≠ MD5("john@email.com10.00ORDER-123SECRET")

// Cùng data nhưng thứ tự khác → hash khác!
```

---

### **3. Timestamp Validation**

Timestamp ngăn chặn **replay attacks**:

```javascript
// URL hợp lệ lúc 10:00 AM
?amount=99.50&timestamp=1737493928000&checksum=abc123

// Hacker copy toàn bộ URL này

// 2 giờ sau (12:00 PM), hacker gửi lại URL
// Server check:
currentTime = Date.now()  // 1737501128000 (12:00 PM)
requestTime = 1737493928000  // 10:00 AM
timeDiff = currentTime - requestTime  // 7200000 ms = 2 hours

if (timeDiff > 5 * 60 * 1000) {  // > 5 minutes
  return "Request expired"  // ✅ Reject
}
```

**Benefits:**
- ✅ Ngăn replay attacks
- ✅ Link tự động expire
- ✅ Giới hạn window of opportunity cho hackers

---

### **4. MerchantOrderCode Uniqueness**

```javascript
// Generate unique order code
const generateMerchantOrderCode = () => {
  return `ORDER-${Date.now()}-${crypto.randomUUID().split('-')[0]}`;
};

// Example output
"ORDER-1737493928000-A1B2C3D4"
       ↑               ↑
    timestamp      random UUID

// Why?
1. Timestamp → Chronological ordering
2. UUID → Prevent collisions (2 orders same millisecond)
3. Included in checksum → Prevent duplicate payments
```

**Prevents:**
- ✅ Duplicate payments
- ✅ Order ID collision
- ✅ Replay attacks (each request = unique order code)

---

## 📊 EXAMPLES CHI TIẾT

### **Example 1: Normal Payment Flow**

**Input Data:**
```javascript
amount = 99.50
merchantOrderCode = "ORDER-1737493928-A1B2C3D4"
email = "john@example.com"
merchantRefCode = "BTCNAIL-MERCHANT-001"
timestamp = 1737493928000
secretKey = "my_secret_key_xyz"
```

**Step-by-Step:**

```javascript
// Step 1: Format amount
formattedAmount = (99.50).toFixed(2)  // "99.50"

// Step 2: Concatenate
dataString = "99.50" + 
             "ORDER-1737493928-A1B2C3D4" + 
             "john@example.com" + 
             "BTCNAIL-MERCHANT-001" + 
             "1737493928000" + 
             "my_secret_key_xyz"

// Result:
"99.50ORDER-1737493928-A1B2C3D4john@example.comBTCNAIL-MERCHANT-0011737493928000my_secret_key_xyz"

// Step 3: Calculate MD5
checksum = MD5(dataString)
         = "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1"  // 32 characters

// Step 4: Build URL
url = "https://sandbox.vlinkpay.com/embedded/payment-init?" +
      "amount=99.50&" +
      "merchantOrderCode=ORDER-1737493928-A1B2C3D4&" +
      "email=john@example.com&" +
      "merchantRefCode=BTCNAIL-MERCHANT-001&" +
      "checksum=a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1&" +
      "timestamp=1737493928000&" +
      "orderRedirectUrl=https://myapp.com/success"
```

**VLINKPAY Verification:**

```javascript
// VLINKPAY receives URL parameters
received = {
  amount: "99.50",
  merchantOrderCode: "ORDER-1737493928-A1B2C3D4",
  email: "john@example.com",
  merchantRefCode: "BTCNAIL-MERCHANT-001",
  checksum: "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1",
  timestamp: "1737493928000"
}

// VLINKPAY recalculates checksum
dataString = "99.50" + 
             "ORDER-1737493928-A1B2C3D4" + 
             "john@example.com" + 
             "BTCNAIL-MERCHANT-001" + 
             "1737493928000" + 
             "my_secret_key_xyz"  // Same secret key from config

calculatedChecksum = MD5(dataString)
                   = "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1"

// Compare
if (received.checksum === calculatedChecksum) {
  console.log("✅ Checksum valid - Processing payment");
  processPayment();
} else {
  console.log("❌ Checksum invalid - Rejecting payment");
  rejectPayment();
}

// Result: ✅ VALID - Payment processed
```

---

### **Example 2: Hacker Attack (Amount Tampering)**

**Original URL (từ backend):**
```
https://sandbox.vlinkpay.com/embedded/payment-init?
  amount=99.50&
  merchantOrderCode=ORDER-1737493928-A1B2C3D4&
  email=john@example.com&
  merchantRefCode=BTCNAIL-MERCHANT-001&
  checksum=a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1&
  timestamp=1737493928000
```

**Hacker sửa amount:**
```
https://sandbox.vlinkpay.com/embedded/payment-init?
  amount=0.01&  👈 SỬA TỪ 99.50 → 0.01
  merchantOrderCode=ORDER-1737493928-A1B2C3D4&
  email=john@example.com&
  merchantRefCode=BTCNAIL-MERCHANT-001&
  checksum=a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1&  👈 GIỮ NGUYÊN CHECKSUM CŨ
  timestamp=1737493928000
```

**VLINKPAY Verification:**

```javascript
// Received data
received = {
  amount: "0.01",  // Modified!
  merchantOrderCode: "ORDER-1737493928-A1B2C3D4",
  email: "john@example.com",
  merchantRefCode: "BTCNAIL-MERCHANT-001",
  checksum: "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1",  // Old checksum
  timestamp: "1737493928000"
}

// Recalculate with received data
dataString = "0.01" +  // Modified amount!
             "ORDER-1737493928-A1B2C3D4" + 
             "john@example.com" + 
             "BTCNAIL-MERCHANT-001" + 
             "1737493928000" + 
             "my_secret_key_xyz"

calculatedChecksum = MD5(dataString)
                   = "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4"  // Different!

// Compare
received.checksum    = "a7f3e8d9c2b1f0e4d8c7b6a5f4e3d2c1"
calculatedChecksum   = "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4"

// Result: NOT MATCH!
if (received.checksum === calculatedChecksum) {
  // Not executed
} else {
  console.error("❌ SECURITY ALERT: Checksum mismatch!");
  console.error("Possible tampering detected");
  console.error("Expected:", calculatedChecksum);
  console.error("Received:", received.checksum);
  
  rejectPayment();
  logSecurityIncident({
    type: "checksum_mismatch",
    ip: request.ip,
    data: received
  });
}

// Result: ❌ REJECTED - Attack prevented!
```

---

### **Example 3: Why .toFixed(2) Matters**

**Without .toFixed(2):**

```javascript
// Backend
amount = 99.5  // JavaScript number
checksum = MD5("99.5ORDER-123...")  // "99.5" as string
         = "abc123def"

// URL sent to VLINKPAY
?amount=99.5&checksum=abc123def
```

**VLINKPAY might expect:**

```javascript
// VLINKPAY's calculation
amount = "99.50"  // Their system requires 2 decimals
checksum = MD5("99.50ORDER-123...")  // "99.50" as string
         = "xyz789ghi"  // Different!

// Compare
received: "abc123def"
calculated: "xyz789ghi"
Result: MISMATCH ❌
```

**With .toFixed(2):**

```javascript
// Backend
amount = 99.5
formattedAmount = amount.toFixed(2)  // "99.50"
checksum = MD5("99.50ORDER-123...")
         = "xyz789ghi"

// URL sent to VLINKPAY
?amount=99.50&checksum=xyz789ghi

// VLINKPAY's calculation
checksum = MD5("99.50ORDER-123...")
         = "xyz789ghi"

// Compare
received: "xyz789ghi"
calculated: "xyz789ghi"
Result: MATCH ✅
```

---

## 🚨 COMMON ATTACKS PREVENTED

### **1. Amount Tampering**

**Attack:**
```
Original: ?amount=99.50
Modified: ?amount=0.01
```

**Prevention:**
```javascript
Checksum includes amount → Amount change → Checksum invalid → Rejected ✅
```

---

### **2. Email Substitution**

**Attack:**
```
Original: ?email=victim@email.com
Modified: ?email=hacker@evil.com
```

**Prevention:**
```javascript
Checksum includes email → Email change → Checksum invalid → Rejected ✅
```

---

### **3. Replay Attack**

**Attack:**
```
1. Hacker intercepts valid request at 10:00 AM
2. Saves entire URL (including valid checksum)
3. Replays same request at 2:00 PM
```

**Prevention:**
```javascript
// Server validates timestamp
requestTime = 1737493928000  // 10:00 AM
currentTime = 1737507528000  // 2:00 PM
diff = 4 hours > 5 minutes

→ Request expired → Rejected ✅
```

---

### **4. Order Duplication**

**Attack:**
```
1. User completes payment for ORDER-123
2. Hacker replays same ORDER-123 to get double credit
```

**Prevention:**
```javascript
// Server tracks order codes
if (orderAlreadyProcessed("ORDER-123")) {
  return "Duplicate order detected → Rejected ✅"
}
```

---

### **5. Man-in-the-Middle (MITM)**

**Attack:**
```
1. Hacker intercepts request
2. Modifies data
3. Forwards to server
```

**Prevention:**
```javascript
// HTTPS encrypts entire request
→ Hacker can't read/modify encrypted data ✅

// Even if decrypted
→ Checksum validation catches any modification ✅
```

---

### **6. Brute Force Checksum**

**Attack:**
```
1. Hacker tries to guess valid checksum
2. Tries random checksums: "abc123...", "def456...", etc.
```

**Prevention:**
```javascript
// MD5 produces 32 hex characters
// Possible combinations: 16^32 = 340,282,366,920,938,463,463,374,607,431,768,211,456
// At 1 billion attempts/second: Would take 10,790,283,070,806,014,188 years ✅

// Plus timestamp expires in 5 minutes
→ Brute force impossible ✅
```

---

## ✅ BEST PRACTICES

### **1. Secret Key Management**

```javascript
// ❌ BAD - Hardcoded
const secretKey = "my_secret_key_123";

// ❌ BAD - In frontend
const checksum = MD5(data + window.SECRET_KEY);

// ❌ BAD - Committed to Git
// config.json: { "secretKey": "abc123" }

// ✅ GOOD - Environment variable
const secretKey = Deno.env.get('VLINKPAY_SECRET_KEY');

// ✅ GOOD - Encrypted in database
const encrypted = await kv.get('vlinkpay_settings');
const secretKey = await decrypt(encrypted.secretKey);

// ✅ GOOD - Backend only
// Backend creates checksum, frontend never sees secret key
```

---

### **2. Timestamp Validation**

```javascript
// ❌ BAD - No validation
// Accept any timestamp

// ❌ BAD - Too long window
const maxAge = 24 * 60 * 60 * 1000;  // 24 hours

// ✅ GOOD - Short window
const maxAge = 5 * 60 * 1000;  // 5 minutes
const timeDiff = Date.now() - timestamp;
if (timeDiff > maxAge) {
  return "Request expired";
}

// ✅ GOOD - Also check future timestamps
if (timestamp > Date.now() + 60000) {  // +1 minute tolerance
  return "Invalid timestamp - in the future";
}
```

---

### **3. Input Validation**

```javascript
// ✅ Validate BEFORE checksum calculation
if (!amount || amount <= 0) {
  return "Invalid amount";
}

if (!email || !isValidEmail(email)) {
  return "Invalid email";
}

// ✅ Sanitize inputs
amount = parseFloat(amount).toFixed(2);
email = email.trim().toLowerCase();
```

---

### **4. Error Handling**

```javascript
// ❌ BAD - Leak information
return "Checksum mismatch. Expected: abc123, Got: def456";

// ✅ GOOD - Generic error
return "Invalid request";

// ✅ GOOD - Log details server-side
console.error("Checksum mismatch:", {
  expected: calculatedChecksum,
  received: receivedChecksum,
  ip: request.ip,
  timestamp: Date.now()
});
```

---

### **5. HTTPS Only**

```javascript
// ❌ BAD - HTTP
http://payment.com/pay?amount=99.50&checksum=...

// ✅ GOOD - HTTPS
https://payment.com/pay?amount=99.50&checksum=...

// Enforce HTTPS
if (request.protocol !== 'https') {
  return "HTTPS required";
}
```

---

## 📝 TESTING CHECKSUM

### **Unit Test Example:**

```javascript
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { createHash } from "node:crypto";

Deno.test("Checksum generation - normal case", () => {
  const params = {
    amount: 99.50,
    merchantOrderCode: "ORDER-123",
    email: "test@email.com",
    merchantRefCode: "REF-001",
    timestamp: 1737493928000,
    secretKey: "test_secret"
  };
  
  const dataString = 
    `${params.amount.toFixed(2)}` +
    `${params.merchantOrderCode}` +
    `${params.email}` +
    `${params.merchantRefCode}` +
    `${params.timestamp}` +
    `${params.secretKey}`;
  
  const checksum = createHash('md5').update(dataString).digest('hex');
  
  // Verify checksum is 32 characters
  assertEquals(checksum.length, 32);
  
  // Verify deterministic (same input → same output)
  const checksum2 = createHash('md5').update(dataString).digest('hex');
  assertEquals(checksum, checksum2);
});

Deno.test("Checksum validation - amount tampering", () => {
  const originalAmount = 99.50;
  const tamperedAmount = 0.01;
  
  const generateChecksum = (amount: number) => {
    const dataString = `${amount.toFixed(2)}ORDER-123test@email.com`;
    return createHash('md5').update(dataString).digest('hex');
  };
  
  const originalChecksum = generateChecksum(originalAmount);
  const tamperedChecksum = generateChecksum(tamperedAmount);
  
  // Checksums should be different
  assertEquals(originalChecksum !== tamperedChecksum, true);
});

Deno.test("Amount formatting - .toFixed(2)", () => {
  const testCases = [
    { input: 10, expected: "10.00" },
    { input: 99.5, expected: "99.50" },
    { input: 199.99, expected: "199.99" },
    { input: 0.1, expected: "0.10" }
  ];
  
  testCases.forEach(({ input, expected }) => {
    assertEquals(input.toFixed(2), expected);
  });
});
```

---

## 📚 TÓM TẮT

### **Checksum = Chữ Ký Số**

```
┌─────────────────────────────────────────┐
│          PAYMENT REQUEST                 │
│  amount = 99.50                          │
│  email = user@email.com                  │
│  order = ORDER-123                       │
│                                          │
│  + SECRET_KEY = "xyz"                    │
│                                          │
│  ↓ MD5 HASH                              │
│                                          │
│  checksum = "a1b2c3d4..."                │
│  (Digital Signature)                     │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│         SERVER VALIDATION                │
│                                          │
│  Recalculate checksum with received data │
│                                          │
│  If match → ✅ Valid                     │
│  If not   → ❌ Tampered/Invalid          │
└─────────────────────────────────────────┘
```

### **Key Points:**

1. ✅ **Integrity** - Đảm bảo data không bị sửa đổi
2. ✅ **Authentication** - Xác thực nguồn gốc request
3. ✅ **Security** - Ngăn chặn fraud và tampering
4. ✅ **MD5** - Fast, deterministic, irreversible
5. ✅ **Secret Key** - Chỉ backend biết, không leak ra frontend
6. ✅ **Timestamp** - Ngăn replay attacks
7. ✅ **Format Consistency** - .toFixed(2) đảm bảo checksum match

---

**End of Checksum Explained Documentation**
