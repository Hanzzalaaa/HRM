-- Revolix HRM System Database Schema
-- This script creates all necessary tables for the HRM system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for various fields
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'COMPANY', 'HR', 'EMPLOYEE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE employment_status AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_type AS ENUM ('CASUAL', 'SICK', 'ANNUAL', 'UNPAID', 'MATERNITY', 'PATERNITY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  budget DECIMAL(15, 2) DEFAULT 0,
  head_employee_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  postal_code VARCHAR(20),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation VARCHAR(100),
  employment_type employment_type DEFAULT 'FULL_TIME',
  employment_status employment_status DEFAULT 'ACTIVE',
  joining_date DATE NOT NULL,
  termination_date DATE,
  reporting_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  basic_salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
  bank_account_number VARCHAR(50),
  bank_name VARCHAR(100),
  ifsc_code VARCHAR(20),
  pan_number VARCHAR(20),
  aadhar_number VARCHAR(20),
  profile_photo_url TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for department head
ALTER TABLE departments 
ADD CONSTRAINT fk_department_head 
FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(5, 2),
  status attendance_status DEFAULT 'PRESENT',
  notes TEXT,
  is_late BOOLEAN DEFAULT false,
  is_early_departure BOOLEAN DEFAULT false,
  location_checkin TEXT,
  location_checkout TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Leave balance table
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  year INTEGER NOT NULL,
  total_leaves INTEGER NOT NULL DEFAULT 0,
  used_leaves INTEGER NOT NULL DEFAULT 0,
  remaining_leaves INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, leave_type, year)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary records table
CREATE TABLE IF NOT EXISTS salaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  basic_salary DECIMAL(15, 2) NOT NULL,
  hra DECIMAL(15, 2) DEFAULT 0,
  transport_allowance DECIMAL(15, 2) DEFAULT 0,
  medical_allowance DECIMAL(15, 2) DEFAULT 0,
  special_allowance DECIMAL(15, 2) DEFAULT 0,
  bonus DECIMAL(15, 2) DEFAULT 0,
  gross_salary DECIMAL(15, 2) NOT NULL,
  provident_fund DECIMAL(15, 2) DEFAULT 0,
  professional_tax DECIMAL(15, 2) DEFAULT 0,
  income_tax DECIMAL(15, 2) DEFAULT 0,
  other_deductions DECIMAL(15, 2) DEFAULT 0,
  total_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(15, 2) NOT NULL,
  payment_status payment_status DEFAULT 'PENDING',
  payment_date DATE,
  payment_reference VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Company financials table
CREATE TABLE IF NOT EXISTS company_financials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_expenses DECIMAL(15, 2) DEFAULT 0,
  salary_expenses DECIMAL(15, 2) DEFAULT 0,
  operational_expenses DECIMAL(15, 2) DEFAULT 0,
  profit_loss DECIMAL(15, 2) DEFAULT 0,
  pending_salaries DECIMAL(15, 2) DEFAULT 0,
  pending_salary_count INTEGER DEFAULT 0,
  debt DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, year)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_audience VARCHAR(50) DEFAULT 'ALL',
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  priority VARCHAR(20) DEFAULT 'NORMAL',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table for audit
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_salaries_employee ON salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON leave_balances;
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salaries_updated_at ON salaries;
CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON salaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_financials_updated_at ON company_financials;
CREATE TRIGGER update_company_financials_updated_at BEFORE UPDATE ON company_financials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
