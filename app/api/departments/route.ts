import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    // Departments list is needed by forms (employee create/edit) for all authenticated roles
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const departments = await prisma.departments.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ success: true, data: departments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['super_admin', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    const department = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        name,
        description: description || null,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ success: true, department })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Department already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}