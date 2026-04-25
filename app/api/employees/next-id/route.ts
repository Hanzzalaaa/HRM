import { NextResponse } from "next/server"
import { generateEmployeeId } from "@/lib/utils/employee-id-generator"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const nextId = await generateEmployeeId()

    return NextResponse.json({
      success: true,
      employee_id: nextId,
    })
  } catch (error) {
    console.error("Error generating employee ID:", error)
    return NextResponse.json(
      { error: "Failed to generate employee ID" },
      { status: 500 }
    )
  }
}
