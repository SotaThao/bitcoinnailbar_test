import { Hono } from 'npm:hono@4.6.14';
import { kv, requireAuth, requirePermission } from './helpers.tsx';

// ========== TYPE DEFINITIONS ==========
export interface Membership {
  id: string;
  customer_phone: string;
  customer_name: string;
  customer_email?: string;
  tier: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  payment_method: 'cash' | 'vlinkpay' | 'card';
  amount_paid: number;
  notes?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  display_name: string;
  price: number;
  duration_months: number;
  billing_cycle: 'week' | 'month' | 'year';
  discount_percentage: number;
  is_popular?: boolean;
  benefits: string[];
  color: string;
}

// Default membership tiers
export const DEFAULT_TIERS: MembershipTier[] = [
  {
    id: 'tier:silver',
    name: 'silver',
    display_name: 'Silver',
    price: 99,
    duration_months: 1,
    billing_cycle: 'year',
    discount_percentage: 10,
    benefits: ['10% off all services', 'Priority booking', 'Birthday gift'],
    color: 'text-gray-300'
  },
  {
    id: 'tier:gold',
    name: 'gold',
    display_name: 'Gold',
    price: 479,
    duration_months: 1,
    billing_cycle: 'year',
    discount_percentage: 20,
    benefits: ['20% off all services', 'Priority booking', 'Birthday gift', 'Free upgrade once/month'],
    color: 'text-[#eab308]'
  },
  {
    id: 'tier:platinum',
    name: 'platinum',
    display_name: 'Platinum',
    price: 539,
    duration_months: 1,
    billing_cycle: 'year',
    discount_percentage: 25,
    benefits: ['25% off all services', 'VIP priority', 'Birthday gift', 'Free upgrade twice/month', 'Complimentary drink'],
    color: 'text-white'
  },
  {
    id: 'tier:vip-crypto',
    name: 'vip-crypto', // Using string type instead of literal since it's not in the original union type, might need to update interface
    display_name: 'VIP Crypto',
    price: 624,
    duration_months: 1,
    billing_cycle: 'year',
    discount_percentage: 35,
    benefits: ['35% off all services', 'VIP priority', 'Birthday gift', 'Unlimited free upgrades', 'Complimentary drink', 'Exclusive events'],
    color: 'text-[#f7931a]'
  }
];

// ========== ROUTES ==========
export const membershipRoutes = new Hono();

// GET: List all memberships
membershipRoutes.get('/make-server-84f9c112/memberships', requireAuth, requirePermission('can_manage_settings'), async (c) => {
  try {
    const memberships = await kv.getByPrefix('membership:');
    return c.json({ success: true, data: memberships });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET: Get membership by ID
membershipRoutes.get('/make-server-84f9c112/memberships/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const membership = await kv.get(`membership:${id}`);

    if (!membership) {
      return c.json({ success: false, error: 'Membership not found' }, 404);
    }

    return c.json({ success: true, data: membership });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET: Check customer membership status by phone
membershipRoutes.get('/make-server-84f9c112/memberships/check/:phone', async (c) => {
  try {
    const phone = c.req.param('phone');
    const allMemberships = await kv.getByPrefix('membership:');

    // Find active membership for this phone
    const activeMembership = allMemberships.find((m: Membership) =>
      m.customer_phone === phone && m.status === 'active'
    );

    if (!activeMembership) {
      return c.json({
        success: true,
        data: {
          has_membership: false,
          tier: null,
          discount_percentage: 0
        }
      });
    }

    // Get tier details
    const tier = DEFAULT_TIERS.find(t => t.name === activeMembership.tier);

    return c.json({
      success: true,
      data: {
        has_membership: true,
        tier: activeMembership.tier,
        discount_percentage: tier?.discount_percentage || 0,
        membership: activeMembership
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Create new membership
membershipRoutes.post('/make-server-84f9c112/memberships', requireAuth, requirePermission('can_manage_settings'), async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const { customer_phone, customer_name, customer_email, tier, payment_method, amount_paid, notes } = body;

    // Validation
    if (!customer_phone || !customer_name || !tier || !payment_method || amount_paid === undefined) {
      return c.json({
        success: false,
        error: 'Missing required fields: customer_phone, customer_name, tier, payment_method, amount_paid'
      }, 400);
    }

    // Validate tier
    const tierConfig = DEFAULT_TIERS.find(t => t.name === tier);
    if (!tierConfig) {
      return c.json({ success: false, error: 'Invalid tier' }, 400);
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + tierConfig.duration_months);

    // Create membership
    const id = `${Date.now()}`;
    const membership: Membership = {
      id,
      customer_phone,
      customer_name,
      customer_email,
      tier,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      payment_method,
      amount_paid,
      notes,
      created_at: new Date().toISOString(),
      created_by: user.sub || user.id,
    };

    await kv.set(`membership:${id}`, membership);

    return c.json({ success: true, data: membership });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Update membership
membershipRoutes.put('/make-server-84f9c112/memberships/:id', requireAuth, requirePermission('can_manage_settings'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existingMembership = await kv.get(`membership:${id}`);
    if (!existingMembership) {
      return c.json({ success: false, error: 'Membership not found' }, 404);
    }

    // Update membership
    const updatedMembership: Membership = {
      ...existingMembership,
      ...body,
      id, // Prevent ID change
      updated_at: new Date().toISOString(),
    };

    await kv.set(`membership:${id}`, updatedMembership);

    return c.json({ success: true, data: updatedMembership });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE: Delete membership
membershipRoutes.delete('/make-server-84f9c112/memberships/:id', requireAuth, requirePermission('can_manage_settings'), async (c) => {
  try {
    const id = c.req.param('id');

    const existingMembership = await kv.get(`membership:${id}`);
    if (!existingMembership) {
      return c.json({ success: false, error: 'Membership not found' }, 404);
    }

    await kv.mdel([`membership:${id}`]);

    return c.json({ success: true, message: 'Membership deleted successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET: Get membership tiers configuration
membershipRoutes.get('/make-server-84f9c112/memberships/tiers/config', async (c) => {
  try {
    // Check if custom tiers exist in KV
    const customTiers = await kv.get('settings:membership-tiers');
    const tiers = customTiers || DEFAULT_TIERS;

    return c.json({ success: true, data: tiers });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Update membership tiers configuration (Admin only)
membershipRoutes.put('/make-server-84f9c112/memberships/tiers/config', requireAuth, requirePermission('can_manage_settings'), async (c) => {
  try {
    const body = await c.req.json();
    const { tiers } = body;

    if (!Array.isArray(tiers)) {
      return c.json({ success: false, error: 'Invalid tiers format' }, 400);
    }

    await kv.set('settings:membership-tiers', tiers);

    return c.json({ success: true, data: tiers });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
