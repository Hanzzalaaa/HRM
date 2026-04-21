import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    try {
      await prisma.$connect()
    } catch (connectError) {
      console.error('Database connection error:', connectError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' }, 
        { status: 503 }
      )
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        employees: {
          include: {
            departments_employees_department_idTodepartments: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 })
    }

    const cookieStore = await cookies()
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.code === 'P1001' || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your internet connection and try again.' }, 
        { status: 503 }
      )
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}