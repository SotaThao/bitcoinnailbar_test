-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- BITCOIN NAIL BAR - POSTGRES MIGRATION SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Date Created: 2026-01-28
-- Purpose: Migrate Appointments & Technicians from KV Store to Postgres
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy/paste this ENTIRE file
-- 3. Click "Run" to execute
-- 4. Verify tables created successfully
-- 5. Return to Figma Make and run migration script
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STEP 1: DROP EXISTING TABLES (if running this script multiple times)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Uncomment these lines if you need to reset tables:
-- DROP TABLE IF EXISTS assignment_change_log CASCADE;
-- DROP TABLE IF EXISTS appointment_info CASCADE;
-- DROP TABLE IF EXISTS technician_info CASCADE;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 1: technician_info
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Stores all technician/staff information
-- Migrated from: kv_store_89edbd69 → staff:*
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE technician_info (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  nick_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  avatar_url TEXT,
  
  -- Employment Details
  employment_type VARCHAR(20) CHECK (employment_type IN ('W2', '1099', 'Contractor', 'Full-time', 'Part-time')),
  license_number VARCHAR(50),
  license_expiry DATE,
  commission_rate DECIMAL(5,2) DEFAULT 40.00, -- Percentage (e.g., 40.00 = 40%)
  hourly_rate DECIMAL(10,2),
  
  -- Skills & Specialties
  specialties JSONB DEFAULT '[]'::jsonb, 
  -- Example: ["Manicure", "Pedicure", "Gel Polish", "Nail Art"]
  
  -- Performance Metrics
  rating DECIMAL(3,2) DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
  total_income DECIMAL(10,2) DEFAULT 0.00,
  total_appointments INTEGER DEFAULT 0,
  last_metrics_update TIMESTAMPTZ,
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  unavailable_until TIMESTAMPTZ,
  unavailable_reason TEXT,
  working_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'::jsonb,
  -- Example: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  
  working_hours JSONB,
  -- Example: {"start": "09:00", "end": "18:00"}
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(100),
  
  -- Additional Info
  notes TEXT,
  hire_date DATE,
  termination_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Legacy Migration (from KV Store)
  legacy_staff_id VARCHAR(100) UNIQUE
  -- Example: "staff:1738051200000"
);

-- Indexes for Performance
CREATE INDEX idx_technician_name ON technician_info(name);
CREATE INDEX idx_technician_available ON technician_info(is_available) WHERE is_available = true;
CREATE INDEX idx_technician_rating ON technician_info(rating DESC);
CREATE INDEX idx_technician_legacy_id ON technician_info(legacy_staff_id);

-- Comments for Documentation
COMMENT ON TABLE technician_info IS 'Stores all technician/staff member information';
COMMENT ON COLUMN technician_info.specialties IS 'Array of service specialties (JSONB array of strings)';
COMMENT ON COLUMN technician_info.working_days IS 'Array of working day names (JSONB array)';
COMMENT ON COLUMN technician_info.legacy_staff_id IS 'Original KV Store ID for migration tracking';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 2: appointment_info
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Stores all appointment/booking information
-- Migrated from: kv_store_89edbd69 → appointment:*
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE appointment_info (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  
  -- Foreign Key Relationships
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES technician_info(id) ON DELETE SET NULL,
  
  -- Branch (still KV Store reference for now)
  branch_id VARCHAR(100),
  branch_name VARCHAR(255),
  
  -- Services
  service_ids JSONB DEFAULT '[]'::jsonb,
  -- Example: ["service-123", "service-456"]
  
  service_names JSONB DEFAULT '[]'::jsonb,
  -- Example: ["Manicure", "Pedicure"]
  
  estimated_duration INTEGER DEFAULT 60, -- In minutes
  
  -- Appointment Details
  appointment_time TIMESTAMPTZ NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  
  -- Technician Assignment Tracking
  assignment_method VARCHAR(20) 
    CHECK (assignment_method IN ('auto', 'manual', 'customer_choice')),
  
  assignment_score INTEGER 
    CHECK (assignment_score >= 0 AND assignment_score <= 100),
  
  last_assignment_change TIMESTAMPTZ,
  assignment_change_count INTEGER DEFAULT 0,
  has_customer_preference BOOLEAN DEFAULT false,
  
  -- Payment Information
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_status VARCHAR(20) DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'refunded')),
  payment_method VARCHAR(50),
  
  -- Additional Details
  notes TEXT,
  qr_code_url TEXT,
  cancellation_reason TEXT,
  
  -- Email Tracking
  email_sent BOOLEAN DEFAULT false,
  email_error TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Legacy Migration (from KV Store)
  legacy_appointment_id VARCHAR(100) UNIQUE
  -- Example: "appointment:1738051200000"
);

-- Indexes for Performance
CREATE INDEX idx_appointment_time ON appointment_info(appointment_time DESC);
CREATE INDEX idx_appointment_status ON appointment_info(status);
CREATE INDEX idx_appointment_customer_phone ON appointment_info(customer_phone);
CREATE INDEX idx_appointment_technician ON appointment_info(technician_id);
CREATE INDEX idx_appointment_customer ON appointment_info(customer_id);
CREATE INDEX idx_appointment_legacy_id ON appointment_info(legacy_appointment_id);

-- Composite Index for common queries
CREATE INDEX idx_appointment_tech_time ON appointment_info(technician_id, appointment_time);

-- Comments for Documentation
COMMENT ON TABLE appointment_info IS 'Stores all customer appointments and bookings';
COMMENT ON COLUMN appointment_info.service_ids IS 'Array of service IDs (JSONB array)';
COMMENT ON COLUMN appointment_info.service_names IS 'Array of service names for display (JSONB array)';
COMMENT ON COLUMN appointment_info.assignment_score IS 'Auto-assignment algorithm score (0-100)';
COMMENT ON COLUMN appointment_info.legacy_appointment_id IS 'Original KV Store ID for migration tracking';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 3: assignment_change_log
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Stores audit trail for technician assignment changes
-- Migrated from: kv_store_89edbd69 → assignment-log:*
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE assignment_change_log (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key Relationships
  appointment_id UUID REFERENCES appointment_info(id) ON DELETE CASCADE,
  from_technician_id UUID REFERENCES technician_info(id) ON DELETE SET NULL,
  to_technician_id UUID REFERENCES technician_info(id) ON DELETE SET NULL,
  
  -- Technician Names (denormalized for historical accuracy)
  from_technician_name VARCHAR(255),
  to_technician_name VARCHAR(255) NOT NULL,
  
  -- Reason Tracking
  reason_id VARCHAR(100), -- Still KV Store reference: assignment-reason:*
  reason_text TEXT NOT NULL,
  reason_category VARCHAR(50),
  custom_reason TEXT,
  
  -- Assignment Method
  assignment_method VARCHAR(20) NOT NULL 
    CHECK (assignment_method IN ('auto', 'manual')),
  
  assignment_score INTEGER 
    CHECK (assignment_score >= 0 AND assignment_score <= 100),
  
  -- User Tracking
  changed_by VARCHAR(100) NOT NULL,
  changed_by_name VARCHAR(255) NOT NULL,
  changed_by_role VARCHAR(50),
  
  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Legacy Migration (from KV Store)
  legacy_log_id VARCHAR(150) UNIQUE
  -- Example: "assignment-log:appointment:123:1738051200000"
);

-- Indexes for Performance
CREATE INDEX idx_assignment_log_appointment ON assignment_change_log(appointment_id, timestamp DESC);
CREATE INDEX idx_assignment_log_from_tech ON assignment_change_log(from_technician_id);
CREATE INDEX idx_assignment_log_to_tech ON assignment_change_log(to_technician_id);
CREATE INDEX idx_assignment_log_timestamp ON assignment_change_log(timestamp DESC);
CREATE INDEX idx_assignment_log_changed_by ON assignment_change_log(changed_by);

-- Comments for Documentation
COMMENT ON TABLE assignment_change_log IS 'Immutable audit trail for all technician assignment changes';
COMMENT ON COLUMN assignment_change_log.from_technician_name IS 'Denormalized name for historical accuracy (in case technician is deleted)';
COMMENT ON COLUMN assignment_change_log.to_technician_name IS 'Denormalized name for historical accuracy';
COMMENT ON COLUMN assignment_change_log.legacy_log_id IS 'Original KV Store ID for migration tracking';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AUTO-UPDATE TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Automatically update 'updated_at' timestamp on record changes
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_technician_updated_at 
  BEFORE UPDATE ON technician_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_appointment_updated_at 
  BEFORE UPDATE ON appointment_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HELPER FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function: Get available technicians for a specific time slot
CREATE OR REPLACE FUNCTION get_available_technicians(
  p_appointment_time TIMESTAMPTZ,
  p_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
  technician_id UUID,
  technician_name VARCHAR,
  specialties JSONB,
  rating DECIMAL,
  is_busy BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.specialties,
    t.rating,
    EXISTS (
      SELECT 1 FROM appointment_info a
      WHERE a.technician_id = t.id
        AND a.status IN ('confirmed', 'pending')
        AND a.appointment_time < p_appointment_time + (p_duration_minutes || ' minutes')::INTERVAL
        AND (a.appointment_time + (a.estimated_duration || ' minutes')::INTERVAL) > p_appointment_time
    ) AS is_busy
  FROM technician_info t
  WHERE t.is_available = true
  ORDER BY t.rating DESC, t.name;
END;
$$ LANGUAGE plpgsql;

-- Function: Get technician's upcoming appointments
CREATE OR REPLACE FUNCTION get_technician_schedule(
  p_technician_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  appointment_id UUID,
  appointment_time TIMESTAMPTZ,
  customer_name VARCHAR,
  services JSONB,
  duration INTEGER,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.appointment_time,
    a.customer_name,
    a.service_names,
    a.estimated_duration,
    a.status
  FROM appointment_info a
  WHERE a.technician_id = p_technician_id
    AND DATE(a.appointment_time) >= p_start_date
    AND DATE(a.appointment_time) < p_start_date + p_days
    AND a.status NOT IN ('cancelled', 'completed')
  ORDER BY a.appointment_time;
END;
$$ LANGUAGE plpgsql;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Uncomment if you want to enable RLS for security
-- Note: Make sure your backend uses service_role_key for full access
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ALTER TABLE technician_info ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointment_info ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assignment_change_log ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow backend service role full access to technician_info"
--   ON technician_info FOR ALL
--   USING (true);

-- CREATE POLICY "Allow backend service role full access to appointment_info"
--   ON appointment_info FOR ALL
--   USING (true);

-- CREATE POLICY "Allow backend service role full access to assignment_change_log"
--   ON assignment_change_log FOR ALL
--   USING (true);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION QUERIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Run these to verify tables were created successfully
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('technician_info', 'appointment_info', 'assignment_change_log')
ORDER BY table_name;

-- Check table row counts (should be 0 before migration)
SELECT 
  'technician_info' AS table_name, 
  COUNT(*) AS row_count 
FROM technician_info
UNION ALL
SELECT 
  'appointment_info', 
  COUNT(*) 
FROM appointment_info
UNION ALL
SELECT 
  'assignment_change_log', 
  COUNT(*) 
FROM assignment_change_log;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('technician_info', 'appointment_info', 'assignment_change_log')
ORDER BY tablename, indexname;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SUCCESS MESSAGE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SUCCESS: Postgres tables created successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  1. technician_info';
  RAISE NOTICE '  2. appointment_info';
  RAISE NOTICE '  3. assignment_change_log';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Return to Figma Make';
  RAISE NOTICE '  2. Run migration script to copy data from KV Store';
  RAISE NOTICE '  3. Verify data migrated correctly';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;