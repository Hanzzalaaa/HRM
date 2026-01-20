const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const departments = [
  {
    name: 'Engineering',
    description: 'Software development and technical operations'
  },
  {
    name: 'Human Resources',
    description: 'Employee management and recruitment'
  },
  {
    name: 'Finance',
    description: 'Financial planning and accounting'
  },
  {
    name: 'Marketing',
    description: 'Marketing and brand management'
  },
  {
    name: 'Sales',
    description: 'Sales and business development'
  },
  {
    name: 'Operations',
    description: 'Business operations and logistics'
  },
  {
    name: 'Customer Support',
    description: 'Customer service and support'
  },
  {
    name: 'Product',
    description: 'Product management and design'
  }
]

async function main() {
  console.log('🏢 Seeding departments...\n')

  for (const dept of departments) {
    // Check if department already exists
    const existing = await prisma.department.findFirst({
      where: { name: dept.name }
    })

    if (existing) {
      console.log(`✓ ${dept.name} - already exists`)
      continue
    }

    // Create department
    const created = await prisma.department.create({
      data: dept
    })

    console.log(`✓ ${created.name} - created (ID: ${created.id})`)
  }

  console.log('\n✅ Departments seeded successfully!')
  
  // Display all departments
  const allDepartments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  })

  console.log('\n📋 Available departments:')
  allDepartments.forEach(dept => {
    console.log(`   - ${dept.name} (${dept.id})`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
