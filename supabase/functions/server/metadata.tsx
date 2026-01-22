/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * METADATA HELPER - Hybrid KV Store Enhancement
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * This module implements a **progressive metadata system** for the KV store.
 * 
 * **Why?**
 * - Cannot alter table schema (DDL not allowed in Figma Make)
 * - Need better data organization without breaking changes
 * - Want queryable metadata (entity_type, status, timestamps)
 * 
 * **How?**
 * - Store metadata INSIDE the value JSON as `_meta` field
 * - Backward compatible (existing data still works)
 * - Helper functions for filtering and querying
 * 
 * **Structure:**
 * ```json
 * {
 *   "phone": "5551234567",
 *   "name": "John Doe",
 *   "_meta": {
 *     "entity_type": "customer",
 *     "status": "active",
 *     "created_at": "2025-01-22T10:00:00Z",
 *     "updated_at": "2025-01-22T10:00:00Z",
 *     "version": "1.0"
 *   }
 * }
 * ```
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ========== TYPE DEFINITIONS ==========

/**
 * Entity types in the system
 */
export type EntityType =
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

/**
 * Status values for entities
 */
export type EntityStatus =
  | 'active'             // Currently active/valid
  | 'inactive'           // Deactivated but not deleted
  | 'pending'            // Awaiting action
  | 'pending_payment'    // Waiting for payment
  | 'completed'          // Finished/processed
  | 'expired'            // Past expiration date
  | 'used'               // Already consumed/redeemed
  | 'cancelled'          // Cancelled by user/admin
  | 'deleted';           // Soft deleted

/**
 * Metadata interface
 */
export interface Metadata {
  entity_type: EntityType;
  status: EntityStatus;
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
  version?: string;        // Schema version for migrations
  tags?: string[];         // Optional tags for categorization
  parent_id?: string;      // Optional parent entity reference
}

/**
 * Entity with metadata
 */
export interface EntityWithMetadata<T = any> {
  _meta: Metadata;
  [key: string]: any;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Create metadata object
 */
export function createMetadata(
  entity_type: EntityType,
  status: EntityStatus = 'active',
  options?: {
    version?: string;
    tags?: string[];
    parent_id?: string;
  }
): Metadata {
  const now = new Date().toISOString();
  
  return {
    entity_type,
    status,
    created_at: now,
    updated_at: now,
    version: options?.version || '1.0',
    tags: options?.tags,
    parent_id: options?.parent_id,
  };
}

/**
 * Update metadata (preserves created_at, updates updated_at)
 */
export function updateMetadata(
  existingMeta: Metadata,
  updates: Partial<Omit<Metadata, 'created_at'>>
): Metadata {
  return {
    ...existingMeta,
    ...updates,
    created_at: existingMeta.created_at, // Preserve original
    updated_at: new Date().toISOString(), // Always update
  };
}

/**
 * Add metadata to entity (for writing to KV)
 */
export function withMetadata<T extends object>(
  data: T,
  entity_type: EntityType,
  status: EntityStatus = 'active',
  options?: {
    version?: string;
    tags?: string[];
    parent_id?: string;
  }
): EntityWithMetadata<T> {
  return {
    ...data,
    _meta: createMetadata(entity_type, status, options),
  } as EntityWithMetadata<T>;
}

/**
 * Extract data without metadata (for responses)
 */
export function withoutMetadata<T>(entity: EntityWithMetadata<T>): T {
  const { _meta, ...data } = entity;
  return data as T;
}

/**
 * Get metadata from entity
 */
export function getMetadata(entity: EntityWithMetadata): Metadata | null {
  return entity._meta || null;
}

/**
 * Check if entity has metadata
 */
export function hasMetadata(entity: any): entity is EntityWithMetadata {
  return !!entity?._meta;
}

// ========== QUERY HELPERS ==========

/**
 * Filter entities by type
 */
export function filterByType<T>(
  entities: EntityWithMetadata<T>[],
  entity_type: EntityType
): EntityWithMetadata<T>[] {
  return entities.filter(e => e._meta?.entity_type === entity_type);
}

/**
 * Filter entities by status
 */
export function filterByStatus<T>(
  entities: EntityWithMetadata<T>[],
  status: EntityStatus | EntityStatus[]
): EntityWithMetadata<T>[] {
  const statuses = Array.isArray(status) ? status : [status];
  return entities.filter(e => e._meta?.status && statuses.includes(e._meta.status));
}

/**
 * Filter entities by tags
 */
export function filterByTags<T>(
  entities: EntityWithMetadata<T>[],
  tags: string[]
): EntityWithMetadata<T>[] {
  return entities.filter(e => 
    e._meta?.tags?.some(tag => tags.includes(tag))
  );
}

/**
 * Filter entities by parent
 */
export function filterByParent<T>(
  entities: EntityWithMetadata<T>[],
  parent_id: string
): EntityWithMetadata<T>[] {
  return entities.filter(e => e._meta?.parent_id === parent_id);
}

/**
 * Sort entities by creation date
 */
export function sortByCreatedAt<T>(
  entities: EntityWithMetadata<T>[],
  order: 'asc' | 'desc' = 'desc'
): EntityWithMetadata<T>[] {
  return [...entities].sort((a, b) => {
    const dateA = new Date(a._meta.created_at).getTime();
    const dateB = new Date(b._meta.created_at).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Sort entities by updated date
 */
export function sortByUpdatedAt<T>(
  entities: EntityWithMetadata<T>[],
  order: 'asc' | 'desc' = 'desc'
): EntityWithMetadata<T>[] {
  return [...entities].sort((a, b) => {
    const dateA = new Date(a._meta.updated_at).getTime();
    const dateB = new Date(b._meta.updated_at).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Get active entities only
 */
export function getActive<T>(entities: EntityWithMetadata<T>[]): EntityWithMetadata<T>[] {
  return filterByStatus(entities, 'active');
}

/**
 * Get pending entities only
 */
export function getPending<T>(entities: EntityWithMetadata<T>[]): EntityWithMetadata<T>[] {
  return filterByStatus(entities, ['pending', 'pending_payment']);
}

/**
 * Get expired entities only
 */
export function getExpired<T>(entities: EntityWithMetadata<T>[]): EntityWithMetadata<T>[] {
  return filterByStatus(entities, 'expired');
}

// ========== MIGRATION HELPERS ==========

/**
 * Migrate existing entity to include metadata
 * Used for progressive migration of old data
 */
export function migrateEntity<T extends object>(
  data: T,
  entity_type: EntityType,
  inferStatus?: (data: T) => EntityStatus
): EntityWithMetadata<T> {
  // Check if already has metadata
  if (hasMetadata(data)) {
    return data as EntityWithMetadata<T>;
  }
  
  // Infer status from data or default to 'active'
  const status = inferStatus ? inferStatus(data) : 'active';
  
  return withMetadata(data, entity_type, status);
}

/**
 * Bulk migrate entities
 */
export function migrateEntities<T extends object>(
  entities: T[],
  entity_type: EntityType,
  inferStatus?: (data: T) => EntityStatus
): EntityWithMetadata<T>[] {
  return entities.map(entity => migrateEntity(entity, entity_type, inferStatus));
}

// ========== VALIDATION ==========

/**
 * Validate metadata structure
 */
export function validateMetadata(meta: any): meta is Metadata {
  return (
    meta &&
    typeof meta === 'object' &&
    typeof meta.entity_type === 'string' &&
    typeof meta.status === 'string' &&
    typeof meta.created_at === 'string' &&
    typeof meta.updated_at === 'string'
  );
}

/**
 * Validate entity with metadata
 */
export function validateEntity(entity: any): entity is EntityWithMetadata {
  return hasMetadata(entity) && validateMetadata(entity._meta);
}

// ========== STATS & ANALYTICS ==========

/**
 * Get entity statistics
 */
export function getEntityStats<T>(
  entities: EntityWithMetadata<T>[]
): {
  total: number;
  by_type: Record<EntityType, number>;
  by_status: Record<EntityStatus, number>;
  oldest: string;
  newest: string;
} {
  const by_type: any = {};
  const by_status: any = {};
  
  entities.forEach(entity => {
    const type = entity._meta.entity_type;
    const status = entity._meta.status;
    
    by_type[type] = (by_type[type] || 0) + 1;
    by_status[status] = (by_status[status] || 0) + 1;
  });
  
  const sorted = sortByCreatedAt(entities, 'asc');
  
  return {
    total: entities.length,
    by_type,
    by_status,
    oldest: sorted[0]?._meta.created_at || '',
    newest: sorted[sorted.length - 1]?._meta.created_at || '',
  };
}

// ========== EXAMPLE USAGE ==========

/**
 * Example: Create customer with metadata
 * 
 * ```typescript
 * const customer = withMetadata(
 *   {
 *     phone: "5551234567",
 *     name: "John Doe",
 *     email: "john@example.com"
 *   },
 *   'customer',
 *   'active'
 * );
 * 
 * await kv.set('customer:5551234567', customer);
 * ```
 */

/**
 * Example: Query customers by status
 * 
 * ```typescript
 * const allCustomers = await kv.getByPrefix('customer:');
 * const activeCustomers = filterByStatus(allCustomers, 'active');
 * const sortedCustomers = sortByCreatedAt(activeCustomers, 'desc');
 * ```
 */

/**
 * Example: Migrate existing data
 * 
 * ```typescript
 * const oldData = await kv.get('customer:xxx');
 * const migrated = migrateEntity(oldData, 'customer');
 * await kv.set('customer:xxx', migrated);
 * ```
 */
