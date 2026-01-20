import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { check_out, work_hours, status } = body

    // Get the attendance record to get the date
    const existingRecord = await prisma.attendance.findUnique({
      where: { id },
      select: { date: true }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      )
    }

    const dateStr = existingRecord.date.toISOString().split('T')[0]

    const updateData: any = { status }
    
    if (check_out) {
      updateData.check_out = check_out
    }
    
    if (work_hours !== undefined) {
      updateData.work_hours = work_hours
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: updateData
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
