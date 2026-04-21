import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const salaries = await prisma.salaries.findMany({
      include: {
        employees: {
          include: { users: { select: { full_name: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    const rows = [
      ["Employee ID", "Full Name", "Month", "Year", "Basic", "Gross", "Net", "Status"],
      ...salaries.map(s => [
        s.employees.employee_id,
        s.employees.users.full_name,
        s.month,
        s.year,
        s.basic_salary,
        s.gross_salary,
        s.net_salary,
        s.payment_status
      ])
    ]

    const csv = rows.map(r => r.join(",")).join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=payroll.csv"
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}