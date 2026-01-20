import { NextResponse } from "next/server"
import { generateEmployeeId } from "@/lib/utils/employee-id-generator"

export async function GET() {
  try {
    const nextId = await generateEmployeeId()
    
    return NextResponse.json({ 
      success: true, 
      employee_id: nextId 
    })
  } catch (error) {
    console.error("Error generating employee ID:", error)
    return NextResponse.json(
      { error: "Failed to generate employee ID" },
      { status: 500 }
    )
  }
}
