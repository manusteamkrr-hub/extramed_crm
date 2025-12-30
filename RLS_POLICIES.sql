-- RLS Policies for extramed_crm
-- This script must be run in the Supabase SQL Editor

-- 1. Enable RLS for all sensitive tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inpatients ENABLE ROW LEVEL SECURITY;

-- 2. Create helper function to get user role
-- Note: user_profiles table already has RLS enabled and policies to read own profile
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid()
$$;

-- 3. Define RLS Policies

-- =================================================================================
-- PATIENTS Table Policies
-- =================================================================================

-- Admin/Doctor: Full Access (R/W)
CREATE POLICY "Admin and Doctor can view all patients" ON patients
  FOR SELECT USING (get_user_role() IN ('admin', 'doctor'));

CREATE POLICY "Admin and Doctor can insert patients" ON patients
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'doctor'));

CREATE POLICY "Admin and Doctor can update patients" ON patients
  FOR UPDATE USING (get_user_role() IN ('admin', 'doctor'));

CREATE POLICY "Admin and Doctor can delete patients" ON patients
  FOR DELETE USING (get_user_role() IN ('admin', 'doctor'));

-- Accountant: Read-Only Access (only for basic demographic data if needed, or no access)
-- For simplicity and security, we grant no access to Accountants for the full patient record.
-- If they need basic info (name, MRN) for billing, a view should be created.
-- For now, they rely on the estimates/payments tables.

-- =================================================================================
-- ESTIMATES & PAYMENTS Tables Policies
-- =================================================================================

-- Admin/Accountant: Full Access (R/W)
CREATE POLICY "Admin and Accountant can view all estimates" ON estimates
  FOR SELECT USING (get_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Admin and Accountant can insert estimates" ON estimates
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Admin and Accountant can update estimates" ON estimates
  FOR UPDATE USING (get_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Admin and Accountant can delete estimates" ON estimates
  FOR DELETE USING (get_user_role() IN ('admin', 'accountant'));

-- Doctor: Read-Only Access
CREATE POLICY "Doctor can view estimates" ON estimates
  FOR SELECT USING (get_user_role() = 'doctor');

-- Estimate Items (Same as Estimates)
CREATE POLICY "Admin and Accountant can view all estimate_items" ON estimate_items
  FOR SELECT USING (get_user_role() IN ('admin', 'accountant', 'doctor')); -- Doctor needs to see items too

CREATE POLICY "Admin and Accountant can insert estimate_items" ON estimate_items
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Admin and Accountant can update estimate_items" ON estimate_items
  FOR UPDATE USING (get_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Admin and Accountant can delete estimate_items" ON estimate_items
  FOR DELETE USING (get_user_role() IN ('admin', 'accountant'));

-- Payments (Same as Estimates, but Doctor only needs to view)
CREATE POLICY "Admin and Accountant can view all payments" ON payments
  FOR SELECT USING (get_user_role() IN ('admin', 'accountant', 'doctor'));

CREATE POLICY "Admin and Accountant can insert payments" ON payments
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Admin and Accountant can update payments" ON payments
  FOR UPDATE USING (get_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Admin and Accountant can delete payments" ON payments
  FOR DELETE USING (get_user_role() IN ('admin', 'accountant'));

-- =================================================================================
-- MEDICAL Records (Diagnoses, Medications, Allergies, Lab Results, Procedures)
-- =================================================================================

-- Admin/Doctor: Full Access (R/W)
-- Accountant: No Access

-- Diagnoses
CREATE POLICY "Admin and Doctor can view diagnoses" ON diagnoses
  FOR SELECT USING (get_user_role() IN ('admin', 'doctor'));
CREATE POLICY "Admin and Doctor can manage diagnoses" ON diagnoses
  FOR ALL USING (get_user_role() IN ('admin', 'doctor'));

-- Medications
CREATE POLICY "Admin and Doctor can view medications" ON medications
  FOR SELECT USING (get_user_role() IN ('admin', 'doctor'));
CREATE POLICY "Admin and Doctor can manage medications" ON medications
  FOR ALL USING (get_user_role() IN ('admin', 'doctor'));

-- Allergies
CREATE POLICY "Admin and Doctor can view allergies" ON allergies
  FOR SELECT USING (get_user_role() IN ('admin', 'doctor'));
CREATE POLICY "Admin and Doctor can manage allergies" ON allergies
  FOR ALL USING (get_user_role() IN ('admin', 'doctor'));

-- Lab Results
CREATE POLICY "Admin and Doctor can view lab_results" ON lab_results
  FOR SELECT USING (get_user_role() IN ('admin', 'doctor'));
CREATE POLICY "Admin and Doctor can manage lab_results" ON lab_results
  FOR ALL USING (get_user_role() IN ('admin', 'doctor'));

-- Procedures
CREATE POLICY "Admin and Doctor can view procedures" ON procedures
  FOR SELECT USING (get_user_role() IN ('admin', 'doctor'));
CREATE POLICY "Admin and Doctor can manage procedures" ON procedures
  FOR ALL USING (get_user_role() IN ('admin', 'doctor'));

-- =================================================================================
-- INPATIENTS & ROOMS Tables Policies
-- =================================================================================

-- Admin/Doctor: Full Access (R/W)
-- Accountant: Read-Only (to check occupancy for billing)

-- Rooms
CREATE POLICY "All authenticated users can view rooms" ON rooms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage rooms" ON rooms
  FOR ALL USING (get_user_role() = 'admin');

-- Inpatients
CREATE POLICY "Admin and Doctor can view inpatients" ON inpatients
  FOR SELECT USING (get_user_role() IN ('admin', 'doctor', 'accountant')); -- Accountant needs to see who is in the hospital

CREATE POLICY "Admin and Doctor can manage inpatients" ON inpatients
  FOR ALL USING (get_user_role() IN ('admin', 'doctor'));

-- =================================================================================
-- USER_PROFILES Table Policies (already exist, but ensure full access for Admin)
-- =================================================================================

-- Admin: Full Access to all profiles
CREATE POLICY "Admin can view all user_profiles" ON user_profiles
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "Admin can manage all user_profiles" ON user_profiles
  FOR ALL USING (get_user_role() = 'admin');

-- Note: Existing policies for users to manage their own profile should be kept.
-- "Public profiles are viewable by everyone." (true) - Should be changed to authenticated
-- "Users can insert their own profile." (auth.uid() = id)
-- "Users can update own profile." (auth.uid() = id)

-- Let's update the existing user_profiles policies for better security:
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON user_profiles;
CREATE POLICY "Authenticated users can view user_profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- End of RLS Policies
