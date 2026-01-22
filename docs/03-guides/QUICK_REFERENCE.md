# QUICK REFERENCE - METADATA SYSTEM

## 🎯 Common Tasks

### Creating Entity with Metadata

```typescript
import { withMetadata } from './metadata.tsx';

const entity = withMetadata(
  { /* your data */ },
  'customer',     // entity_type
  'active'        // status
);

await kv.set('customer:xxx', entity);
```

### Updating Entity Status

```typescript
import { updateMetadata } from './metadata.tsx';

const entity = await kv.get('customer:xxx');

const updated = {
  ...entity,
  // update fields
  _meta: updateMetadata(entity._meta, { status: 'inactive' })
};

await kv.set('customer:xxx', updated);
```

### Querying by Status

```typescript
import { filterByStatus } from './metadata.tsx';

const all = await kv.getByPrefix('customer:');
const active = filterByStatus(all, 'active');
const pending = filterByStatus(all, ['pending', 'pending_payment']);
```

### Sorting by Date

```typescript
import { sortByCreatedAt } from './metadata.tsx';

const sorted = sortByCreatedAt(entities, 'desc'); // newest first
```

---

## 📋 Entity Type Quick Map

| Key Prefix | Entity Type | Table | Status Values |
|------------|-------------|-------|---------------|
| `customer:` | `customer` | 89edbd69 | active, inactive, deleted |
| `membership:` | `membership` | 89edbd69 | active, expired |
| `order:` | `order` | 89edbd69 | pending_payment, completed |
| `redeem_code:` | `redeem_code` | 89edbd69 | pending, used, expired |
| `user:` | `user` | 89edbd69 | active, inactive |
| `notification:` | `notification` | 89edbd69 | active |
| `service:` | `service` | 84f9c112 | active, inactive |
| `promotion:` | `promotion` | 84f9c112 | active, expired |

---

## 🔍 Helper Functions Cheat Sheet

### Creation
```typescript
createMetadata(type, status)              // Create metadata object
withMetadata(data, type, status)          // Add metadata to data
updateMetadata(existing, updates)         // Update existing metadata
```

### Extraction
```typescript
withoutMetadata(entity)                   // Remove metadata
getMetadata(entity)                       // Get metadata only
hasMetadata(entity)                       // Check if has metadata
```

### Filtering
```typescript
filterByType(entities, 'customer')        // Filter by type
filterByStatus(entities, 'active')        // Filter by single status
filterByStatus(entities, ['pending', ...]) // Filter by multiple statuses
filterByTags(entities, ['vip'])           // Filter by tags
getActive(entities)                       // Get active only
getPending(entities)                      // Get pending only
getExpired(entities)                      // Get expired only
```

### Sorting
```typescript
sortByCreatedAt(entities, 'desc')         // Sort by created (newest)
sortByUpdatedAt(entities, 'asc')          // Sort by updated (oldest)
```

### Migration
```typescript
migrateEntity(data, 'customer')           // Migrate single entity
migrateEntities(array, 'customer')        // Migrate array
validateMetadata(meta)                    // Validate metadata
validateEntity(entity)                    // Validate entity
```

---

## 📊 Status Flow Examples

### Order Lifecycle
```
pending_payment → completed
```

### Redeem Code Lifecycle
```
pending → used
pending → expired (if past expiresAt)
```

### Membership Lifecycle
```
active → expired (if past expiresAt)
```

### Customer Lifecycle
```
active → inactive (deactivated)
active → deleted (soft delete)
```

---

## 🚀 Migration Commands

### Check Status
```bash
curl -X GET \
  -H "X-Session-Token: YOUR_TOKEN" \
  https://PROJECT.supabase.co/functions/v1/make-server-84f9c112/admin/migrate/status
```

### Migrate Customers
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Session-Token: YOUR_TOKEN" \
  -d '{"prefix":"customer:"}' \
  https://PROJECT.supabase.co/functions/v1/make-server-84f9c112/admin/migrate/prefix
```

### Migrate All
```bash
curl -X POST \
  -H "X-Session-Token: YOUR_TOKEN" \
  https://PROJECT.supabase.co/functions/v1/make-server-84f9c112/admin/migrate/all
```

---

## ⚠️ Common Pitfalls

### ❌ DON'T: Forget to update metadata
```typescript
const updated = { ...entity, name: 'New Name' };
// Missing: _meta.updated_at not updated!
```

### ✅ DO: Use updateMetadata helper
```typescript
const updated = {
  ...entity,
  name: 'New Name',
  _meta: updateMetadata(entity._meta, { status: 'active' })
};
```

### ❌ DON'T: Send metadata to client
```typescript
return c.json({ data: entity }); // Includes _meta!
```

### ✅ DO: Remove metadata before response
```typescript
return c.json({ data: withoutMetadata(entity) });
```

### ❌ DON'T: Assume metadata exists
```typescript
const status = entity._meta.status; // Can crash if no _meta!
```

### ✅ DO: Check with hasMetadata
```typescript
const status = hasMetadata(entity) ? entity._meta.status : 'unknown';
```

---

## 🎨 Code Snippets

### Create Customer with Metadata
```typescript
import { withMetadata } from './metadata.tsx';

const customer = withMetadata(
  {
    phone: "5551234567",
    full_name: "John Doe",
    email: "john@example.com",
    total_visits: 0,
    total_spent: 0
  },
  'customer',
  'active'
);

await kv.set(`customer:${customer.id}`, customer);
```

### Query Active Customers by Date
```typescript
import { getActive, sortByCreatedAt } from './metadata.tsx';

const allCustomers = await kv.getByPrefix('customer:');
const activeCustomers = getActive(allCustomers);
const sortedCustomers = sortByCreatedAt(activeCustomers, 'desc');

console.log(`Found ${sortedCustomers.length} active customers`);
```

### Expire Old Redeem Codes
```typescript
import { updateMetadata } from './metadata.tsx';

const codes = await kv.getByPrefix('redeem_code:');

for (const code of codes) {
  if (new Date(code.expiresAt) < new Date() && code._meta.status === 'pending') {
    const expired = {
      ...code,
      _meta: updateMetadata(code._meta, { status: 'expired' })
    };
    await kv.set(`redeem_code:${code.code}`, expired);
  }
}
```

### Get Statistics
```typescript
import { getEntityStats } from './metadata.tsx';

const customers = await kv.getByPrefix('customer:');
const stats = getEntityStats(customers);

console.log(stats);
// {
//   total: 150,
//   by_type: { customer: 150 },
//   by_status: { active: 120, inactive: 30 },
//   oldest: "2024-01-01T00:00:00Z",
//   newest: "2025-01-22T10:00:00Z"
// }
```

---

## 📖 Full Documentation

- [METADATA_SYSTEM.md](../02-api/METADATA_SYSTEM.md) - Complete guide
- [DATABASE_STRUCTURE.md](../01-architecture/DATABASE_STRUCTURE.md) - DB schema
- [API_ENDPOINTS.md](../02-api/API_ENDPOINTS.md) - API reference
