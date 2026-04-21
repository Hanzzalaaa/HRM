import { prisma } from '@/lib/prisma'

export async function generateEmployeeId(): Promise<string> {
  const latestEmployee = await prisma.employees.findFirst({
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

  if (!latestEmployee) {
    return 'EMP001'
  }

  const lastNumber = parseInt(latestEmployee.employee_id.replace('EMP', ''), 10)
  const nextNumber = lastNumber + 1
  const nextId = `EMP${String(nextNumber).padStart(3, '0')}`
  
  return nextId
}

export async function employeeIdExists(employeeId: string): Promise<boolean> {
  const employee = await prisma.employees.findUnique({
    where: { employee_id: employeeId },
    select: { id: true }
  })
  
  return !!employee
}

export function isValidEmployeeIdFormat(employeeId: string): boolean {
  return /^EMP\d{3}$/.test(employeeId)
}