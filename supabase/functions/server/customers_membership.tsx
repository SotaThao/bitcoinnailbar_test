/**
 * CUSTOMER MEMBERSHIP INTEGRATION
 * Handles customer auto-create/update during membership activation
 */

import { Hono } from 'npm:hono@4';
import { customerKV } from './kv_store_customers.tsx';
import type { Customer } from './customers_new.tsx';

const app = new Hono();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

const detectRegion = (phone: string): 'US' | 'VN' | null => {
  const normalized = normalizePhone(phone);
  // HARDCODED: Always return US (US market only)
  if (/^\d{10}$/.test(normalized)) return 'US';
  return null;
};

const formatPhoneUS = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
};

const formatPhoneVN = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return `${normalized.slice(0, 4)}.${normalized.slice(4, 7)}.${normalized.slice(7)}`;
};

/**
 * Calculate new expiry date when stacking memberships
 * If current membership is active, add duration from its expiry date
 * If expired, start from now
 */
const calculateStackedExpiry = (currentMembership: any, durationMonths: number): Date => {
  const now = new Date();
  const currentExpiry = new Date(currentMembership.expires_at);
  
  // If current membership is active (expires in future)
  if (currentExpiry > now && currentMembership.status === 'active') {
    // Add duration from current expiry date
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + durationMonths);
    return newExpiry;
  } else {
    // If expired, start from now
    const newExpiry = new Date(now);
    newExpiry.setMonth(newExpiry.getMonth() + durationMonths);
    return newExpiry;
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /customers/activate-membership
 * Update customer with membership info after successful redemption
 * 
 * Request Body:
 * {
 *   phone: string (required)
 *   membership: {
 *     id: string
 *     tier: string
 *     amount: number
 *     duration: number (months)
 *     benefits: string[]
 *     redeem_code: string
 *   }
 *   customer_name?: string (for new customers)
 * }
 */
app.post('/make-server-84f9c112/customers/activate-membership', async (c) => {
  try {
    const body = await c.req.json();
    const { phone, membership, customer_name } = body;

    // Validate
    if (!phone || !membership) {
      return c.json({
        success: false,
        error: 'Phone and membership are required'
      }, 400);
    }

    if (!membership.tier || !membership.amount || !membership.duration) {
      return c.json({
        success: false,
        error: 'Membership must include tier, amount, and duration'
      }, 400);
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    const region = detectRegion(normalizedPhone);

    if (!region) {
      return c.json({
        success: false,
        error: 'Invalid phone number format'
      }, 400);
    }

    // Check if customer exists
    const existingCustomer = await customerKV.searchByPhone(normalizedPhone);

    if (existingCustomer && !existingCustomer.is_deleted) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // UPDATE EXISTING CUSTOMER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const currentMembership = existingCustomer.membership;
      const newMembership = membership;
      const activatedAt = new Date();
      let finalMembership;

      // CASE 1: No existing membership → Apply new one
      if (!currentMembership) {
        const expiresAt = new Date(activatedAt);
        expiresAt.setMonth(expiresAt.getMonth() + newMembership.duration);

        finalMembership = {
          id: newMembership.id,
          tier: newMembership.tier,
          amount: newMembership.amount,
          activated_at: activatedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active' as const,
          benefits: newMembership.benefits || [],
          redeem_code: newMembership.redeem_code
        };
      }
      // CASE 2: Same tier → Stack duration
      else if (currentMembership.tier === newMembership.tier) {
        const expiresAt = calculateStackedExpiry(currentMembership, newMembership.duration);

        finalMembership = {
          ...currentMembership,
          amount: newMembership.amount, // Update amount
          expires_at: expiresAt.toISOString(),
          status: 'active' as const,
          benefits: newMembership.benefits || currentMembership.benefits,
          redeem_code: newMembership.redeem_code // Latest redeem code
        };
      }
      // CASE 3: Different tier → Compare amounts
      else {
        // Higher amount wins
        if (newMembership.amount > currentMembership.amount) {
          const expiresAt = new Date(activatedAt);
          expiresAt.setMonth(expiresAt.getMonth() + newMembership.duration);

          finalMembership = {
            id: newMembership.id,
            tier: newMembership.tier,
            amount: newMembership.amount,
            activated_at: activatedAt.toISOString(),
            expires_at: expiresAt.toISOString(),
            status: 'active' as const,
            benefits: newMembership.benefits || [],
            redeem_code: newMembership.redeem_code
          };
        } else {
          finalMembership = currentMembership; // Keep existing
        }
      }

      // Update customer
      existingCustomer.membership = finalMembership;
      existingCustomer.updated_at = new Date().toISOString();

      await customerKV.set(existingCustomer.id, existingCustomer);

      return c.json({
        success: true,
        data: {
          customer: existingCustomer,
          membership_action: currentMembership 
            ? (currentMembership.tier === newMembership.tier ? 'stacked' : 
               newMembership.amount > currentMembership.amount ? 'upgraded' : 'kept_existing')
            : 'activated'
        }
      });

    } else {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // CREATE NEW CUSTOMER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // Generate key
      const key = region === 'US' 
        ? `customer_us:${normalizedPhone}`
        : `customer_vn:${crypto.randomUUID()}`;
      
      // Format phone
      const phoneDisplay = region === 'US'
        ? formatPhoneUS(normalizedPhone)
        : formatPhoneVN(normalizedPhone);

      // Calculate expiry
      const activatedAt = new Date();
      const expiresAt = new Date(activatedAt);
      expiresAt.setMonth(expiresAt.getMonth() + membership.duration);

      // Create customer with membership
      const newCustomer: Customer = {
        id: key,
        phone: normalizedPhone,
        phone_display: phoneDisplay,
        full_name: customer_name || 'Customer', // Default name if not provided
        region,
        total_visits: 0,
        total_spent: 0,
        appointment_ids: [],
        membership: {
          id: membership.id,
          tier: membership.tier,
          amount: membership.amount,
          activated_at: activatedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active',
          benefits: membership.benefits || [],
          redeem_code: membership.redeem_code
        },
        created_at: new Date().toISOString(),
        created_by: 'system_membership',
        is_deleted: false
      };

      await customerKV.set(key, newCustomer);

      return c.json({
        success: true,
        data: {
          customer: newCustomer,
          membership_action: 'activated'
        }
      });
    }

  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to activate membership'
    }, 500);
  }
});

/**
 * GET /customers/membership/:identifier
 * Get customer's current membership status
 * Supports both phone and email lookup
 */
app.get('/make-server-84f9c112/customers/membership/:identifier', async (c) => {
  try {
    const identifier = c.req.param('identifier');

    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@');
    let customer;
    
    if (isEmail) {
      customer = await customerKV.searchByEmail(identifier.trim());
    } else {
      const normalizedPhone = normalizePhone(identifier);
      customer = await customerKV.searchByPhone(normalizedPhone);
    }

    if (!customer || customer.is_deleted) {
      return c.json({
        success: true,
        has_membership: false,
        data: null
      });
    }

    // Check if membership is active
    let isActive = false;
    if (customer.membership) {
      const now = new Date();
      const expiresAt = new Date(customer.membership.expires_at);
      isActive = expiresAt > now && customer.membership.status === 'active';
    }

    const response = {
      success: true,
      has_membership: !!customer.membership,
      is_active: isActive,
      data: {
        customer,
        membership: customer.membership || null
      }
    };

    return c.json(response);

  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to check membership'
    }, 500);
  }
});

export { app as customersMembershipApp };