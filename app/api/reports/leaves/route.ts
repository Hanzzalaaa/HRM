import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!['super_admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const leaves = await prisma.leaves.findMany({
      include: {
        employees: {
          include: { users: { select: { full_name: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    const rows = [
      ["Employee ID", "Full Name", "Leave Type", "Start Date", "End Date", "Total Days", "Status"],
      ...leaves.map(l => [
        l.employees.employee_id,
        `"${l.employees.users.full_name}"`,
        l.leave_type,
        new Date(l.start_date).toLocaleDateString(),
        new Date(l.end_date).toLocaleDateString(),
        l.total_days,
        l.status,
      ]),
    ]

    const csv = rows.map(r => r.join(",")).join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=leaves.csv",
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to export leaves" }, { status: 500 })
  }
}