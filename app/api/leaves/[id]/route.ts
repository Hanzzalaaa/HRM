import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, rejection_reason, approved_by } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Verify the leave exists first
    const existing = await prisma.leaves.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    const updateData: any = {
      status,
      updated_at: new Date(),
    }

    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    if (approved_by) {
      updateData.approved_by = approved_by
      updateData.approved_at = new Date()
    }

    // FIX: was prisma.leave (wrong) — correct model name is prisma.leaves
    const leave = await prisma.leaves.update({
      where: { id },
      data: updateData,
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
