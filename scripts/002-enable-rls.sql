-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
  role_val user_role;
BEGIN
  SELECT role INTO role_val FROM users WHERE id = user_uuid;
  RETURN role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get employee_id from user_id
CREATE OR REPLACE FUNCTION get_employee_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  emp_id UUID;
BEGIN
  SELECT id INTO emp_id FROM employees WHERE user_id = user_uuid;
  RETURN emp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admin and HR can view all users" ON users;
CREATE POLICY "Super admin and HR can view all users" ON users FOR SELECT 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR', 'COMPANY'));

DROP POLICY IF EXISTS "Super admin can manage users" ON users;
CREATE POLICY "Super admin can manage users" ON users FOR ALL 
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- Employees table policies
DROP POLICY IF EXISTS "Employees can view own profile" ON employees;
CREATE POLICY "Employees can view own profile" ON employees FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Super admin HR Company can view all employees" ON employees;
CREATE POLICY "Super admin HR Company can view all employees" ON employees FOR SELECT 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR', 'COMPANY'));

DROP POLICY IF EXISTS "Super admin and HR can manage employees" ON employees;
CREATE POLICY "Super admin and HR can manage employees" ON employees FOR ALL 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR'));

DROP POLICY IF EXISTS "Employees can update own basic info" ON employees;
CREATE POLICY "Employees can update own basic info" ON employees FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Departments table policies
DROP POLICY IF EXISTS "Anyone can view departments" ON departments;
CREATE POLICY "Anyone can view departments" ON departments FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Super admin can manage departments" ON departments;
CREATE POLICY "Super admin can manage departments" ON departments FOR ALL 
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- Attendance table policies
DROP POLICY IF EXISTS "Employees can view own attendance" ON attendance;
CREATE POLICY "Employees can view own attendance" ON attendance FOR SELECT 
USING (employee_id = get_employee_id(auth.uid()));

DROP POLICY IF EXISTS "Employees can mark own attendance" ON attendance;
CREATE POLICY "Employees can mark own attendance" ON attendance FOR INSERT 
WITH CHECK (employee_id = get_employee_id(auth.uid()));

DROP POLICY IF EXISTS "Employees can update own attendance" ON attendance;
CREATE POLICY "Employees can update own attendance" ON attendance FOR UPDATE 
USING (employee_id = get_employee_id(auth.uid()));

DROP POLICY IF EXISTS "Super admin and HR can view all attendance" ON attendance;
CREATE POLICY "Super admin and HR can view all attendance" ON attendance FOR SELECT 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR', 'COMPANY'));

DROP POLICY IF EXISTS "Super admin and HR can manage all attendance" ON attendance;
CREATE POLICY "Super admin and HR can manage all attendance" ON attendance FOR ALL 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR'));

-- Leave balances policies
DROP POLICY IF EXISTS "Employees can view own leave balance" ON leave_balances;
CREATE POLICY "Employees can view own leave balance" ON leave_balances FOR SELECT 
USING (employee_id = get_employee_id(auth.uid()));

DROP POLICY IF EXISTS "Super admin and HR can manage leave balances" ON leave_balances;
CREATE POLICY "Super admin and HR can manage leave balances" ON leave_balances FOR ALL 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR'));

-- Leave requests policies
DROP POLICY IF EXISTS "Employees can view own leave requests" ON leave_requests;
CREATE POLICY "Employees can view own leave requests" ON leave_requests FOR SELECT 
USING (employee_id = get_employee_id(auth.uid()));

DROP POLICY IF EXISTS "Employees can create own leave requests" ON leave_requests;
CREATE POLICY "Employees can create own leave requests" ON leave_requests FOR INSERT 
WITH CHECK (employee_id = get_employee_id(auth.uid()));

DROP POLICY IF EXISTS "Super admin and HR can manage all leave requests" ON leave_requests;
CREATE POLICY "Super admin and HR can manage all leave requests" ON leave_requests FOR ALL 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR'));

-- Salaries policies
DROP POLICY IF EXISTS "Employees can view own salary" ON salaries;
CREATE POLICY "Employees can view own salary" ON salaries FOR SELECT 
USING (employee_id = get_employee_id(auth.uid()));

DROP POLICY IF EXISTS "Super admin HR Company can view all salaries" ON salaries;
CREATE POLICY "Super admin HR Company can view all salaries" ON salaries FOR SELECT 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR', 'COMPANY'));

DROP POLICY IF EXISTS "Super admin can manage salaries" ON salaries;
CREATE POLICY "Super admin can manage salaries" ON salaries FOR ALL 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR'));

-- Company financials policies
DROP POLICY IF EXISTS "Super admin and Company can view financials" ON company_financials;
CREATE POLICY "Super admin and Company can view financials" ON company_financials FOR SELECT 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'COMPANY'));

DROP POLICY IF EXISTS "Super admin can manage financials" ON company_financials;
CREATE POLICY "Super admin can manage financials" ON company_financials FOR ALL 
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- Announcements policies
DROP POLICY IF EXISTS "All authenticated users can view active announcements" ON announcements;
CREATE POLICY "All authenticated users can view active announcements" ON announcements FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Super admin and HR can manage announcements" ON announcements;
CREATE POLICY "Super admin and HR can manage announcements" ON announcements FOR ALL 
USING (get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'HR'));

-- Activity logs policies
DROP POLICY IF EXISTS "Super admin can view all logs" ON activity_logs;
CREATE POLICY "Super admin can view all logs" ON activity_logs FOR SELECT 
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

DROP POLICY IF EXISTS "Users can create their own logs" ON activity_logs;
CREATE POLICY "Users can create their own logs" ON activity_logs FOR INSERT 
WITH CHECK (user_id = auth.uid());
