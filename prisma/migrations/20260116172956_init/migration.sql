-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'hr', 'employee');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'intern');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'half_day', 'on_leave');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'hold');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'employee',
    "avatar_url" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "date_of_joining" TIMESTAMP(3) NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "phone" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "bank_account" TEXT,
    "bank_name" TEXT,
    "pan_number" TEXT,
    "aadhar_number" TEXT,
    "basic_salary" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "head_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL,
    "work_hours" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'pending',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salaries" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basic_salary" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "da" DOUBLE PRECISION NOT NULL,
    "ta" DOUBLE PRECISION NOT NULL,
    "medical" DOUBLE PRECISION NOT NULL,
    "other_allowances" DOUBLE PRECISION NOT NULL,
    "pf_deduction" DOUBLE PRECISION NOT NULL,
    "tax_deduction" DOUBLE PRECISION NOT NULL,
    "other_deductions" DOUBLE PRECISION NOT NULL,
    "gross_salary" DOUBLE PRECISION NOT NULL,
    "net_salary" DOUBLE PRECISION NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_financials" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "total_revenue" DOUBLE PRECISION NOT NULL,
    "total_expenses" DOUBLE PRECISION NOT NULL,
    "salary_expenses" DOUBLE PRECISION NOT NULL,
    "operational_expenses" DOUBLE PRECISION NOT NULL,
    "marketing_expenses" DOUBLE PRECISION NOT NULL,
    "other_expenses" DOUBLE PRECISION NOT NULL,
    "net_profit" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_financials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "target_roles" "UserRole"[],
    "target_departments" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_id_key" ON "employees"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_head_id_key" ON "departments"("head_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_employee_id_date_key" ON "attendances"("employee_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "salaries_employee_id_month_year_key" ON "salaries"("employee_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "company_financials_month_year_key" ON "company_financials"("month", "year");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
