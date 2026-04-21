import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10)

  const user = await prisma.users.create({
    data: {
      id: crypto.randomUUID(),
      email: 'admin@revolixtechnology.com',
      password: hashedPassword,
      full_name: 'Super Admin',
      role: 'super_admin',
      updated_at: new Date()
    }
  })

  console.log('✅ Super Admin created:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())