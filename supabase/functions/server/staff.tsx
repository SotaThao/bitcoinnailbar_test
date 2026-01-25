/**
 * STAFF MODULE
 * Phase 2.5 - Extracted from index.tsx (Wave 2 Start!)
 * 
 * Routes:
 * - GET  /staff - List all staff
 * - POST /staff - Create staff member
 * - PUT  /staff/:id - Update staff member
 * - DELETE /staff/:id - Delete staff member
 * - POST /staff/seed - Seed initial staff data (6 members)
 * 
 * KV Table: kv_store_89edbd69 (admin)
 * KV Prefix: staff:
 * 
 * Special Logic:
 * - Seed route creates 6 realistic US nail salon staff members
 * - Includes W2/1099 employment types, license numbers, specialties
 * - Commission rates, work schedules, emergency contacts
 */

import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';

const app = new Hono();

// ========== GET ALL STAFF ==========
app.get('/make-server-84f9c112/staff', async (c) => {
  try {
    const staff = await kv.getByPrefix('staff:');
    return c.json({ success: true, data: staff });
  } catch (e) {
    console.error('❌ [GET STAFF] Error:', e);
    return c.json({ success: false, error: String(e) }, 500);
  }
});

// ========== CREATE STAFF ==========
app.post('/make-server-84f9c112/staff', async (c) => {
  try {
    const body = await c.req.json();
    const id = `staff:${Date.now()}`;
    const staff = {
      id,
      ...body,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, staff);
    console.log(`✅ [CREATE STAFF] Created: ${id} - ${body.name || 'Unknown'}`);
    
    return c.json({ success: true, data: staff });
  } catch (error: any) {
    console.error('❌ [CREATE STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== UPDATE STAFF ==========
app.put('/make-server-84f9c112/staff/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Get existing staff to preserve createdAt
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: 'Staff not found' }, 404);
    }
    
    const updatedStaff = {
      ...existing,
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(id, updatedStaff);
    console.log(`✅ [UPDATE STAFF] Updated: ${id} - ${body.name || 'Unknown'}`);
    
    return c.json({ success: true, data: updatedStaff });
  } catch (error: any) {
    console.error('❌ [UPDATE STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== DELETE STAFF ==========
app.delete('/make-server-84f9c112/staff/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`🗑️  [DELETE STAFF] Deleting: ${id}`);
    
    await kv.mdel([id]);
    
    console.log(`✅ [DELETE STAFF] Successfully deleted: ${id}`);
    return c.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error: any) {
    console.error('❌ [DELETE STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== SEED STAFF DATA ==========
// Creates 6 realistic staff members based on US nail salon business
app.post('/make-server-84f9c112/staff/seed', async (c) => {
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
      const staffMember = {
        id,
        ...staff,
        createdAt: new Date().toISOString()
      };
      
      await kv.set(id, staffMember);
      created.push(staffMember);
      
      // Small delay to ensure unique timestamps
      await new Promise(r => setTimeout(r, 10));
    }

    console.log(`✅ [SEED STAFF] Successfully seeded ${created.length} staff members`);
    
    return c.json({ 
      success: true, 
      message: `Successfully seeded ${created.length} staff members`,
      data: created 
    });
  } catch (error: any) {
    console.error('❌ [SEED STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as staffApp };