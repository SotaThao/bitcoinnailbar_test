import { Hono } from 'npm:hono@4.6.14';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED UTILITIES (Phase 1 Refactor)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { retry } from './_shared_retry.tsx';
import { kvAdmin as kv } from './_shared_kv.tsx';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOMAIN MODULES (Phase 2 Refactor)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { setupApp } from './setup.tsx';
import { branchesApp } from './branches.tsx';
import { servicesApp } from './services.tsx';
import { reviewsApp } from './reviews.tsx';
import { staffApp } from './staff.tsx';
import { membershipRoutes } from './membership.tsx';
import { app as authApp } from './auth.tsx';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER SYSTEM - Postgres Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { customersApp } from './customers_postgres.tsx';
import { customersBookingApp } from './customers_booking_postgres.tsx';
import { customersMembershipApp } from './customers_membership_postgres.tsx';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE MODULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import rolesApp from './roles.tsx';
import { promotionsApp } from './promotions.tsx';
import { registerPromotionTranslateRoutes } from './promotion-translate.tsx';
import galleryApp from './gallery.tsx';
import galleryLogoApp from './gallery-logo.tsx';
import { settingsApp } from './settings.tsx';
import { vlinkpaySettingsApp } from './vlinkpay-settings.tsx';
import { paymentApp } from './payment.tsx';
import { redeemApp } from './redeem.tsx';
import { membershipRedeemApp } from './membership-redeem.tsx';
import { adminRedeemCodesApp } from './admin-redeem-codes.tsx';
import { adminMigrationApp } from './admin-migration.tsx';
import { eventsApp } from './events.tsx';
import { appointmentsApp } from './appointments.tsx';
import { payrollApp } from './payroll.tsx';
import { chatbotApp } from './chatbot.tsx';
import { migrateCustomersApp } from './migrate-customers-to-postgres.tsx';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TECHNICIAN ASSIGNMENT SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import assignmentReasonsApp from './assignment-reasons.tsx';
import assignmentLogsApp from './assignment-logs.tsx';
import technicianAssignmentApp from './technician-assignment.tsx';
import migrateToPostgresApp from './migrate-to-postgres.tsx';
import { manualAssignmentApp } from './manual-assignment.tsx';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEBUG MODULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { debugSettingsApp } from './debug-settings.tsx';
import { app as debugUsersApp } from './debug-users.tsx';
import { app as debugCheckUserApp } from './debug-check-user.tsx';
import { debugCustomersApp } from './debug-customers.tsx';
import { debugPostgresCustomersApp } from './debug-postgres-customers.tsx';
import { debugConsolidatedApp } from './debug-consolidated.tsx';
import { debugCustomerAuditApp } from './debug-customer-audit.tsx';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITIES MODULE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { utilitiesApp } from './utilities.tsx'; // 7 routes: upload, menu images (5 routes), vlink proxy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOUNT MODULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Phase 2 - Domain Modules (Clean Architecture)
app.route('/', setupApp);
app.route('/', branchesApp);
app.route('/', servicesApp);
app.route('/', reviewsApp);
app.route('/', staffApp);

// Authentication & Authorization
app.route('/', authApp);
app.route('/make-server-84f9c112/roles', rolesApp);

// Membership System
app.route('/', membershipRoutes);
app.route('/make-server-84f9c112', membershipRedeemApp);

// Customer Management (Postgres)
app.route('/', customersApp);
app.route('/', customersBookingApp);
app.route('/', customersMembershipApp);

// Content Management
app.route('/', promotionsApp);
registerPromotionTranslateRoutes(app);
app.route('/', galleryApp);
app.route('/make-server-84f9c112/gallery-logo', galleryLogoApp);
app.route('/', settingsApp);

// Business Operations
app.route('/', eventsApp);
app.route('/', appointmentsApp);
app.route('/', payrollApp);

// Technician Assignment System
app.route('/make-server-84f9c112/assignment-reasons', assignmentReasonsApp);
app.route('/make-server-84f9c112/assignment-logs', assignmentLogsApp);
app.route('/make-server-84f9c112/appointments', technicianAssignmentApp);
app.route('/make-server-84f9c112/migrate-to-postgres', migrateToPostgresApp);
app.route('/', manualAssignmentApp);

// Payment & Redeem
app.route('/', vlinkpaySettingsApp);
app.route('/', paymentApp);
app.route('/', redeemApp);
app.route('/make-server-84f9c112', adminRedeemCodesApp);

// AI & Chatbot
app.route('/', chatbotApp);

// Utilities
app.route('/', utilitiesApp);

// Admin Tools
app.route('/make-server-84f9c112', adminMigrationApp);
app.route('/make-server-84f9c112', migrateCustomersApp);
app.route('/make-server-84f9c112', debugSettingsApp);

// Debug Endpoints
app.route('/', debugUsersApp);
app.route('/', debugCheckUserApp);
app.route('/', debugCustomersApp);
app.route('/', debugPostgresCustomersApp);
app.route('/', debugConsolidatedApp);
app.route('/', debugCustomerAuditApp);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEED BUILT-IN ROLES ON STARTUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function seedBuiltInRoles() {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Seed timeout after 10s')), 10000)
    );

    const seedPromise = (async () => {
      try {
        // Quick check with minimal retries
        let existingRoles: any[] = [];
        try {
          existingRoles = await retry(() => kv.getByPrefix('role:'), 2, 300);
        } catch {
          existingRoles = [];
        }

        const hasAdminRole = existingRoles.some((r: any) => r.name === 'admin' && r.is_built_in);
        const hasStaffRole = existingRoles.some((r: any) => r.name === 'staff' && r.is_built_in);

        if (hasAdminRole && hasStaffRole) {
          return;
        }

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
        }
      } catch (seedError) {
        throw seedError;
      }
    })();

    await Promise.race([seedPromise, timeoutPromise]);
  } catch (error: any) {
    // Don't throw - let server continue
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVER STARTUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Seed roles in background (non-blocking)
setTimeout(() => {
  seedBuiltInRoles().catch(() => {});
}, 2000);

Deno.serve(app.fetch);