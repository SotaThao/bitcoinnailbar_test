/**
 * Utilities for debugging Cloudinary storage
 */

import { projectId, publicAnonKey } from '@utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112`;

export async function inspectCategories() {
  console.log('🔍 [DEBUG] Fetching categories...');
  
  const response = await fetch(`${API_BASE}/settings/categories`, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`📋 [DEBUG] Total Categories: ${data.data?.length || 0}`);
    console.table(data.data);
    return data.data;
  } else {
    console.error('❌ [DEBUG] Failed to fetch categories:', data.error);
    return null;
  }
}

export async function inspectServices() {
  console.log('🔍 [DEBUG] Fetching service menu...');
  
  const response = await fetch(`${API_BASE}/settings/service-menu`, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });
  
  const data = await response.json();
  
  if (data.success) {
    const categories = Object.keys(data.data || {});
    console.log(`🛠️ [DEBUG] Total Service Categories: ${categories.length}`);
    console.log('📁 Categories:', categories);
    
    // Count services per category
    const serviceCounts: Record<string, number> = {};
    categories.forEach(cat => {
      const groups = data.data[cat]?.groups || [];
      let total = 0;
      groups.forEach((group: any) => {
        total += group.services?.length || 0;
      });
      serviceCounts[cat] = total;
    });
    
    console.table(serviceCounts);
    return data.data;
  } else {
    console.error('❌ [DEBUG] Failed to fetch services:', data.error);
    return null;
  }
}

export async function inspectAll() {
  console.log('🚀 [DEBUG] === FULL STORAGE INSPECTION ===\n');
  
  const categories = await inspectCategories();
  console.log('\n---\n');
  const services = await inspectServices();
  
  console.log('\n🎯 [DEBUG] === SUMMARY ===');
  console.log(`Categories: ${categories?.length || 0}`);
  console.log(`Service Menu Keys: ${Object.keys(services || {}).length}`);
  
  return { categories, services };
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).inspectCategories = inspectCategories;
  (window as any).inspectServices = inspectServices;
  (window as any).inspectAll = inspectAll;
  (window as any).debugStorage = inspectAll; // Alias
}