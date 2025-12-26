-- Extramed CRM Database Schema for Supabase/PostgreSQL
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  passport_series VARCHAR(10),
  passport_number VARCHAR(20),
  insurance VARCHAR(50),
  insurance_company VARCHAR(255),
  insurance_policy VARCHAR(100),
  diagnosis TEXT,
  status VARCHAR(50) DEFAULT 'active',
  photo TEXT,
  photo_alt TEXT,
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(50),
  has_alerts BOOLEAN DEFAULT false,
  alerts TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnoses Table
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  diagnosed_date DATE NOT NULL,
  physician VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dosage TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  prescribed_by VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allergies Table
CREATE TABLE IF NOT EXISTS allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  allergen VARCHAR(255) NOT NULL,
  reaction TEXT,
  severity VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_date DATE NOT NULL,
  result TEXT NOT NULL,
  reference_range TEXT,
  status VARCHAR(50),
  ordered_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procedures Table
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  procedure_name VARCHAR(255) NOT NULL,
  procedure_date DATE NOT NULL,
  performed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estimates Table
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estimate Items Table
CREATE TABLE IF NOT EXISTS estimate_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  service_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  category_name VARCHAR(255),
  category_id VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  quantity INTEGER NOT NULL DEFAULT 1,
  discount DECIMAL(5, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  occupied INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inpatients Table
CREATE TABLE IF NOT EXISTS inpatients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  room_number VARCHAR(20) REFERENCES rooms(number),
  room_type VARCHAR(50),
  admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_discharge TIMESTAMP WITH TIME ZONE,
  actual_discharge TIMESTAMP WITH TIME ZONE,
  attending_physician VARCHAR(255),
  treatment_status VARCHAR(50) DEFAULT 'treatment',
  billing_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_patients_mrn ON patients(medical_record_number);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_diagnoses_patient ON diagnoses(patient_id);
CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_estimates_patient ON estimates(patient_id);
CREATE INDEX idx_estimate_items_estimate ON estimate_items(estimate_id);
CREATE INDEX idx_payments_estimate ON payments(estimate_id);
CREATE INDEX idx_inpatients_patient ON inpatients(patient_id);
CREATE INDEX idx_inpatients_room ON inpatients(room_number);

-- Insert initial room data
INSERT INTO rooms (number, type, capacity, occupied) VALUES
  ('101', 'economy', 4, 0),
  ('102', 'economy', 4, 0),
  ('103', 'economy', 4, 0),
  ('201', 'standard', 2, 0),
  ('202', 'standard', 2, 0),
  ('203', 'standard', 2, 0),
  ('301', 'comfort', 2, 0),
  ('302', 'comfort', 2, 0),
  ('401', 'vip', 1, 0),
  ('402', 'vip', 1, 0)
ON CONFLICT (number) DO NOTHING;

-- Insert sample patient (Ivanov Ivan Ivanovich)
INSERT INTO patients (
  medical_record_number,
  name,
  date_of_birth,
  age,
  gender,
  phone,
  email,
  address,
  passport_series,
  passport_number,
  insurance,
  insurance_company,
  insurance_policy,
  diagnosis,
  status,
  photo,
  photo_alt,
  emergency_contact,
  emergency_phone,
  has_alerts,
  alerts
) VALUES (
  'MRN-2025-001',
  'Иванов Иван Иванович',
  '1985-03-15',
  39,
  'Мужской',
  '+7 (999) 123-45-67',
  'ivanov@example.com',
  'г. Москва, ул. Ленина, д. 10, кв. 25',
  '4512',
  '123456',
  'dms',
  'АльфаСтрахование',
  'ДМС-2025-001234',
  'I10 - Эссенциальная гипертензия',
  'active',
  'https://img.rocket.new/generatedImages/rocket_gen_img_10c48cdd0-1763299750352.png',
  'Professional headshot of middle-aged man with short dark hair wearing blue medical scrubs in clinical setting',
  'Иванова Мария Петровна',
  '+7 (999) 765-43-21',
  true,
  ARRAY['Аллергия на пенициллин', 'Повышенное артериальное давление']
) ON CONFLICT (medical_record_number) DO NOTHING;
