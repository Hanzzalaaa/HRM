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
    const { employee_id, date } = body

    if (!employee_id || !date) {
      return NextResponse.json(
        { error: "employee_id and date are required" },
        { status: 400 }
      )
    }

    const now = new Date()
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    dateObj.setUTCHours(0, 0, 0, 0)

    // ✅ PKT (UTC+5) mein time check karo
    const pktHours = (now.getUTCHours() + 5) % 24
    const pktMinutes = now.getUTCMinutes()
    const isLate = pktHours > 9 || (pktHours === 9 && pktMinutes > 30)
    const status = isLate ? "late" : "present"

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