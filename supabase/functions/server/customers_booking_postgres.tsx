/**
 * CUSTOMER BOOKING INTEGRATION - Postgres Implementation
 * Handles customer auto-create/update during booking process
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

const isValidPhoneUS = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  return /^\d{10}$/.test(normalized);
};

const formatPhoneUS = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
};

/**
 * Check if membership is valid for booking date
 */
const isMembershipValid = (customer: any, appointmentTime: string): boolean => {
  if (!customer.membership_id || !customer.membership_end_date) return false;
  if (customer.status !== 'active') return false;
  
  const expiresAt = new Date(customer.membership_end_date);
  const bookingDate = new Date(appointmentTime);
  
  return expiresAt >= bookingDate;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENDPOINTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /customers/book
 * Create/Update customer during booking process
 * 
 * CRITICAL LOGIC (Per BOOKING_CUSTOMER_LOGIC.md):
 * - Only count visits/spent if appointment_status = 'Complete'
 * - Always track appointment regardless of status
 */
app.post('/make-server-84f9c112/customers/book', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      phone, 
      full_name, 
      email, 
      address, 
      date_of_birth,
      appointment_id,
      appointment_time,
      appointment_amount,
      appointment_status = 'Pending'  // Default to Pending
    } = body;

    // Validate required fields
    if (!phone || !full_name || !appointment_id || !appointment_time || appointment_amount === undefined) {
      return c.json({
        success: false,
        error: 'Missing required fields: phone, full_name, appointment_id, appointment_time, appointment_amount'
      }, 400);
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    
    // Validate phone
    if (!isValidPhoneUS(normalizedPhone)) {
      return c.json({
        success: false,
        error: 'Invalid US phone number. Must be 10 digits.'
      }, 400);
    }

    // Check if customer exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone', normalizedPhone)
      .neq('status', 'suspended')
      .maybeSingle();

    if (fetchError) {
      console.error('❌ [BOOKING] Fetch error:', fetchError);
      throw fetchError;
    }

    if (existingCustomer) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // UPDATE EXISTING CUSTOMER
      // Per BOOKING_CUSTOMER_LOGIC.md: Only count if Complete
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log(`📝 [BOOKING] Updating existing customer: ${existingCustomer.id}`);
      console.log(`   Appointment status: ${appointment_status}`);

      // ✅ CRITICAL: Only accumulate if status = 'Complete'
      const shouldCount = appointment_status === 'Complete';
      console.log(`   ${shouldCount ? '✅' : '⏸️'} ${shouldCount ? 'Counting' : 'NOT counting'} in statistics`);

      const updates: any = {
        full_name, // Allow name update
        email: email || existingCustomer.email,
        address: address || existingCustomer.address,
        date_of_birth: date_of_birth || existingCustomer.date_of_birth,
      };

      if (shouldCount) {
        updates.total_visits = existingCustomer.total_visits + 1;
        updates.lifetime_spend = existingCustomer.lifetime_spend + appointment_amount;
        updates.last_visit_date = appointment_time;
      }

      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customer_profiles')
        .update(updates)
        .eq('id', existingCustomer.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [BOOKING] Update error:', updateError);
        throw updateError;
      }

      console.log(`✅ [BOOKING] Customer updated successfully`);
      console.log(`   Total visits: ${updatedCustomer.total_visits}`);
      console.log(`   Total spent: $${updatedCustomer.lifetime_spend}`);

      // Check membership validity for booking date
      const hasValidMembership = isMembershipValid(updatedCustomer, appointment_time);

      return c.json({
        success: true,
        data: {
          customer: {
            id: updatedCustomer.id,
            phone: updatedCustomer.phone,
            phone_display: formatPhoneUS(updatedCustomer.phone),
            full_name: updatedCustomer.full_name,
            email: updatedCustomer.email,
            total_visits: updatedCustomer.total_visits,
            total_spent: updatedCustomer.lifetime_spend,
            last_visit: updatedCustomer.last_visit_date,
            membership: hasValidMembership ? {
              tier: updatedCustomer.tier,
              status: 'active',
              expires_at: updatedCustomer.membership_end_date,
            } : undefined,
          },
          membership: hasValidMembership ? {
            tier: updatedCustomer.tier,
            expires_at: updatedCustomer.membership_end_date,
          } : null,
          has_valid_membership: hasValidMembership
        }
      });

    } else {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // CREATE NEW CUSTOMER
      // Per BOOKING_CUSTOMER_LOGIC.md: Only count if Complete
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      console.log(`✨ [BOOKING] Creating new customer with phone: ${normalizedPhone}`);
      console.log(`   Appointment status: ${appointment_status}`);

      // ✅ CRITICAL: Check status before counting
      const shouldCount = appointment_status === 'Complete';
      console.log(`   ${shouldCount ? '✅' : '⏸️'} ${shouldCount ? 'Counting' : 'NOT counting'} in initial statistics`);
      
      // Create customer (Postgres will auto-generate UUID via DEFAULT gen_random_uuid())
      const { data: newCustomer, error: createError } = await supabase
        .from('customer_profiles')
        .insert({
          phone: normalizedPhone,
          email,
          full_name,
          address,
          date_of_birth,
          tier: 'guest',
          status: 'active',
          total_visits: shouldCount ? 1 : 0,  // Only count if Complete
          lifetime_spend: shouldCount ? appointment_amount : 0,  // Only count if Complete
          last_visit_date: shouldCount ? appointment_time : null,  // Only set if Complete
          loyalty_points: 0,
          marketing_opt_in: true,
          sms_opt_in: false,
          preferred_language: 'en',
          created_by: 'system_booking', // System created
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ [BOOKING] Create error:', createError);
        throw createError;
      }

      console.log(`✅ [BOOKING] New customer created: ${newCustomer.id}`);
      console.log(`   Total visits: ${newCustomer.total_visits}`);
      console.log(`   Total spent: $${newCustomer.lifetime_spend}`);

      return c.json({
        success: true,
        data: {
          customer: {
            id: newCustomer.id,
            phone: newCustomer.phone,
            phone_display: formatPhoneUS(newCustomer.phone),
            full_name: newCustomer.full_name,
            email: newCustomer.email,
            total_visits: newCustomer.total_visits,
            total_spent: newCustomer.lifetime_spend,
            last_visit: newCustomer.last_visit_date,
          },
          membership: null,
          has_valid_membership: false
        }
      });
    }

  } catch (error: any) {
    console.error('❌ [BOOKING] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to process booking'
    }, 500);
  }
});

/**
 * GET /customers/lookup/:phone?appointment_time=ISO
 * Lookup customer by phone for booking form auto-fill
 * Returns customer info + membership if valid for appointment date
 */
app.get('/make-server-84f9c112/customers/lookup/:phone', async (c) => {
  try {
    const phone = c.req.param('phone');
    const appointmentTime = c.req.query('appointment_time') || new Date().toISOString();

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);

    // Find customer
    const { data: customer, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone', normalizedPhone)
      .neq('status', 'suspended')
      .maybeSingle();

    if (error) {
      console.error('❌ [LOOKUP] Error:', error);
      throw error;
    }

    if (!customer) {
      return c.json({
        success: true,
        found: false,
        data: null
      });
    }

    // Check membership validity
    const hasValidMembership = isMembershipValid(customer, appointmentTime);

    console.log(`✅ [LOOKUP] Customer found: ${customer.id}, Membership valid: ${hasValidMembership}`);

    return c.json({
      success: true,
      found: true,
      data: {
        customer: {
          id: customer.id,
          phone: customer.phone,
          phone_display: formatPhoneUS(customer.phone),
          full_name: customer.full_name,
          email: customer.email,
          address: customer.address,
          date_of_birth: customer.date_of_birth,
          membership: hasValidMembership ? {
            tier: customer.tier,
            status: 'active',
            expires_at: customer.membership_end_date,
          } : undefined,
        },
        membership: hasValidMembership ? {
          tier: customer.tier,
          expires_at: customer.membership_end_date,
        } : null,
        has_valid_membership: hasValidMembership
      }
    });

  } catch (error: any) {
    console.error('❌ [LOOKUP] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to lookup customer'
    }, 500);
  }
});

export { app as customersBookingApp };