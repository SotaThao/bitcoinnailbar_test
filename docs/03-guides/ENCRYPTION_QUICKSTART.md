# 🔐 ENCRYPTION QUICK START GUIDE

**Purpose:** Setup VLINKPAY API key encryption  
**Time Required:** 5-10 minutes  
**Status:** ✅ Production Ready

---

## 🎯 WHAT THIS DOES

Encrypts your VLINKPAY API keys before storing in database using AES-256-GCM encryption.

**Security Benefits:**
- ✅ API keys encrypted at rest
- ✅ Even if database is compromised, keys are unreadable
- ✅ Encryption key stored separately in Supabase secrets

---

## ⚡ QUICK START (3 STEPS)

### **Step 1: Generate Encryption Key**

1. Open `/docs/03-guides/ENCRYPTION_KEY_GENERATOR.html` in browser
2. Click "Generate Encryption Key"
3. Click "Copy to Clipboard"

### **Step 2: Add to Supabase Secrets**

1. Go to Supabase Dashboard → Your Project
2. Navigate to: **Edge Functions** → **Secrets**
3. Click "+ Add Secret"
4. Enter:
   - Name: `VLINKPAY_ENCRYPTION_KEY`
   - Value: [Paste your copied key]
5. Click "Save"

### **Step 3: Configure VLINKPAY Settings**

1. Go to your app: `/admin/vlinkpay-settings`
2. Enter your VLINKPAY credentials
3. Click "Save Settings"

**Done!** ✅ Your API keys are now encrypted.

---

## 🐛 TROUBLESHOOTING

### **Error: "Decryption failed"**

**Cause:** Encryption key changed or missing

**Fix:**
```bash
# Verify secret exists
supabase secrets list --project-ref [YOUR_REF]

# Should show:
# VLINKPAY_ENCRYPTION_KEY=***hidden***

# If missing, add it (see Step 2)
```

---

### **Error: "VLINKPAY_ENCRYPTION_KEY environment variable not set"**

**Cause:** Secret not configured in Supabase

**Fix:** Follow Step 2 above to add the secret.

---

### **Error: "Unsupported state or unable to authenticate data"**

**Cause:** Wrong encryption key used

**Fix:**
1. Generate a NEW encryption key
2. Update Supabase secret
3. Re-save VLINKPAY settings in admin panel

⚠️ **Warning:** Old encrypted data cannot be decrypted with new key. You must re-enter credentials.

---

## 🔒 SECURITY BEST PRACTICES

1. ✅ **Never commit encryption key to Git**
2. ✅ **Store key only in Supabase secrets**
3. ✅ **Generate a unique key per environment (staging/production)**
4. ✅ **Keep backup of encryption key in secure password manager**
5. ✅ **Rotate encryption key periodically (every 6-12 months)**

---

## 📝 HOW IT WORKS

### **Encryption Flow:**
```
User enters API key → Frontend encrypts (AES-256-GCM) → Saves encrypted to DB
```

### **Decryption Flow:**
```
Backend reads encrypted key → Decrypts using encryption key → Uses for API calls
```

### **Algorithm:**
- **Cipher:** AES-256-GCM
- **Key Size:** 256 bits (32 bytes)
- **IV Size:** 96 bits (12 bytes, random per encryption)
- **Auth Tag:** 128 bits (included in output)

---

## 🔄 KEY ROTATION

**When to rotate:**
- Every 6-12 months (recommended)
- After security incident
- When staff with key access leaves

**How to rotate:**
1. Generate new encryption key
2. Add as new Supabase secret (e.g., `VLINKPAY_ENCRYPTION_KEY_V2`)
3. Update backend code to use new key
4. Re-encrypt all existing data
5. Delete old key

---

## ✅ VERIFICATION CHECKLIST

- [ ] Encryption key generated
- [ ] Key added to Supabase secrets
- [ ] VLINKPAY settings saved successfully
- [ ] Payment link creation works
- [ ] No "decryption failed" errors in logs
- [ ] Key backed up securely

---

**For HTML key generator, see:** `/docs/03-guides/ENCRYPTION_KEY_GENERATOR.html`  
**Last Updated:** January 21, 2026  
**Status:** Complete ✅
