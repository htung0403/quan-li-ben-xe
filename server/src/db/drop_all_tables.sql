-- ============================================
-- DROP ALL TABLES IN POSTGRESQL
-- ============================================
-- This script will drop all tables, views, and related objects
-- WARNING: This will delete all data permanently!
-- ============================================

-- Method 1: Drop all tables using CASCADE (Recommended)
-- This will automatically handle foreign key constraints
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all views first
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
    
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all sequences (if any remain)
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public')
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as argtypes 
              FROM pg_proc INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
              WHERE pg_namespace.nspname = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- ============================================
-- ALTERNATIVE METHOD 2: Manual drop (if needed)
-- ============================================
-- Uncomment and use this if Method 1 doesn't work
-- Drop in reverse order of dependencies

/*
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS service_charges CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS violation_types CASCADE;
DROP TABLE IF EXISTS dispatch_records CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS vehicle_documents CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS vehicle_types CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS operators CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop views
DROP VIEW IF EXISTS daily_dispatch_summary CASCADE;
DROP VIEW IF EXISTS vehicles_in_station CASCADE;
DROP VIEW IF EXISTS vehicles_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/

-- ============================================
-- VERIFY: Check remaining tables
-- ============================================
-- Run this after dropping to verify all tables are gone:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

