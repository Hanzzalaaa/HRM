export type UserRole = "super_admin" | "hr" | "employee"
export type UserStatus = "active" | "inactive" | "suspended"
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern"
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled"
export type LeaveType = "annual" | "sick" | "personal" | "maternity" | "paternity" | "unpaid"
export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "on_leave"

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string | null
  status: UserStatus
  created_at: Date | string
  updated_at: Date | string
}

export interface Employee {
  id: string
  user_id: string
  employee_id: string
  department_id: string
  designation: string
  employment_type: EmploymentType
  date_of_joining: Date | string
  date_of_birth?: Date | string | null
  phone?: string | null
  address?: string | null
  emergency_contact?: string | null
  bank_account?: string | null
  bank_name?: string | null
  pan_number?: string | null
  aadhar_number?: string | null
  basic_salary: number
  created_at: Date | string
  updated_at: Date | string
  user?: User
  department?: Department
}

export interface Department {
  id: string
  name: string
  description?: string | null
  head_id?: string | null
  created_at: Date | string
  updated_at: Date | string
  head?: Employee
  _count?: { employees: number }
}

export interface Attendance {
  id: string
  employee_id: string
  date: Date | string
  check_in?: Date | string | null
  check_out?: Date | string | null
  status: AttendanceStatus
  work_hours?: number | null
  notes?: string | null
  created_at: Date | string
  updated_at: Date | string
  employee?: Employee
}

export interface Leave {
  id: string
  employee_id: string
  leave_type: LeaveType
  start_date: Date | string
  end_date: Date | string
  total_days: number
  reason: string
  status: LeaveStatus
  approved_by?: string | null
  approved_at?: Date | string | null
  rejection_reason?: string | null
  created_at: Date | string
  updated_at: Date | string
  employee?: Employee
  approver?: User
}

export interface Salary {
  id: string
  employee_id: string
  month: number
  year: number
  basic_salary: number
  hra: number
  da: number
  ta: number
  medical: number
  other_allowances: number
  pf_deduction: number
  tax_deduction: number
  other_deductions: number
  gross_salary: number
  net_salary: number
  payment_status: "pending" | "paid" | "hold"
  payment_date?: Date | string | null
  created_at: Date | string
  updated_at: Date | string
  employee?: Employee
}

export interface CompanyFinancials {
  id: string
  month: number
  year: number
  total_revenue: number
  total_expenses: number
  salary_expenses: number
  operational_expenses: number
  marketing_expenses: number
  other_expenses: number
  net_profit: number
  notes?: string | null
  created_at: Date | string
  updated_at: Date | string
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: "low" | "medium" | "high" | "urgent"
  target_roles: UserRole[]
  target_departments?: string[] | null
  is_active: boolean
  published_at?: Date | string | null
  expires_at?: Date | string | null
  created_by: string
  created_at: Date | string
  updated_at: Date | string
  author?: User
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id?: string | null
  details?: Record<string, unknown> | null
  ip_address?: string | null
  created_at: Date | string
  user?: User
}

export interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalDepartments: number
  pendingLeaves: number
  todayAttendance: number
  monthlyPayroll: number
}
