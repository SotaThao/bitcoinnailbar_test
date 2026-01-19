import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface MembershipTier {
  id: string;
  name: string;
  display_name: string;
  price: number;
  duration_months: number;
  discount_percentage: number;
  benefits: string[];
  color: string;
}

export function useMembershipTiers() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTiers() {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/memberships/tiers/config`, {
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`
            }
        });
        const data = await response.json();
        if (data.success) {
          setTiers(data.data);
        } else {
          setError(data.error || 'Failed to fetch configuration');
        }
      } catch (err: any) {
        console.error('Error fetching membership tiers:', err);
        setError('Failed to fetch membership tiers');
      } finally {
        setLoading(false);
      }
    }

    fetchTiers();
  }, []);

  return { tiers, loading, error };
}