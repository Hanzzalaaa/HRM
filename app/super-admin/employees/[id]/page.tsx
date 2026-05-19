import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChangePasswordDialog } from "@/components/employees/change-password-dialog"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Pencil, ArrowLeft } from "lucide-react"
import { formatCurrency, formatDate, getStatusColor, getRoleBadgeColor } from "@/lib/utils/helpers"

export const dynamic = 'force-dynamic'

interface EmployeeViewPageProps {
  params: Promise<{ id: string }>
}

export default async function EmployeeViewPage({ params }: EmployeeViewPageProps) {
  const { id } = await params

  const employee = await prisma.employees.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          status: true,
          avatar_url: true,
        },
      },
      departments_employees_department_idTodepartments: {
        select: { name: true },
      },
    },
  })

  if (!employee) {
    notFound()
  }

  const dept = employee.departments_employees_department_idTodepartments

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.users.full_name}
        description={`${employee.designation} · ${dept.name}`}
        actions={
          <div className="flex gap-2">
            <Link href="/super-admin/employees">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <ChangePasswordDialog
              employeeId={id}
              employeeName={employee.users.full_name}
            />
            <Link href={`/super-admin/employees/${id}/edit`}>
              <Button>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Employee ID",    value: employee.employee_id },
              { label: "Full Name",      value: employee.users.full_name },
              { label: "Email",          value: employee.users.email },
              { label: "Phone",          value: employee.phone || "N/A" },
              { label: "Date of Birth",  value: employee.date_of_birth ? formatDate(employee.date_of_birth) : "N/A" },
              { label: "Address",        value: employee.address || "N/A" },
              { label: "Emergency Contact", value: employee.emergency_contact || "N/A" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{dept.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{employee.designation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employment Type</p>
              <p className="font-medium capitalize">{employee.employment_type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Joining</p>
              <p className="font-medium">{formatDate(employee.date_of_joining)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge className={getRoleBadgeColor(employee.users.role)}>
                {employee.users.role.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(employee.users.status)}>
                {employee.users.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Basic Salary</p>
              <p className="font-medium">{formatCurrency(employee.basic_salary)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Account</p>
              <p className="font-medium">{employee.bank_account || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank Name</p>
              <p className="font-medium">{employee.bank_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PAN Number</p>
              <p className="font-medium">{employee.pan_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aadhar Number</p>
              <p className="font-medium">{employee.aadhar_number || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
