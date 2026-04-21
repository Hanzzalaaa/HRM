import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.departments.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete department with employees' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
  }
}