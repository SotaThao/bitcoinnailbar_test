# 🔐 VLINKPAY API Key Encryption Setup Guide

## 📋 Overview

Your VLINKPAY API Key is now protected using **AES-256-GCM encryption** - military-grade security standard used by governments and banks.

---

## 🔑 Step 1: Generate Encryption Key

### **Option A: Using Node.js (Recommended)**

```javascript
// Run this in your terminal or browser console
const key = crypto.getRandomValues(new Uint8Array(32));
const base64Key = btoa(String.fromCharCode(...key));
console.log('Your Encryption Key:', base64Key);
```

### **Option B: Using Browser Console**

1. Open browser console (F12)
2. Paste and run:
```javascript
const key = crypto.getRandomValues(new Uint8Array(32));
const base64Key = btoa(String.fromCharCode(...key));
console.log('🔑 ENCRYPTION KEY:\n' + base64Key);
console.log('\n⚠️  IMPORTANT: Copy this key and keep it secret!');
```

### **Option C: Using Online Tool**

Visit: https://generate-random.org/encryption-key-generator?count=1&bytes=32&cipher=aes-256-cbc&string=&password=

- Click "Generate"
- Copy the **Base64 encoded** key

### **Example Output:**
```
Your Encryption Key: 8KpN2vX9Qm4R7Hs1Jk3Fg6Wc5Tb8Ye2Zx4Aq9Mn0Lv=
```

⚠️ **CRITICAL**: Save this key in a secure location!

---

## 🛠️ Step 2: Configure Supabase Secret

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard

2. **Navigate to Your Project**
   - Select: **Bitcoin Nail Bar** project

3. **Open Edge Functions Settings**
   - Click: **Edge Functions** (sidebar)
   - Click: **Settings** tab
   - Scroll to: **Secrets**

4. **Add New Secret**
   - Click: **"Add New Secret"**
   - Name: `VLINKPAY_ENCRYPTION_KEY`
   - Value: `[Paste your generated key from Step 1]`
   - Click: **"Save"**

### **Screenshot Guide:**
```
Project Settings → Edge Functions → Secrets
┌─────────────────────────────────────────┐
│ Name: VLINKPAY_ENCRYPTION_KEY          │
│ Value: 8KpN2vX9Qm4R7Hs1...            │  ← Paste here
│                                         │
│ [Cancel]           [Save Secret] ✓     │
└─────────────────────────────────────────┘
```

---

## ✅ Step 3: Verify Setup

### **Test Encryption:**

1. **Go to Admin Panel**
   - Navigate to: `/admin/vlinkpay-settings`

2. **Enter Settings**
   ```
   Merchant Ref Code:  TEST-MERCHANT-001
   API Key:            my-secret-api-key-12345
   Sandbox Endpoint:   https://test-web-app.vlinkpay.com
   Redirect URL:       https://yoursite.com/membership?payment=success
   ```

3. **Click "Save Settings"**

4. **Check Backend Logs** (Supabase Dashboard → Edge Functions → Logs)
   ```
   ✅ Expected Output:
   🔐 [VLINKPAY SETTINGS] Encrypting API key...
   ✅ [VLINKPAY SETTINGS] API key encrypted successfully
   💾 [VLINKPAY SETTINGS] Attempting to save to KV...
   ✅ [VLINKPAY SETTINGS] Settings saved successfully to database
   ```

5. **Check Database**
   - Go to: **Table Editor** → `kv_store_89edbd69`
   - Find row with key: `vlinkpay_settings`
   - Check `apiKey` field → Should see encrypted text like:
     ```
     IYu4Xp9Km3Hs7Jk2Fg...  (Base64 gibberish - encrypted!)
     ```
   - ❌ Should NOT see your plain API key!

---

## 🔍 Step 4: Verify Decryption Works

### **Test Payment Flow:**

1. **Navigate to Membership Page**
   - Go to: `/membership`

2. **Click "Join Now" on any tier**

3. **Enter email and proceed**

4. **Check Backend Logs**
   ```
   ✅ Expected Output:
   💳 [PAYMENT] Creating payment link...
   🔐 [DECRYPTION] Decrypting API key...
   ✅ [PAYMENT] Payment link created successfully
   ```

5. **If you see errors:**
   ```
   ❌ Error: VLINKPAY_ENCRYPTION_KEY environment variable not set
   → Go back to Step 2, check if secret was saved correctly
   
   ❌ Error: Decryption failed
   → Encryption key mismatch
   → Delete settings, re-save with correct encryption key
   ```

---

## 🔐 How It Works (Technical)

### **Encryption Flow:**
```
User enters API Key: "my-secret-key"
         ↓
Frontend sends to backend (HTTPS encrypted)
         ↓
Backend receives: "my-secret-key"
         ↓
Generates random IV (12 bytes)
         ↓
AES-256-GCM encryption
         ↓
Encrypted output: "IYu4Xp9Km3Hs7Jk2Fg6Wc5Tb8Ye2Zx..."
         ↓
Saved to database (encrypted)
```

### **Decryption Flow:**
```
Payment request received
         ↓
Load settings from database
         ↓
Get encrypted API Key: "IYu4Xp9Km3Hs7Jk2Fg6Wc5Tb8Ye2Zx..."
         ↓
Extract IV (first 12 bytes)
         ↓
AES-256-GCM decryption
         ↓
Original API Key: "my-secret-key"
         ↓
Use for VLINKPAY API call
```

### **Security Features:**

1. **AES-256-GCM**
   - 256-bit key = 2^256 possible keys (unbreakable)
   - GCM mode = Authenticated encryption (prevents tampering)

2. **Random IV**
   - Each encryption uses different IV
   - Same API key encrypted twice = different ciphertext

3. **Environment Variable**
   - Encryption key NEVER in code
   - Stored in Supabase Secrets (separate from database)

4. **Authentication Tag**
   - 128-bit tag prevents modification
   - If data tampered → decryption fails

---

## 📊 Security Comparison

### **BEFORE (Plain Text):**
```
Database Entry:
{
  "apiKey": "my-secret-api-key-12345"  ❌ Anyone can read!
}

Risk Level: 🔴 HIGH
- Database admin can see API key
- Backup leaks expose API key
- Logs may contain API key
```

### **AFTER (Encrypted):**
```
Database Entry:
{
  "apiKey": "IYu4Xp9Km3Hs7Jk2Fg6Wc5Tb8Ye2Zx4Aq9Mn0LvPqRsT..."  ✅ Gibberish!
}

Risk Level: 🟢 LOW
- Database admin sees encrypted data (useless without encryption key)
- Backup leaks don't expose API key
- Logs show encrypted values only
```

---

## ⚠️ Important Security Notes

### **✅ DO:**
- ✅ Keep `VLINKPAY_ENCRYPTION_KEY` secret
- ✅ Use unique encryption key for each environment (dev/staging/prod)
- ✅ Backup encryption key in secure password manager
- ✅ Rotate encryption key every 6-12 months

### **❌ DON'T:**
- ❌ Share encryption key via email/chat
- ❌ Commit encryption key to GitHub
- ❌ Store encryption key in frontend code
- ❌ Reuse encryption key across multiple projects

---

## 🔄 Rotating Encryption Key (Advanced)

If you need to change the encryption key:

1. **Generate new key** (Step 1)
2. **Save old settings** (export from database)
3. **Update Supabase secret** with new key
4. **Re-enter API Key** in admin panel
   - Old encrypted data will fail to decrypt (expected)
   - New encryption will use new key

---

## 🆘 Troubleshooting

### **Problem: "Encryption key not set" error**

**Solution:**
1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Verify `VLINKPAY_ENCRYPTION_KEY` exists
3. If missing, add it (Step 2)
4. Redeploy edge functions:
   ```bash
   supabase functions deploy
   ```

### **Problem: "Decryption failed" error**

**Solution:**
1. Check if encryption key was changed
2. Go to `/admin/vlinkpay-settings`
3. Re-enter ALL fields (including API Key)
4. Click "Save Settings"

### **Problem: Encryption key lost**

**Solution:**
- ❌ Old encrypted data is UNRECOVERABLE
- ✅ Generate new encryption key
- ✅ Configure in Supabase (Step 2)
- ✅ Re-enter API Key in admin panel

---

## 📝 Summary Checklist

- [ ] Generated 32-byte encryption key (Step 1)
- [ ] Added `VLINKPAY_ENCRYPTION_KEY` to Supabase Secrets (Step 2)
- [ ] Tested encryption by saving settings (Step 3)
- [ ] Verified database shows encrypted data (Step 3)
- [ ] Tested decryption by creating payment link (Step 4)
- [ ] Backed up encryption key in password manager
- [ ] Documented encryption key location (secure note)

---

## 🎯 Quick Reference

**Environment Variable Name:**
```
VLINKPAY_ENCRYPTION_KEY
```

**Location:**
```
Supabase Dashboard → Project Settings → Edge Functions → Secrets
```

**Key Format:**
```
Base64 string (exactly 32 bytes when decoded)
Example: 8KpN2vX9Qm4R7Hs1Jk3Fg6Wc5Tb8Ye2Zx4Aq9Mn0Lv=
```

**Test Command (Browser Console):**
```javascript
// Generate new key
crypto.getRandomValues(new Uint8Array(32));
```

---

**✅ Encryption Setup Complete!**

Your VLINKPAY API Key is now protected with military-grade encryption. 🔐🎉
