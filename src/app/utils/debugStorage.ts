/**
 * Utilities for debugging Cloudinary storage
 * Returns data for inspection; caller handles logging.
 */

import { projectId, publicAnonKey } from '@utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112`;

export async function inspectCategories() {
  const response = await fetch(`${API_BASE}/settings/categories`, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });

  const data = await response.json();

  if (data.success) {
    return data.data;
  }
  return null;
}

export async function inspectServices() {
  const response = await fetch(`${API_BASE}/settings/service-menu`, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });

  const data = await response.json();

  if (data.success) {
    const categories = Object.keys(data.data || {});

    // Count services per category
    const serviceCounts: Record<string, number> = {};
    categories.forEach(cat => {
      const groups = data.data[cat]?.groups || [];
      let total = 0;
      groups.forEach((group: { services?: unknown[] }) => {
        total += group.services?.length || 0;
      });
      serviceCounts[cat] = total;
    });

    return { data: data.data, serviceCounts };
  }
  return null;
}

export async function inspectAll() {
  const [categories, servicesResult] = await Promise.all([
    inspectCategories(),
    inspectServices(),
  ]);

  return {
    categories,
    services: servicesResult?.data ?? null,
    serviceCounts: servicesResult?.serviceCounts ?? {},
  };
}
