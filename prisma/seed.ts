import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const departments = [
    { id: 'dept_001', name: 'HR' },
    { id: 'dept_002', name: 'Engineering' },
    { id: 'dept_003', name: 'Finance' },
    { id: 'dept_004', name: 'Marketing' },
    { id: 'dept_005', name: 'Operations' },
  ]

  for (const dept of departments) {
    await prisma.departments.upsert({
      where: { name: dept.name },
      update: {},
      create: {
        id: dept.id,
        name: dept.name,
        updated_at: new Date()
      }
    })
  }

  console.log('✅ Departments created!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())