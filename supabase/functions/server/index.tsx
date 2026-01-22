import { Hono } from 'npm:hono@4.6.14';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@3.5.0';
import QRCode from 'npm:qrcode@1.5.4';
import { initialServices } from './initial_services.ts';
import * as jose from 'npm:jose@5.2.0';
import { membershipRoutes } from './membership.tsx';
import { app as authApp } from './auth.tsx';
import { app as customersApp } from './customers.tsx';
import rolesApp from './roles.tsx';
import { promotionsApp } from './promotions.tsx';
import galleryApp from './gallery.tsx';
import { vlinkpaySettingsApp } from './vlinkpay-settings.tsx';
import { paymentApp } from './payment.tsx';
import { redeemApp } from './redeem.tsx';

// JWT Secret - in production this should be from environment variable
const JWT_SECRET = new TextEncoder().encode(
  Deno.env.get('JWT_SECRET') || 'bitcoin-nail-bar-secret-key-change-in-production'
);

// Use a single shared Supabase client to prevent connection reset issues
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);

const KV_TABLE = "kv_store_89edbd69";

// Helper to retry failed requests
const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 200): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = String(error);
    
    // Check if error is HTML (Cloudflare error page)
    const isHTMLError = errorStr.includes('<!DOCTYPE html>') || errorStr.includes('<html');
    
    // Retry on network/connection errors and HTML error pages
    const isRetryable = 
      errorStr.includes("connection error") || 
      errorStr.includes("connection reset") || 
      errorStr.includes("network connection lost") || 
      errorStr.includes("gateway error") ||
      errorStr.includes("Internal server error") ||
      errorStr.includes("TypeError") ||
      isHTMLError;
    
    if (retries > 0 && isRetryable) {
      console.warn(`⚠️ [RETRY] Request failed, retrying... (${retries} left). Error type: ${isHTMLError ? 'HTML Error Page (500)' : 'Connection Error'}`);
      await new Promise(r => setTimeout(r, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    console.error(`��� [RETRY] All retries exhausted. Final error:`, error);
    throw error;
  }
};

// Local KV implementation to bypass potential issues in the protected file
const kv = {
  async get(key: string) {
    return retry(async () => {
      const { data, error } = await supabase.from(KV_TABLE).select("value").eq("key", key).maybeSingle();
      if (error) throw new Error(`[KV GET] ${error.message || JSON.stringify(error)}`);
      return data?.value;
    });
  },
  async set(key: string, value: any) {
    return retry(async () => {
      const { error } = await supabase.from(KV_TABLE).upsert({ key, value });
      if (error) throw new Error(`[KV SET] ${error.message || JSON.stringify(error)}`);
    });
  },
  async getByPrefix(prefix: string) {
    return retry(async () => {
      const { data, error } = await supabase.from(KV_TABLE).select("value").like("key", prefix + "%");
      if (error) throw new Error(`[KV GETBYPREFIX] ${error.message || JSON.stringify(error)}`);
      return data?.map((d: any) => d.value) ?? [];
    });
  },
  async mdel(keys: string[]) {
    return retry(async () => {
      const { error } = await supabase.from(KV_TABLE).delete().in("key", keys);
      if (error) throw new Error(`[KV MDEL] ${error.message || JSON.stringify(error)}`);
    });
  }
};

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ========== MOUNT MODULES ==========
app.route('/', authApp);
app.route('/', membershipRoutes);
app.route('/', customersApp);
app.route('/make-server-84f9c112/roles', rolesApp);
app.route('/', promotionsApp);
app.route('/', galleryApp);
app.route('/', vlinkpaySettingsApp);
app.route('/', paymentApp);
app.route('/', redeemApp);

// ========== TYPE DEFINITIONS ==========
interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'owner' | 'admin' | 'staff';
  avatar_url?: string;
  is_active: boolean;
  password_hash?: string; // Hashed password for authentication
  created_at: string;
  created_by: string;
  last_login?: string;
}

interface Session {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

interface StaffDetails {
  user_id: string;
  employee_id: string;
  experience_level: 'senior' | 'full' | 'probation';
  employment_type: 'full-time' | 'part-time';
  hourly_rate?: number;
  commission_rate?: number;
  start_date: string;
  specialties?: string[];
  notes?: string;
}

interface Permissions {
  user_id: string;
  can_manage_services: boolean;
  can_manage_staff: boolean;
  can_view_reports: boolean;
  can_manage_appointments: boolean;
  can_process_payments: boolean;
  can_view_analytics: boolean;
  can_manage_settings: boolean;
}

// ========== HELPER FUNCTIONS ==========
const generateUserId = () => crypto.randomUUID();
const generateSessionToken = () => crypto.randomUUID();

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// ========== JWT HELPER FUNCTIONS ==========
const generateJWT = async (user: User): Promise<string> => {
  const payload = {
    sub: user.id, // subject (user ID)
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    permissions: {
      can_manage_services: user.permissions?.can_manage_services || false,
      can_manage_staff: user.permissions?.can_manage_staff || false,
      can_view_reports: user.permissions?.can_view_reports || false,
      can_manage_appointments: user.permissions?.can_manage_appointments || false,
      can_process_payments: user.permissions?.can_process_payments || false,
      can_view_analytics: user.permissions?.can_view_analytics || false,
      can_manage_settings: user.permissions?.can_manage_settings || false,
    },
  };

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(JWT_SECRET);

  return jwt;
};

const verifyJWT = async (token: string): Promise<any> => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('❌ [JWT] Verification failed:', error);
    return null;
  }
};

// Middleware to verify JWT and attach user to context
const requireAuth = async (c: any, next: any) => {
  // Check for custom session token first (bypasses Supabase Gateway verification)
  let token = c.req.header('X-Session-Token');
  
  // Fallback to Authorization header if X-Session-Token is missing
  if (!token) {
    const authHeader = c.req.header('Authorization');
    token = authHeader?.replace('Bearer ', '');
  }

  if (!token) {
    return c.json({ success: false, error: 'Missing authorization header' }, 401);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }

  // Attach user info to context for downstream handlers
  c.set('user', payload);
  await next();
};

// Middleware to check specific permission
const requirePermission = (permission: string) => {
  return async (c: any, next: any) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Owner has all permissions
    if (user.role === 'owner') {
      await next();
      return;
    }

    // Check specific permission
    if (!user.permissions || !user.permissions[permission]) {
      return c.json({ 
        success: false, 
        error: `Permission denied: ${permission} required` 
      }, 403);
    }

    await next();
  };
};

// ========== EMAIL HELPER FUNCTIONS ==========
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

const sendTestEmail = async (recipientEmail: string) => {
  return await sendEmail(
    recipientEmail,
    'Test Email - Bitcoin Nail Bar',
    `<h1>✅ Test Successful!</h1><p>Resend email configuration is working.</p>`
  );
};

// ========== APPOINTMENT HELPER ==========
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

  // 2. Save Appointment
  const appointmentId = `appointment:${Date.now()}`;
  const appointment = {
    id: appointmentId,
    customerName,
    customerPhone,
    customerEmail,
    branchId,
    staffId,
    serviceIds: finalServiceIds,
    serviceNames: serviceNamesArray,
    appointmentTime,
    status: "pending",
    notes,
    createdAt: new Date().toISOString(),
  };
  
  await kv.set(appointmentId, appointment);
  console.log("✅ [CREATE_APPT] Saved to KV:", appointmentId);

  // 3. Generate QR & Send Email
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
      
      const displayServices = Array.isArray(appointment.serviceNames) ? appointment.serviceNames.join(", ") : 'Selected services';
      
      // QR Generation
      console.log("🎫 [CREATE_APPT] Generating QR code for appointment:", appointmentId);
      const qrData = JSON.stringify({
        id: appointmentId,
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
          const qrFile = new File([bytes], `qr-${appointmentId}.png`, { type: 'image/png' });
          
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

      // Email Template
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light only">
          <meta name="supported-color-schemes" content="light">
          <title>Booking Confirmed - Bitcoin Nail Bar</title>
          <style>
            /* Force light mode - prevent dark mode auto-conversion */
            :root {
              color-scheme: light only;
              supported-color-schemes: light;
            }
            body {
              background-color: #f8fafc !important;
            }
            .email-container {
              background-color: #ffffff !important;
            }
            /* Dark mode override */
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #f8fafc !important;
              }
              .email-container {
                background-color: #ffffff !important;
              }
              [data-ogsc] .email-container {
                background-color: #ffffff !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc !important;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc !important;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff !important; border-radius: 0; overflow: hidden;">
                  
                  <!-- Content Container -->
                  <tr>
                    <td style="padding: 40px 32px 0 32px; background-color: #ffffff !important;">
                      
                      <!-- Greeting -->
                      <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                        <tr>
                          <td>
                            <p style="font-size: 16px; line-height: 24px; color: #45556c !important; margin: 0 0 8px 0;">
                              Hello <strong style="color: #0f172b !important;">${customerName}</strong>,
                            </p>
                            <p style="font-size: 16px; line-height: 24px; color: #45556c !important; margin: 0;">
                              Thank you for booking! We're excited to see you at Bitcoin Nail Bar.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Appointment Details Section -->
                      <table role="presentation" style="width: 100%; margin-bottom: 32px; background: #f8fafc !important; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                        <tr>
                          <td style="padding: 25px; background-color: #f8fafc !important;">
                            <!-- Heading -->
                            <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                              <tr>
                                <td>
                                  <table role="presentation">
                                    <tr>
                                      <td style="padding-right: 8px; vertical-align: middle;">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M15.8333 3.33334H4.16667C3.24619 3.33334 2.5 4.07954 2.5 5.00001V16.6667C2.5 17.5872 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5872 17.5 16.6667V5.00001C17.5 4.07954 16.7538 3.33334 15.8333 3.33334Z" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                          <path d="M13.3333 1.66666V5" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                          <path d="M6.66666 1.66666V5" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                          <path d="M2.5 8.33334H17.5" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                      </td>
                                      <td style="vertical-align: middle;">
                                        <p style="font-size: 20px; font-weight: bold; line-height: 30px; color: #0f172b !important; margin: 0;">
                                          Appointment Details
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- Service Info -->
                            <table role="presentation" style="width: 100%; margin-bottom: 12px;">
                              <tr>
                                <td style="vertical-align: top; padding-right: 12px; width: 40px;">
                                  <div style="width: 40px; height: 40px; background-color: #ffedd4 !important; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                      <path d="M10 6.66666V10L12.5 11.6667" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                  </div>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="font-size: 16px; font-weight: bold; line-height: 24px; color: #0f172b !important; margin: 0 0 2px 0;">
                                    ${displayServices}
                                  </p>
                                  <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                    Bitcoin Nail Bar - Houston, TX
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <!-- Date & Time Info -->
                            <table role="presentation" style="width: 100%;">
                              <tr>
                                <td style="vertical-align: top; padding-right: 12px; width: 40px;">
                                  <div style="width: 40px; height: 40px; background-color: #dbeafe !important; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#155DFC" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                      <path d="M10 5V10L13.3333 11.6667" stroke="#155DFC" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                  </div>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="font-size: 16px; line-height: 24px; color: #0f172b !important; margin: 0 0 2px 0;">
                                    Date & Time
                                  </p>
                                  <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                    ${formattedTime}
                                  </p>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>

                      <!-- Your Ticket Section -->
                      <table role="presentation" style="width: 100%; margin-bottom: 32px;">
                        <tr>
                          <td>
                            <!-- Heading -->
                            <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                              <tr>
                                <td>
                                  <table role="presentation">
                                    <tr>
                                      <td style="padding-right: 8px; vertical-align: middle;">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M15.8333 2.5H4.16667L2.5 7.5V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V7.5L15.8333 2.5Z" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                          <path d="M2.5 7.5H17.5" stroke="#FF9800" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                      </td>
                                      <td style="vertical-align: middle;">
                                        <p style="font-size: 20px; font-weight: bold; line-height: 30px; color: #0f172b !important; margin: 0;">
                                          Your Booking
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- Ticket Card -->
                            <table role="presentation" style="width: 100%; background-color: #ffffff !important; border: 2px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
                              <tr>
                                <!-- QR Code Section -->
                                <td style="background: linear-gradient(135.223deg, #0B0F19 0%, #1d293d 100%) !important; padding: 32px; text-align: center; vertical-align: middle; width: 258px;">
                                  ${qrCodeUrl ? `
                                    <div style="background-color: #ffffff; border-radius: 10px; padding: 16px; display: inline-block; box-shadow: inset 0px 2px 4px 0px rgba(0,0,0,0.05);">
                                      <img src="${qrCodeUrl}" width="160" height="160" alt="Check-in QR Code" style="display: block;" />
                                    </div>
                                  ` : '<div style="width: 192px; height: 192px; background-color: #f1f5f9; border-radius: 10px;"></div>'}
                                </td>
                                
                                <!-- Booking Info Section -->
                                <td style="padding: 24px; vertical-align: top; background-color: #ffffff !important;">
                                  <!-- Booking ID & Status -->
                                  <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                                    <tr>
                                      <td style="vertical-align: top;">
                                        <p style="font-size: 12px; line-height: 16px; color: #62748e !important; text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 4px 0;">
                                          Booking ID
                                        </p>
                                        <div style="background-color: #f1f5f9 !important; border: 1px solid #cad5e2; border-radius: 10px; padding: 8px 13px;">
                                          <p style="font-family: Consolas, monospace; font-size: 16px; line-height: 24px; color: #0f172b !important; letter-spacing: 0.8px; margin: 0;">
                                            ${appointmentId.split(':')[1].substring(0, 8).toUpperCase()}
                                          </p>
                                        </div>
                                      </td>
                                      <td style="text-align: right; vertical-align: top;">
                                        <div style="background-color: #dcfce7 !important; border-radius: 999px; padding: 4px 12px; display: inline-block;">
                                          <p style="font-size: 12px; line-height: 16px; color: #016630 !important; margin: 0;">
                                            Active
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>

                                  <!-- Customer Info -->
                                  <table role="presentation" style="width: 100%; border-top: 1px solid #e2e8f0; padding-top: 17px;">
                                    <tr>
                                      <td style="padding-bottom: 12px;">
                                        <table role="presentation">
                                          <tr>
                                            <td style="padding-right: 8px; vertical-align: middle;">
                                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0524 11.2811 12.5523 10.781C12.0522 10.281 11.3739 10 10.6667 10H5.33333C4.62609 10 3.94781 10.281 3.44772 10.781C2.94762 11.2811 2.66667 11.9594 2.66667 12.6667V14" stroke="#90A1B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M8 7.33333C9.47276 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667C5.33333 6.13943 6.52724 7.33333 8 7.33333Z" stroke="#90A1B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                              </svg>
                                            </td>
                                            <td style="vertical-align: middle;">
                                              <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                                <span style="color: #90A1B9; margin-right: 4px;">Name:</span> ${customerName}
                                              </p>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding-bottom: 12px;">
                                        <table role="presentation">
                                          <tr>
                                            <td style="padding-right: 8px; vertical-align: middle;">
                                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14.6666 11.2733V13.2733C14.6673 13.4607 14.6295 13.6461 14.5558 13.8172C14.4822 13.9883 14.3743 14.1412 14.2393 14.2657C14.1044 14.3903 13.9455 14.4836 13.7731 14.5394C13.6008 14.5952 13.4189 14.6121 13.2399 14.5893C11.2533 14.3733 9.35634 13.6951 7.66663 12.6C6.09559 11.5647 4.76856 10.2377 3.73329 8.66665C2.63385 6.96863 1.95604 5.06001 1.74663 3.06665C1.72379 2.88796 1.74059 2.70638 1.79592 2.53427C1.85124 2.36217 1.94382 2.20352 2.06746 2.06903C2.19111 1.93453 2.34293 1.82736 2.51268 1.75475C2.68244 1.68214 2.86616 1.6458 3.05129 1.648H5.05129C5.38575 1.64478 5.70954 1.7667 5.95596 1.98863C6.20239 2.21056 6.3537 2.51659 6.37863 2.84332C6.42514 3.47352 6.57917 4.09117 6.83329 4.66665C6.93427 4.89308 6.95604 5.14589 6.89552 5.38883C6.835 5.63177 6.69527 5.85226 6.49663 6.01865L5.64663 6.86665C6.59858 8.54019 7.99309 9.9347 9.66663 10.8867L10.5133 10.0333C10.6797 9.83468 10.9002 9.69495 11.1431 9.63443C11.3861 9.57391 11.6389 9.59568 11.8653 9.69665C12.4408 9.95078 13.0584 10.1048 13.6886 10.1513C14.0175 10.1764 14.3252 10.3291 14.5478 10.5776C14.7704 10.8261 14.8916 11.1523 14.8866 11.4867L14.6666 11.2733Z" stroke="#90A1B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                              </svg>
                                            </td>
                                            <td style="vertical-align: middle;">
                                              <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                                <span style="color: #90A1B9; margin-right: 4px;">Phone:</span> ${customerPhone}
                                              </p>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <table role="presentation">
                                          <tr>
                                            <td style="padding-right: 8px; vertical-align: middle;">
                                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.66667 2.66667H13.3333C14.0667 2.66667 14.6667 3.26667 14.6667 4V12C14.6667 12.7333 14.0667 13.3333 13.3333 13.3333H2.66667C1.93333 13.3333 1.33333 12.7333 1.33333 12V4C1.33333 3.26667 1.93333 2.66667 2.66667 2.66667Z" stroke="#90A1B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M14.6667 4L8 8.66667L1.33333 4" stroke="#90A1B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                              </svg>
                                            </td>
                                            <td style="vertical-align: middle;">
                                              <p style="font-size: 14px; line-height: 20px; color: #64748b !important; margin: 0;">
                                                <span style="color: #90A1B9; margin-right: 4px;">Email:</span> ${customerEmail}
                                              </p>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>

                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>

                      <!-- Important Check-in Information -->
                      <table role="presentation" style="width: 100%; margin-bottom: 32px; background-color: #fffbeb !important; border-left: 4px solid #FF9800; border-radius: 0 10px 10px 0; overflow: hidden;">
                        <tr>
                          <td style="padding: 20px 20px 20px 24px; background-color: #fffbeb !important;">
                            <table role="presentation" style="width: 100%;">
                              <tr>
                                <td style="vertical-align: top; padding-right: 12px; width: 24px;">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E17100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 8V12" stroke="#E17100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 16H12.01" stroke="#E17100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                  </svg>
                                </td>
                                <td style="vertical-align: top;">
                                  <p style="font-size: 18px; font-weight: bold; line-height: 27px; color: #7b3306 !important; margin: 0 0 8px 0;">
                                    Important Check-in Information
                                  </p>
                                  <ul style="margin: 0; padding: 0; list-style: none;">
                                    <li style="font-size: 14px; line-height: 20px; color: #973c00 !important; margin-bottom: 4px;">
                                      • Please present this QR code at the reception desk
                                    </li>
                                    <li style="font-size: 14px; line-height: 20px; color: #973c00 !important; margin-bottom: 4px;">
                                      • You can save this email or screenshot the QR code
                                    </li>
                                    <li style="font-size: 14px; line-height: 20px; color: #973c00 !important; margin-bottom: 4px;">
                                      • Arrive 5-10 minutes before your appointment
                                    </li>
                                    <li style="font-size: 14px; line-height: 20px; color: #973c00 !important;">
                                      • One QR code = One booking entry
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Section -->
                      <table role="presentation" style="width: 100%; margin-bottom: 32px; background: #FF9800 !important; border-radius: 14px; padding: 24px; text-align: center;">
                        <tr>
                          <td style="background-color: #FF9800 !important;">
                            <p style="font-size: 16px; line-height: 24px; color: #ffffff !important; margin: 0 0 12px 0;">
                              Need help or want to reschedule?
                            </p>
                            <table role="presentation" style="margin: 0 auto;">
                              <tr>
                                <td style="background-color: #ffffff !important; border-radius: 10px; padding: 12px 32px;">
                                  <a href="tel:+18327993990" style="font-size: 16px; font-weight: bold; line-height: 24px; color: #FF9800 !important; text-decoration: none;">
                                    Call Us: (832) 799-3990
                                  </a>
                                </td>
                              </tr>
                            </table>
                            <p style="font-size: 14px; line-height: 20px; color: #ffffff !important; margin: 12px 0 0 0;">
                              9793 Westheimer Rd, Houston, TX 77042
                            </p>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 0 32px 40px 32px; border-top: 1px solid #e2e8f0; background-color: #ffffff !important;">
                      <table role="presentation" style="width: 100%; padding-top: 33px;">
                        <tr>
                          <td style="text-align: center;">
                            <p style="font-size: 14px; line-height: 20px; color: #62748e !important; margin: 0 0 8px 0;">
                              Questions? Contact our support team
                            </p>
                            <p style="font-size: 12px; line-height: 16px; color: #90a1b9 !important; margin: 0;">
                              © 2026 Bitcoin Nail Bar. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await sendEmail(customerEmail, '✅ Appointment Confirmed - Bitcoin Nail Bar', emailHtml);
      emailSent = true;
      
    } catch (err: any) {
      console.error("❌ [CREATE_APPT] Email/QR error:", err);
      emailError = err.message;
    }
  }

  return { appointment, emailSent, emailError, qrCodeUrl };
}

// Routes
app.get("/make-server-84f9c112/health", (c) => c.json({ status: "ok", version: "v7-staff-management" }));

// ========== SETUP ENDPOINTS ==========

// Check if owner exists
app.get('/make-server-84f9c112/setup/check', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    const hasOwner = users.some((user: User) => user.role === 'owner');
    
    console.log(`🔍 [SETUP CHECK] Owner exists: ${hasOwner}`);
    return c.json({ success: true, data: { has_owner: hasOwner } });
  } catch (error: any) {
    console.error('❌ [SETUP CHECK] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Debug: List all users (without password hashes for security)
app.get('/make-server-84f9c112/debug/users', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    
    // Remove password hashes for security
    const sanitizedUsers = users.map((user: User) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      created_by: user.created_by,
      has_password: !!user.password_hash, // Just indicate if password exists
    }));
    
    console.log(`🔍 [DEBUG USERS] Found ${users.length} users`);
    sanitizedUsers.forEach((user: any) => {
      console.log(`  - ${user.email} (${user.role}) - Active: ${user.is_active} - Has Password: ${user.has_password}`);
    });
    
    return c.json({ 
      success: true, 
      data: { 
        users: sanitizedUsers,
        total_count: users.length,
        owner_count: users.filter((u: User) => u.role === 'owner').length,
        admin_count: users.filter((u: User) => u.role === 'admin').length,
        staff_count: users.filter((u: User) => u.role === 'staff').length,
      } 
    });
  } catch (error: any) {
    console.error('❌ [DEBUG USERS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Debug: List all sessions
app.get('/make-server-84f9c112/debug/sessions', async (c) => {
  try {
    const sessions = await kv.getByPrefix('session:');
    
    const sessionDetails = sessions.map((session: Session) => ({
      token: session.token,
      user_id: session.user_id,
      created_at: session.created_at,
      expires_at: session.expires_at,
      is_expired: new Date() > new Date(session.expires_at),
    }));
    
    console.log(`🔍 [DEBUG SESSIONS] Found ${sessions.length} sessions`);
    sessionDetails.forEach((s: any) => {
      console.log(`  - Token: ${s.token} | User: ${s.user_id} | Expired: ${s.is_expired}`);
    });
    
    return c.json({ 
      success: true, 
      data: { 
        sessions: sessionDetails,
        total_count: sessions.length,
        active_count: sessionDetails.filter((s: any) => !s.is_expired).length,
        expired_count: sessionDetails.filter((s: any) => s.is_expired).length,
      } 
    });
  } catch (error: any) {
    console.error('❌ [DEBUG SESSIONS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Debug: Get user password hash (FOR DEBUG ONLY - REMOVE IN PRODUCTION)
app.post('/make-server-84f9c112/debug/get-hash', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ success: false, error: 'Email is required' }, 400);
    }

    const users = await kv.getByPrefix('user:');
    const user = users.find((u: User) => u.email === email);

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    console.log(`🔍 [DEBUG GET HASH] Email: ${email}`);
    console.log(`🔍 [DEBUG GET HASH] Hash: ${user.password_hash}`);

    return c.json({ 
      success: true, 
      data: { 
        email: user.email,
        password_hash: user.password_hash,
        has_hash: !!user.password_hash,
      } 
    });
  } catch (error: any) {
    console.error('❌ [DEBUG GET HASH] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create owner account (one-time only)
app.post('/make-server-84f9c112/setup/owner', async (c) => {
  try {
    const { full_name, email, phone, password } = await c.req.json();

    // Validate required fields
    if (!full_name || !email || !password) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    // Check if owner already exists
    const users = await kv.getByPrefix('user:');
    const hasOwner = users.some((user: User) => user.role === 'owner');
    
    if (hasOwner) {
      return c.json({ success: false, error: 'Owner account already exists' }, 403);
    }

    // Check if email already exists
    const emailExists = users.some((user: User) => user.email === email);
    if (emailExists) {
      return c.json({ success: false, error: 'Email already in use' }, 400);
    }

    // Generate a simple user ID (in production, use UUID)
    const userId = `owner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Hash password using Web Crypto API (available in Deno)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create user record
    const user: User = {
      id: userId,
      email,
      full_name,
      phone,
      role: 'owner',
      is_active: true,
      password_hash, // Store hashed password
      created_at: new Date().toISOString(),
      created_by: userId, // self-created
    };

    await kv.set(`user:${userId}`, user);

    // Create owner permissions (full access)
    const permissions: Permissions = {
      user_id: userId,
      can_manage_services: true,
      can_manage_staff: true,
      can_view_reports: true,
      can_manage_appointments: true,
      can_process_payments: true,
      can_view_analytics: true,
      can_manage_settings: true,
    };

    await kv.set(`permissions:${userId}`, permissions);

    console.log(`✅ [CREATE OWNER] Owner created: ${email}`);
    
    // Return user without password_hash
    const { password_hash: _, ...userWithoutPassword } = user;
    
    return c.json({ 
      success: true, 
      data: { user: userWithoutPassword, permissions } 
    });
  } catch (error: any) {
    console.error('❌ [CREATE OWNER] Exception:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== AUTHENTICATION ENDPOINTS ==========
// NOTE: Auth routes (login, verify, logout) and User Management have been moved to auth.tsx module

// Test Email
app.get("/make-server-84f9c112/test-email", async (c) => {
  try {
    const data = await sendTestEmail("thaob1203247@gmail.com");
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post("/make-server-84f9c112/test-resend-direct", async (c) => {
  try {
    const body = await c.req.json();
    const result = await sendEmail(body.email || "thaob1203247@gmail.com", 'Test', '<h1>Success</h1>');
    return c.json(result);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// KV CRUD
const kvRoutes = ['branches', 'services', 'staff', 'appointments', 'reviews'];
kvRoutes.forEach(route => {
  app.get(`/make-server-84f9c112/${route}`, async (c) => {
    try {
      // Map plural route to singular prefix
      const prefixMap: Record<string, string> = {
        'branches': 'branch',
        'services': 'service',
        'staff': 'staff',
        'appointments': 'appointment',
        'reviews': 'review'
      };
      const prefix = prefixMap[route] || route.slice(0, -1);
      const items = await kv.getByPrefix(`${prefix}:`);
      
      // Special handling for services: add booking count and classification
      if (route === 'services') {
        const allAppointments = await kv.getByPrefix("appointment:");
        const serviceBookingCount: Record<string, number> = {};
        
        allAppointments.forEach((appt: any) => {
          if (Array.isArray(appt.serviceIds)) {
            appt.serviceIds.forEach((serviceId: string) => {
              serviceBookingCount[serviceId] = (serviceBookingCount[serviceId] || 0) + 1;
            });
          }
        });
        
        const enrichedServices = items.map((s: any) => ({
          ...s,
          bookingCount: serviceBookingCount[s.id] || 0,
          isOwnerRecommended: s.owner_recommended === true
        })).sort((a, b) => b.bookingCount - a.bookingCount);
        
        return c.json({ success: true, data: enrichedServices });
      }
      
      return c.json({ success: true, data: items });
    } catch (e) { return c.json({ success: false, error: String(e) }, 500); }
  });
});

app.post("/make-server-84f9c112/branches", async (c) => {
  const body = await c.req.json();
  const id = `branch:${Date.now()}`;
  await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
  return c.json({ success: true, data: { id, ...body } });
});

app.post("/make-server-84f9c112/services", async (c) => {
  const body = await c.req.json();
  const id = `service:${Date.now()}`;
  await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
  return c.json({ success: true, data: { id, ...body } });
});

// DELETE Service
app.delete("/make-server-84f9c112/services/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️  [DELETE SERVICE] Deleting service: ${id}`);
    
    // Delete from KV store using direct Supabase delete
    const { error } = await supabase.from(KV_TABLE).delete().eq("key", id);
    
    if (error) {
      console.error("❌ [DELETE SERVICE] Error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`✅ [DELETE SERVICE] Successfully deleted: ${id}`);
    return c.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("❌ [DELETE SERVICE] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE Branch
app.delete("/make-server-84f9c112/branches/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`🗑️  [DELETE BRANCH] Deleting branch: ${id}`);
    
    // Delete from KV store using direct Supabase delete
    const { error } = await supabase.from(KV_TABLE).delete().eq("key", id);
    
    if (error) {
      console.error("❌ [DELETE BRANCH] Error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`✅ [DELETE BRANCH] Successfully deleted: ${id}`);
    return c.json({ success: true, message: "Branch deleted successfully" });
  } catch (error: any) {
    console.error("❌ [DELETE BRANCH] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/make-server-84f9c112/staff", async (c) => {
  try {
    const body = await c.req.json();
    const id = `staff:${Date.now()}`;
    await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
    return c.json({ success: true, data: { id, ...body } });
  } catch (error: any) {
    console.error("Error creating staff:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Seed Staff Data - Creates 6 realistic staff members based on US nail salon business
app.post("/make-server-84f9c112/staff/seed", async (c) => {
  try {
    const seedStaff = [
      {
        name: "Jennifer Martinez",
        nickname: "Jenny",
        phone: "(714) 555-0123",
        email: "jennifer.martinez@bitcoinnailbar.com",
        role: "Lead Technician",
        hireDate: "2023-01-15",
        employmentType: "W2",
        licenseNumber: "CA-NT-987456",
        baseHourlyRate: "18.00",
        commissionRate: 0.70,
        tipSplit: "100",
        specialties: ["Manicure", "Pedicure", "Gel Polish", "Nail Art", "Nail Extension"],
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        emergencyContactName: "Maria Martinez",
        emergencyContactPhone: "(714) 555-0124"
      },
      {
        name: "Linda Nguyen",
        nickname: "Linda",
        phone: "(714) 555-0145",
        email: "linda.nguyen@bitcoinnailbar.com",
        role: "Senior Nail Artist",
        hireDate: "2023-03-20",
        employmentType: "1099",
        licenseNumber: "CA-NT-876543",
        baseHourlyRate: "16.50",
        commissionRate: 0.65,
        tipSplit: "100",
        specialties: ["Nail Art", "Acrylic", "Gel Polish", "Nail Extension"],
        workingDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        emergencyContactName: "Tom Nguyen",
        emergencyContactPhone: "(714) 555-0146"
      },
      {
        name: "Sarah Johnson",
        nickname: "Sarah",
        phone: "(714) 555-0167",
        email: "sarah.johnson@bitcoinnailbar.com",
        role: "Nail Technician",
        hireDate: "2023-06-10",
        employmentType: "W2",
        licenseNumber: "CA-NT-765432",
        baseHourlyRate: "15.50",
        commissionRate: 0.60,
        tipSplit: "100",
        specialties: ["Manicure", "Pedicure", "Gel Polish", "Dip Powder"],
        workingDays: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
        emergencyContactName: "Mike Johnson",
        emergencyContactPhone: "(714) 555-0168"
      },
      {
        name: "Mai Tran",
        nickname: "Mai",
        phone: "(714) 555-0189",
        email: "mai.tran@bitcoinnailbar.com",
        role: "Pedicure Specialist",
        hireDate: "2023-08-05",
        employmentType: "W2",
        licenseNumber: "CA-NT-654321",
        baseHourlyRate: "15.50",
        commissionRate: 0.60,
        tipSplit: "100",
        specialties: ["Pedicure", "Spa Treatment", "Manicure", "Gel Polish"],
        workingDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        emergencyContactName: "Linh Tran",
        emergencyContactPhone: "(714) 555-0190"
      },
      {
        name: "Jessica Lee",
        nickname: "Jess",
        phone: "(714) 555-0201",
        email: "jessica.lee@bitcoinnailbar.com",
        role: "Nail Technician",
        hireDate: "2024-01-12",
        employmentType: "1099",
        licenseNumber: "CA-NT-543210",
        baseHourlyRate: "15.00",
        commissionRate: 0.55,
        tipSplit: "100",
        specialties: ["Manicure", "Gel Polish", "Dip Powder", "Acrylic"],
        workingDays: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
        emergencyContactName: "David Lee",
        emergencyContactPhone: "(714) 555-0202"
      },
      {
        name: "Emily Chen",
        nickname: "Em",
        phone: "(714) 555-0223",
        email: "emily.chen@bitcoinnailbar.com",
        role: "Apprentice",
        hireDate: "2024-09-01",
        employmentType: "W2",
        licenseNumber: "CA-NT-432109",
        baseHourlyRate: "14.00",
        commissionRate: 0.50,
        tipSplit: "100",
        specialties: ["Manicure", "Pedicure", "Gel Polish"],
        workingDays: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
        emergencyContactName: "Amy Chen",
        emergencyContactPhone: "(714) 555-0224"
      }
    ];

    const created = [];
    for (const staff of seedStaff) {
      const id = `staff:${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await kv.set(id, { id, ...staff, createdAt: new Date().toISOString() });
      created.push({ id, ...staff });
      // Small delay to ensure unique timestamps
      await new Promise(r => setTimeout(r, 10));
    }

    return c.json({ 
      success: true, 
      message: `Successfully seeded ${created.length} staff members`,
      data: created 
    });
  } catch (error: any) {
    console.error("Error seeding staff:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/make-server-84f9c112/reviews", async (c) => {
  const body = await c.req.json();
  const id = `review:${Date.now()}`;
  await kv.set(id, { id, ...body, createdAt: new Date().toISOString() });
  return c.json({ success: true, data: { id, ...body } });
});

// ========== CUSTOMER ENDPOINTS ==========
// Lookup customer by phone number
app.get("/make-server-84f9c112/customers/phone/:phone", async (c) => {
  try {
    const phone = c.req.param("phone");
    const normalizedPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    
    console.log(`🔍 [LOOKUP CUSTOMER] Phone: ${normalizedPhone}`);
    
    // Try to find customer by normalized phone
    const customerKey = `customer:${normalizedPhone}`;
    const customerData = await kv.get(customerKey);
    
    if (customerData) {
      console.log(`✅ [LOOKUP CUSTOMER] Found customer:`, customerData.name);
      return c.json({ success: true, data: customerData });
    }
    
    console.log(`ℹ️  [LOOKUP CUSTOMER] No customer found for phone: ${normalizedPhone}`);
    return c.json({ success: true, data: null });
  } catch (error: any) {
    console.error(`❌ [LOOKUP CUSTOMER] Error:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save/Update customer info
app.post("/make-server-84f9c112/customers", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, name, email } = body;
    
    if (!phone || !name) {
      return c.json({ success: false, error: "Phone and name are required" }, 400);
    }
    
    const normalizedPhone = phone.replace(/\D/g, '');
    const customerKey = `customer:${normalizedPhone}`;
    
    const customerData = {
      phone: normalizedPhone,
      name,
      email: email || "",
      lastUpdated: new Date().toISOString(),
    };
    
    await kv.set(customerKey, customerData);
    console.log(`✅ [SAVE CUSTOMER] Saved customer: ${name} (${normalizedPhone})`);
    
    return c.json({ success: true, data: customerData });
  } catch (error: any) {
    console.error(`❌ [SAVE CUSTOMER] Error:`, error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

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
    const appointments = await kv.getByPrefix("appointment:");
    
    // Sort by creation time (newest first)
    const sorted = appointments.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.appointmentTime).getTime();
      const timeB = new Date(b.createdAt || b.appointmentTime).getTime();
      return timeB - timeA;
    });
    
    console.log(`📋 [GET_APPOINTMENTS] Returning ${sorted.length} appointments`);
    return c.json({ success: true, data: sorted });
  } catch (error: any) {
    console.error("❌ [GET_APPOINTMENTS] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get Single Appointment by ID
app.get("/make-server-84f9c112/appointments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const appointment = await kv.get(id);
    
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
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = await kv.get(id);
  if (!existing) return c.json({ success: false, error: "Not found" }, 404);
  const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
  await kv.set(id, updated);
  return c.json({ success: true, data: updated });
});

// Check-in Endpoint
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

// ========== SOCIAL MEDIA SETTINGS ==========
// Get Social Media Links
app.get("/make-server-84f9c112/settings/social-media", async (c) => {
  try {
    const socialMedia = await kv.get("settings:social-media");
    if (!socialMedia) {
      // Return default with only Facebook
      return c.json({
        success: true,
        data: {
          facebook: "https://www.facebook.com/bitcoinnailbar",
          instagram: "",
          tiktok: ""
        }
      });
    }
    return c.json({ success: true, data: socialMedia });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update Social Media Links
app.put("/make-server-84f9c112/settings/social-media", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings:social-media", {
      facebook: body.facebook || "",
      instagram: body.instagram || "",
      tiktok: body.tiktok || "",
      updatedAt: new Date().toISOString()
    });
    return c.json({ success: true, data: body });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== DASHBOARD STATS ==========
app.get("/make-server-84f9c112/dashboard/stats", async (c) => {
  try {
    const appointments = await kv.getByPrefix("appointment:");
    const staff = await kv.getByPrefix("staff:");
    const services = await kv.getByPrefix("service:");
    
    // 🔍 DEBUG LOGGING
    console.log("📊 [DASHBOARD] Total records:");
    console.log("   - Appointments:", appointments.length);
    console.log("   - Staff:", staff.length);
    console.log("   - Services:", services.length);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Filter today's appointments
    const todayAppointments = appointments.filter((appt: any) => {
      const apptDate = new Date(appt.appointmentTime);
      return apptDate >= today;
    });
    
    const yesterdayAppointments = appointments.filter((appt: any) => {
      const apptDate = new Date(appt.appointmentTime);
      return apptDate >= yesterday && apptDate < today;
    });
    
    // Calculate revenue (completed appointments only)
    const completedToday = todayAppointments.filter((a: any) => a.status === 'completed');
    const completedYesterday = yesterdayAppointments.filter((a: any) => a.status === 'completed');
    
    // Calculate revenue based on services
    const calculateRevenue = (appointments: any[]) => {
      let total = 0;
      appointments.forEach((appt: any) => {
        if (appt.serviceIds && Array.isArray(appt.serviceIds)) {
          appt.serviceIds.forEach((serviceId: string) => {
            const service = services.find((s: any) => s.id === serviceId);
            if (service && service.price) {
              total += parseFloat(service.price);
            }
          });
        }
      });
      return total;
    };
    
    const todayRevenue = calculateRevenue(completedToday);
    const yesterdayRevenue = calculateRevenue(completedYesterday);
    const revenueChange = yesterdayRevenue > 0 
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : 0;
    
    // Active tickets (pending or confirmed today)
    const activeTickets = todayAppointments.filter((a: any) => 
      a.status === 'pending' || a.status === 'confirmed'
    );
    
    const waitingForCheckout = completedToday.length;
    
    // Staff status (available vs busy)
    const busyStaffIds = todayAppointments
      .filter((a: any) => a.status === 'confirmed' || a.status === 'pending')
      .map((a: any) => a.staffId);
    
    const availableStaff = staff.filter((s: any) => !busyStaffIds.includes(s.id));
    const busyStaff = staff.filter((s: any) => busyStaffIds.includes(s.id));
    
    // Waitlist (pending appointments)
    const waitlist = todayAppointments.filter((a: any) => a.status === 'pending');
    
    // Recent activity (last 10 completed appointments)
    const recentCompleted = appointments
      .filter((a: any) => a.status === 'completed')
      .sort((a: any, b: any) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime())
      .slice(0, 10)
      .map((appt: any) => {
        const staffMember = staff.find((s: any) => s.id === appt.staffId);
        const apptServices = services.filter((s: any) => 
          appt.serviceIds && appt.serviceIds.includes(s.id)
        );
        const price = apptServices.reduce((sum: number, s: any) => sum + parseFloat(s.price || 0), 0);
        
        return {
          id: appt.id.replace('appointment:', '#'),
          client: appt.customerName,
          service: apptServices.map((s: any) => s.name).join(', ') || 'Service',
          staff: staffMember ? staffMember.name : 'Staff',
          price: `$${price.toFixed(2)}`,
          status: appt.status
        };
      });
    
    // Staff status details - Return ALL staff (pagination handled in frontend)
    const staffStatus = staff.map((s: any) => {
      const isBusy = busyStaffIds.includes(s.id);
      const staffAppt = isBusy ? todayAppointments.find((a: any) => a.staffId === s.id) : null;
      
      let busyUntil = '';
      if (staffAppt) {
        // Calculate busy until time based on service duration
        const apptServices = services.filter((service: any) => 
          staffAppt.serviceIds && staffAppt.serviceIds.includes(service.id)
        );
        const totalDuration = apptServices.reduce((sum: number, service: any) => {
          return sum + (parseInt(service.duration) || 30);
        }, 0);
        
        const apptStartTime = new Date(staffAppt.appointmentTime);
        const apptEndTime = new Date(apptStartTime.getTime() + totalDuration * 60000);
        
        // Format busy until time
        const hours = apptEndTime.getHours();
        const minutes = apptEndTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        busyUntil = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }
      
      return {
        name: s.name,
        status: isBusy ? 'Busy' : 'Available',
        color: isBusy ? 'bg-orange-500' : 'bg-green-500',
        text: isBusy ? `Busy until ${busyUntil}` : 'Available',
        busyUntil: busyUntil,
        isBusy: isBusy
      };
    });
    
    return c.json({
      success: true,
      data: {
        stats: {
          revenue: {
            value: `$${todayRevenue.toFixed(0)}`,
            change: revenueChange,
            subtext: `${revenueChange >= 0 ? '+' : ''}${revenueChange}% from yesterday`
          },
          activeTickets: {
            value: activeTickets.length.toString(),
            subtext: `${waitingForCheckout} waiting for checkout`
          },
          staff: {
            value: `${availableStaff.length}/${staff.length}`,
            subtext: `${busyStaff.length} busy with clients`
          },
          waitlist: {
            value: waitlist.length.toString(),
            subtext: waitlist.length > 0 ? '~15 min avg wait' : 'No waiting clients'
          }
        },
        recentActivity: recentCompleted,
        staffStatus: staffStatus
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== DEBUG ENDPOINT - Check Data Quality ==========
app.get("/make-server-84f9c112/debug/data-check", async (c) => {
  try {
    const staff = await kv.getByPrefix("staff:");
    const appointments = await kv.getByPrefix("appointment:");
    const services = await kv.getByPrefix("service:");
    const branches = await kv.getByPrefix("branch:");
    
    // Group staff by name to find duplicates
    const staffByName: any = {};
    staff.forEach((s: any) => {
      if (!staffByName[s.name]) {
        staffByName[s.name] = [];
      }
      staffByName[s.name].push(s);
    });
    
    const duplicateStaff = Object.entries(staffByName)
      .filter(([name, records]: [string, any]) => records.length > 1)
      .map(([name, records]: [string, any]) => ({
        name,
        count: records.length,
        ids: records.map((r: any) => r.id)
      }));
    
    // Group branches by name to find duplicates
    const branchesByName: any = {};
    branches.forEach((b: any) => {
      const branchName = b.name || 'Unknown';
      if (!branchesByName[branchName]) {
        branchesByName[branchName] = [];
      }
      branchesByName[branchName].push(b);
    });
    
    const duplicateBranches = Object.entries(branchesByName)
      .filter(([name, records]: [string, any]) => records.length > 1)
      .map(([name, records]: [string, any]) => ({
        name,
        count: records.length,
        ids: records.map((r: any) => r.id)
      }));
    
    return c.json({
      success: true,
      data: {
        totals: {
          staff: staff.length,
          appointments: appointments.length,
          services: services.length,
          branches: branches.length
        },
        duplicates: {
          staff: duplicateStaff,
          totalDuplicates: duplicateStaff.reduce((sum, d) => sum + d.count - 1, 0),
          branches: duplicateBranches,
          totalBranchDuplicates: duplicateBranches.reduce((sum, d) => sum + d.count - 1, 0)
        },
        sampleStaff: staff.slice(0, 3).map((s: any) => ({
          id: s.id,
          name: s.name,
          role: s.role
        })),
        sampleBranches: branches.slice(0, 5).map((b: any) => ({
          id: b.id,
          name: b.name || 'N/A',
          address: b.address || 'N/A'
        }))
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== BULK CLEAN ENDPOINTS ==========
// Clean all appointments
app.post("/make-server-84f9c112/debug/clean-appointments", async (c) => {
  try {
    const { ids } = await c.req.json();
    console.log(`🗑️  [CLEAN APPOINTMENTS] Deleting ${ids.length} appointments`);
    
    const { error } = await supabase.from(KV_TABLE).delete().in("key", ids);
    
    if (error) {
      console.error("❌ [CLEAN APPOINTMENTS] Error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`✅ [CLEAN APPOINTMENTS] Successfully deleted ${ids.length} appointments`);
    return c.json({ success: true, message: `Deleted ${ids.length} appointments` });
  } catch (error: any) {
    console.error("❌ [CLEAN APPOINTMENTS] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Clean all staff
app.post("/make-server-84f9c112/debug/clean-staff", async (c) => {
  try {
    const { ids } = await c.req.json();
    console.log(`🗑️  [CLEAN STAFF] Deleting ${ids.length} staff`);
    
    const { error } = await supabase.from(KV_TABLE).delete().in("key", ids);
    
    if (error) {
      console.error("❌ [CLEAN STAFF] Error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log(`✅ [CLEAN STAFF] Successfully deleted ${ids.length} staff`);
    return c.json({ success: true, message: `Deleted ${ids.length} staff` });
  } catch (error: any) {
    console.error("❌ [CLEAN STAFF] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== CLEANUP DUPLICATES ENDPOINT ========== [v2.0 - Fixed mdel]
app.post("/make-server-84f9c112/debug/cleanup-duplicates", async (c) => {
  try {
    console.log("🧹 [CLEANUP v2] Endpoint called - Direct Supabase delete");
    console.log(`   Table: ${KV_TABLE}`);
    
    // Use shared supabase client
    const { data: rawData, error } = await supabase
      .from(KV_TABLE)
      .select("key, value")
      .like("key", "staff:%");
    
    console.log(`   Raw query result: ${rawData?.length || 0} records`);
    
    if (error) {
      console.error("❌ [CLEANUP] Database query error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!rawData || rawData.length === 0) {
      console.log("ℹ️  [CLEANUP] No staff records found");
      return c.json({
        success: true,
        data: {
          deletedCount: 0,
          remainingCount: 0,
          keptRecords: [],
          summary: "No staff records found to clean"
        }
      });
    }
    
    const staff = rawData.map((d: any) => ({ ...d.value, key: d.key }));
    
    console.log("🧹 [CLEANUP] Starting duplicate cleanup...");
    console.log(`   Total staff records before: ${staff.length}`);
    
    // Group staff by name
    const staffByName: any = {};
    staff.forEach((s: any) => {
      if (!staffByName[s.name]) {
        staffByName[s.name] = [];
      }
      staffByName[s.name].push(s);
    });
    
    let deletedCount = 0;
    const keepRecords: string[] = [];
    const deleteKeys: string[] = [];
    
    // For each name group, keep the oldest record (by key timestamp)
    for (const [name, records] of Object.entries(staffByName) as [string, any][]) {
      if (records.length > 1) {
        // Sort by key to find oldest (earliest timestamp in key)
        records.sort((a: any, b: any) => {
          const timestampA = parseInt(a.key.split(':')[1] || '0');
          const timestampB = parseInt(b.key.split(':')[1] || '0');
          return timestampA - timestampB;
        });
        
        // Keep the first (oldest)
        const keepRecord = records[0];
        keepRecords.push(keepRecord.key);
        
        // Delete the rest
        for (let i = 1; i < records.length; i++) {
          deleteKeys.push(records[i].key);
          deletedCount++;
        }
        
        console.log(`   ✓ ${name}: Kept ${keepRecord.key}, marked ${records.length - 1} for deletion`);
      } else {
        keepRecords.push(records[0].key);
      }
    }
    
    // Batch delete all duplicates
    if (deleteKeys.length > 0) {
      // Direct delete using Supabase client (workaround for mdel issue)
      const { error: deleteError } = await supabase
        .from(KV_TABLE)
        .delete()
        .in("key", deleteKeys);
      
      if (deleteError) {
        throw new Error(`Delete error: ${deleteError.message}`);
      }
      
      console.log(`   🗑️  Deleted ${deleteKeys.length} duplicate records`);
    }
    
    // Verify final count
    const staffAfter = await kv.getByPrefix("staff:");
    
    console.log("🧹 [CLEANUP] Completed!");
    console.log(`   Records deleted: ${deletedCount}`);
    console.log(`   Records remaining: ${staffAfter.length}`);
    
    return c.json({
      success: true,
      data: {
        deletedCount,
        remainingCount: staffAfter.length,
        keptRecords: keepRecords,
        summary: `Deleted ${deletedCount} duplicate staff records. ${staffAfter.length} unique staff remain.`
      }
    });
  } catch (error: any) {
    console.error('🚨 [CLEANUP ERROR]', error);
    console.error('   Stack:', error.stack);
    return c.json({ success: false, error: error.message || String(error) }, 500);
  }
});

// ========== CLEANUP DUPLICATES V2 (No kv.mdel dependency) ==========
app.post("/make-server-84f9c112/debug/cleanup-duplicates-v2", async (c) => {
  try {
    console.log("🧹 [CLEANUP V2] Starting...");
    
    // Get all staff records directly from Supabase
    const { data: allStaff, error: fetchError } = await supabase
      .from(KV_TABLE)
      .select("key, value")
      .like("key", "staff:%");
    
    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }
    
    if (!allStaff || allStaff.length === 0) {
      return c.json({
        success: true,
        data: { deletedCount: 0, summary: "No staff records found" }
      });
    }
    
    console.log(`   Total staff records: ${allStaff.length}`);
    
    // Group by name
    const staffByName: Record<string, any[]> = {};
    allStaff.forEach((item: any) => {
      const staff = item.value;
      if (!staffByName[staff.name]) {
        staffByName[staff.name] = [];
      }
      staffByName[staff.name].push({ ...staff, dbKey: item.key });
    });
    
    // Find duplicates and build delete list
    const deleteKeys: string[] = [];
    
    for (const [name, records] of Object.entries(staffByName)) {
      if (records.length > 1) {
        // Sort by key to find oldest
        records.sort((a, b) => {
          const timeA = parseInt(a.dbKey.split(':')[1] || '0');
          const timeB = parseInt(b.dbKey.split(':')[1] || '0');
          return timeA - timeB;
        });
        
        // Delete all except the first (oldest)
        for (let i = 1; i < records.length; i++) {
          deleteKeys.push(records[i].dbKey);
        }
        
        console.log(`   ${name}: Keeping ${records[0].dbKey}, deleting ${records.length - 1} duplicates`);
      }
    }
    
    console.log(`   Total duplicates to delete: ${deleteKeys.length}`);
    
    // Delete using direct Supabase query (no kv.mdel)
    if (deleteKeys.length > 0) {
      const { error: deleteError } = await supabase
        .from(KV_TABLE)
        .delete()
        .in("key", deleteKeys);
      
      if (deleteError) {
        throw new Error(`Delete error: ${deleteError.message}`);
      }
      
      console.log(`   ✅ Deleted ${deleteKeys.length} records`);
    }
    
    // Verify final count
    const { data: finalStaff, error: verifyError } = await supabase
      .from(KV_TABLE)
      .select("key")
      .like("key", "staff:%");
    
    const finalCount = finalStaff?.length || 0;
    
    console.log(`   Final staff count: ${finalCount}`);
    
    return c.json({
      success: true,
      data: {
        deletedCount: deleteKeys.length,
        remainingCount: finalCount,
        summary: `Deleted ${deleteKeys.length} duplicate staff records. ${finalCount} unique staff remain.`
      }
    });
  } catch (error: any) {
    console.error('🚨 [CLEANUP V2 ERROR]', error);
    return c.json({ success: false, error: error.message || String(error) }, 500);
  }
});

// ========== PAYROLL LOGIC (RESTORED) ==========
app.post("/make-server-84f9c112/payroll/calculate", async (c) => {
  try {
    const body = await c.req.json();
    const { staffId, startDate, endDate } = body;
    
    const allAppointments = await kv.getByPrefix("appointment:");
    const completedAppointments = allAppointments.filter((appt: any) => 
      appt.staffId === staffId && 
      appt.status === "completed" &&
      new Date(appt.appointmentTime) >= new Date(startDate) &&
      new Date(appt.appointmentTime) <= new Date(endDate)
    );
    
    const staff = await kv.get(staffId);
    if (!staff) return c.json({ success: false, error: "Staff not found" }, 404);
    
    const services = await kv.getByPrefix("service:");
    const serviceMap = new Map(services.map((s: any) => [s.id, s]));
    
    let totalRevenue = 0;
    let totalTips = 0;
    const details = [];
    
    for (const appt of completedAppointments) {
      let apptRevenue = 0;
      for (const serviceId of appt.serviceIds || []) {
        const service = serviceMap.get(serviceId);
        if (service) apptRevenue += service.price;
      }
      
      const tip = appt.tip || 0;
      const commission = apptRevenue * (staff.commissionRate || 0.6);
      
      totalRevenue += apptRevenue;
      totalTips += tip;
      
      details.push({
        appointmentId: appt.id,
        customerName: appt.customerName,
        date: appt.appointmentTime,
        revenue: apptRevenue,
        commission,
        tip,
      });
    }
    
    const totalCommission = totalRevenue * (staff.commissionRate || 0.6);
    const totalEarnings = totalCommission + totalTips;
    
    const payrollData = {
      staffId,
      staffName: staff.name,
      startDate,
      endDate,
      totalRevenue,
      totalCommission,
      totalTips,
      totalEarnings,
      appointmentCount: completedAppointments.length,
      details,
      generatedAt: new Date().toISOString(),
    };
    
    const payrollId = `payroll:${staffId}:${Date.now()}`;
    await kv.set(payrollId, payrollData);
    
    return c.json({ success: true, data: payrollData });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-84f9c112/payroll/:staffId", async (c) => {
  try {
    const staffId = c.req.param("staffId");
    const payrollRecords = await kv.getByPrefix(`payroll:${staffId}:`);
    return c.json({ success: true, data: payrollRecords });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== ANALYTICS LOGIC (RESTORED) ==========
app.get("/make-server-84f9c112/analytics/revenue", async (c) => {
  try {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const branchId = c.req.query('branchId');
    
    const appointments = await kv.getByPrefix("appointment:");
    const completed = appointments.filter((appt: any) => 
      appt.status === "completed" &&
      (!startDate || new Date(appt.appointmentTime) >= new Date(startDate)) &&
      (!endDate || new Date(appt.appointmentTime) <= new Date(endDate)) &&
      (!branchId || appt.branchId === branchId)
    );
    
    const services = await kv.getByPrefix("service:");
    const serviceMap = new Map(services.map((s: any) => [s.id, s]));
    
    let totalRevenue = 0;
    const dailyRevenue: any = {};
    
    for (const appt of completed) {
      let apptRevenue = 0;
      for (const serviceId of appt.serviceIds || []) {
        const service = serviceMap.get(serviceId);
        if (service) apptRevenue += service.price;
      }
      totalRevenue += apptRevenue;
      
      const date = new Date(appt.appointmentTime).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + apptRevenue;
    }
    
    return c.json({
      success: true,
      data: {
        totalRevenue,
        totalAppointments: completed.length,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue,
        })),
      },
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== UPLOAD ==========
app.post("/make-server-84f9c112/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || !(file instanceof File)) return c.json({ success: false, error: "No file" }, 400);

    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (!cloudinaryUrl) return c.json({ success: false, error: "Config missing" }, 500);

    const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (!matches) return c.json({ success: false, error: "Invalid config" }, 500);
    const [, apiKey, apiSecret, cloudName] = matches;

    const timestamp = Math.round(Date.now() / 1000).toString();
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST", body: formData,
    });

    if (!response.ok) return c.json({ success: false, error: await response.text() }, 500);
    const result = await response.json();
    return c.json({ success: true, url: result.secure_url });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== CHATBOT ==========
app.post("/make-server-84f9c112/chat", async (c) => {
  try {
    const { messages, language } = await c.req.json();
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");

    if (!apiKey) {
      return c.json({ success: true, message: "Chatbot unavailable (Missing API Key)" });
    }

    // ========== UPDATED: Read from Admin Services (settings:service-menu) ==========
    // Fetch service menu data (nested structure with categories/groups)
    const serviceMenuData = await kv.get("settings:service-menu");
    
    if (!serviceMenuData) {
      console.warn("⚠️ [CHAT] No service menu data found");
      return c.json({ 
        success: true, 
        message: language === 'vi' 
          ? "Xin lỗi, hệ thống đang cập nhật dịch vụ. Vui lòng thử lại sau."
          : "Sorry, service data is being updated. Please try again later."
      });
    }

    // Fetch category metadata for display names
    const categoriesData = await kv.get("settings:categories") || [];
    const categoryMapping: Record<string, { name: string; displayOrder: number; status: string }> = {};
    categoriesData.forEach((cat: any) => {
      categoryMapping[cat.key] = { 
        name: cat.name, 
        displayOrder: cat.displayOrder || 999,
        status: cat.status || 'active'
      };
    });

    // Helper function to flatten nested service menu data
    const flattenServices = (data: any): any[] => {
      const flattened: any[] = [];
      
      Object.keys(data).forEach((categoryKey) => {
        // ⚠️ FILTER: Skip inactive categories
        const categoryInfo = categoryMapping[categoryKey];
        if (!categoryInfo || categoryInfo.status !== 'active') {
          console.log(`🚫 [CHAT] Skipping inactive category: ${categoryKey}`);
          return; // Skip this category entirely
        }
        
        const categoryData = data[categoryKey];
        const categoryName = categoryInfo.name || categoryKey;
        
        if (categoryData.groups) {
          categoryData.groups.forEach((group: any, groupIndex: number) => {
            if (group.items) {
              group.items.forEach((item: any, itemIndex: number) => {
                // Parse price (handle string/number/range formats)
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

                const regularPrice = parsePrice(item.regular);
                const memberPrice = parsePrice(item.member);

                flattened.push({
                  id: `${categoryKey}-${groupIndex}-${itemIndex}`,
                  name: item.name,
                  category: categoryName,
                  categoryKey: categoryKey,
                  groupName: group.name,
                  regular_price: regularPrice,
                  member_price: memberPrice,
                  price: regularPrice,
                  description: item.description || '',
                  status: item.status || 'active',
                  serviceType: item.serviceType || 'regular',
                  compatibleServiceIds: item.compatibleServiceIds || [],
                  owner_recommended: item.owner_recommended === true,
                  displayOrder: categoryMapping[categoryKey]?.displayOrder || 999
                });
              });
            }
          });
        }
      });

      return flattened.filter((s: any) => s.status === 'active');
    };

    const allServices = flattenServices(serviceMenuData);

    // 🔍 DEBUG: Log actual service names to verify data source
    console.log("📊 [CHAT DEBUG] Total services loaded:", allServices.length);
    console.log("📋 [CHAT DEBUG] First 10 service names:", allServices.slice(0, 10).map((s: any) => s.name));
    console.log("🔥 [CHAT DEBUG] Service menu keys:", Object.keys(serviceMenuData));

    // Calculate booking count per service
    const allAppointments = await kv.getByPrefix("appointment:");
    const serviceBookingCount: Record<string, number> = {};
    
    allAppointments.forEach((appt: any) => {
      if (Array.isArray(appt.serviceIds)) {
        appt.serviceIds.forEach((serviceId: string) => {
          serviceBookingCount[serviceId] = (serviceBookingCount[serviceId] || 0) + 1;
        });
      }
    });

    // Enrich services with booking stats
    const servicesWithStats = allServices.map((s: any) => ({
      ...s,
      bookingCount: serviceBookingCount[s.id] || 0
    })).sort((a: any, b: any) => b.bookingCount - a.bookingCount);

    // Get owner recommended services (dynamically from database, no hardcoded names)
    const ownerRecommended = servicesWithStats.filter((s: any) => s.owner_recommended === true);
    
    // Sort Owner Recommended by booking count (most popular first)
    // This way the most recommended services naturally appear first
    ownerRecommended.sort((a: any, b: any) => b.bookingCount - a.bookingCount);
    
    // ⚠️ STRICT VALIDATION: Only show hot services if we have REAL booking data
    const totalBookings = allAppointments.length;
    const hotServices = totalBookings > 0 
      ? servicesWithStats.filter((s: any) => s.bookingCount > 0).slice(0, 5)
      : [];
    
    console.log("🔥 [CHAT DEBUG] Total bookings:", totalBookings);
    console.log("🔥 [CHAT DEBUG] Hot services count:", hotServices.length);

    // ========== FETCH MEMBERSHIP DATA ==========
    const membershipTiers = await kv.get('membership:tiers') || [];
    let membershipContext = '';
    
    if (Array.isArray(membershipTiers) && membershipTiers.length > 0) {
      membershipContext += '\n\n💎 MEMBERSHIP PROGRAM:\n';
      membershipContext += 'We offer a premium membership program with exclusive benefits and savings.\n\n';
      
      membershipTiers.forEach((tier: any) => {
        membershipContext += `📋 ${tier.name.toUpperCase()} TIER:\n`;
        membershipContext += `  💰 Price: $${tier.price} (${tier.duration})\n`;
        membershipContext += `  🎁 Benefits:\n`;
        
        if (tier.benefits && Array.isArray(tier.benefits)) {
          tier.benefits.forEach((benefit: string) => {
            membershipContext += `    ✓ ${benefit}\n`;
          });
        }
        
        if (tier.discount > 0) {
          membershipContext += `  💵 Discount: ${tier.discount}% OFF all services\n`;
        }
        
        if (tier.description) {
          membershipContext += `  ℹ️  ${tier.description}\n`;
        }
        
        membershipContext += '\n';
      });
      
      membershipContext += '🌟 WHEN TO RECOMMEND MEMBERSHIP:\n';
      membershipContext += '  - Customer asks about pricing for multiple services\n';
      membershipContext += '  - Customer is a frequent visitor or books regularly\n';
      membershipContext += '  - Customer shows interest in multiple treatments\n';
      membershipContext += '  - When member price shows significant savings (highlight the difference)\n';
      membershipContext += '  - ALWAYS mention membership benefits when discussing service prices\n';
    }
    
    // ========== FETCH PROMOTIONS DATA ==========
    const promotionsData = await kv.get('settings:promotions') || [];
    let promotionContext = '';
    
    if (Array.isArray(promotionsData) && promotionsData.length > 0) {
      promotionContext += '\n\n🎉 CURRENT PROMOTIONS & SPECIAL OFFERS:\n';
      
      promotionsData.forEach((promo: any, index: number) => {
        const promoLang = promo[language] || promo['en'];
        if (promoLang) {
          promotionContext += `\n${index + 1}. ${promoLang.title}\n`;
          if (promoLang.description) {
            promotionContext += `   📝 ${promoLang.description}\n`;
          }
          if (promoLang.buttonText) {
            promotionContext += `   🔗 Action: ${promoLang.buttonText}\n`;
          }
        }
      });
      
      promotionContext += '\n���� PROMOTION STRATEGY:\n';
      promotionContext += '  - Mention relevant promotions when customer inquires about specific services\n';
      promotionContext += '  - Use promotions to create urgency and encourage booking\n';
      promotionContext += '  - Always check if a promotion applies to customer\'s requested services\n';
      promotionContext += '  - Be enthusiastic but not pushy about promotions\n';
    }

    // ========== Build AI Context with Enhanced Structure ==========
    let serviceContext = "\n\n📋 AVAILABLE SERVICES:\n";
    serviceContext += `(Total Active Services: ${allServices.length})\n`;
    
    // 1. Owner Recommended (Best Value)
    if (ownerRecommended.length > 0) {
      serviceContext += "\n⭐ DỊCH VỤ ĐƯỢC ĐỀ XUẤT (Ưu tiên #1):\n";
      ownerRecommended.forEach((s: any) => {
        serviceContext += `- ${s.name} (${s.category} > ${s.groupName})\n`;
        // Only show member price if it exists and is different from regular price
        if (s.member_price && s.member_price !== s.regular_price) {
          const savings = s.regular_price - s.member_price;
          serviceContext += `  💰 Giá: $${s.regular_price} (Thường) / $${s.member_price} (Thành viên) [Tiết kiệm $${savings}]\n`;
        } else {
          serviceContext += `  💰 Giá: $${s.regular_price}\n`;
        }
        if (s.description) serviceContext += `  ℹ️  ${s.description}\n`;
      });
    }
    
    // 2. Hot Services (Most Popular) - ONLY IF WE HAVE REAL BOOKING DATA
    if (hotServices.length > 0) {
      serviceContext += "\n🔥 HOT SERVICES (Customer Favorites - Based on Real Booking Data):\n";
      hotServices.forEach((s: any) => {
        serviceContext += `- ${s.name}: $${s.regular_price} (${s.bookingCount} bookings)\n`;
        serviceContext += `  📍 ${s.category} > ${s.groupName}\n`;
      });
    } else {
      // Explicitly tell AI that hot services are NOT available yet
      serviceContext += "\n⚠️ HOT SERVICES: Not available yet (no booking data). Do NOT mention 'hot services' or 'most popular'.\n";
    }
    
    // 3. Services by Category
    serviceContext += "\n📂 ALL SERVICES BY CATEGORY:\n";
    
    const servicesByCategory: Record<string, any[]> = {};
    servicesWithStats.forEach((s: any) => {
      if (!servicesByCategory[s.category]) {
        servicesByCategory[s.category] = [];
      }
      servicesByCategory[s.category].push(s);
    });

    const sortedCategories = Object.keys(servicesByCategory).sort((a, b) => {
      const orderA = servicesWithStats.find((s: any) => s.category === a)?.displayOrder || 999;
      const orderB = servicesWithStats.find((s: any) => s.category === b)?.displayOrder || 999;
      return orderA - orderB;
    });

    sortedCategories.forEach((categoryName) => {
      const categoryServices = servicesByCategory[categoryName];
      serviceContext += `\n${categoryName}:\n`;
      
      const byGroup: Record<string, any[]> = {};
      categoryServices.forEach((s: any) => {
        if (!byGroup[s.groupName]) {
          byGroup[s.groupName] = [];
        }
        byGroup[s.groupName].push(s);
      });

      Object.keys(byGroup).forEach((groupName) => {
        serviceContext += `  ${groupName}:\n`;
        byGroup[groupName].forEach((s: any) => {
          // Only show member price if it exists and is different from regular price
          const priceInfo = (s.member_price && s.member_price !== s.regular_price)
            ? `$${s.regular_price} (Thường) / $${s.member_price} (Thành viên)`
            : `$${s.regular_price}`;
          const typeLabel = s.serviceType === 'addon' ? ' [ADD-ON]' : '';
          serviceContext += `    - ${s.name}: ${priceInfo}${typeLabel}\n`;
        });
      });
    });

    // 4. Add-ons Info
    const addons = servicesWithStats.filter((s: any) => s.serviceType === 'addon');
    if (addons.length > 0) {
      serviceContext += "\n➕ AVAILABLE ADD-ONS:\n";
      serviceContext += "Note: Add-ons enhance main services.\n";
      addons.forEach((s: any) => {
        serviceContext += `- ${s.name}: $${s.regular_price}\n`;
      });
    }

    // 🛡️ WHITELIST: Create exact list of valid service names for AI to cross-check
    const validServiceNames = allServices.map((s: any) => s.name);
    serviceContext += `\n\n🔒 VALID SERVICE NAMES (${validServiceNames.length} total):\n`;
    serviceContext += validServiceNames.join(', ') + '\n';
    serviceContext += '\n⚠️ IMPORTANT: If customer asks about a service NOT in this list, politely say it\'s not available.\n';
    
    const systemPrompt = `You are the AI receptionist for "Bitcoin Nail Bar" - an intelligent, helpful, and knowledgeable assistant.
    
    CURRENT DATE/TIME: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (Central Time - Houston, TX)
    
    📍 BUSINESS INFORMATION:
    - Address: 9793 Westheimer Rd, Houston, TX 77042
    - Store Phone: (346) 802-4906
    - Sales Phone: (832) 799-3990
    - Email: customerbitcoinnailbar@gmail.com
    - Payment Methods: Cash, Credit Card, Bitcoin, VLINKPAY (crypto payment)
    - Special Feature: We are the first nail salon in Houston accepting Bitcoin payments
    
    ${serviceContext}
    ${membershipContext}
    ${promotionContext}
    
    🚨 CRITICAL ACCURACY RULES (MUST FOLLOW):
    1. ✅ ONLY mention services listed above in "AVAILABLE SERVICES"
    2. ✅ ONLY quote prices exactly as shown (do NOT estimate or guess)
    3. ✅ ONLY mention promotions listed in "CURRENT PROMOTIONS" section
    4. ✅ ONLY mention membership tiers shown in "MEMBERSHIP PROGRAM" section
    5. ✅ If a service is NOT listed above, say "I don't have that service in our menu"
    6. ✅ If you're unsure about ANY information, ask customer to check with staff
    7. ❌ NEVER invent service names, prices, promotions, or membership details
    8. ❌ NEVER mention "Hot Services" unless explicitly shown above with booking data
    9. ❌ NEVER make assumptions about services not in the list
    
    🎯 ADVANCED CAPABILITIES & INTELLIGENCE:
    
    1. 💬 CONVERSATIONAL INTELLIGENCE:
       - Understand context from previous messages in the conversation
       - Remember customer preferences mentioned earlier in the chat
       - Ask clarifying questions when customer intent is unclear
       - Provide personalized recommendations based on customer needs
    
    2. 🎨 SERVICE RECOMMENDATIONS (Smart Upselling):
       - ⭐ FIRST: Recommend "Dịch vụ được đề xuất" (Owner Recommended) - HIGHEST PRIORITY
       - 💰 SECOND: Highlight membership savings when applicable (show exact $ amount saved)
       - 🔥 THIRD: Suggest hot services (if shown with booking data)
       - 📂 FOURTH: Category-based recommendations matching customer needs
       - ➕ ALWAYS: Suggest relevant add-ons to enhance the main service
       
    3. 💎 MEMBERSHIP UPSELLING STRATEGY:
       - When customer asks about pricing: Compare regular vs member prices
       - When booking multiple services: Calculate total savings with membership
       - When customer is repeat visitor: Mention long-term value of membership
       - EXAMPLE: "As a member, you'd save $15 on this service alone! Over 6 months, that's $90+ in savings."
       
    4. 🎉 PROMOTION AWARENESS:
       - Match promotions to customer's requested services
       - Create urgency: "We have a special offer this month!"
       - Be enthusiastic but natural: "Great timing! This service is currently on promotion."
       - If multiple promotions apply, mention the best value one first
       
    5. 📅 APPOINTMENT BOOKING INTELLIGENCE:
       - Ask for: Name, Phone Number, Service(s), Date/Time
       - Optional but recommended: Email address
       - FIRST: Show clear summary of booking details
       - SECOND: Ask confirmation: "Should I confirm this booking for you?"
       - THIRD: ONLY after explicit confirmation ("yes", "confirm", "ok", "đúng rồi"), use 'create_booking' tool
       - Convert natural language time to ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
       - Handle multiple services in one booking
       - YOU CANNOT create bookings by text alone - MUST use 'create_booking' tool
       
    6. 🧠 CONTEXT AWARENESS:
       - Track conversation history to avoid repeating information
       - Remember if customer already knows about membership/promotions
       - Adapt tone based on customer's communication style (formal/casual)
       - Handle multi-turn conversations naturally
       
    7. 💡 PROACTIVE ASSISTANCE:
       - Suggest booking during less busy hours if customer is flexible
       - Recommend service packages that complement each other
       - Inform about preparation needed for certain services
       - Mention parking, payment options, or other practical details when relevant
    
    🎭 COMMUNICATION STYLE:
    - LANGUAGE: ${language === 'vi' ? 'Vietnamese (Quý khách - polite, respectful form)' : 'English (Professional yet warm)'}
    - TONE: Professional, luxury salon experience, friendly and welcoming
    - PERSONALITY: Knowledgeable expert who genuinely cares about customer satisfaction
    - EMPATHY: Show understanding of customer needs and concerns
    - ENTHUSIASM: Be genuinely excited about services and promotions (but not pushy)
    
    🎯 GOAL: Make every customer feel valued, informed, and excited to visit Bitcoin Nail Bar.
    `;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_booking",
          description: "Book an appointment when user provides all details",
          parameters: {
            type: "object",
            properties: {
              customerName: { type: "string" },
              customerPhone: { type: "string" },
              customerEmail: { type: "string" },
              serviceNames: { type: "string", description: "Comma separated service names" },
              appointmentTime: { type: "string", description: "ISO 8601 date string (YYYY-MM-DDTHH:mm:ss)" },
              notes: { type: "string" }
            },
            required: ["customerName", "customerPhone", "serviceNames", "appointmentTime"]
          }
        }
      }
    ];

    // 1. Call DeepSeek with Tools
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools: tools,
        temperature: 0 // Deterministic output - no creativity, no hallucination
      })
    });

    const data = await response.json();
    if (!data.choices) throw new Error(JSON.stringify(data));
    
    const choice = data.choices[0];
    const message = choice.message;

    // 2. Handle Tool Call
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === "create_booking") {
        const bookingArgs = JSON.parse(toolCall.function.arguments);
        
        // Execute booking logic
        console.log("🤖 Chatbot creating booking:", bookingArgs);
        const bookingResult = await createAppointment(bookingArgs);
        
        // 3. Send result back to LLM for final confirmation
        const toolOutputMessage = {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ 
            success: true, 
            appointmentId: bookingResult.appointment.id,
            status: "Booked successfully. Email sent." 
          })
        };

        const finalResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
              message, // The assistant message with tool_calls
              toolOutputMessage // The result of the tool
            ]
          })
        });
        
        const finalData = await finalResponse.json();
        
        console.log("🎫 [CHATBOT] Booking completed, returning ticketData with qrCodeUrl:", bookingResult.qrCodeUrl ? "✅ Has URL" : "⚠️ No URL (will use fallback)");
        
        // Return with ticket data for frontend to display
        return c.json({ 
          success: true, 
          message: finalData.choices[0].message.content,
          ticketData: {
            id: bookingResult.appointment.id,
            customerName: bookingResult.appointment.customerName,
            customerPhone: bookingResult.appointment.customerPhone,
            appointmentTime: bookingResult.appointment.appointmentTime,
            serviceNames: Array.isArray(bookingResult.appointment.serviceNames) 
              ? bookingResult.appointment.serviceNames.join(', ') 
              : bookingResult.appointment.serviceNames || 'Services',
            branchName: "Bitcoin Nail Bar - Houston, TX",
            qrCodeUrl: bookingResult.qrCodeUrl
          }
        });
      }
    }

    return c.json({ success: true, message: message.content });

  } catch (error: any) {
    console.log("Error in chat:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== SERVICE MENU SETTINGS ==========
// Get Service Menu Data
app.get("/make-server-84f9c112/settings/service-menu", async (c) => {
  try {
    console.log('🔍 [SERVICE MENU GET] Fetching data from KV store...');
    const data = await kv.get("settings:service-menu");
    
    if (!data) {
      console.log('⚠️ [SERVICE MENU GET] No data found, initializing with defaults');
      await kv.set("settings:service-menu", initialServices);
      return c.json({ success: true, data: initialServices });
    }
    
    // Count services
    const categoryCounts: Record<string, number> = {};
    Object.keys(data).forEach(categoryKey => {
      const groups = data[categoryKey]?.groups || [];
      let totalServices = 0;
      groups.forEach((group: any) => {
        totalServices += group.items?.length || 0;
      });
      categoryCounts[categoryKey] = totalServices;
    });
    console.log('✅ [SERVICE MENU GET] Returning data, services per category:', categoryCounts);
    
    return c.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ [SERVICE MENU GET] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update Service Menu Data
app.put("/make-server-84f9c112/settings/service-menu", async (c) => {
  try {
    const body = await c.req.json();
    console.log('🔍 [SERVICE MENU PUT] Received data:', JSON.stringify(body, null, 2));
    console.log('📊 [SERVICE MENU PUT] Data size:', JSON.stringify(body).length, 'bytes');
    
    // Count services in each category
    const categoryCounts: Record<string, number> = {};
    Object.keys(body).forEach(categoryKey => {
      const groups = body[categoryKey]?.groups || [];
      let totalServices = 0;
      groups.forEach((group: any) => {
        totalServices += group.items?.length || 0;
      });
      categoryCounts[categoryKey] = totalServices;
    });
    console.log('📈 [SERVICE MENU PUT] Services per category:', categoryCounts);
    
    await kv.set("settings:service-menu", body);
    console.log('✅ [SERVICE MENU PUT] Successfully saved to KV store');
    
    // Verify by reading back
    const savedData = await kv.get("settings:service-menu");
    console.log('🔍 [SERVICE MENU PUT] Verification read - data exists:', !!savedData);
    
    return c.json({ success: true, data: body });
  } catch (error: any) {
    console.error('❌ [SERVICE MENU PUT] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reset Service Menu Data
app.post("/make-server-84f9c112/settings/service-menu/reset", async (c) => {
  try {
    await kv.set("settings:service-menu", initialServices);
    return c.json({ success: true, data: initialServices });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== SERVICE CATEGORIES MANAGEMENT ==========

// Get all categories
app.get("/make-server-84f9c112/settings/categories", async (c) => {
  try {
    const categories = await kv.get("settings:categories");
    console.log(`📋 [GET CATEGORIES] Found ${categories?.length || 0} categories`);
    if (categories && categories.length > 0) {
      console.log(`📋 [GET CATEGORIES] IDs:`, categories.map((c: any) => `${c.id}:${c.name}`));
    }
    if (!categories) {
      // Return empty array if not initialized
      console.log(`⚠️ [GET CATEGORIES] No categories found, returning empty array`);
      return c.json({ success: true, data: [] });
    }
    return c.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("❌ [GET CATEGORIES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Save/Update categories
app.put("/make-server-84f9c112/settings/categories", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings:categories", body);
    return c.json({ success: true, data: body });
  } catch (error: any) {
    console.error("❌ [UPDATE CATEGORIES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reorder categories (drag & drop)
app.put("/make-server-84f9c112/settings/categories/reorder", async (c) => {
  try {
    const { categories } = await c.req.json();
    
    if (!Array.isArray(categories)) {
      return c.json({ success: false, error: "Invalid categories array" }, 400);
    }
    
    // Update displayOrder for each category based on array position
    const reorderedCategories = categories.map((cat, index) => ({
      ...cat,
      displayOrder: index,
    }));
    
    await kv.set("settings:categories", reorderedCategories);
    console.log(`✅ [REORDER CATEGORIES] Successfully reordered ${reorderedCategories.length} categories`);
    
    return c.json({ success: true, data: reorderedCategories });
  } catch (error: any) {
    console.error("❌ [REORDER CATEGORIES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add new category
app.post("/make-server-84f9c112/settings/categories", async (c) => {
  try {
    const newCategory = await c.req.json();
    const categories = await kv.get("settings:categories") || [];
    
    // Generate new ID
    const maxId = categories.length > 0 ? Math.max(...categories.map((c: any) => c.id)) : 0;
    newCategory.id = maxId + 1;
    
    // Ensure status field exists (default: active)
    if (!newCategory.status) {
      newCategory.status = 'active';
    }
    
    categories.push(newCategory);
    await kv.set("settings:categories", categories);
    
    return c.json({ success: true, data: newCategory });
  } catch (error: any) {
    console.error("❌ [ADD CATEGORY] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete category (CASCADE DELETE: also deletes all services in this category)
app.delete("/make-server-84f9c112/settings/categories/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    console.log(`🗑️ [DELETE CATEGORY] Request to delete category ID: ${id}`);
    
    // 1. Get and filter categories
    const categories = await kv.get("settings:categories") || [];
    console.log(`📋 [DELETE CATEGORY] Total categories in DB: ${categories.length}`);
    
    const categoryToDelete = categories.find((cat: any) => cat.id === id);
    
    if (!categoryToDelete) {
      // ⚠️ Changed from console.error to console.warn - this is not an error, just a no-op
      console.warn(`⚠️ [DELETE CATEGORY] Category with ID ${id} not found (may have been already deleted)`);
      console.log(`🔍 [DELETE CATEGORY] Available category IDs:`, categories.map((c: any) => c.id));
      // Return 200 with success=true since idempotent delete is acceptable
      return c.json({ 
        success: true, 
        message: `Category ${id} not found (may have been already deleted)`,
        alreadyDeleted: true 
      }, 200);
    }
    
    const categoryName = categoryToDelete.name;
    console.log(`📌 [DELETE CATEGORY] Found category: "${categoryName}" (ID: ${id})`);
    
    const filtered = categories.filter((cat: any) => cat.id !== id);
    await kv.set("settings:categories", filtered);
    console.log(`✅ [DELETE CATEGORY] Category removed from categories list`);
    
    // 2. CASCADE DELETE: Remove all services in this category from service-menu
    const serviceMenu = await kv.get("settings:service-menu") || {};
    
    // Remove the category key from service menu if exists
    if (serviceMenu[categoryName]) {
      const servicesCount = serviceMenu[categoryName]?.groups?.reduce((total: number, group: any) => {
        return total + (group.services?.length || 0);
      }, 0) || 0;
      
      delete serviceMenu[categoryName];
      await kv.set("settings:service-menu", serviceMenu);
      console.log(`🗑️ [DELETE CATEGORY CASCADE] Deleted ${servicesCount} services from "${categoryName}"`);
    } else {
      console.log(`ℹ️ [DELETE CATEGORY] No services found in category "${categoryName}"`);
    }
    
    return c.json({ 
      success: true, 
      data: filtered,
      message: `Category "${categoryName}" and all its services deleted successfully`
    });
  } catch (error: any) {
    console.error("❌ [DELETE CATEGORY] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE MULTIPLE CATEGORIES by names (CASCADE DELETE)
app.post("/make-server-84f9c112/settings/categories/delete-batch", async (c) => {
  try {
    const { names } = await c.req.json();
    console.log(`🗑️ [DELETE BATCH] Deleting categories:`, names);
    
    if (!Array.isArray(names) || names.length === 0) {
      return c.json({ success: false, error: "Invalid names array" }, 400);
    }
    
    // 1. Get categories
    const categories = await kv.get("settings:categories") || [];
    console.log(`📋 [DELETE BATCH] Total categories before: ${categories.length}`);
    
    // 2. Find categories to delete
    const categoriesToDelete = categories.filter((cat: any) => 
      names.includes(cat.name)
    );
    
    if (categoriesToDelete.length === 0) {
      return c.json({ 
        success: false, 
        error: "No matching categories found",
        availableCategories: categories.map((c: any) => c.name)
      }, 404);
    }
    
    console.log(`📌 [DELETE BATCH] Found ${categoriesToDelete.length} categories to delete:`, 
      categoriesToDelete.map((c: any) => c.name));
    
    // 3. Filter out categories to delete
    const filtered = categories.filter((cat: any) => 
      !names.includes(cat.name)
    );
    await kv.set("settings:categories", filtered);
    console.log(`✅ [DELETE BATCH] Categories removed. Remaining: ${filtered.length}`);
    
    // 4. CASCADE DELETE: Remove services from service-menu
    const serviceMenu = await kv.get("settings:service-menu") || {};
    let totalServicesDeleted = 0;
    
    categoriesToDelete.forEach((category: any) => {
      if (serviceMenu[category.name]) {
        const servicesCount = serviceMenu[category.name]?.groups?.reduce((total: number, group: any) => {
          return total + (group.services?.length || 0);
        }, 0) || 0;
        
        delete serviceMenu[category.name];
        totalServicesDeleted += servicesCount;
        console.log(`🗑️ [DELETE BATCH CASCADE] Deleted ${servicesCount} services from "${category.name}"`);
      }
    });
    
    await kv.set("settings:service-menu", serviceMenu);
    
    return c.json({ 
      success: true, 
      data: filtered,
      deleted: categoriesToDelete.map((c: any) => c.name),
      servicesDeleted: totalServicesDeleted,
      message: `Deleted ${categoriesToDelete.length} categories and ${totalServicesDeleted} services`
    });
  } catch (error: any) {
    console.error("❌ [DELETE BATCH] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== MENU IMAGE MANAGEMENT (Cloudinary) ==========

// GET: List all menu images
app.get("/make-server-84f9c112/menu/images", async (c) => {
  try {
    const images = await kv.get("menu:images") || [];
    return c.json({ success: true, data: images });
  } catch (error: any) {
    console.error("❌ [GET MENU IMAGES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Upload menu image to Cloudinary
app.post("/make-server-84f9c112/admin/menu/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    const orderStr = body['order'];
    const name = body['name']; // Menu name
    
    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ success: false, error: "Menu name is required" }, 400);
    }

    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (!cloudinaryUrl) {
      return c.json({ success: false, error: "Cloudinary not configured" }, 500);
    }

    const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (!matches) {
      return c.json({ success: false, error: "Invalid Cloudinary URL" }, 500);
    }
    const [, apiKey, apiSecret, cloudName] = matches;

    // Generate signature
    const timestamp = Math.round(Date.now() / 1000).toString();
    const folder = "bitcoin-nail-bar/menu";
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [CLOUDINARY UPLOAD] Error:", errorText);
      return c.json({ success: false, error: errorText }, 500);
    }

    const result = await response.json();
    
    // Save metadata to KV
    const images = await kv.get("menu:images") || [];
    const newImage = {
      id: `menu-img-${Date.now()}`,
      name: name.trim(),
      cloudinary_url: result.secure_url,
      public_id: result.public_id,
      order: parseInt(orderStr || images.length.toString()),
      width: result.width,
      height: result.height,
      uploadedAt: new Date().toISOString(),
    };
    
    images.push(newImage);
    // Sort by order
    images.sort((a: any, b: any) => a.order - b.order);
    
    await kv.set("menu:images", images);
    
    console.log(`✅ [MENU UPLOAD] Image uploaded: ${newImage.id} - ${newImage.name}`);
    return c.json({ success: true, data: newImage });
  } catch (error: any) {
    console.error("❌ [MENU UPLOAD] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE: Remove menu image
app.delete("/make-server-84f9c112/admin/menu/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const images = await kv.get("menu:images") || [];
    
    const imageToDelete = images.find((img: any) => img.id === id);
    if (!imageToDelete) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }
    
    // Delete from Cloudinary
    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (cloudinaryUrl) {
      const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (matches) {
        const [, apiKey, apiSecret, cloudName] = matches;
        const timestamp = Math.round(Date.now() / 1000).toString();
        const signatureString = `public_id=${imageToDelete.public_id}&timestamp=${timestamp}${apiSecret}`;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureString);
        const hashBuffer = await crypto.subtle.digest("SHA-1", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const deleteFormData = new FormData();
        deleteFormData.append("public_id", imageToDelete.public_id);
        deleteFormData.append("api_key", apiKey);
        deleteFormData.append("timestamp", timestamp);
        deleteFormData.append("signature", signature);
        
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
          method: "POST",
          body: deleteFormData,
        });
      }
    }
    
    // Remove from KV
    const updatedImages = images.filter((img: any) => img.id !== id);
    await kv.set("menu:images", updatedImages);
    
    console.log(`✅ [MENU DELETE] Image deleted: ${id}`);
    return c.json({ success: true, message: "Image deleted" });
  } catch (error: any) {
    console.error("❌ [MENU DELETE] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Reorder menu images
app.put("/make-server-84f9c112/admin/menu/reorder", async (c) => {
  try {
    const { images: reorderedImages } = await c.req.json();
    
    // Update order field
    const updatedImages = reorderedImages.map((img: any, index: number) => ({
      ...img,
      order: index,
    }));
    
    await kv.set("menu:images", updatedImages);
    
    console.log(`✅ [MENU REORDER] ${updatedImages.length} images reordered`);
    return c.json({ success: true, data: updatedImages });
  } catch (error: any) {
    console.error("❌ [MENU REORDER] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Update menu image (name and/or image)
app.put("/make-server-84f9c112/admin/menu/:id/update", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.parseBody();
    const file = body['file'];
    const name = body['name'];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ success: false, error: "Menu name is required" }, 400);
    }

    const images = await kv.get("menu:images") || [];
    const imageIndex = images.findIndex((img: any) => img.id === id);
    
    if (imageIndex === -1) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }

    const existingImage = images[imageIndex];
    let updatedImageData: any = {
      ...existingImage,
      name: name.trim(),
    };

    // If new file is provided, upload to Cloudinary and delete old image
    if (file && file instanceof File) {
      const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
      if (!cloudinaryUrl) {
        return c.json({ success: false, error: "Cloudinary not configured" }, 500);
      }

      const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (!matches) {
        return c.json({ success: false, error: "Invalid Cloudinary URL" }, 500);
      }
      const [, apiKey, apiSecret, cloudName] = matches;

      // Upload new image to Cloudinary
      const timestamp = Math.round(Date.now() / 1000).toString();
      const folder = "bitcoin-nail-bar/menu";
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [CLOUDINARY UPLOAD] Error:", errorText);
        return c.json({ success: false, error: "Failed to upload new image" }, 500);
      }

      const result = await response.json();

      // Delete old image from Cloudinary
      const deleteTimestamp = Math.round(Date.now() / 1000).toString();
      const deleteSignatureString = `public_id=${existingImage.public_id}&timestamp=${deleteTimestamp}${apiSecret}`;
      
      const deleteData = encoder.encode(deleteSignatureString);
      const deleteHashBuffer = await crypto.subtle.digest("SHA-1", deleteData);
      const deleteHashArray = Array.from(new Uint8Array(deleteHashBuffer));
      const deleteSignature = deleteHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const deleteFormData = new FormData();
      deleteFormData.append("public_id", existingImage.public_id);
      deleteFormData.append("api_key", apiKey);
      deleteFormData.append("timestamp", deleteTimestamp);
      deleteFormData.append("signature", deleteSignature);
      
      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: "POST",
        body: deleteFormData,
      });

      // Update with new image data
      updatedImageData = {
        ...updatedImageData,
        cloudinary_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      };
    }

    // Update in KV store
    images[imageIndex] = updatedImageData;
    await kv.set("menu:images", images);
    
    console.log(`✅ [MENU UPDATE] Image updated: ${id} - ${updatedImageData.name}`);
    return c.json({ success: true, data: updatedImageData });
  } catch (error: any) {
    console.error("❌ [MENU UPDATE] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== HOMEPAGE SETTINGS ==========

// GET: Homepage menu mode setting
app.get("/make-server-84f9c112/settings/homepage-menu", async (c) => {
  try {
    const mode = await kv.get("settings:homepage-menu-mode") || "services-list";
    return c.json({ success: true, data: { mode } });
  } catch (error: any) {
    console.error("❌ [GET HOMEPAGE SETTING] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Update homepage menu mode
app.post("/make-server-84f9c112/admin/settings/homepage-menu", async (c) => {
  try {
    const { mode } = await c.req.json();
    
    if (!["services-list", "menu-images"].includes(mode)) {
      return c.json({ success: false, error: "Invalid mode" }, 400);
    }
    
    await kv.set("settings:homepage-menu-mode", mode);
    
    console.log(`✅ [HOMEPAGE SETTING] Mode set to: ${mode}`);
    return c.json({ success: true, data: { mode } });
  } catch (error: any) {
    console.error("❌ [HOMEPAGE SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET: Fetch chatbot avatar
app.get("/make-server-84f9c112/settings/chatbot-avatar", async (c) => {
  try {
    const avatarPath = await kv.get("settings:chatbot-avatar-path") || '';
    
    if (!avatarPath) {
      console.log('ℹ️ [CHATBOT AVATAR] No avatar path found in KV store');
      return c.json({ success: true, data: { avatar: '' } });
    }

    // Use public URL instead of signed URL (avatar is public content)
    const BUCKET_NAME = 'make-84f9c112-promotions';
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(avatarPath);

    console.log(`✅ [CHATBOT AVATAR] Public URL generated for: ${avatarPath}`);
    return c.json({ success: true, data: { avatar: data.publicUrl } });
  } catch (error: any) {
    console.error("❌ [CHATBOT SETTING] Exception:", error);
    // Fallback to empty avatar on error
    return c.json({ success: true, data: { avatar: '' } });
  }
});

// POST: Update chatbot avatar (expects file path, not signed URL)
app.post("/make-server-84f9c112/admin/settings/chatbot-avatar", async (c) => {
  try {
    const { avatarPath } = await c.req.json();
    
    // Save file path to KV store
    await kv.set("settings:chatbot-avatar-path", avatarPath || '');
    
    console.log(`✅ [CHATBOT SETTING] Avatar path updated: ${avatarPath}`);
    return c.json({ success: true, data: { avatarPath } });
  } catch (error: any) {
    console.error("❌ [CHATBOT SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Save promotions to KV store
app.post("/make-server-84f9c112/admin/settings/promotions", async (c) => {
  try {
    const { promotions } = await c.req.json();
    
    if (!Array.isArray(promotions)) {
      return c.json({ success: false, error: "Invalid promotions data" }, 400);
    }
    
    await kv.set("settings:promotions", promotions);
    
    console.log(`✅ [PROMOTIONS SETTING] ${promotions.length} promotions saved`);
    return c.json({ success: true, data: { promotions } });
  } catch (error: any) {
    console.error("❌ [PROMOTIONS SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET: Fetch promotions from KV store
app.get("/make-server-84f9c112/settings/promotions", async (c) => {
  try {
    const promotions = await kv.get("settings:promotions") || [];
    
    // Generate fresh signed URLs for images
    const promotionsWithSignedUrls = await Promise.all(
      (promotions as any[]).map(async (promo: any) => {
        const updatedPromo = { ...promo };
        
        // Process both languages
        for (const lang of ['vi', 'en']) {
          if (!updatedPromo[lang]) continue;
          
          // Background Image
          if (updatedPromo[lang].backgroundImagePath) {
            try {
              const { data: signedData, error: signError } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo[lang].backgroundImagePath, 86400); // 24 hours (reduced from 1 year for security)
              
              if (signError) {
                console.warn(`⚠️ Failed to sign background image for ${promo.id} (${lang}):`, signError);
              } else if (signedData?.signedUrl) {
                updatedPromo[lang].backgroundImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing background image for ${promo.id} (${lang}):`, err);
            }
          }
          
          // Icon Image
          if (updatedPromo[lang].iconImagePath) {
            try {
              const { data: signedData, error: signError } = await supabase.storage
                .from('make-84f9c112-promotions')
                .createSignedUrl(updatedPromo[lang].iconImagePath, 86400); // 24 hours (reduced from 1 year for security)
              
              if (signError) {
                console.warn(`⚠️ Failed to sign icon image for ${promo.id} (${lang}):`, signError);
              } else if (signedData?.signedUrl) {
                updatedPromo[lang].iconImage = signedData.signedUrl;
              }
            } catch (err) {
              console.error(`❌ Error signing icon image for ${promo.id} (${lang}):`, err);
            }
          }
        }
        
        return updatedPromo;
      })
    );
    
    console.log(`✅ [PROMOTIONS SETTING] Fetched ${promotionsWithSignedUrls.length} promotions with fresh signed URLs`);
    return c.json({ success: true, data: { promotions: promotionsWithSignedUrls } });
  } catch (error: any) {
    console.error("❌ [PROMOTIONS SETTING] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Proxy for VLinkExchange to avoid CORS
app.get("/make-server-84f9c112/proxy/vlink", async (c) => {
  try {
    console.log('🔍 [PROXY VLINK] Fetching from upstream...');
    const response = await fetch('https://vlinkexchange.com/matching/public/active-markets?limit=500');
    if (!response.ok) {
      throw new Error(`Upstream API failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ [PROXY VLINK] Successfully fetched data');
    return c.json(data);
  } catch (error: any) {
    console.error("❌ [PROXY VLINK] Error:", error);
    // Return empty array/object to prevent frontend crash, or propagate error 
    // depending on how strict we want to be. Here we propagate error to let frontend handle fallback.
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== AVAILABILITY CHECK ==========
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
    // TODO: Fetch from branch/staff settings later
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

// ========== SEED BUILT-IN ROLES ON STARTUP ==========
async function seedBuiltInRoles() {
  try {
    console.log('🌱 [SEED] Checking for built-in roles...');
    
    // Increase timeout to 30 seconds (longer for database connection issues)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Seed timeout after 30s')), 30000)
    );
    
    const seedPromise = (async () => {
      try {
        // Use higher retry count for seed operation (5 retries with 500ms initial delay)
        const existingRoles = await retry(() => kv.getByPrefix('role:'), 5, 500);
        
        // Check if built-in roles already exist
        const hasAdminRole = existingRoles.some((r: any) => r.name === 'admin' && r.is_built_in);
        const hasStaffRole = existingRoles.some((r: any) => r.name === 'staff' && r.is_built_in);
        
        // Seed Admin role if not exists
        if (!hasAdminRole) {
          const adminRoleId = crypto.randomUUID();
          const adminRole = {
            id: adminRoleId,
            name: 'admin',
            description: 'Administrator with elevated permissions',
            permissions: [
              'manage_services',
              'manage_staff',
              'view_reports',
              'manage_appointments',
              'process_payments',
              'view_analytics',
            ],
            is_built_in: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await kv.set(`role:${adminRoleId}`, adminRole);
          console.log('✅ [SEED] Created built-in role: Admin');
        }
        
        // Seed Staff role if not exists
        if (!hasStaffRole) {
          const staffRoleId = crypto.randomUUID();
          const staffRole = {
            id: staffRoleId,
            name: 'staff',
            description: 'Staff member with basic permissions',
            permissions: [
              'manage_appointments',
              'process_payments',
            ],
            is_built_in: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await kv.set(`role:${staffRoleId}`, staffRole);
          console.log('✅ [SEED] Created built-in role: Staff');
        }
        
        if (hasAdminRole && hasStaffRole) {
          console.log('✅ [SEED] Built-in roles already exist, skipping...');
        }
      } catch (seedError) {
        console.error('❌ [SEED] Error in seed logic:', seedError);
        throw seedError;
      }
    })();
    
    await Promise.race([seedPromise, timeoutPromise]);
  } catch (error: any) {
    console.error('❌ [SEED] Failed to seed built-in roles:', error);
    console.log('⚠️  [SEED] Server will continue starting. Roles will be created on first access if needed.');
    // Don't throw - let server continue
  }
}

// Start server immediately (don't block on seed)
console.log('🚀 [SERVER] Bitcoin Nail Bar Server Starting...');
console.log('🔍 [SERVER] Check-in endpoint: /make-server-84f9c112/check-in');

// Seed roles in background (non-blocking) - wait 2 seconds for database to be ready
setTimeout(() => {
  seedBuiltInRoles().catch(err => {
    console.error('⚠️  [SEED] Background seed failed, but server is running:', err);
    console.log('💡 [SEED] This is normal if database is still warming up. Roles will be created on first access.');
  });
}, 2000);

Deno.serve(app.fetch);