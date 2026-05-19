import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) return null

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        avatar_url: true,
        status: true,
        created_at: true,
        updated_at: true,
        employees: {
          include: {
            departments_employees_department_idTodepartments: true,
          },
        },
      },
    })

    // If the user record is gone (deleted) treat as unauthenticated
    if (!user) return null

    // Suspended/inactive users lose their session
    if (user.status !== 'active') return null

    return user
  } catch (error) {
    // DB errors must not crash layouts — return null so guards redirect to login
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  const user = await prisma.users.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    throw new Error('Invalid credentials')
  }

  const { password: _pw, ...safeUser } = user
  return safeUser
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
}