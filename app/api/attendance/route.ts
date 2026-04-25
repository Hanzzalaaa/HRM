import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { employee_id, date, status } = body

    if (!employee_id || !date || !status) {
      return NextResponse.json(
        { error: "employee_id, date, and status are required" },
        { status: 400 }
      )
    }

    const validStatuses = ['present', 'absent', 'late', 'half_day', 'on_leave']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const now = new Date()
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    dateObj.setUTCHours(0, 0, 0, 0)

    const attendance = await prisma.attendances.upsert({
      where: {
        employee_id_date: {
          employee_id,
          date: dateObj,
        },
      },
      update: {
        check_in: now,
        status,
        updated_at: now,
      },
      create: {
        id: crypto.randomUUID(),
        employee_id,
        date: dateObj,
        check_in: now,
        status,
        updated_at: now,
      },
    })

    return NextResponse.json({ success: true, data: attendance })
  } catch (error: any) {
    console.error("Error creating attendance:", error)

    // Handle foreign key violation (invalid employee_id)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid employee_id — employee does not exist" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create attendance record" },
      { status: 500 }
    )
  }
}