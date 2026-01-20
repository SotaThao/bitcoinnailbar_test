# 🔐 JWT Authentication Architecture

## Overview
Bitcoin Nail Bar sử dụng **JWT (JSON Web Tokens)** cho authentication & authorization, hỗ trợ **Role-Based Access Control (RBAC)** với permissions chi tiết.

---

## 🏗️ Architecture

### Flow:
```
1. User Login → Backend verifies credentials
2. Backend generates JWT (signed with secret key)
3. JWT contains: user_id, email, role, permissions
4. Frontend stores JWT in localStorage
5. Every API request sends: Authorization: Bearer {jwt}
6. Backend verifies JWT signature & decodes payload
7. Backend checks permissions from JWT payload
```

---

## 🎫 JWT Structure

### Header:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload (Claims):
```json
{
  "sub": "user-uuid-123",           // Subject (User ID)
  "email": "admin@example.com",
  "role": "owner",                  // owner | admin | manager | staff
  "full_name": "John Doe",
  "permissions": {
    "can_manage_services": true,
    "can_manage_staff": true,
    "can_view_reports": true,
    "can_manage_appointments": true,
    "can_process_payments": true,
    "can_view_analytics": true,
    "can_manage_settings": true
  },
  "iat": 1234567890,                // Issued At
  "exp": 1234987890                 // Expiration (7 days)
}
```

### Signature:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

---

## 👥 Roles & Permissions

### Role Hierarchy:
1. **Owner** - Full access (all permissions = true)
2. **Admin** - Customizable permissions
3. **Manager** - Limited permissions
4. **Staff** - View-only permissions

### Permission Matrix:

| Permission                  | Owner | Admin | Manager | Staff |
|-----------------------------|-------|-------|---------|-------|
| can_manage_services         | ✅    | ✅    | ❌      | ❌    |
| can_manage_staff            | ✅    | ✅    | ❌      | ❌    |
| can_view_reports            | ✅    | ✅    | ✅      | ❌    |
| can_manage_appointments     | ✅    | ✅    | ✅      | ✅    |
| can_process_payments        | ✅    | ✅    | ✅      | ❌    |
| can_view_analytics          | ✅    | ✅    | ✅      | ❌    |
| can_manage_settings         | ✅    | ❌    | ❌      | ❌    |

---

## 🛠️ Backend Implementation

### Generate JWT (Login):
```typescript
const generateJWT = async (user: User): Promise<string> => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    permissions: user.permissions,
  };

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return jwt;
};
```

### Verify JWT:
```typescript
const verifyJWT = async (token: string): Promise<any> => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
};
```

### Protected Route Middleware:
```typescript
const requireAuth = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Missing authorization header' }, 401);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('user', payload);
  await next();
};
```

### Permission Check Middleware:
```typescript
const requirePermission = (permission: string) => {
  return async (c: any, next: any) => {
    const user = c.get('user');
    
    // Owner has all permissions
    if (user.role === 'owner') {
      await next();
      return;
    }

    // Check permission
    if (!user.permissions?.[permission]) {
      return c.json({ error: 'Permission denied' }, 403);
    }

    await next();
  };
};
```

### Usage Example:
```typescript
// Protected route with permission check
app.delete(
  '/make-server-84f9c112/services/:id',
  requireAuth,
  requirePermission('can_manage_services'),
  async (c) => {
    // Only users with can_manage_services can access
    const user = c.get('user');
    console.log(`User ${user.email} deleting service...`);
    // ... delete logic
  }
);
```

---

## 💻 Frontend Implementation

### Store JWT after login:
```typescript
// utils/auth.ts
export const saveSession = (token: string, expiresAt: string) => {
  localStorage.setItem('admin_session', JSON.stringify({
    token,
    expiresAt,
  }));
};
```

### Send JWT with requests:
```typescript
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${session.token}`,
  },
});
```

### Check permissions in UI:
```typescript
const session = getSession();
if (!session) return null;

// Decode JWT (client-side only for UI logic)
const payload = JSON.parse(atob(session.token.split('.')[1]));

// Conditional rendering based on permissions
{payload.permissions.can_manage_services && (
  <Button>Edit Services</Button>
)}
```

---

## 🔒 Security Best Practices

### ✅ Implemented:
- JWT signed with HMAC-SHA256
- 7-day expiration
- HTTPS only (Supabase Edge Functions)
- No sensitive data in payload
- Token stored in localStorage (XSS protection via CSP)

### 🚀 Future Enhancements:
- [ ] Refresh token mechanism
- [ ] Token revocation (blacklist)
- [ ] Rate limiting per user
- [ ] IP address validation
- [ ] Device fingerprinting

---

## 📋 Testing Flow

### 1. Test Login:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/make-server-84f9c112/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-24T12:00:00Z",
    "user": { ... }
  }
}
```

### 2. Test Verify:
```bash
curl https://your-project.supabase.co/functions/v1/make-server-84f9c112/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "payload": {
      "sub": "user-id",
      "role": "owner",
      "permissions": { ... }
    }
  }
}
```

---

## 🐛 Debugging

### Decode JWT (Browser Console):
```javascript
const token = localStorage.getItem('admin_session');
const payload = JSON.parse(atob(JSON.parse(token).token.split('.')[1]));
console.log('JWT Payload:', payload);
```

### Check Expiration:
```javascript
const exp = payload.exp * 1000; // Convert to milliseconds
const isExpired = Date.now() > exp;
console.log('Expired:', isExpired);
```

### Debug Endpoints:
- `/admin/test-jwt` - JWT test interface
- `/admin/debug-auth` - Auth debugging tools

---

## 📊 Scalability

JWT authentication là **stateless** - backend không cần lưu session trong database:

✅ **Benefits:**
- Horizontal scaling (no session store)
- Fast verification (no DB query)
- Microservices-ready
- Multi-tenant support

✅ **Multi-Account Support:**
- Each user has unique JWT
- Permissions embedded in token
- Easy to add new roles/permissions
- Support unlimited concurrent users

---

## 🔄 Token Refresh (Future)

**Strategy:** Refresh token rotation
```
1. Login → Return access_token (15min) + refresh_token (7days)
2. Access token expires → Use refresh_token to get new access_token
3. Refresh token used → Issue new refresh_token (rotation)
4. Old refresh_token invalidated
```

**Implementation:**
```typescript
app.post('/auth/refresh', async (c) => {
  const { refresh_token } = await c.req.json();
  
  // Verify refresh token
  const payload = await verifyJWT(refresh_token);
  if (!payload) return c.json({ error: 'Invalid refresh token' }, 401);
  
  // Generate new tokens
  const new_access_token = await generateJWT(user, '15m');
  const new_refresh_token = await generateJWT(user, '7d');
  
  // Invalidate old refresh token (store in blacklist)
  await kv.set(`blacklist:${refresh_token}`, true);
  
  return c.json({
    access_token: new_access_token,
    refresh_token: new_refresh_token,
  });
});
```

---

## 📚 References

- **JWT Standard:** https://jwt.io
- **Jose Library:** https://github.com/panva/jose
- **RBAC Best Practices:** https://auth0.com/docs/manage-users/access-control/rbac
- **OWASP JWT Security:** https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

---

**Last Updated:** January 20, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
