const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEmployeeIdGeneration() {
  console.log('🧪 Testing Employee ID Generation\n')

  try {
    // Test 1: Get latest employee
    console.log('1️⃣ Checking latest employee...')
    const latestEmployee = await prisma.employee.findFirst({
      where: {
        employee_id: {
          startsWith: 'EMP'
        }
      },
      orderBy: {
        employee_id: 'desc'
      },
      select: {
        employee_id: true
      }
    })

    if (latestEmployee) {
      console.log(`   Latest employee ID: ${latestEmployee.employee_id}`)
      
      // Extract number
      const lastNumber = parseInt(latestEmployee.employee_id.replace('EMP', ''), 10)
      const nextNumber = lastNumber + 1
      const nextId = `EMP${String(nextNumber).padStart(3, '0')}`
      
      console.log(`   Next employee ID will be: ${nextId}`)
    } else {
      console.log('   No employees found. Next ID will be: EMP001')
    }

    // Test 2: Count all employees
    console.log('\n2️⃣ Counting employees...')
    const totalEmployees = await prisma.employee.count()
    console.log(`   Total employees: ${totalEmployees}`)

    // Test 3: List all employee IDs
    if (totalEmployees > 0 && totalEmployees <= 10) {
      console.log('\n3️⃣ Listing all employee IDs:')
      const allEmployees = await prisma.employee.findMany({
        select: {
          employee_id: true,
          user: {
            select: {
              full_name: true
            }
          }
        },
        orderBy: {
          employee_id: 'asc'
        }
      })

      allEmployees.forEach(emp => {
        console.log(`   ${emp.employee_id} - ${emp.user.full_name}`)
      })
    }

    console.log('\n✅ Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEmployeeIdGeneration()
