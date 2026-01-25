-- ============================================
-- CUSTOMER PROFILES SCHEMA UPDATE
-- Add missing fields from KV Store
-- Date: 2026-01-23
-- ============================================

-- Add missing columns
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Add phone index for fast lookup (ID is UUID now, not phone-based)
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles (phone);

-- Add created_by tracking (optional - can be NULL)
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS created_by text;

-- Add membership_amount for tier comparison logic
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS membership_amount NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN customer_profiles.membership_amount IS 'Amount paid for current membership (used for tier upgrade comparison)';

-- Verify schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customer_profiles'
ORDER BY ordinal_position;

-- ============================================
-- NOTES:
-- - Run this in Supabase SQL Editor
-- - All columns added with IF NOT EXISTS (safe to re-run)
-- - Phone index critical for lookup operations
-- ============================================