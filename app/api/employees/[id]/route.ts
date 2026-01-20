import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      full_name,
      role,
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

    // Get employee to find user_id
    const employee = await prisma.employee.findUnique({
      where: { id }
    })

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // Update user and employee in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Update user
      const user = await tx.user.update({
        where: { id: employee.user_id },
        data: {
          full_name,
          role
        }
      })

      // Update employee
      const updatedEmployee = await tx.employee.update({
        where: { id },
        data: {
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

      return { user, employee: updatedEmployee }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    )
  }
}
