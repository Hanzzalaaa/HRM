import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateEmployeeId } from "@/lib/utils/employee-id-generator"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      full_name,
      email,
      password,
      role,
      employee_id, // Optional - will be auto-generated if not provided
      department_id,
      designation,
      employment_type,
      date_of_joining,
      date_of_birth,
      phone,
      address,
      emergency_contact,
      bank_account,
      bank_name,
      pan_number,
      aadhar_number,
      basic_salary,
    } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate employee ID if not provided
    const finalEmployeeId = employee_id || await generateEmployeeId()

    // Check if employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employee_id: finalEmployeeId }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: `Employee ID ${finalEmployeeId} already exists` },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and employee in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          full_name,
          role,
          status: 'active'
        }
      })

      // Create employee
      const employee = await tx.employee.create({
        data: {
          user_id: user.id,
          employee_id: finalEmployeeId,
          department_id,
          designation,
          employment_type,
          date_of_joining: new Date(date_of_joining),
          date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
          phone,
          address,
          emergency_contact,
          bank_account,
          bank_name,
          pan_number,
          aadhar_number,
          basic_salary
        }
      })

      return { user, employee }
    })

    return NextResponse.json({ 
      success: true, 
      data: result,
      employee_id: finalEmployeeId 
    })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    )
  }
}
