import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { Users } from 'lucide-react'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  if (!userId) return null
  
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      employees: {
        include: {
          departments_employees_department_idTodepartments: true
        }
      }
    }
  })
  
  return user
}

export async function signIn(email: string, password: string) {
  const user = await prisma.users.findUnique({
    where: { email }
  })
  
  if (!user) {
    throw new Error('Invalid credentials')
  }
  
  const isValid = await bcrypt.compare(password, user.password)
  
  if (!isValid) {
    throw new Error('Invalid credentials')
  }
  
  return Users
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
}