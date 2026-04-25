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
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      total_days,
      reason,
      status,
    } = body

    if (!employee_id || !leave_type || !start_date || !end_date || !total_days || !reason) {
      return NextResponse.json(
        { error: "employee_id, leave_type, start_date, end_date, total_days, and reason are required" },
        { status: 400 }
      )
    }

    const validLeaveTypes = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid']
    if (!validLeaveTypes.includes(leave_type)) {
      return NextResponse.json(
        { error: `leave_type must be one of: ${validLeaveTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (typeof total_days !== 'number' || total_days <= 0) {
      return NextResponse.json(
        { error: "total_days must be a positive number" },
        { status: 400 }
      )
    }

    const startDateObj = new Date(start_date)
    const endDateObj = new Date(end_date)

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format for start_date or end_date" },
        { status: 400 }
      )
    }

    if (endDateObj < startDateObj) {
      return NextResponse.json(
        { error: "end_date must be after start_date" },
        { status: 400 }
      )
    }

    const leave = await prisma.leaves.create({
      data: {
        id: crypto.randomUUID(),
        employee_id,
        leave_type,
        start_date: startDateObj,
        end_date: endDateObj,
        total_days,
        reason,
        status: status || "pending",
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: leave })
  } catch (error: any) {
    console.error("Error creating leave:", error)

    // Handle foreign key violation (invalid employee_id)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid employee_id — employee does not exist" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    )
  }
}