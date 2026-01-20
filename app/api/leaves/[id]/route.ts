import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, rejection_reason, approved_by } = body

    const updateData: any = { status }
    
    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }
    
    if (approved_by) {
      updateData.approved_by = approved_by
      updateData.approved_at = new Date()
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: leave })
  } catch (error) {
    console.error("Error updating leave:", error)
    return NextResponse.json(
      { error: "Failed to update leave" },
      { status: 500 }
    )
  }
}
