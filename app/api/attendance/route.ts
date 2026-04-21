import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employee_id, date, status } = body

    const now = new Date()
    const dateObj = new Date(date)
    dateObj.setUTCHours(0, 0, 0, 0)

    const attendance = await prisma.attendances.upsert({
      where: {
        employee_id_date: {
          employee_id,
          date: dateObj
        }
      },
      update: {
        check_in: now,
        status,
        updated_at: now
      },
      create: {
        id: crypto.randomUUID(),
        employee_id,
        date: dateObj,
        check_in: now,
        status,
        updated_at: now
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