import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const attendance = await prisma.attendances.findMany({
      include: {
        employees: {
          include: { users: { select: { full_name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    })

    const rows = [
      ["Employee ID", "Full Name", "Date", "Check In", "Check Out", "Status", "Work Hours"],
      ...attendance.map(a => [
        a.employees.employee_id,
        a.employees.users.full_name,
        new Date(a.date).toLocaleDateString(),
        a.check_in ? new Date(a.check_in).toLocaleTimeString() : "-",
        a.check_out ? new Date(a.check_out).toLocaleTimeString() : "-",
        a.status,
        a.work_hours ?? "-"
      ])
    ]

    const csv = rows.map(r => r.join(",")).join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=attendance.csv"
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}