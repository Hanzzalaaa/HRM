import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const existingRecord = await prisma.attendances.findUnique({
      where: { id },
      select: { check_in: true }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      )
    }

    const now = new Date()

    // Calculate work hours from check_in to now
    let workHours = 0
    if (existingRecord.check_in) {
      const diffMs = now.getTime() - existingRecord.check_in.getTime()
      workHours = Math.round((diffMs / 3600000) * 100) / 100
    }

    // Determine status based on work hours
    let finalStatus = status
    if (workHours >= 8) {
      finalStatus = "present"
    } else if (workHours >= 4) {
      finalStatus = "half_day"
    } else {
      finalStatus = existingRecord.check_in ? status : "absent"
    }

    const attendance = await prisma.attendances.update({
      where: { id },
      data: {
        check_out: now,
        work_hours: workHours,
        status: finalStatus,
        updated_at: now
      }
    })

    return NextResponse.json({ success: true, data: attendance })
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    )
  }
}