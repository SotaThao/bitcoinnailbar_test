import { Hono } from 'npm:hono@4.6.14';
import QRCode from 'npm:qrcode@1.5.4';
import { kvAdmin as kv } from './_shared_kv.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { generateBookingConfirmationEmail } from './email-templates.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Send Email via Resend
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const sendEmail = async (to: string, subject: string, html: string) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  
  console.log("📧 [sendEmail] Starting...");
  console.log("   - To:", to);
  
  if (!apiKey) {
    console.error("❌ Missing RESEND_API_KEY");
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "Bitcoin Nail Bar <bookings@tnsthao94.online>",
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Resend API error: ${JSON.stringify(data)}`);
  }
  
  return { success: true, data };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Create Appointment (with Email & Customer Integration)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function createAppointment(data: any) {
  const { customerName, customerPhone, customerEmail, branchId, staffId, serviceIds, serviceNames, appointmentTime, notes } = data;
  
  console.log("🚀 [CREATE_APPT] Starting creation for:", customerName);

  // 1. Resolve Service IDs if only names provided (for Chatbot)
  let finalServiceIds = serviceIds || [];
  
  // Normalize serviceNames to an array if it's a string
  let serviceNamesArray: string[] = [];
  if (Array.isArray(serviceNames)) {
    serviceNamesArray = serviceNames;
  } else if (typeof serviceNames === 'string') {
    serviceNamesArray = serviceNames.split(',').map((s: string) => s.trim());
  }

  if ((!finalServiceIds || finalServiceIds.length === 0) && serviceNamesArray.length > 0) {
    try {
      const allServices = await kv.getByPrefix("service:");
      if (allServices && allServices.length > 0) {
        const normalizedNames = serviceNamesArray.map(n => n.toLowerCase());
        const found = allServices.filter((s: any) => normalizedNames.some((n: string) => s.name.toLowerCase().includes(n)));
        finalServiceIds = found.map((s: any) => s.id);
        console.log("🔍 [CREATE_APPT] Resolved service IDs from names:", finalServiceIds);
      } else {
         console.log("⚠️ [CREATE_APPT] No services found in DB, proceeding with names only");
      }
    } catch (e) {
      console.warn("⚠️ [CREATE_APPT] Failed to resolve service IDs:", e);
      // Proceed even if service ID resolution fails
    }
  }

  // 2. Calculate total amount for customer record
  let totalAmount = 0;
  try {
    const serviceMenuData = await kv.get("settings:service-menu");
    if (serviceMenuData) {
      const flattenServices = (data: any): any[] => {
        const flattened: any[] = [];
        Object.keys(data).forEach((categoryKey) => {
          const categoryData = data[categoryKey];
          if (categoryData.groups) {
            categoryData.groups.forEach((group: any, groupIndex: number) => {
              if (group.items) {
                group.items.forEach((item: any, itemIndex: number) => {
                  const parsePrice = (val: any): number => {
                    if (typeof val === 'number') return val;
                    if (!val) return 0;
                    const str = String(val).trim();
                    if (str.includes('-')) {
                      const parts = str.split('-');
                      const prices = parts.map((p: string) => parseFloat(p.trim())).filter((p: number) => !isNaN(p));
                      return prices.length > 0 ? Math.max(...prices) : 0;
                    }
                    if (str.includes('+')) {
                      return parseFloat(str.replace('+', '')) || 0;
                    }
                    return parseFloat(str) || 0;
                  };

                  flattened.push({
                    id: `${categoryKey}-${groupIndex}-${itemIndex}`,
                    name: item.name,
                    price: parsePrice(item.regular)
                  });
                });
              }
            });
          }
        });
        return flattened;
      };
      
      const allServices = flattenServices(serviceMenuData);
      totalAmount = finalServiceIds.reduce((sum: number, id: string) => {
        const service = allServices.find((s: any) => s.id === id);
        return sum + (service?.price || 0);
      }, 0);
    }
  } catch (e) {
    console.warn("⚠️ [CREATE_APPT] Could not calculate total:", e);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━━━━━━
  // 3. NEW: Resolve Technician ID (if staffId provided)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let technicianId = null;
  if (staffId) {
    try {
      // Try to find technician by legacy_staff_id first
      const { data: technician } = await supabase
        .from('technician_info')
        .select('id')
        .eq('legacy_staff_id', staffId)
        .maybeSingle();
      
      if (technician) {
        technicianId = technician.id;
        console.log(`✅ [CREATE_APPT] Resolved technician: ${staffId} → ${technicianId}`);
      } else {
        console.warn(`⚠️ [CREATE_APPT] Technician not found for staffId: ${staffId}`);
      }
    } catch (e) {
      console.warn("⚠️ [CREATE_APPT] Failed to resolve technician ID:", e);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. NEW: Create/Update Customer Record (POSTGRES)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let customerId = null;
  console.log("📝 [CREATE_APPT] Creating/updating customer record in Postgres...");
  try {
    // Normalize phone
    const normalizedPhone = customerPhone.replace(/\D/g, '');
    
    // Search for existing customer in Postgres
    const { data: existingCustomer, error: searchError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone', normalizedPhone)
      .neq('status', 'suspended')
      .maybeSingle();
    
    if (searchError && searchError.code !== 'PGRST116') {
      console.error('❌ [CREATE_APPT] Postgres search error:', searchError);
      throw searchError;
    }
    
    if (existingCustomer) {
      // ✅ UPDATE EXISTING CUSTOMER
      console.log('📝 [CREATE_APPT] Updating existing customer:', existingCustomer.id);
      
      const { error: updateError } = await supabase
        .from('customer_profiles')
        .update({
          full_name: customerName,
          email: customerEmail || existingCustomer.email,
          total_visits: (existingCustomer.total_visits || 0) + 1,
          lifetime_spend: (existingCustomer.lifetime_spend || 0) + totalAmount,
          last_visit_date: appointmentTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id);
      
      if (updateError) {
        console.error('❌ [CREATE_APPT] Postgres update error:', updateError);
        throw updateError;
      }
      
      customerId = existingCustomer.id;
      console.log('✅ [CREATE_APPT] Customer updated in Postgres:', existingCustomer.id);
      
    } else {
      // ✅ CREATE NEW CUSTOMER
      console.log('🆕 [CREATE_APPT] Creating new customer in Postgres...');
      
      // Postgres will auto-generate UUID via DEFAULT gen_random_uuid()
      const { data: newCustomer, error: insertError } = await supabase
        .from('customer_profiles')
        .insert({
          phone: normalizedPhone,
          email: customerEmail,
          full_name: customerName,
          total_visits: 1,
          lifetime_spend: totalAmount,
          last_visit_date: appointmentTime,
          tier: 'guest',
          status: 'active',
          loyalty_points: 0,
          marketing_opt_in: true,
          sms_opt_in: false,
          preferred_language: 'en',
          created_by: 'system_booking'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ [CREATE_APPT] Postgres insert error:', insertError);
        throw insertError;
      }
      
      customerId = newCustomer?.id;
      console.log('✅ [CREATE_APPT] New customer created in Postgres:', newCustomer?.id);
    }
    
  } catch (customerIntegrationError) {
    console.error('❌ [CREATE_APPT] Customer integration error:', customerIntegrationError);
    // Don't fail the whole booking process if customer creation fails
    console.warn('⚠️ [CREATE_APPT] Continuing despite customer integration error');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. NEW: Save Appointment to POSTGRES (appointment_info)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let appointment: any = null;
  try {
    const appointmentData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      customer_id: customerId,
      technician_id: technicianId,
      branch_id: branchId || null,
      service_ids: finalServiceIds,
      service_names: serviceNamesArray,
      appointment_time: appointmentTime,
      status: "pending",
      notes: notes || null,
      total_amount: totalAmount,
      payment_status: 'unpaid',
    };
    
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('appointment_info')
      .insert(appointmentData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ [CREATE_APPT] Failed to save appointment to Postgres:', insertError);
      throw insertError;
    }
    
    appointment = insertedAppointment;
    console.log("✅ [CREATE_APPT] Saved to Postgres:", appointment.id);
    
  } catch (dbError) {
    console.error('❌ [CREATE_APPT] Database error:', dbError);
    throw dbError;
  }

  // 6. Generate QR & Send Email
  let emailSent = false;
  let emailError = null;
  let qrCodeUrl = null;

  if (customerEmail && customerEmail.trim().length > 0) {
    try {
      // Format time
      let formattedTime = appointmentTime;
      try {
        formattedTime = new Date(appointmentTime).toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } catch {}
      
      const displayServices = Array.isArray(appointment.service_names) ? appointment.service_names.join(", ") : 'Selected services';
      
      // QR Generation
      console.log("🎫 [CREATE_APPT] Generating QR code for appointment:", appointment.id);
      const qrData = JSON.stringify({
        id: appointment.id,
        phone: customerPhone,
        name: customerName,
        time: appointmentTime
      });
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300, margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      console.log("✅ [CREATE_APPT] QR code generated successfully");
      
      // Cloudinary Upload
      const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
      if (cloudinaryUrl) {
        console.log("☁️ [CREATE_APPT] Attempting Cloudinary upload...");
        const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
        if (matches) {
          const [, apiKey, apiSecret, cloudName] = matches;
          const timestamp = Math.round(Date.now() / 1000).toString();
          const signatureString = `timestamp=${timestamp}${apiSecret}`;
          
          const encoder = new TextEncoder();
          const data = encoder.encode(signatureString);
          const hashBuffer = await crypto.subtle.digest("SHA-1", data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          const base64Data = qrCodeDataURL.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const qrFile = new File([bytes], `qr-${appointment.id}.png`, { type: 'image/png' });
          
          const formData = new FormData();
          formData.append("file", qrFile);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);
          
          const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            qrCodeUrl = uploadResult.secure_url;
            console.log("✅ [CREATE_APPT] QR uploaded to Cloudinary:", qrCodeUrl);
          } else {
            const errorText = await uploadResponse.text();
            console.error("❌ [CREATE_APPT] Cloudinary upload failed:", uploadResponse.status, errorText);
          }
        } else {
          console.warn("⚠️ [CREATE_APPT] Could not parse CLOUDINARY_URL");
        }
      } else {
        console.warn("⚠️ [CREATE_APPT] CLOUDINARY_URL not configured, QR will fallback to client-side generation");
      }

      // Generate Email Template
      const emailHtml = generateBookingConfirmationEmail({
        customerName,
        customerEmail,
        customerPhone,
        appointmentId: appointment.id,
        displayServices,
        formattedTime,
        qrCodeUrl
      });

      await sendEmail(customerEmail, '✅ Appointment Confirmed - Bitcoin Nail Bar', emailHtml);
      emailSent = true;
      
    } catch (err: any) {
      console.error("❌ [CREATE_APPT] Email/QR error:", err);
      emailError = err.message;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. Broadcast Realtime Notification to Admin
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    console.log("📡 [CREATE_APPT] Broadcasting realtime notification...");
    
    // Send realtime event to 'appointments' channel
    await supabase.channel('appointments').send({
      type: 'broadcast',
      event: 'appointment_created',
      payload: {
        id: appointment.id,
        customerName: appointment.customer_name,
        customerPhone: appointment.customer_phone,
        appointmentTime: appointment.appointment_time,
        serviceNames: appointment.service_names,
        status: appointment.status,
        createdAt: appointment.created_at
      }
    });
    
    console.log("✅ [CREATE_APPT] Realtime notification sent successfully");
  } catch (broadcastError) {
    console.error("❌ [CREATE_APPT] Realtime broadcast error:", broadcastError);
    // Don't fail the whole booking if notification fails
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. NEW: Trigger Auto-Assign if no technician assigned
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!technicianId) {
    console.log("🤖 [CREATE_APPT] No technician assigned, triggering auto-assign...");
    try {
      // Import auto-assign module
      const { autoAssignTechnician } = await import('./technician-assignment.tsx');
      
      const assignResult = await autoAssignTechnician(appointment.id);
      
      if (assignResult.success && assignResult.technician_id) {
        console.log(`✅ [CREATE_APPT] Auto-assigned to technician: ${assignResult.technician_id}`);
        // Update appointment object with new technician_id
        appointment.technician_id = assignResult.technician_id;
      } else {
        console.warn("⚠️ [CREATE_APPT] Auto-assign failed:", assignResult.message);
      }
    } catch (autoAssignError) {
      console.error("❌ [CREATE_APPT] Auto-assign error:", autoAssignError);
      // Don't fail the whole booking if auto-assign fails
    }
  } else {
    console.log("✅ [CREATE_APPT] Technician already assigned:", technicianId);
  }

  return { appointment, emailSent, emailError, qrCodeUrl };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT: createAppointment for use by chatbot.tsx (Wave 7)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { createAppointment };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES: Appointment CRUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Create Appointment (Manual/API)
app.post("/make-server-84f9c112/appointments", async (c) => {
  try {
    const body = await c.req.json();
    const result = await createAppointment(body);
    return c.json({ success: true, data: result.appointment, emailSent: result.emailSent, emailError: result.emailError });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get All Appointments (for Admin)
app.get("/make-server-84f9c112/appointments", async (c) => {
  try {
    // Read from Postgres appointment_info table
    const { data: appointments, error } = await supabase
      .from('appointment_info')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("❌ [GET_APPOINTMENTS] Postgres error:", error);
      throw error;
    }
    
    console.log(`📋 [GET_APPOINTMENTS] Returning ${appointments?.length || 0} appointments from Postgres`);
    return c.json({ success: true, data: appointments || [] });
  } catch (error: any) {
    console.error("❌ [GET_APPOINTMENTS] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get Single Appointment by ID
app.get("/make-server-84f9c112/appointments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Read from Postgres
    const { data: appointment, error } = await supabase
      .from('appointment_info')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`❌ [GET_APPOINTMENT] Postgres error:`, error);
      throw error;
    }
    
    if (!appointment) {
      console.warn(`⚠️ [GET_APPOINTMENT] Not found: ${id}`);
      return c.json({ success: false, error: "Appointment not found" }, 404);
    }
    
    console.log(`✅ [GET_APPOINTMENT] Found: ${id}`);
    return c.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error("❌ [GET_APPOINTMENT] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update Appointment
app.put("/make-server-84f9c112/appointments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    // Get existing appointment
    const { data: existing, error: fetchError } = await supabase
      .from('appointment_info')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    if (!existing) {
      return c.json({ success: false, error: "Appointment not found" }, 404);
    }
    
    // Update in Postgres
    const { data: updated, error: updateError } = await supabase
      .from('appointment_info')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    console.log(`✅ [UPDATE_APPOINTMENT] Updated: ${id}`);
    return c.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("❌ [UPDATE_APPOINTMENT] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE: Check-in Logic
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post("/make-server-84f9c112/check-in", async (c) => {
  try {
    const { appointmentId, phoneNumber } = await c.req.json();
    console.log('🔍 [CHECK-IN] Request params:', { appointmentId, phoneNumber });
    
    if (!appointmentId && !phoneNumber) return c.json({ success: false, error: "Missing params" }, 400);
    
    let appointment: any = null;
    
    // Try to find by ID first
    if (appointmentId) {
      console.log('🔍 [CHECK-IN] Searching by ID:', appointmentId);
      appointment = await kv.get(appointmentId);
      if (appointment) {
        console.log('✅ [CHECK-IN] Found by ID:', appointment.id);
      } else {
        console.log('⚠️ [CHECK-IN] Not found by ID, trying phone fallback...');
      }
    }
    
    // Fallback to phone search if ID search failed
    if (!appointment && phoneNumber) {
      console.log('🔍 [CHECK-IN] Searching by phone:', phoneNumber);
      const all = await kv.getByPrefix("appointment:");
      const searchPhone = phoneNumber.replace(/\D/g, '');
      const valid = all.filter((a: any) => 
        a.customerPhone?.replace(/\D/g, '').includes(searchPhone) && 
        ["pending", "confirmed", "booked"].includes(a.status)
      ).sort((a: any, b: any) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
      if (valid.length) {
        appointment = valid[0];
        console.log('✅ [CHECK-IN] Found by phone:', appointment.id);
      }
    }

    if (!appointment) {
      console.log('❌ [CHECK-IN] Appointment not found');
      return c.json({ success: false, error: "Not found" }, 404);
    }

    // Update status to "confirmed" after successful check-in
    if (!["checked-in", "completed", "cancelled"].includes(appointment.status)) {
      appointment.status = "confirmed";
      appointment.checkedInAt = new Date().toISOString();
      await kv.set(appointment.id, appointment);
      console.log('✅ [CHECK-IN] Status updated to confirmed');
      
      // 🔔 Save notification event for real-time updates
      const notificationId = `notification:checkin:${Date.now()}`;
      const notificationData = {
        id: notificationId,
        type: 'checkin',
        appointmentId: appointment.id,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        serviceNames: appointment.serviceNames || [],
        appointmentTime: appointment.appointmentTime,
        checkedInAt: appointment.checkedInAt,
        createdAt: new Date().toISOString(),
      };
      await kv.set(notificationId, notificationData);
      console.log('✅ [CHECK-IN] Notification event saved:', notificationId);
    }
    return c.json({ success: true, data: appointment });
  } catch (e: any) {
    console.error('❌ [CHECK-IN] Error:', e);
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE: Availability Check
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post("/make-server-84f9c112/appointments/availability", async (c) => {
  try {
    const { date, staffId, serviceIds } = await c.req.json();
    
    if (!date) return c.json({ success: false, error: "Date is required" }, 400);
    
    // 0. Fetch Metadata (Services & Staff)
    const [allServices, allStaff, allAppointments] = await Promise.all([
       kv.getByPrefix("service:"),
       kv.getByPrefix("staff:"),
       kv.getByPrefix("appointment:")
    ]);

    const serviceMap = new Map(allServices.map((s: any) => [s.id, s]));

    // 1. Calculate Requested Duration
    let requestedDuration = 30; // Default minimum
    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      let total = 0;
      serviceIds.forEach((id: string) => {
         const s = serviceMap.get(id);
         if (s) {
           let mins = 30; // Default per service
           if (s.durationMinutes) {
              mins = parseInt(s.durationMinutes);
           } else if (s.duration) {
             const match = String(s.duration).match(/(\d+)/);
             if (match) mins = parseInt(match[1]);
           }
           total += mins;
         }
      });
      if (total > 0) requestedDuration = total;
    }

    // 2. Define Working Hours (9:00 AM to 7:00 PM)
    const START_HOUR = 9;
    const END_HOUR = 19; 
    
    const targetDate = new Date(date);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // 3. Filter Appointments for Date
    const dayAppointments = allAppointments.filter((appt: any) => {
       if (appt.status === 'cancelled') return false;
       const apptDate = new Date(appt.appointmentTime);
       return apptDate.toISOString().split('T')[0] === dateStr;
    });

    // 4. Generate Slots
    const availableSlots: string[] = [];
    const interval = 15; // 15 min increments
    
    const startMins = START_HOUR * 60;
    const endMins = END_HOUR * 60;
    
    // Iterate slots
    for (let time = startMins; time <= endMins - requestedDuration; time += interval) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(Math.floor(time / 60), time % 60, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + requestedDuration);
        
        // Skip past times if today
        const now = new Date();
        if (slotStart < now) continue;

        // Determine Candidate Staff
        let candidateStaffIds: string[] = [];
        if (staffId) {
            candidateStaffIds = [staffId];
        } else {
            // "No Preference" -> Check all staff
            candidateStaffIds = allStaff.map((s: any) => s.id);
        }
        
        // Check Availability
        let isSlotAvailable = false;
        
        for (const candidateId of candidateStaffIds) {
            // Find appointments for THIS staff
            const staffAppts = dayAppointments.filter((a: any) => a.staffId === candidateId);
            
            // Check overlap
            const hasOverlap = staffAppts.some((appt: any) => {
                const apptStart = new Date(appt.appointmentTime);
                
                // Calculate duration of EXISTING appointment
                let apptDuration = 45; // Default fallback
                if (appt.serviceIds && Array.isArray(appt.serviceIds)) {
                    let total = 0;
                    appt.serviceIds.forEach((sid: string) => {
                        const s = serviceMap.get(sid);
                        if (s) {
                             let mins = 30;
                             if (s.durationMinutes) mins = parseInt(s.durationMinutes);
                             else if (s.duration) {
                               const match = String(s.duration).match(/(\d+)/);
                               if (match) mins = parseInt(match[1]);
                             }
                             total += mins;
                        }
                    });
                    if (total > 0) apptDuration = total;
                }
                
                const apptEnd = new Date(apptStart);
                apptEnd.setMinutes(apptEnd.getMinutes() + apptDuration);
                
                // Overlap Logic: (StartA < EndB) && (EndA > StartB)
                return (slotStart < apptEnd && slotEnd > apptStart);
            });
            
            if (!hasOverlap) {
                isSlotAvailable = true;
                break; // Found a free staff member!
            }
        }
        
        if (isSlotAvailable) {
            // Format to "HH:mm AM/PM"
            const hours = slotStart.getHours();
            const minutes = slotStart.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h = hours % 12 || 12;
            const m = minutes < 10 ? '0' + minutes : minutes;
            availableSlots.push(`${h < 10 ? '0' + h : h}:${m} ${ampm}`);
        }
    }
    
    return c.json({ success: true, data: availableSlots });
    
  } catch (error: any) {
    console.error("Availability Check Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as appointmentsApp };