/**
 * CUSTOMER MEMBERSHIP INTEGRATION - Postgres Implementation
 * Handles customer auto-create/update during membership activation
 * Migrated from KV Store to Postgres
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

const formatPhoneUS = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
};

/**
 * Calculate new expiry date when stacking memberships (same tier)
 * Per MEMBERSHIP_LOGIC.md: Extend from current expiry, not from now
 */
const calculateStackedExpiry = (currentEndDate: string, durationMonths: number): Date => {
  const now = new Date();
  const currentExpiry = new Date(currentEndDate);
  
  // If current membership is active (expires in future)
  if (currentExpiry > now) {
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
 * CRITICAL LOGIC (Per MEMBERSHIP_LOGIC.md):
 * - Same tier → Extend expiry date (stack duration)
 * - Different tier → Compare amounts, higher wins
 * - Tier hierarchy: Diamond > Platinum > Gold
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

    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone', normalizedPhone)
      .neq('status', 'suspended')
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingCustomer) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // UPDATE EXISTING CUSTOMER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const currentTier = existingCustomer.tier;
      const currentAmount = existingCustomer.membership_amount || 0; // ✅ FIXED: Get from membership_amount column
      const currentEndDate = existingCustomer.membership_end_date;
      
      const newTier = membership.tier;
      const newAmount = membership.amount;
      const newDuration = membership.duration;

      const activatedAt = new Date();
      let finalEndDate: Date;
      let membershipAction: string;

      // CASE 1: No existing membership → Apply new one
      if (!existingCustomer.membership_id || !currentEndDate) {
        finalEndDate = new Date(activatedAt);
        finalEndDate.setMonth(finalEndDate.getMonth() + newDuration);
        membershipAction = 'activated';
      }
      // CASE 2: Same tier → Stack duration (Per MEMBERSHIP_LOGIC.md)
      else if (currentTier === newTier) {
        finalEndDate = calculateStackedExpiry(currentEndDate, newDuration);
        membershipAction = 'stacked';
      }
      // CASE 3: Different tier → Compare amounts (Per Guidelines)
      else {
        // Higher amount wins
        if (newAmount > currentAmount) {
          finalEndDate = new Date(activatedAt);
          finalEndDate.setMonth(finalEndDate.getMonth() + newDuration);
          membershipAction = 'upgraded';
        } else {
          // Keep existing - don't update
          return c.json({
            success: true,
            data: {
              customer: {
                id: existingCustomer.id,
                phone: existingCustomer.phone,
                phone_display: formatPhoneUS(existingCustomer.phone),
                full_name: existingCustomer.full_name,
                tier: existingCustomer.tier,
                membership_end_date: existingCustomer.membership_end_date,
              },
              membership_action: 'kept_existing'
            }
          });
        }
      }

      // Update customer membership
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customer_profiles')
        .update({
          tier: newTier,
          status: 'active',
          membership_start_date: activatedAt.toISOString(),
          membership_end_date: finalEndDate.toISOString(),
          membership_amount: newAmount, // ✅ Store amount for future comparisons
        })
        .eq('id', existingCustomer.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return c.json({
        success: true,
        data: {
          customer: {
            id: updatedCustomer.id,
            phone: updatedCustomer.phone,
            phone_display: formatPhoneUS(updatedCustomer.phone),
            full_name: updatedCustomer.full_name,
            tier: updatedCustomer.tier,
            membership_start_date: updatedCustomer.membership_start_date,
            membership_end_date: updatedCustomer.membership_end_date,
          },
          membership_action: membershipAction
        }
      });

    } else {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // CREATE NEW CUSTOMER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // Calculate expiry
      const activatedAt = new Date();
      const expiresAt = new Date(activatedAt);
      expiresAt.setMonth(expiresAt.getMonth() + membership.duration);

      const customerEmail = `${normalizedPhone}@placeholder.com`;

      // Create customer with membership
      const { data: newCustomer, error: createError } = await supabase
        .from('customer_profiles')
        .insert({
          phone: normalizedPhone,
          email: customerEmail,
          full_name: customer_name || 'Customer', // Default name if not provided
          tier: membership.tier,
          status: 'active',
          membership_start_date: activatedAt.toISOString(),
          membership_end_date: expiresAt.toISOString(),
          membership_amount: membership.amount, // ✅ Store amount for future comparisons
          total_visits: 0,
          lifetime_spend: 0,
          loyalty_points: 0,
          marketing_opt_in: true,
          sms_opt_in: false,
          preferred_language: 'en',
          created_by: 'system_membership',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return c.json({
        success: true,
        data: {
          customer: {
            id: newCustomer.id,
            phone: newCustomer.phone,
            phone_display: formatPhoneUS(newCustomer.phone),
            full_name: newCustomer.full_name,
            tier: newCustomer.tier,
            membership_start_date: newCustomer.membership_start_date,
            membership_end_date: newCustomer.membership_end_date,
          },
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
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('email', identifier.trim())
        .neq('status', 'suspended')
        .maybeSingle();
      
      if (error) throw error;
      customer = data;
    } else {
      const normalizedPhone = normalizePhone(identifier);
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('phone', normalizedPhone)
        .neq('status', 'suspended')
        .maybeSingle();
      
      if (error) throw error;
      customer = data;
    }

    if (!customer) {
      return c.json({
        success: true,
        has_membership: false,
        data: null
      });
    }

    // Check if membership is active
    let isActive = false;
    if (customer.membership_id && customer.membership_end_date) {
      const now = new Date();
      const expiresAt = new Date(customer.membership_end_date);
      isActive = expiresAt > now && customer.status === 'active';
    }

    const response = {
      success: true,
      has_membership: !!customer.membership_id,
      is_active: isActive,
      data: {
        customer: {
          id: customer.id,
          phone: customer.phone,
          phone_display: formatPhoneUS(customer.phone),
          full_name: customer.full_name,
          email: customer.email,
        },
        membership: customer.membership_id ? {
          tier: customer.tier,
          status: isActive ? 'active' : 'expired',
          activated_at: customer.membership_start_date,
          expires_at: customer.membership_end_date,
        } : null
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