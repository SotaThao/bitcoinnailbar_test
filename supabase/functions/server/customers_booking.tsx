/**
 * CUSTOMER BOOKING INTEGRATION
 * Handles customer auto-create/update during booking process
 */

import { Hono } from 'npm:hono@4';
import { customerKV } from './kv_store_customers.tsx';
import type { Customer, CustomerUS, CustomerVN } from './customers_new.tsx';

const app = new Hono();

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

const isValidPhoneVN = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  return /^0\d{9}$/.test(normalized);
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

const detectRegion = (phone: string): 'US' | 'VN' | null => {
  const normalized = normalizePhone(phone);
  // HARDCODED: Always return US (US market only)
  if (/^\d{10}$/.test(normalized)) return 'US';
  return null;
};

/**
 * Check if membership is valid for booking date
 */
const isMembershipValid = (membership: any, appointmentTime: string): boolean => {
  if (!membership) return false;
  if (membership.status !== 'active') return false;
  
  const expiresAt = new Date(membership.expires_at);
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
 * Request Body:
 * {
 *   phone: string (required)
 *   full_name: string (required)
 *   email?: string
 *   address?: string
 *   date_of_birth?: string
 *   appointment_id: string (required)
 *   appointment_time: string (ISO) (required)
 *   appointment_amount: number (required)
 *   appointment_status?: string (default: 'Pending')
 * }
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
      appointment_status = 'Pending'  // ← Default to Pending
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
    
    // Detect region
    const region = detectRegion(normalizedPhone);
    if (!region) {
      return c.json({
        success: false,
        error: 'Invalid phone number format'
      }, 400);
    }

    // Validate phone
    if (region === 'US' && !isValidPhoneUS(normalizedPhone)) {
      return c.json({
        success: false,
        error: 'Invalid US phone number. Must be 10 digits.'
      }, 400);
    }
    
    if (region === 'VN' && !isValidPhoneVN(normalizedPhone)) {
      return c.json({
        success: false,
        error: 'Invalid VN phone number. Must be 10 digits starting with 0.'
      }, 400);
    }

    // Check if customer exists
    const existingCustomer = await customerKV.searchByPhone(normalizedPhone);

    if (existingCustomer && !existingCustomer.is_deleted) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // UPDATE EXISTING CUSTOMER
      // Per BOOKING_CUSTOMER_LOGIC.md: Only count if Complete
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // Update fields (user can update email/address during booking)
      existingCustomer.full_name = full_name; // Allow name update
      existingCustomer.email = email || existingCustomer.email;
      existingCustomer.address = address || existingCustomer.address;
      existingCustomer.date_of_birth = date_of_birth || existingCustomer.date_of_birth;
      
      // ✅ CRITICAL: Only accumulate if status = 'Complete'
      // Per BOOKING_CUSTOMER_LOGIC.md Section 2
      if (appointment_status === 'Complete') {
        existingCustomer.total_visits += 1;
        existingCustomer.total_spent += appointment_amount;
        existingCustomer.last_visit = appointment_time;
      } else {
        // Don't update total_visits, total_spent, or last_visit
      }
      
      // Always add appointment ID regardless of status
      if (!existingCustomer.appointment_ids) {
        existingCustomer.appointment_ids = [];
      }
      existingCustomer.appointment_ids.push(appointment_id);
      
      // Update timestamp
      existingCustomer.updated_at = new Date().toISOString();

      // Save
      await customerKV.set(existingCustomer.id, existingCustomer);

      // Check membership validity for booking date
      let validMembership = null;
      if (existingCustomer.membership) {
        const isValid = isMembershipValid(existingCustomer.membership, appointment_time);
        if (isValid) {
          validMembership = existingCustomer.membership;
        }
      }

      return c.json({
        success: true,
        data: {
          customer: existingCustomer,
          membership: validMembership, // null if not valid
          has_valid_membership: !!validMembership
        }
      });

    } else {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // CREATE NEW CUSTOMER
      // Per BOOKING_CUSTOMER_LOGIC.md: Only count if Complete
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // Generate key
      const key = region === 'US' 
        ? `customer_us:${normalizedPhone}`
        : `customer_vn:${crypto.randomUUID()}`;
      
      // Format phone
      const phoneDisplay = region === 'US'
        ? formatPhoneUS(normalizedPhone)
        : formatPhoneVN(normalizedPhone);

      // ✅ CRITICAL: Check status before counting
      const shouldCount = appointment_status === 'Complete';

      // Create customer
      const newCustomer: Customer = {
        id: key,
        phone: normalizedPhone,
        phone_display: phoneDisplay,
        full_name,
        region,
        email: email || undefined,
        address: address || undefined,
        date_of_birth: date_of_birth || undefined,
        total_visits: shouldCount ? 1 : 0,  // ← Only count if Complete
        total_spent: shouldCount ? appointment_amount : 0,  // ← Only count if Complete
        last_visit: shouldCount ? appointment_time : undefined,  // ← Only set if Complete
        appointment_ids: [appointment_id],
        created_at: new Date().toISOString(),
        created_by: 'system_booking', // System created
        is_deleted: false
      };

      // Save
      await customerKV.set(key, newCustomer);

      return c.json({
        success: true,
        data: {
          customer: newCustomer,
          membership: null,
          has_valid_membership: false
        }
      });
    }

  } catch (error: any) {
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
    const customer = await customerKV.searchByPhone(normalizedPhone);

    if (!customer || customer.is_deleted) {
      return c.json({
        success: true,
        found: false,
        data: null
      });
    }

    // Check membership validity
    let validMembership = null;
    if (customer.membership) {
      const isValid = isMembershipValid(customer.membership, appointmentTime);
      if (isValid) {
        validMembership = customer.membership;
      }
    }

    return c.json({
      success: true,
      found: true,
      data: {
        customer,
        membership: validMembership,
        has_valid_membership: !!validMembership
      }
    });

  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to lookup customer'
    }, 500);
  }
});

export { app as customersBookingApp };