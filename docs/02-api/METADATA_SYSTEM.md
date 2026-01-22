# METADATA SYSTEM - KV STORE ENHANCEMENT

## 📋 Overview

The **Metadata System** is a progressive enhancement to the KV store that adds structured metadata to all entities without requiring database schema changes.

### Problem
- KV store only has 2 columns: `key` and `value`
- Difficult to query by entity type, status, or timestamps
- No standardized way to track entity lifecycle
- Hard to implement soft deletes, expiration, or status tracking

### Solution
- Store metadata **inside** the `value` JSON as `_meta` field
- Backward compatible (existing data still works)
- Progressive migration (can be applied gradually)
- Type-safe helpers for common operations

---

## 🏗️ Structure

### Metadata Schema

```typescript
{
  "_meta": {
    "entity_type": "customer",           // Type of entity
    "status": "active",                  // Current status
    "created_at": "2025-01-22T10:00:00Z", // Creation timestamp
    "updated_at": "2025-01-22T10:00:00Z", // Last update timestamp
    "version": "1.0",                    // Schema version
    "tags": ["vip", "regular"],          // Optional tags
    "parent_id": "order:xxx"             // Optional parent reference
  },
  // ... rest of entity data
}
```

### Entity Types

```typescript
type EntityType =
  | 'customer'           // Customer profiles
  | 'membership'         // Active memberships
  | 'order'              // Payment orders
  | 'redeem_code'        // Redeem codes
  | 'user'               // Admin/staff users
  | 'permissions'        // User permissions
  | 'notification'       // Check-in notifications
  | 'branch'             // Store locations
  | 'settings'           // System settings
  | 'gallery'            // Gallery images
  | 'menu'               // Menu images
  | 'promotion'          // Promotions
  | 'service'            // Services
  | 'appointment'        // Appointments
  | 'redeem_history'     // Redemption history
  | 'role';              // User roles
```

### Status Values

```typescript
type EntityStatus =
  | 'active'             // Currently active/valid
  | 'inactive'           // Deactivated but not deleted
  | 'pending'            // Awaiting action
  | 'pending_payment'    // Waiting for payment
  | 'completed'          // Finished/processed
  | 'expired'            // Past expiration date
  | 'used'               // Already consumed/redeemed
  | 'cancelled'          // Cancelled by user/admin
  | 'deleted';           // Soft deleted
```

---

## 🚀 Usage

### Creating Entity with Metadata

```typescript
import { withMetadata } from './metadata.tsx';

// Create customer with metadata
const customer = withMetadata(
  {
    phone: "5551234567",
    name: "John Doe",
    email: "john@example.com"
  },
  'customer',      // entity_type
  'active'         // status
);

await kv.set('customer:5551234567', customer);
```

### Updating Entity

```typescript
import { updateMetadata } from './metadata.tsx';

// Get existing entity
const customer = await kv.get('customer:5551234567');

// Update data and metadata
const updated = {
  ...customer,
  name: "John Smith",
  _meta: updateMetadata(customer._meta, { status: 'inactive' })
};

await kv.set('customer:5551234567', updated);
```

### Querying Entities

```typescript
import { filterByStatus, filterByType, sortByCreatedAt } from './metadata.tsx';

// Get all customers
const allCustomers = await kv.getByPrefix('customer:');

// Filter by status
const activeCustomers = filterByStatus(allCustomers, 'active');

// Sort by creation date
const sorted = sortByCreatedAt(activeCustomers, 'desc');

// Get only active entities
import { getActive } from './metadata.tsx';
const active = getActive(allCustomers);
```

### Removing Metadata for Response

```typescript
import { withoutMetadata } from './metadata.tsx';

// Remove metadata before sending to client
const customer = await kv.get('customer:xxx');
const response = withoutMetadata(customer);

return c.json({ data: response });
```

---

## 🔄 Migration

### Check Migration Status

```bash
GET /make-server-84f9c112/admin/migrate/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "with_metadata": 120,
    "without_metadata": 30,
    "percentage": 80,
    "need_migration": true,
    "stats": {
      "total": 120,
      "by_type": {
        "customer": 50,
        "order": 30,
        "membership": 20
      },
      "by_status": {
        "active": 100,
        "expired": 20
      }
    }
  }
}
```

### List Key Prefixes

```bash
GET /make-server-84f9c112/admin/migrate/prefixes
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "prefix": "customer:", "count": 50 },
    { "prefix": "order:", "count": 30 },
    { "prefix": "membership:", "count": 20 }
  ]
}
```

### Migrate by Prefix

```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json

{
  "prefix": "customer:"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Migration completed for prefix \"customer:\"",
  "data": {
    "total": 50,
    "migrated": 45,
    "skipped": 5,
    "failed": 0,
    "errors": []
  }
}
```

### Migrate All Entities

```bash
POST /make-server-84f9c112/admin/migrate/all
```

**Response:**
```json
{
  "success": true,
  "message": "Migration completed",
  "data": {
    "total": 150,
    "migrated": 30,
    "skipped": 120,
    "failed": 0,
    "errors": []
  }
}
```

---

## 📊 Helper Functions Reference

### Creation & Update

| Function | Description |
|----------|-------------|
| `createMetadata(type, status)` | Create new metadata object |
| `updateMetadata(existing, updates)` | Update existing metadata |
| `withMetadata(data, type, status)` | Add metadata to entity |
| `withoutMetadata(entity)` | Remove metadata from entity |
| `getMetadata(entity)` | Extract metadata from entity |
| `hasMetadata(entity)` | Check if entity has metadata |

### Filtering

| Function | Description |
|----------|-------------|
| `filterByType(entities, type)` | Filter by entity type |
| `filterByStatus(entities, status)` | Filter by status |
| `filterByTags(entities, tags)` | Filter by tags |
| `filterByParent(entities, parent_id)` | Filter by parent |
| `getActive(entities)` | Get only active entities |
| `getPending(entities)` | Get pending entities |
| `getExpired(entities)` | Get expired entities |

### Sorting

| Function | Description |
|----------|-------------|
| `sortByCreatedAt(entities, order)` | Sort by creation date |
| `sortByUpdatedAt(entities, order)` | Sort by update date |

### Migration

| Function | Description |
|----------|-------------|
| `migrateEntity(data, type)` | Migrate single entity |
| `migrateEntities(entities, type)` | Migrate array of entities |
| `validateMetadata(meta)` | Validate metadata structure |
| `validateEntity(entity)` | Validate entity with metadata |

### Analytics

| Function | Description |
|----------|-------------|
| `getEntityStats(entities)` | Get statistics about entities |

---

## 🎯 Best Practices

### 1. Always Use Metadata for New Entities

✅ **Good:**
```typescript
const customer = withMetadata(
  { phone, name, email },
  'customer',
  'active'
);
await kv.set('customer:xxx', customer);
```

❌ **Bad:**
```typescript
// Missing metadata
await kv.set('customer:xxx', { phone, name, email });
```

### 2. Update Metadata When Changing Status

✅ **Good:**
```typescript
const updated = {
  ...entity,
  _meta: updateMetadata(entity._meta, { status: 'inactive' })
};
```

❌ **Bad:**
```typescript
// Metadata not updated
const updated = { ...entity, status: 'inactive' };
```

### 3. Remove Metadata Before Sending to Client

✅ **Good:**
```typescript
const response = withoutMetadata(entity);
return c.json({ data: response });
```

❌ **Bad:**
```typescript
// Exposing internal metadata to client
return c.json({ data: entity });
```

### 4. Use Helper Functions for Queries

✅ **Good:**
```typescript
const active = getActive(customers);
const sorted = sortByCreatedAt(active, 'desc');
```

❌ **Bad:**
```typescript
// Manual filtering
const active = customers.filter(c => c._meta?.status === 'active');
```

---

## 🔍 Examples

### Example 1: Customer Management

```typescript
import { withMetadata, updateMetadata, filterByStatus } from './metadata.tsx';

// Create new customer
const newCustomer = withMetadata(
  { phone: "5551234567", name: "John Doe" },
  'customer',
  'active'
);
await kv.set('customer:5551234567', newCustomer);

// Update customer status
const customer = await kv.get('customer:5551234567');
const updated = {
  ...customer,
  _meta: updateMetadata(customer._meta, { status: 'inactive' })
};
await kv.set('customer:5551234567', updated);

// Query active customers
const allCustomers = await kv.getByPrefix('customer:');
const activeCustomers = filterByStatus(allCustomers, 'active');
```

### Example 2: Order Lifecycle

```typescript
// Create pending order
const order = withMetadata(
  { merchantOrderCode: "ORDER-123", amount: 100 },
  'order',
  'pending_payment'
);
await kv.set('order:ORDER-123', order);

// Mark as completed
const existing = await kv.get('order:ORDER-123');
const completed = {
  ...existing,
  paymentCompletedAt: new Date().toISOString(),
  _meta: updateMetadata(existing._meta, { status: 'completed' })
};
await kv.set('order:ORDER-123', completed);
```

### Example 3: Membership Expiration

```typescript
import { getExpired } from './metadata.tsx';

// Get all memberships
const memberships = await kv.getByPrefix('membership:');

// Filter expired
const expired = getExpired(memberships);

// Update to expired status
for (const membership of expired) {
  if (new Date(membership.expiresAt) < new Date()) {
    const updated = {
      ...membership,
      _meta: updateMetadata(membership._meta, { status: 'expired' })
    };
    await kv.set(`membership:${membership.phone}`, updated);
  }
}
```

---

## ⚠️ Important Notes

1. **Backward Compatibility**: Old entities without metadata will still work. Helpers gracefully handle missing metadata.

2. **Migration Safety**: Migration is:
   - Non-destructive (preserves all data)
   - Idempotent (can run multiple times)
   - Gradual (can migrate by prefix)

3. **Performance**: Metadata adds ~100 bytes per entity. Negligible for most use cases.

4. **Authorization**: Migration endpoints require **Owner** role.

5. **Version Field**: Use `version` to track schema changes for future migrations.

---

## 🚨 Troubleshooting

### Issue: Entity missing metadata after creation

**Cause**: Not using `withMetadata()` helper

**Solution**: Always use helper functions:
```typescript
const entity = withMetadata(data, 'customer', 'active');
```

### Issue: Migration shows errors

**Cause**: Invalid JSON in KV store

**Solution**: Check error details in migration response and fix manually

### Issue: Status not updating

**Cause**: Not using `updateMetadata()` helper

**Solution**: Use helper to ensure `updated_at` is set:
```typescript
_meta: updateMetadata(existing._meta, { status: 'new_status' })
```

---

## 📚 Related Files

- `/supabase/functions/server/metadata.tsx` - Core metadata helpers
- `/supabase/functions/server/migrate-metadata.tsx` - Migration utilities
- `/supabase/functions/server/admin-migration.tsx` - Migration endpoints
- `/docs/01-architecture/DATABASE_STRUCTURE.md` - Overall DB architecture

---

## 🎓 Next Steps

1. ✅ Run migration status check
2. ✅ Migrate entities by prefix (start with customers)
3. ✅ Update backend code to use metadata helpers
4. ✅ Test queries with new metadata filters
5. ✅ Monitor performance impact
