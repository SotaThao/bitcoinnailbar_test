# VLINKPAY API Integration Guide

## 🎯 Purpose
This guide helps developers integrate the actual VLINKPAY API to replace the placeholder implementation.

---

## 📋 Prerequisites

1. **VLINKPAY Account**: Active merchant account
2. **API Credentials**: 
   - Merchant ID
   - API Key
   - (Optional) Webhook Secret
3. **API Documentation**: From VLINKPAY support

---

## 🔧 Implementation Steps

### Step 1: Update Payment URL Builder

**File**: `/supabase/functions/server/payment.tsx`

**Current Placeholder**:
```typescript
const buildVLinkPayURL = (params: {
  merchantId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  metadata: any;
}): string => {
  // TODO: Implement actual VLINKPAY URL builder
  const baseUrl = 'https://vlinkpay.com/payment';
  const queryParams = new URLSearchParams({
    merchant_id: params.merchantId,
    amount: params.amount.toString(),
    order_info: params.orderInfo,
    return_url: params.returnUrl,
    metadata: JSON.stringify(params.metadata),
  });
  
  return `${baseUrl}?${queryParams.toString()}`;
};
```

**Replace With** (example structure):
```typescript
const buildVLinkPayURL = async (params: {
  merchantId: string;
  apiKey: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  metadata: any;
}): Promise<string> => {
  // 1. Generate signature (refer to VLINKPAY docs)
  const timestamp = Date.now();
  const signatureString = `${params.merchantId}${params.amount}${timestamp}${params.apiKey}`;
  const signature = await generateSignature(signatureString);

  // 2. Call VLINKPAY API to create payment session
  const response = await fetch('https://api.vlinkpay.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Merchant-Id': params.merchantId,
      'X-Signature': signature,
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: 'VND',
      description: params.orderInfo,
      return_url: params.returnUrl,
      metadata: params.metadata,
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`VLINKPAY API Error: ${result.message}`);
  }

  // 3. Return payment URL
  return result.payment_url;
};

// Helper function for signature generation
const generateSignature = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
```

---

### Step 2: Add Webhook Handler (Optional)

**File**: `/supabase/functions/server/payment.tsx`

**Add New Route**:
```typescript
// POST /make-server-84f9c112/payment/webhook
app.post('/make-server-84f9c112/payment/webhook', async (c) => {
  try {
    console.log('📨 [WEBHOOK] Received VLINKPAY webhook');
    
    const body = await c.req.json();
    
    // 1. Verify webhook signature
    const signature = c.req.header('X-VLINKPAY-Signature');
    const settings = await kv.get('vlinkpay_settings');
    
    if (!verifyWebhookSignature(body, signature, settings.webhookSecret)) {
      console.error('❌ [WEBHOOK] Invalid signature');
      return c.json({ error: 'Invalid signature' }, 401);
    }

    // 2. Handle payment success
    if (body.status === 'success') {
      const redeemCode = body.metadata?.redeemCode;
      
      if (redeemCode) {
        // Update code status to confirmed
        const redemption = await kv.get(`redeem_code:${redeemCode}`);
        if (redemption) {
          redemption.status = 'confirmed'; // Optional: add intermediate state
          await kv.set(`redeem_code:${redeemCode}`, redemption);
        }

        // Send email with redeem code (implement email service)
        await sendRedeemCodeEmail(body.customer_email, redeemCode);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('❌ [WEBHOOK] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Webhook signature verification
const verifyWebhookSignature = (body: any, signature: string, secret: string): boolean => {
  const payload = JSON.stringify(body);
  const expectedSignature = generateHMAC(payload, secret);
  return signature === expectedSignature;
};

const generateHMAC = (payload: string, secret: string): string => {
  // Implement HMAC-SHA256 (check VLINKPAY docs for exact algorithm)
  // Example using Web Crypto API
  // ...
};
```

---

### Step 3: Update Email Notification

**Current**: Email sent by VLINKPAY after payment

**Add Server-Side Email** (optional):
```typescript
const sendRedeemCodeEmail = async (email: string, code: string) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'Bitcoin Nail Bar <bookings@tnsthao94.online>',
      to: [email],
      subject: 'Your Bitcoin Nail Bar Membership Code',
      html: `
        <h1>Thank You for Your Purchase!</h1>
        <p>Your membership redeem code is:</p>
        <h2 style="font-family: monospace; background: #f0f0f0; padding: 10px;">${code}</h2>
        <p>Redeem it at: https://yoursite.com/membership</p>
      `,
    }),
  });

  return response.json();
};
```

---

### Step 4: Test Connection Endpoint

**Update**: `/supabase/functions/server/vlinkpay-settings.tsx`

```typescript
app.post('/make-server-84f9c112/vlinkpay/test-connection', async (c) => {
  try {
    const settings = await kv.get('vlinkpay_settings');
    
    if (!settings?.isActive) {
      return c.json({ success: false, error: 'Not configured' }, 400);
    }

    // Call VLINKPAY API to verify credentials
    const response = await fetch('https://api.vlinkpay.com/v1/verify', {
      method: 'GET',
      headers: {
        'X-Merchant-Id': settings.merchantId,
        'X-API-Key': settings.apiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Connection failed');
    }

    return c.json({ 
      success: true, 
      message: 'Connection successful',
      data: {
        merchantId: settings.merchantId,
        merchantName: result.merchant_name,
      }
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});
```

---

## 🔒 Security Checklist

- [ ] **API Keys**: Never expose in frontend
- [ ] **Webhook Verification**: Always verify signature
- [ ] **HTTPS Only**: Enforce SSL/TLS
- [ ] **Rate Limiting**: Implement on webhook endpoint
- [ ] **Logging**: Log all payment events
- [ ] **Error Handling**: Never expose sensitive errors to user

---

## 🧪 Testing

### Step 1: Sandbox Environment
```typescript
// Add environment flag
const VLINKPAY_BASE_URL = Deno.env.get('VLINKPAY_ENV') === 'production'
  ? 'https://api.vlinkpay.com'
  : 'https://sandbox.vlinkpay.com';
```

### Step 2: Test Payment
1. Use test merchant credentials
2. Create payment with small amount (1000 VND)
3. Complete payment in sandbox
4. Verify webhook received
5. Check redeem code generated

### Step 3: Test Redemption
1. Copy generated code
2. Enter in Redeem form
3. Verify membership applied
4. Check KV store records

---

## 📞 VLINKPAY Support Resources

- **API Docs**: https://vlinkpay.com/docs
- **Support Email**: support@vlinkpay.com
- **Status Page**: https://status.vlinkpay.com
- **Sandbox**: https://sandbox.vlinkpay.com

---

## 🚨 Common Issues

### Issue 1: Invalid Signature
**Cause**: Wrong signature algorithm or encoding
**Fix**: Check VLINKPAY docs for exact HMAC implementation

### Issue 2: Webhook Not Received
**Cause**: Firewall or wrong URL
**Fix**: 
- Verify webhook URL in VLINKPAY dashboard
- Check Edge Function logs
- Test with webhook.site

### Issue 3: Payment URL Not Opening
**Cause**: Pop-up blocked or CORS
**Fix**:
- Ensure window.open() called from user action
- Check browser console for errors

---

## ✅ Deployment Checklist

Before going live:
- [ ] Obtain production API credentials
- [ ] Update VLINKPAY settings in admin panel
- [ ] Test payment flow end-to-end
- [ ] Configure webhook URL in VLINKPAY dashboard
- [ ] Test webhook delivery
- [ ] Monitor first few transactions
- [ ] Setup error alerting

---

## 📝 Notes

- Keep this guide updated as VLINKPAY API changes
- Document any custom modifications
- Share learnings with team
