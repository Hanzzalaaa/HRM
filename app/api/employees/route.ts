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
      employee_id,
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

    const existingUser = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    const finalEmployeeId = employee_id || await generateEmployeeId()

    const existingEmployee = await prisma.employees.findUnique({
      where: { employee_id: finalEmployeeId }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: `Employee ID ${finalEmployeeId} already exists` },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx: any) => {

      const user = await tx.users.create({
        data: {
          id: crypto.randomUUID(),
          email,
          password: hashedPassword,
          full_name,
          role,
          status: "active",
          updated_at: new Date()
        }
      })

      const employee = await tx.employees.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          employee_id: finalEmployeeId,
          department_id,
          designation,
          employment_type,
          date_of_joining: new Date(date_of_joining),
          date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
          phone: phone || null,
          address: address || null,
          emergency_contact: emergency_contact || null,
          bank_account: bank_account || null,
          bank_name: bank_name || null,
          pan_number: pan_number || null,
          aadhar_number: aadhar_number || null,
          basic_salary: basic_salary || 0,
          updated_at: new Date()
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