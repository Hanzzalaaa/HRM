// Database helper functions to replace Supabase client
import { prisma } from './prisma'
import { getCurrentUser } from './auth'

export async function getUser() {
  return await getCurrentUser()
}

export { prisma as db }
