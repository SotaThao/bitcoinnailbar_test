# METADATA MIGRATION GUIDE

## 📅 Implementation Date: January 22, 2025

---

## 🎯 What Changed?

### Before (Old System)
```json
{
  "key": "customer:xxx",
  "value": {
    "phone": "5551234567",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### After (New System with Metadata)
```json
{
  "key": "customer:xxx",
  "value": {
    "phone": "5551234567",
    "name": "John Doe",
    "email": "john@example.com",
    "_meta": {
      "entity_type": "customer",
      "status": "active",
      "created_at": "2025-01-22T10:00:00Z",
      "updated_at": "2025-01-22T10:00:00Z",
      "version": "1.0"
    }
  }
}
```

---

## 🚀 What You Get

### ✅ Benefits

1. **Better Organization**
   - Clear entity types (customer, order, membership, etc.)
   - Standardized status tracking (active, pending, expired, etc.)
   - Automatic timestamps (created_at, updated_at)

2. **Easier Queries**
   ```typescript
   // Before: Manual filtering
   const active = customers.filter(c => !c.is_deleted && c.status === 'active');
   
   // After: Helper functions
   const active = getActive(customers);
   ```

3. **No Breaking Changes**
   - Existing data still works
   - Gradual migration (no downtime)
   - Backward compatible helpers

4. **Future-Proof**
   - Version field for schema migrations
   - Tags for categorization
   - Parent relationships support

---

## 📋 Migration Steps

### Step 1: Check Current Status

**Request:**
```bash
GET /make-server-84f9c112/admin/migrate/status
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "with_metadata": 0,
    "without_metadata": 150,
    "percentage": 0,
    "need_migration": true
  }
}
```

---

### Step 2: List Key Prefixes

**Request:**
```bash
GET /make-server-84f9c112/admin/migrate/prefixes
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "prefix": "customer:", "count": 50 },
    { "prefix": "order:", "count": 30 },
    { "prefix": "membership:", "count": 20 },
    { "prefix": "redeem_code:", "count": 25 },
    { "prefix": "user:", "count": 10 },
    { "prefix": "notification:", "count": 15 }
  ]
}
```

---

### Step 3: Migrate by Priority

Migrate entities in this order:

#### 3.1 Migrate Customers (Highest Priority)
```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "prefix": "customer:"
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Migration completed for prefix \"customer:\"",
  "data": {
    "total": 50,
    "migrated": 50,
    "skipped": 0,
    "failed": 0,
    "errors": []
  }
}
```

#### 3.2 Migrate Orders
```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "prefix": "order:"
}
```

#### 3.3 Migrate Memberships
```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "prefix": "membership:"
}
```

#### 3.4 Migrate Redeem Codes
```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "prefix": "redeem_code:"
}
```

#### 3.5 Migrate Users & Permissions
```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "prefix": "user:"
}
```

```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "prefix": "permissions:"
}
```

---

### Step 4: Verify Migration

**Request:**
```bash
GET /make-server-84f9c112/admin/migrate/status
Authorization: Bearer YOUR_TOKEN
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "with_metadata": 150,
    "without_metadata": 0,
    "percentage": 100,
    "need_migration": false,
    "stats": {
      "total": 150,
      "by_type": {
        "customer": 50,
        "order": 30,
        "membership": 20,
        "redeem_code": 25,
        "user": 10,
        "notification": 15
      },
      "by_status": {
        "active": 100,
        "pending": 20,
        "expired": 15,
        "completed": 15
      }
    }
  }
}
```

---

## 🔧 For Developers

### Using Metadata in New Code

#### Example 1: Create Customer
```typescript
import { withMetadata } from './metadata.tsx';

// OLD WAY (still works but not recommended)
const customer = {
  phone: "5551234567",
  full_name: "John Doe",
  email: "john@example.com"
};
await kv.set('customer:xxx', customer);

// NEW WAY (recommended)
const customer = withMetadata(
  {
    phone: "5551234567",
    full_name: "John Doe",
    email: "john@example.com"
  },
  'customer',
  'active'
);
await kv.set('customer:xxx', customer);
```

#### Example 2: Update Entity
```typescript
import { updateMetadata } from './metadata.tsx';

// Fetch entity
const customer = await kv.get('customer:xxx');

// Update with metadata
const updated = {
  ...customer,
  email: "newemail@example.com",
  _meta: updateMetadata(customer._meta, { status: 'active' })
};

await kv.set('customer:xxx', updated);
```

#### Example 3: Query Active Entities
```typescript
import { getActive, sortByCreatedAt } from './metadata.tsx';

// Get all customers
const allCustomers = await kv.getByPrefix('customer:');

// Filter active only
const activeCustomers = getActive(allCustomers);

// Sort by date
const sorted = sortByCreatedAt(activeCustomers, 'desc');
```

---

## ⚠️ Important Notes

### 1. Migration is Safe
- ✅ Non-destructive (preserves all existing data)
- ✅ Idempotent (can run multiple times)
- ✅ Backward compatible (old code still works)

### 2. No Downtime Required
- Migration can run while system is live
- Existing queries continue to work
- Gradual adoption (migrate entity by entity)

### 3. Authorization
- Only **Owner** role can trigger migrations
- Regular users cannot access migration endpoints

### 4. Automatic Status Inference
Migration automatically infers status from existing data:
- `is_active: false` → `status: "inactive"`
- `is_deleted: true` → `status: "deleted"`
- `expiresAt < now` → `status: "expired"`
- `redeemedAt exists` → `status: "used"`
- Default → `status: "active"`

---

## 🐛 Troubleshooting

### Issue: Migration shows errors

**Check error details:**
```json
{
  "success": true,
  "data": {
    "failed": 2,
    "errors": [
      {
        "key": "customer:xxx",
        "error": "Invalid JSON"
      }
    ]
  }
}
```

**Solution:** Manually inspect and fix corrupted entries.

---

### Issue: Some entities missing metadata after migration

**Cause:** Migration was interrupted or entity was created after migration

**Solution:** Re-run migration for that prefix:
```bash
POST /admin/migrate/prefix
{ "prefix": "customer:" }
```

---

### Issue: Migration taking too long

**Cause:** Large dataset (1000+ entities)

**Solution:** 
1. Migrate by prefix (not all at once)
2. Run during low-traffic hours
3. Monitor logs for progress

---

## 📊 Performance Impact

### Before Migration
- Query time: ~100ms for 100 entities
- Storage: ~50KB per 100 entities

### After Migration
- Query time: ~100ms (no change)
- Storage: ~55KB per 100 entities (+10% for metadata)
- Benefit: Faster filtered queries with helper functions

**Verdict:** Negligible performance impact, significant DX improvement.

---

## 📚 Resources

### Documentation
- [METADATA_SYSTEM.md](../02-api/METADATA_SYSTEM.md) - Full metadata guide
- [DATABASE_STRUCTURE.md](../01-architecture/DATABASE_STRUCTURE.md) - Database schema
- [QUICK_REFERENCE.md](../03-guides/QUICK_REFERENCE.md) - Quick reference

### Code Files
- `/supabase/functions/server/metadata.tsx` - Helper functions
- `/supabase/functions/server/migrate-metadata.tsx` - Migration utilities
- `/supabase/functions/server/admin-migration.tsx` - Migration endpoints

---

## ✅ Post-Migration Checklist

- [ ] Run migration status check
- [ ] Migrate all entity types
- [ ] Verify 100% migration (percentage = 100)
- [ ] Test queries with new helper functions
- [ ] Update backend code to use metadata helpers
- [ ] Test entity creation (should include metadata)
- [ ] Test entity updates (should update metadata)
- [ ] Monitor logs for errors

---

## 🎓 Next Steps

1. ✅ **Read Documentation**
   - Start with [METADATA_SYSTEM.md](../02-api/METADATA_SYSTEM.md)
   - Reference [QUICK_REFERENCE.md](../03-guides/QUICK_REFERENCE.md) for common tasks

2. ✅ **Run Migration**
   - Follow steps above
   - Verify with status endpoint

3. ✅ **Update Code**
   - Use `withMetadata()` for new entities
   - Use helper functions for queries
   - Remove metadata before client responses

4. ✅ **Monitor**
   - Check logs for any issues
   - Verify new entities have metadata
   - Test existing functionality

---

## 🙋 Need Help?

If you encounter issues during migration:

1. Check server logs for detailed error messages
2. Review error array in migration response
3. Manually inspect problematic entities in Supabase dashboard
4. Contact system administrator with error details
