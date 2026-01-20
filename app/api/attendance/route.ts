import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employee_id, date, check_in, status } = body

    // Use upsert to handle existing records
    const attendance = await prisma.attendance.upsert({
      where: {
        employee_id_date: {
          employee_id,
          date: new Date(date)
        }
      },
      update: {
        check_in,
        status
      },
      create: {
        employee_id,
        date: new Date(date),
        check_in,
        status
      }
    })

    return NextResponse.json({ success: true, data: attendance })
  } catch (error) {
    console.error("Error creating attendance:", error)
    return NextResponse.json(
      { error: "Failed to create attendance record" },
      { status: 500 }
    )
  }
}
