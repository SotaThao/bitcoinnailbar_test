/**
 * Supabase Environment Configuration
 * 
 * Toggle between staging and production environments
 * 
 * USAGE:
 * 1. Set USE_STAGING to true for staging
 * 2. Set USE_STAGING to false for production
 * 3. Update STAGING credentials after creating staging branch
 */

// ========== ENVIRONMENT TOGGLE ==========
// Change this to switch environments
export const USE_STAGING = false; // ← Set to TRUE when testing in staging

// ========== PRODUCTION CONFIG ==========
const PRODUCTION = {
  projectId: "pwmrmcipniefewufwjjy",
  publicAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bXJtY2lwbmllZmV3dWZ3amp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTgwMDEsImV4cCI6MjA4MjEzNDAwMX0.i8S8gaa2t3NNKq-BUz-600eRYa8tfJeW14Ydold-i9k"
};

// ========== STAGING CONFIG ==========
// TODO: Fill these in after creating staging branch
const STAGING = {
  projectId: "YOUR_STAGING_PROJECT_ID", // ← Update this
  publicAnonKey: "YOUR_STAGING_ANON_KEY" // ← Update this
};

// ========== EXPORT ACTIVE CONFIG ==========
const activeConfig = USE_STAGING ? STAGING : PRODUCTION;

export const projectId = activeConfig.projectId;
export const publicAnonKey = activeConfig.publicAnonKey;
export const supabaseUrl = `https://${projectId}.supabase.co`;

// Log current environment (helps debugging)
console.log(`🌍 Supabase Environment: ${USE_STAGING ? '🧪 STAGING' : '🚀 PRODUCTION'}`);
console.log(`📍 Project ID: ${projectId}`);
