import { prisma } from '@/lib/prisma'

/**
 * Generates the next employee ID in the format EMP001, EMP002, etc.
 * @returns Promise<string> The next available employee ID
 */
export async function generateEmployeeId(): Promise<string> {
  // Get the latest employee by employee_id
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

  if (!latestEmployee) {
    // No employees yet, start with EMP001
    return 'EMP001'
  }

  // Extract the number from the employee_id (e.g., "EMP005" -> 5)
  const lastNumber = parseInt(latestEmployee.employee_id.replace('EMP', ''), 10)
  
  // Increment and format with leading zeros
  const nextNumber = lastNumber + 1
  const nextId = `EMP${String(nextNumber).padStart(3, '0')}`
  
  return nextId
}

/**
 * Checks if an employee ID already exists
 * @param employeeId The employee ID to check
 * @returns Promise<boolean> True if exists, false otherwise
 */
export async function employeeIdExists(employeeId: string): Promise<boolean> {
  const employee = await prisma.employee.findUnique({
    where: { employee_id: employeeId },
    select: { id: true }
  })
  
  return !!employee
}

/**
 * Validates employee ID format (EMP followed by 3 digits)
 * @param employeeId The employee ID to validate
 * @returns boolean True if valid format
 */
export function isValidEmployeeIdFormat(employeeId: string): boolean {
  return /^EMP\d{3}$/.test(employeeId)
}
