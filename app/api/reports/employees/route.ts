import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const employees = await prisma.employees.findMany({
      include: {
        users: { select: { full_name: true, email: true, role: true, status: true } },
        departments_employees_department_idTodepartments: { select: { name: true } }
      },
      orderBy: { created_at: 'asc' }
    })

    const rows = [
      ["Employee ID", "Full Name", "Email", "Department", "Designation", "Employment Type", "Date of Joining", "Status", "Salary"],
      ...employees.map(e => [
        e.employee_id,
        e.users.full_name,
        e.users.email,
        e.departments_employees_department_idTodepartments?.name ?? "-",
        e.designation,
        e.employment_type,
        new Date(e.date_of_joining).toLocaleDateString(),
        e.users.status,
        e.basic_salary
      ])
    ]

    const csv = rows.map(r => r.join(",")).join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=employees.csv"
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}