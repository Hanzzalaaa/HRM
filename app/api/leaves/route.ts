import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
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

    const leave = await prisma.leave.create({
      data: {
        employee_id,
        leave_type,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        total_days,
        reason,
        status: status || 'pending'
      }
    })

    return NextResponse.json({ success: true, data: leave })
  } catch (error) {
    console.error("Error creating leave:", error)
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    )
  }
}
